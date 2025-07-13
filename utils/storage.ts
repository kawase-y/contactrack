import type { Person } from '~/types'

const STORAGE_KEY = 'contactrack-people'

export const storageUtils = {
  // データを保存
  savePeople(people: Person[]): void {
    try {
      const data = JSON.stringify(people)
      localStorage.setItem(STORAGE_KEY, data)
    } catch (error) {
      console.error('データの保存に失敗しました:', error)
    }
  },

  // データを読み込み
  loadPeople(): Person[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) return []
      return JSON.parse(data) as Person[]
    } catch (error) {
      console.error('データの読み込みに失敗しました:', error)
      return []
    }
  },

  // データをクリア
  clearPeople(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('データのクリアに失敗しました:', error)
    }
  },

  // ストレージが利用可能かチェック
  isStorageAvailable(): boolean {
    try {
      const test = 'storage-test'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  },

  // データのバックアップ用JSON出力
  exportPeople(people: Person[]): string {
    try {
      return JSON.stringify(people, null, 2)
    } catch (error) {
      console.error('データのエクスポートに失敗しました:', error)
      return '[]'
    }
  },

  // JSONからデータをインポート
  importPeople(jsonData: string): Person[] {
    try {
      const data = JSON.parse(jsonData)
      if (!Array.isArray(data)) {
        throw new Error('無効なデータ形式です')
      }
      // 基本的なデータ構造の検証
      return data.filter(item => 
        item && 
        typeof item.id === 'string' && 
        typeof item.name === 'string' && 
        typeof item.relation === 'string'
      )
    } catch (error) {
      console.error('データのインポートに失敗しました:', error)
      throw new Error('無効なJSONデータです')
    }
  }
}