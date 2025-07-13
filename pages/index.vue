<template>
  <div class="container">
    <header class="app-header">
      <h1>ContacTrack</h1>
      <div class="header-actions">
        <button @click="exportData" class="btn btn-secondary btn-sm">
          エクスポート
        </button>
        <button @click="importData" class="btn btn-secondary btn-sm">
          インポート
        </button>
        <button @click="showForm = true" class="btn btn-primary">
          + 新規登録
        </button>
      </div>
    </header>

    <div v-if="showForm" class="modal-overlay" @click="closeForm">
      <div class="modal-content" @click.stop>
        <PersonForm
          :person="editingPerson"
          :is-edit="!!editingPerson"
          @submit="handleSubmit"
          @cancel="closeForm"
        />
      </div>
    </div>

    <!-- Google Drive 同期セクション -->
    <GoogleDriveSync 
      :people="people" 
      @data-updated="handleDataUpdated"
    />

    <div class="search-section">
      <input
        v-model="searchQuery"
        type="text"
        class="form-input"
        placeholder="名前や関係性で検索..."
      />
    </div>

    <div v-if="filteredPeople.length === 0" class="empty-state">
      <p>まだ人物が登録されていません</p>
      <button @click="showForm = true" class="btn btn-primary">
        最初の人物を登録
      </button>
    </div>

    <div v-else class="people-list">
      <PersonCard
        v-for="person in filteredPeople"
        :key="person.id"
        :person="person"
        @edit="editPerson"
        @delete="deletePerson"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Person, PersonForm } from '~/types'
import { storageUtils } from '~/utils/storage'

// リアクティブデータ
const people = ref<Person[]>([])
const showForm = ref(false)
const editingPerson = ref<Person | null>(null)
const searchQuery = ref('')

// 検索フィルタリング
const filteredPeople = computed(() => {
  if (!searchQuery.value) return people.value
  
  const query = searchQuery.value.toLowerCase()
  return people.value.filter(person => 
    person.name.toLowerCase().includes(query) ||
    person.relation.toLowerCase().includes(query) ||
    (person.memo && person.memo.toLowerCase().includes(query)) ||
    (person.tags && person.tags.some(tag => tag.toLowerCase().includes(query)))
  )
})

// フォーム送信処理
const handleSubmit = (form: PersonForm) => {
  if (editingPerson.value) {
    // 編集
    const index = people.value.findIndex(p => p.id === editingPerson.value!.id)
    if (index !== -1) {
      people.value[index] = {
        ...editingPerson.value,
        lastName: form.lastName,
        firstName: form.firstName,
        lastNameKana: form.lastNameKana,
        firstNameKana: form.firstNameKana,
        name: `${form.lastName} ${form.firstName}`, // 表示用フルネーム
        age: form.age,
        grade: form.grade,
        education: form.education,
        relation: form.relation,
        memo: form.memo,
        meetDate: form.meetDate,
        tags: form.tags,
        contactInfo: form.contactInfo,
        updatedAt: new Date().toISOString()
      }
    }
  } else {
    // 新規登録
    const newPerson: Person = {
      id: generateId(),
      lastName: form.lastName,
      firstName: form.firstName,
      lastNameKana: form.lastNameKana,
      firstNameKana: form.firstNameKana,
      name: `${form.lastName} ${form.firstName}`, // 表示用フルネーム
      age: form.age,
      grade: form.grade,
      education: form.education,
      relation: form.relation,
      memo: form.memo,
      meetDate: form.meetDate,
      tags: form.tags,
      contactInfo: form.contactInfo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    people.value.unshift(newPerson)
  }
  
  closeForm()
}

// Google Drive からのデータ更新を処理
const handleDataUpdated = (updatedPeople: Person[]) => {
  people.value = updatedPeople
}

// 人物編集
const editPerson = (person: Person) => {
  editingPerson.value = person
  showForm.value = true
}

// 人物削除
const deletePerson = (id: string) => {
  if (confirm('この人物を削除しますか？')) {
    people.value = people.value.filter(p => p.id !== id)
  }
}

// フォームを閉じる
const closeForm = () => {
  showForm.value = false
  editingPerson.value = null
}

// ID生成（簡易版）
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// ローカルストレージ関連の関数
const savePeopleToStorage = () => {
  storageUtils.savePeople(people.value)
}

const loadPeopleFromStorage = () => {
  if (process.client && storageUtils.isStorageAvailable()) {
    const loadedPeople = storageUtils.loadPeople()
    people.value = loadedPeople
  }
}

// 初期データの読み込み
onMounted(() => {
  loadPeopleFromStorage()
})

// データの自動保存（watchで変更を監視）
watch(people, () => {
  if (process.client) {
    savePeopleToStorage()
  }
}, { deep: true })

// データエクスポート機能
const exportData = () => {
  try {
    const jsonData = storageUtils.exportPeople(people.value)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contactrack-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    alert('データをエクスポートしました')
  } catch (error) {
    alert('エクスポートに失敗しました')
  }
}

// データインポート機能
const importData = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string
        const importedPeople = storageUtils.importPeople(jsonData)
        
        if (confirm(`${importedPeople.length}件のデータをインポートしますか？現在のデータは上書きされます。`)) {
          people.value = importedPeople
          alert('データをインポートしました')
        }
      } catch (error) {
        alert('インポートに失敗しました。有効なJSONファイルを選択してください。')
      }
    }
    reader.readAsText(file)
  }
  input.click()
}
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.app-header h1 {
  margin: 0;
  color: #333;
  font-size: 1.8rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

@media (max-width: 480px) {
  .header-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .app-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.search-section {
  margin-bottom: 1.5rem;
}

.people-list {
  display: grid;
  gap: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
}

.empty-state p {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
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
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

@media (min-width: 768px) {
  .people-list {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}
</style>