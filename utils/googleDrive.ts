import type { Person } from '~/types'

export interface GoogleDriveFile {
  id: string
  name: string
  modifiedTime: string
  size?: string
}

export interface SyncResult {
  success: boolean
  message: string
  conflictResolution?: 'local' | 'remote' | 'merged'
}

export class GoogleDriveService {
  private isInitialized = false
  private isSignedIn = false
  private CLIENT_ID = ''
  private API_KEY = ''
  private readonly DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
  private readonly SCOPES = 'https://www.googleapis.com/auth/drive.file'
  private readonly FOLDER_NAME = 'ContacTrack-Backups'

  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true

      // 環境変数の取得
      if (process.client) {
        try {
          const config = useRuntimeConfig()
          this.CLIENT_ID = config.public.googleClientId || ''
          this.API_KEY = config.public.googleApiKey || ''
        } catch (error) {
          // テスト環境などでuseRuntimeConfigが利用できない場合
          this.CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
          this.API_KEY = process.env.GOOGLE_API_KEY || ''
        }
        
        if (!this.CLIENT_ID || !this.API_KEY) {
          console.error('Google API credentials not found')
          return false
        }
      }

      // Google Identity Services の初期化
      await this.loadGoogleIdentityServices()
      
      // Google API クライアントの初期化
      await this.loadGoogleAPI()
      await this.initializeGoogleClient()

      this.isInitialized = true
      return true
    } catch (error) {
      console.error('Google Drive API initialization failed:', error)
      return false
    }
  }

  private async loadGoogleIdentityServices(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.accounts) {
        resolve()
        return
      }

      // Google Identity Services は nuxt.config.ts で読み込み済み
      const checkGSI = () => {
        if (typeof google !== 'undefined' && google.accounts) {
          resolve()
        } else {
          setTimeout(checkGSI, 100)
        }
      }
      checkGSI()
    })
  }

  private async loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof gapi !== 'undefined') {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Google API'))
      document.head.appendChild(script)
    })
  }

  private async initializeGoogleClient(): Promise<void> {
    return new Promise((resolve, reject) => {
      gapi.load('client', async () => {
        try {
          await gapi.client.init({
            apiKey: this.API_KEY,
            discoveryDocs: this.DISCOVERY_DOCS
          })
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  private updateSignInStatus(): void {
    // Google Identity Services では認証状態をトークンで管理
    this.isSignedIn = !!gapi.client.getToken()
  }

  async signIn(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize()
        if (!initialized) return false
      }

      return new Promise((resolve) => {
        const tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: this.CLIENT_ID,
          scope: this.SCOPES,
          callback: (response: any) => {
            if (response.error) {
              console.error('OAuth error:', response.error)
              resolve(false)
              return
            }
            
            // トークンを gapi.client に設定
            gapi.client.setToken(response)
            this.isSignedIn = true
            this.updateSignInStatus()
            resolve(true)
          }
        })
        
        // ユーザーが手動でクリックしたトークンリクエスト
        tokenClient.requestAccessToken({ prompt: 'consent' })
      })
    } catch (error) {
      console.error('Google Drive sign in failed:', error)
      return false
    }
  }

  async signOut(): Promise<void> {
    try {
      const token = gapi.client.getToken()
      if (token) {
        google.accounts.oauth2.revoke(token.access_token, () => {
          console.log('Access token revoked')
        })
        gapi.client.setToken(null)
      }
      this.isSignedIn = false
    } catch (error) {
      console.error('Google Drive sign out failed:', error)
    }
  }

  getSignInStatus(): boolean {
    return this.isSignedIn
  }

  async getOrCreateFolder(): Promise<string | null> {
    try {
      // フォルダの検索
      const response = await gapi.client.drive.files.list({
        q: `name='${this.FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        spaces: 'drive'
      })

      if (response.result.files && response.result.files.length > 0) {
        return response.result.files[0].id || null
      }

      // フォルダが存在しない場合は作成
      const folderResponse = await gapi.client.drive.files.create({
        resource: {
          name: this.FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder'
        }
      })

      return folderResponse.result.id || null
    } catch (error) {
      console.error('Failed to get or create folder:', error)
      return null
    }
  }

  async uploadBackup(people: Person[]): Promise<SyncResult> {
    try {
      if (!this.isSignedIn) {
        const signedIn = await this.signIn()
        if (!signedIn) {
          return { success: false, message: 'Google Driveにサインインできませんでした' }
        }
      }

      const folderId = await this.getOrCreateFolder()
      if (!folderId) {
        return { success: false, message: 'バックアップフォルダの作成に失敗しました' }
      }

      const backupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        people: people,
        totalCount: people.length
      }

      const fileName = `contactrack-backup-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`
      const fileContent = JSON.stringify(backupData, null, 2)
      
      // Base64エンコード
      const encoder = new TextEncoder()
      const data = encoder.encode(fileContent)
      const base64Data = btoa(String.fromCharCode(...data))

      const response = await gapi.client.request({
        path: 'https://www.googleapis.com/upload/drive/v3/files',
        method: 'POST',
        params: {
          uploadType: 'multipart'
        },
        headers: {
          'Content-Type': 'multipart/related; boundary="foo_bar_baz"'
        },
        body: [
          '--foo_bar_baz',
          'Content-Type: application/json; charset=UTF-8',
          '',
          JSON.stringify({
            name: fileName,
            parents: [folderId],
            description: `ContacTrack backup created on ${new Date().toLocaleString()}`
          }),
          '--foo_bar_baz',
          'Content-Type: application/json',
          'Content-Transfer-Encoding: base64',
          '',
          base64Data,
          '--foo_bar_baz--'
        ].join('\r\n')
      })

      if (response.status === 200) {
        return { 
          success: true, 
          message: `バックアップが完了しました (${people.length}件のデータ)` 
        }
      } else {
        return { success: false, message: 'バックアップのアップロードに失敗しました' }
      }
    } catch (error) {
      console.error('Backup upload failed:', error)
      return { success: false, message: 'バックアップ中にエラーが発生しました' }
    }
  }

  async listBackups(): Promise<GoogleDriveFile[]> {
    try {
      if (!this.isSignedIn) return []

      const folderId = await this.getOrCreateFolder()
      if (!folderId) return []

      const response = await gapi.client.drive.files.list({
        q: `'${folderId}' in parents and name contains 'contactrack-backup-' and trashed=false`,
        orderBy: 'modifiedTime desc',
        fields: 'files(id,name,modifiedTime,size)'
      })

      return response.result.files?.map(file => ({
        id: file.id || '',
        name: file.name || '',
        modifiedTime: file.modifiedTime || '',
        size: file.size
      })) || []
    } catch (error) {
      console.error('Failed to list backups:', error)
      return []
    }
  }

  async downloadBackup(fileId: string): Promise<Person[] | null> {
    try {
      const response = await gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media'
      })

      const backupData = JSON.parse(response.body)
      
      // バックアップデータの検証
      if (backupData.people && Array.isArray(backupData.people)) {
        return backupData.people
      } else {
        console.error('Invalid backup data format')
        return null
      }
    } catch (error) {
      console.error('Failed to download backup:', error)
      return null
    }
  }

  async restoreFromBackup(fileId: string): Promise<SyncResult> {
    try {
      const backupData = await this.downloadBackup(fileId)
      if (!backupData) {
        return { success: false, message: 'バックアップデータの読み込みに失敗しました' }
      }

      // ローカルストレージに保存
      const { storageUtils } = await import('~/utils/storage')
      storageUtils.savePeople(backupData)

      return { 
        success: true, 
        message: `復元が完了しました (${backupData.length}件のデータ)` 
      }
    } catch (error) {
      console.error('Restore failed:', error)
      return { success: false, message: '復元中にエラーが発生しました' }
    }
  }

  async syncWithLocal(localPeople: Person[]): Promise<SyncResult> {
    try {
      const backups = await this.listBackups()
      if (backups.length === 0) {
        // リモートにバックアップがない場合は、ローカルデータをアップロード
        return await this.uploadBackup(localPeople)
      }

      // 最新のバックアップと比較
      const latestBackup = backups[0]
      const remotePeople = await this.downloadBackup(latestBackup.id)
      
      if (!remotePeople) {
        return { success: false, message: 'リモートデータの取得に失敗しました' }
      }

      // タイムスタンプベースの競合解決
      const localTimestamp = Math.max(...localPeople.map(p => new Date(p.updatedAt).getTime()))
      const remoteTimestamp = new Date(latestBackup.modifiedTime).getTime()

      if (localTimestamp > remoteTimestamp) {
        // ローカルが新しい場合、リモートを更新
        const result = await this.uploadBackup(localPeople)
        return {
          ...result,
          conflictResolution: 'local'
        }
      } else {
        // リモートが新しい場合、ローカルを更新
        const result = await this.restoreFromBackup(latestBackup.id)
        return {
          ...result,
          conflictResolution: 'remote'
        }
      }
    } catch (error) {
      console.error('Sync failed:', error)
      return { success: false, message: '同期中にエラーが発生しました' }
    }
  }
}

// シングルトンインスタンス
export const googleDriveService = new GoogleDriveService()