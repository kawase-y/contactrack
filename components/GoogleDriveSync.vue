<template>
  <div class="google-drive-sync">
    <div class="sync-header">
      <h3 class="sync-title">
        <span class="sync-icon">☁️</span>
        Google Drive 同期
      </h3>
      <div class="sync-status">
        <span v-if="isSignedIn" class="status-badge status-connected">
          接続済み
        </span>
        <span v-else class="status-badge status-disconnected">
          未接続
        </span>
      </div>
    </div>

    <div v-if="!isSignedIn" class="auth-section">
      <p class="auth-description">
        Google Driveと連携することで、複数の端末間でデータを同期できます。
      </p>
      <button 
        @click="signIn" 
        :disabled="isLoading"
        class="btn btn-primary sync-button"
      >
        <span v-if="isLoading">接続中...</span>
        <span v-else>Google Driveに接続</span>
      </button>
    </div>

    <div v-else class="sync-actions">
      <div class="action-grid">
        <button 
          @click="uploadBackup" 
          :disabled="isLoading"
          class="btn btn-primary action-button"
        >
          <span class="action-icon">⬆️</span>
          <div class="action-content">
            <div class="action-title">バックアップ</div>
            <div class="action-description">現在のデータをGoogle Driveに保存</div>
          </div>
        </button>

        <button 
          @click="openBackupList" 
          :disabled="isLoading"
          class="btn btn-secondary action-button"
        >
          <span class="action-icon">⬇️</span>
          <div class="action-content">
            <div class="action-title">復元</div>
            <div class="action-description">Google Driveからデータを復元</div>
          </div>
        </button>

        <button 
          @click="syncData" 
          :disabled="isLoading"
          class="btn btn-info action-button"
        >
          <span class="action-icon">🔄</span>
          <div class="action-content">
            <div class="action-title">同期</div>
            <div class="action-description">最新データと自動同期</div>
          </div>
        </button>

        <button 
          @click="signOut" 
          :disabled="isLoading"
          class="btn btn-danger action-button"
        >
          <span class="action-icon">🔓</span>
          <div class="action-content">
            <div class="action-title">切断</div>
            <div class="action-description">Google Driveから切断</div>
          </div>
        </button>
      </div>

      <div v-if="lastSyncTime" class="sync-info">
        <p class="last-sync">
          最終同期: {{ formatDateTime(lastSyncTime) }}
        </p>
      </div>
    </div>

    <!-- バックアップ一覧モーダル -->
    <div v-if="showBackupList" class="modal-overlay" @click="closeBackupList">
      <div class="modal-content backup-modal" @click.stop>
        <div class="modal-header">
          <h3>バックアップ一覧</h3>
          <button @click="closeBackupList" class="btn-close">✕</button>
        </div>
        
        <div class="modal-body">
          <div v-if="isLoadingBackups" class="loading-state">
            <p>バックアップを読み込み中...</p>
          </div>
          
          <div v-else-if="backups.length === 0" class="empty-state">
            <p>バックアップが見つかりませんでした</p>
          </div>
          
          <div v-else class="backup-list">
            <div 
              v-for="backup in backups" 
              :key="backup.id"
              class="backup-item"
            >
              <div class="backup-info">
                <div class="backup-name">{{ formatBackupName(backup.name) }}</div>
                <div class="backup-meta">
                  <span class="backup-date">{{ formatDateTime(backup.modifiedTime) }}</span>
                  <span v-if="backup.size" class="backup-size">{{ formatFileSize(backup.size) }}</span>
                </div>
              </div>
              <button 
                @click="restoreBackup(backup.id)"
                :disabled="isLoading"
                class="btn btn-primary btn-sm"
              >
                復元
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- メッセージ表示 -->
    <div v-if="message" class="message" :class="messageType">
      <p>{{ message }}</p>
      <button @click="clearMessage" class="btn-close-message">✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import type { Person } from '~/types'
import { googleDriveService, type GoogleDriveFile, type SyncResult } from '~/utils/googleDrive'

interface Props {
  people: Person[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  dataUpdated: [people: Person[]]
}>()

// リアクティブデータ
const isSignedIn = ref(false)
const isLoading = ref(false)
const isLoadingBackups = ref(false)
const showBackupList = ref(false)
const backups = ref<GoogleDriveFile[]>([])
const message = ref('')
const messageType = ref<'success' | 'error' | 'info'>('info')
const lastSyncTime = ref<string | null>(null)

// 初期化
onMounted(async () => {
  const initialized = await googleDriveService.initialize()
  if (initialized) {
    isSignedIn.value = googleDriveService.getSignInStatus()
    loadLastSyncTime()
  }
})

// ローカルストレージから最終同期時刻を読み込み
const loadLastSyncTime = () => {
  if (process.client) {
    const stored = localStorage.getItem('contactrack-last-sync')
    if (stored) {
      lastSyncTime.value = stored
    }
  }
}

// 最終同期時刻を保存
const saveLastSyncTime = () => {
  if (process.client) {
    const now = new Date().toISOString()
    lastSyncTime.value = now
    localStorage.setItem('contactrack-last-sync', now)
  }
}

// サインイン
const signIn = async () => {
  isLoading.value = true
  try {
    const success = await googleDriveService.signIn()
    if (success) {
      isSignedIn.value = true
      showMessage('Google Driveに接続しました', 'success')
    } else {
      showMessage('Google Driveへの接続に失敗しました', 'error')
    }
  } catch (error) {
    showMessage('接続中にエラーが発生しました', 'error')
  } finally {
    isLoading.value = false
  }
}

// サインアウト
const signOut = async () => {
  isLoading.value = true
  try {
    await googleDriveService.signOut()
    isSignedIn.value = false
    lastSyncTime.value = null
    if (process.client) {
      localStorage.removeItem('contactrack-last-sync')
    }
    showMessage('Google Driveから切断しました', 'info')
  } catch (error) {
    showMessage('切断中にエラーが発生しました', 'error')
  } finally {
    isLoading.value = false
  }
}

// バックアップ作成
const uploadBackup = async () => {
  isLoading.value = true
  try {
    const result = await googleDriveService.uploadBackup(props.people)
    if (result.success) {
      saveLastSyncTime()
      showMessage(result.message, 'success')
    } else {
      showMessage(result.message, 'error')
    }
  } catch (error) {
    showMessage('バックアップ中にエラーが発生しました', 'error')
  } finally {
    isLoading.value = false
  }
}

// データ同期
const syncData = async () => {
  isLoading.value = true
  try {
    const result = await googleDriveService.syncWithLocal(props.people)
    if (result.success) {
      saveLastSyncTime()
      
      // 競合解決の結果に応じてメッセージを調整
      let message = result.message
      if (result.conflictResolution === 'remote') {
        message += ' (リモートデータで更新されました)'
        // ページをリロードして最新データを反映
        window.location.reload()
      } else if (result.conflictResolution === 'local') {
        message += ' (ローカルデータでリモートを更新しました)'
      }
      
      showMessage(message, 'success')
    } else {
      showMessage(result.message, 'error')
    }
  } catch (error) {
    showMessage('同期中にエラーが発生しました', 'error')
  } finally {
    isLoading.value = false
  }
}

// バックアップ一覧を取得
const loadBackups = async () => {
  isLoadingBackups.value = true
  try {
    backups.value = await googleDriveService.listBackups()
  } catch (error) {
    showMessage('バックアップ一覧の取得に失敗しました', 'error')
  } finally {
    isLoadingBackups.value = false
  }
}

// バックアップから復元
const restoreBackup = async (fileId: string) => {
  isLoading.value = true
  try {
    const result = await googleDriveService.restoreFromBackup(fileId)
    if (result.success) {
      saveLastSyncTime()
      showMessage(result.message, 'success')
      closeBackupList()
      // ページをリロードして最新データを反映
      window.location.reload()
    } else {
      showMessage(result.message, 'error')
    }
  } catch (error) {
    showMessage('復元中にエラーが発生しました', 'error')
  } finally {
    isLoading.value = false
  }
}

// バックアップ一覧モーダルを開く
const openBackupList = async () => {
  showBackupList.value = true
  await loadBackups()
}

// バックアップ一覧モーダルを閉じる
const closeBackupList = () => {
  showBackupList.value = false
  backups.value = []
}

// メッセージ表示
const showMessage = (msg: string, type: 'success' | 'error' | 'info') => {
  message.value = msg
  messageType.value = type
  
  // 自動でメッセージを消去
  setTimeout(() => {
    clearMessage()
  }, 5000)
}

// メッセージクリア
const clearMessage = () => {
  message.value = ''
}

// 日時フォーマット
const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('ja-JP')
}

// バックアップ名フォーマット
const formatBackupName = (fileName: string) => {
  // ファイル名から日付部分を抽出して読みやすくする
  const match = fileName.match(/contactrack-backup-(\d{4}-\d{2}-\d{2})-(\d+)\.json/)
  if (match) {
    const date = match[1]
    const timestamp = new Date(parseInt(match[2]))
    return `${date} ${timestamp.toLocaleTimeString('ja-JP')}`
  }
  return fileName
}

// ファイルサイズフォーマット
const formatFileSize = (sizeString: string) => {
  const size = parseInt(sizeString)
  if (size < 1024) return `${size}B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)}KB`
  return `${Math.round(size / (1024 * 1024))}MB`
}

// バックアップ一覧を開く際の処理を修正
watch(() => showBackupList.value, (newValue) => {
  if (newValue) {
    loadBackups()
  }
})
</script>

<style scoped>
.google-drive-sync {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
}

.sync-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.sync-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.sync-icon {
  font-size: 1.3rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-connected {
  background: #d4edda;
  color: #155724;
}

.status-disconnected {
  background: #f8d7da;
  color: #721c24;
}

.auth-section {
  text-align: center;
  padding: 2rem 1rem;
}

.auth-description {
  margin-bottom: 1.5rem;
  color: #666;
  line-height: 1.5;
}

.sync-button {
  padding: 0.75rem 2rem;
  font-size: 1rem;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  text-align: left;
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.action-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.action-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.action-content {
  flex: 1;
}

.action-title {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.action-description {
  font-size: 0.75rem;
  opacity: 0.8;
  line-height: 1.3;
}

.sync-info {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.last-sync {
  margin: 0;
  font-size: 0.8rem;
  color: #666;
}

/* モーダル */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-height: 80vh;
  overflow-y: auto;
  width: 100%;
  max-width: 500px;
}

.backup-modal {
  max-width: 600px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-close:hover {
  background: #f8f9fa;
}

.modal-body {
  padding: 1.5rem;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.backup-list {
  space-y: 1rem;
}

.backup-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.backup-info {
  flex: 1;
}

.backup-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.backup-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #666;
}

.backup-date,
.backup-size {
  display: inline-block;
}

/* メッセージ */
.message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1001;
  max-width: 400px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.message.info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.message p {
  margin: 0;
  flex: 1;
}

.btn-close-message {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.btn-close-message:hover {
  opacity: 1;
}

@media (max-width: 480px) {
  .action-grid {
    grid-template-columns: 1fr;
  }
  
  .action-button {
    gap: 0.75rem;
    padding: 0.75rem;
  }
  
  .sync-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .message {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style>