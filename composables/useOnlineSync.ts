import { ref, onMounted, onUnmounted } from 'vue'
import type { Person } from '~/types'
import { googleDriveService } from '~/utils/googleDrive'

export function useOnlineSync(people: Ref<Person[]>) {
  const isOnline = ref(true)
  const isAutoSyncEnabled = ref(false)
  const lastOnlineTime = ref<Date | null>(null)

  // オンライン状態の監視
  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine
    
    if (isOnline.value) {
      lastOnlineTime.value = new Date()
      // オンライン復帰時に自動同期を実行
      if (isAutoSyncEnabled.value) {
        performAutoSync()
      }
    }
  }

  // 自動同期の実行
  const performAutoSync = async () => {
    try {
      // Google Driveにサインインしているかチェック
      if (!googleDriveService.getSignInStatus()) {
        return
      }

      // 最後の同期から一定時間経過している場合のみ同期
      const lastSyncTime = localStorage.getItem('contactrack-last-sync')
      if (lastSyncTime) {
        const timeSinceLastSync = Date.now() - new Date(lastSyncTime).getTime()
        const minSyncInterval = 5 * 60 * 1000 // 5分

        if (timeSinceLastSync < minSyncInterval) {
          return
        }
      }

      console.log('Performing auto-sync...')
      await googleDriveService.syncWithLocal(people.value)
    } catch (error) {
      console.error('Auto-sync failed:', error)
    }
  }

  // 自動同期の有効/無効切り替え
  const toggleAutoSync = () => {
    isAutoSyncEnabled.value = !isAutoSyncEnabled.value
    
    // 設定をローカルストレージに保存
    if (process.client) {
      localStorage.setItem('contactrack-auto-sync', isAutoSyncEnabled.value.toString())
    }
  }

  // 初期化
  onMounted(() => {
    // オンライン状態の初期化
    isOnline.value = navigator.onLine
    
    // 自動同期設定の読み込み
    if (process.client) {
      const storedAutoSync = localStorage.getItem('contactrack-auto-sync')
      isAutoSyncEnabled.value = storedAutoSync === 'true'
    }

    // イベントリスナーの追加
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // 定期的な同期チェック（30分ごと）
    const syncInterval = setInterval(() => {
      if (isOnline.value && isAutoSyncEnabled.value) {
        performAutoSync()
      }
    }, 30 * 60 * 1000)

    // クリーンアップ
    onUnmounted(() => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      clearInterval(syncInterval)
    })
  })

  return {
    isOnline: readonly(isOnline),
    isAutoSyncEnabled: readonly(isAutoSyncEnabled),
    lastOnlineTime: readonly(lastOnlineTime),
    toggleAutoSync,
    performAutoSync
  }
}