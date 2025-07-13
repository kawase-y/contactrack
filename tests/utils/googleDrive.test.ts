import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GoogleDriveService } from '~/utils/googleDrive'
import type { Person } from '~/types'

// Google API のモック
const mockGapi = {
  load: vi.fn(),
  auth2: {
    init: vi.fn(),
    getAuthInstance: vi.fn(() => ({
      isSignedIn: {
        get: vi.fn(() => true)
      },
      signIn: vi.fn(),
      signOut: vi.fn()
    }))
  },
  client: {
    init: vi.fn(),
    drive: {
      files: {
        list: vi.fn(),
        create: vi.fn(),
        get: vi.fn()
      }
    },
    request: vi.fn()
  }
}

// グローバルオブジェクトのモック
global.gapi = mockGapi as any
global.process = { 
  client: true,
  env: {
    GOOGLE_CLIENT_ID: 'test-client-id',
    GOOGLE_API_KEY: 'test-api-key'
  }
} as any

// useRuntimeConfig のモック
const mockUseRuntimeConfig = vi.fn(() => ({
  public: {
    googleClientId: 'test-client-id',
    googleApiKey: 'test-api-key'
  }
}))

vi.mock('#app', () => ({
  useRuntimeConfig: mockUseRuntimeConfig
}))

// DOM API のモック
Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn(() => ({
      onload: null,
      onerror: null,
      src: ''
    })),
    head: {
      appendChild: vi.fn()
    }
  }
})

describe('GoogleDriveService', () => {
  let service: GoogleDriveService
  let testPeople: Person[]

  beforeEach(() => {
    service = new GoogleDriveService()
    testPeople = [
      {
        id: '1',
        lastName: '田中',
        firstName: '太郎',
        lastNameKana: 'たなか',
        firstNameKana: 'たろう',
        name: '田中 太郎',
        age: 30,
        grade: 0,
        education: '学卒',
        relation: '同僚',
        memo: 'テストユーザー',
        meetDate: '2024-01-01',
        tags: ['仕事', 'プロジェクト'],
        contactInfo: {
          email: 'tanaka@example.com',
          phone: '090-1234-5678',
          social: '@tanaka'
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ]

    // モックのリセット
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('初期化', () => {
    it('Google API の初期化が正常に完了する', async () => {
      mockGapi.load.mockImplementation((api: string, callback: Function) => {
        callback()
      })

      const result = await service.initialize()
      
      expect(result).toBe(true)
      expect(mockGapi.load).toHaveBeenCalledWith('auth2', expect.any(Function))
      expect(mockGapi.load).toHaveBeenCalledWith('client', expect.any(Function))
    })

    it('環境変数が設定されていない場合は初期化に失敗する', async () => {
      // 環境変数を空にする
      global.process.env.GOOGLE_CLIENT_ID = ''
      global.process.env.GOOGLE_API_KEY = ''
      
      mockUseRuntimeConfig.mockImplementation(() => {
        throw new Error('useRuntimeConfig not available')
      })

      const result = await service.initialize()
      
      expect(result).toBe(false)
      
      // 元に戻す
      global.process.env.GOOGLE_CLIENT_ID = 'test-client-id'
      global.process.env.GOOGLE_API_KEY = 'test-api-key'
    })
  })

  describe('認証', () => {
    beforeEach(async () => {
      // 新しいサービスインスタンスを作成
      service = new GoogleDriveService()
      
      mockGapi.load.mockImplementation((api: string, callback: Function) => {
        callback()
      })
      await service.initialize()
    })

    it('サインイン状態を正しく取得できる', () => {
      const isSignedIn = service.getSignInStatus()
      
      expect(isSignedIn).toBe(true)
      expect(mockGapi.auth2.getAuthInstance).toHaveBeenCalled()
    })

    it('サインインが正常に実行される', async () => {
      // 新しいサービスインスタンスを作成してサインイン状態をリセット
      const newService = new GoogleDriveService()
      
      mockGapi.load.mockImplementation((api: string, callback: Function) => {
        callback()
      })
      await newService.initialize()
      
      const authInstance = mockGapi.auth2.getAuthInstance()
      // 初期状態でサインインしていない
      authInstance.isSignedIn.get.mockReturnValue(false)
      authInstance.signIn.mockResolvedValue({})
      // サインイン後の状態をtrueに変更
      authInstance.signIn.mockImplementation(async () => {
        authInstance.isSignedIn.get.mockReturnValue(true)
        return {}
      })

      const result = await newService.signIn()
      
      expect(result).toBe(true)
      expect(authInstance.signIn).toHaveBeenCalled()
    })

    it('サインアウトが正常に実行される', async () => {
      // 新しいサービスインスタンスを作成
      const newService = new GoogleDriveService()
      
      mockGapi.load.mockImplementation((api: string, callback: Function) => {
        callback()
      })
      await newService.initialize()
      
      const authInstance = mockGapi.auth2.getAuthInstance()
      authInstance.signOut.mockResolvedValue(undefined)

      await newService.signOut()
      
      expect(authInstance.signOut).toHaveBeenCalled()
    })
  })

  describe('フォルダ管理', () => {
    beforeEach(async () => {
      // 新しいサービスインスタンスを作成
      service = new GoogleDriveService()
      
      mockGapi.load.mockImplementation((api: string, callback: Function) => {
        callback()
      })
      await service.initialize()
    })

    it('既存フォルダが見つかった場合はそのIDを返す', async () => {
      mockGapi.client.drive.files.list.mockResolvedValue({
        result: {
          files: [{ id: 'existing-folder-id' }]
        }
      })

      const folderId = await service.getOrCreateFolder()
      
      expect(folderId).toBe('existing-folder-id')
      expect(mockGapi.client.drive.files.list).toHaveBeenCalledWith({
        q: "name='ContacTrack-Backups' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        spaces: 'drive'
      })
    })

    it('フォルダが存在しない場合は新しく作成する', async () => {
      mockGapi.client.drive.files.list.mockResolvedValue({
        result: { files: [] }
      })
      
      mockGapi.client.drive.files.create.mockResolvedValue({
        result: { id: 'new-folder-id' }
      })

      const folderId = await service.getOrCreateFolder()
      
      expect(folderId).toBe('new-folder-id')
      expect(mockGapi.client.drive.files.create).toHaveBeenCalledWith({
        resource: {
          name: 'ContacTrack-Backups',
          mimeType: 'application/vnd.google-apps.folder'
        }
      })
    })
  })

  describe('バックアップ機能', () => {
    beforeEach(async () => {
      // 新しいサービスインスタンスを作成
      service = new GoogleDriveService()
      
      mockGapi.load.mockImplementation((api: string, callback: Function) => {
        callback()
      })
      await service.initialize()
      
      // フォルダが存在する場合のモック
      mockGapi.client.drive.files.list.mockResolvedValue({
        result: {
          files: [{ id: 'test-folder-id' }]
        }
      })
    })

    it('バックアップのアップロードが正常に完了する', async () => {
      mockGapi.client.request.mockResolvedValue({
        status: 200,
        result: { id: 'backup-file-id' }
      })

      const result = await service.uploadBackup(testPeople)
      
      expect(result.success).toBe(true)
      expect(result.message).toContain('バックアップが完了しました')
      expect(result.message).toContain('1件のデータ')
      expect(mockGapi.client.request).toHaveBeenCalled()
    })

    it('バックアップ一覧を正しく取得できる', async () => {
      const mockBackups = [
        {
          id: 'backup1',
          name: 'contactrack-backup-2024-01-01-123456.json',
          modifiedTime: '2024-01-01T12:00:00Z',
          size: '1024'
        }
      ]

      mockGapi.client.drive.files.list.mockResolvedValue({
        result: { files: mockBackups }
      })

      const backups = await service.listBackups()
      
      expect(backups).toHaveLength(1)
      expect(backups[0].id).toBe('backup1')
      expect(backups[0].name).toBe('contactrack-backup-2024-01-01-123456.json')
    })

    it('バックアップのダウンロードが正常に完了する', async () => {
      const mockBackupData = {
        version: '1.0',
        timestamp: '2024-01-01T12:00:00Z',
        people: testPeople,
        totalCount: 1
      }

      mockGapi.client.drive.files.get.mockResolvedValue({
        body: JSON.stringify(mockBackupData)
      })

      const downloadedPeople = await service.downloadBackup('test-file-id')
      
      expect(downloadedPeople).toEqual(testPeople)
      expect(mockGapi.client.drive.files.get).toHaveBeenCalledWith({
        fileId: 'test-file-id',
        alt: 'media'
      })
    })
  })

  describe('同期機能', () => {
    beforeEach(async () => {
      // 新しいサービスインスタンスを作成
      service = new GoogleDriveService()
      
      mockGapi.load.mockImplementation((api: string, callback: Function) => {
        callback()
      })
      await service.initialize()
      
      // フォルダが存在する場合のモック
      mockGapi.client.drive.files.list.mockResolvedValue({
        result: {
          files: [{ id: 'test-folder-id' }]
        }
      })
    })

    it('リモートにバックアップがない場合はローカルデータをアップロードする', async () => {
      // バックアップ一覧が空の場合
      mockGapi.client.drive.files.list
        .mockResolvedValueOnce({
          result: { files: [{ id: 'test-folder-id' }] }
        })
        .mockResolvedValueOnce({
          result: { files: [] }
        })

      mockGapi.client.request.mockResolvedValue({
        status: 200,
        result: { id: 'new-backup-id' }
      })

      const result = await service.syncWithLocal(testPeople)
      
      expect(result.success).toBe(true)
      expect(result.message).toContain('バックアップが完了しました')
    })

    it('ローカルが新しい場合はリモートを更新する', async () => {
      const oldTimestamp = '2023-12-01T00:00:00Z'
      const mockRemoteBackups = [
        {
          id: 'old-backup',
          name: 'contactrack-backup-2023-12-01-123456.json',
          modifiedTime: oldTimestamp
        }
      ]

      // 新しいローカルデータ（更新日時が新しい）
      const newerTestPeople = [{
        ...testPeople[0],
        updatedAt: '2024-01-01T00:00:00Z'
      }]

      mockGapi.client.drive.files.list
        .mockResolvedValueOnce({
          result: { files: [{ id: 'test-folder-id' }] }
        })
        .mockResolvedValueOnce({
          result: { files: mockRemoteBackups }
        })

      mockGapi.client.request.mockResolvedValue({
        status: 200,
        result: { id: 'updated-backup-id' }
      })

      const result = await service.syncWithLocal(newerTestPeople)
      
      expect(result.success).toBe(true)
      expect(result.conflictResolution).toBe('local')
    })
  })

  describe('エラーハンドリング', () => {
    it('APIエラー時に適切なエラーメッセージを返す', async () => {
      // 新しいサービスインスタンスを作成
      service = new GoogleDriveService()
      
      mockGapi.load.mockImplementation((api: string, callback: Function) => {
        callback()
      })
      await service.initialize()

      // フォルダ取得は成功するがアップロードでエラー
      mockGapi.client.drive.files.list.mockResolvedValue({
        result: { files: [{ id: 'test-folder-id' }] }
      })
      mockGapi.client.request.mockRejectedValue(new Error('API Error'))

      const result = await service.uploadBackup(testPeople)
      
      expect(result.success).toBe(false)
      expect(result.message).toBe('バックアップ中にエラーが発生しました')
    })

    it('不正なバックアップデータ形式の場合はnullを返す', async () => {
      // 新しいサービスインスタンスを作成
      service = new GoogleDriveService()
      
      mockGapi.load.mockImplementation((api: string, callback: Function) => {
        callback()
      })
      await service.initialize()

      mockGapi.client.drive.files.get.mockResolvedValue({
        body: JSON.stringify({ invalid: 'data' })
      })

      const result = await service.downloadBackup('test-file-id')
      
      expect(result).toBeNull()
    })
  })
})