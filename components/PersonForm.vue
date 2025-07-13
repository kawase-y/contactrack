<template>
  <form @submit.prevent="handleSubmit" class="person-form">
    <!-- 名前セクション -->
    <div class="name-section">
      <div class="form-row">
        <div class="form-group">
          <label for="lastName" class="form-label">姓 *</label>
          <input
            id="lastName"
            v-model="form.lastName"
            type="text"
            class="form-input"
            required
            placeholder="山田"
          />
        </div>
        
        <div class="form-group">
          <label for="firstName" class="form-label">名 *</label>
          <input
            id="firstName"
            v-model="form.firstName"
            type="text"
            class="form-input"
            required
            placeholder="太郎"
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="lastNameKana" class="form-label">姓（ふりがな）</label>
          <input
            id="lastNameKana"
            v-model="form.lastNameKana"
            type="text"
            class="form-input"
            placeholder="やまだ"
            @input="isLastNameKanaManualEdit = true"
          />
        </div>
        
        <div class="form-group">
          <label for="firstNameKana" class="form-label">名（ふりがな）</label>
          <input
            id="firstNameKana"
            v-model="form.firstNameKana"
            type="text"
            class="form-input"
            placeholder="たろう"
            @input="isFirstNameKanaManualEdit = true"
          />
        </div>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="age" class="form-label">年齢</label>
        <input
          id="age"
          v-model.number="form.age"
          type="number"
          class="form-input"
          min="0"
          max="120"
          placeholder="25"
        />
      </div>

      <div class="form-group">
        <label for="grade" class="form-label">年次</label>
        <select
          id="grade"
          v-model.number="form.grade"
          class="form-input"
        >
          <option value="30">+30</option>
          <option value="29">+29</option>
          <option value="28">+28</option>
          <option value="27">+27</option>
          <option value="26">+26</option>
          <option value="25">+25</option>
          <option value="24">+24</option>
          <option value="23">+23</option>
          <option value="22">+22</option>
          <option value="21">+21</option>
          <option value="20">+20</option>
          <option value="19">+19</option>
          <option value="18">+18</option>
          <option value="17">+17</option>
          <option value="16">+16</option>
          <option value="15">+15</option>
          <option value="14">+14</option>
          <option value="13">+13</option>
          <option value="12">+12</option>
          <option value="11">+11</option>
          <option value="10">+10</option>
          <option value="9">+9</option>
          <option value="8">+8</option>
          <option value="7">+7</option>
          <option value="6">+6</option>
          <option value="5">+5</option>
          <option value="4">+4</option>
          <option value="3">+3</option>
          <option value="2">+2</option>
          <option value="1">+1</option>
          <option value="0">0 (同期)</option>
          <option value="-1">-1</option>
          <option value="-2">-2</option>
          <option value="-3">-3</option>
          <option value="-4">-4</option>
          <option value="-5">-5</option>
          <option value="-6">-6</option>
          <option value="-7">-7</option>
          <option value="-8">-8</option>
          <option value="-9">-9</option>
          <option value="-10">-10</option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label for="education" class="form-label">学歴</label>
      <select
        id="education"
        v-model="form.education"
        class="form-input"
      >
        <option value="">選択してください</option>
        <option value="専門学校">専門学校</option>
        <option value="学卒">学卒（大学）</option>
        <option value="修士">修士</option>
        <option value="ドクター">ドクター</option>
        <option value="不明">不明</option>
      </select>
    </div>

    <div class="form-group">
      <label for="relation" class="form-label">関係性 *</label>
      <select
        id="relation"
        v-model="form.relation"
        class="form-input"
        required
      >
        <option value="">選択してください</option>
        <option value="仕事">仕事</option>
        <option value="勉強会">勉強会</option>
        <option value="学生時代">学生時代</option>
        <option value="買い物">買い物</option>
        <option value="その他">その他</option>
      </select>
    </div>

    <div class="form-group">
      <label for="meetDate" class="form-label">出会った日</label>
      <input
        id="meetDate"
        v-model="form.meetDate"
        type="date"
        class="form-input"
      />
    </div>

    <div class="form-group">
      <label for="memo" class="form-label">メモ</label>
      <textarea
        id="memo"
        v-model="form.memo"
        class="form-input"
        rows="3"
        placeholder="営業部所属、ゴルフが趣味..."
      ></textarea>
    </div>

    <div class="form-group">
      <label for="tags" class="form-label">タグ</label>
      <input
        id="tags"
        v-model="tagsInput"
        type="text"
        class="form-input"
        placeholder="同期,営業,ゴルフ （カンマ区切り）"
      />
    </div>

    <!-- 連絡先情報セクション -->
    <div class="contact-section">
      <h3 class="section-title">連絡先情報</h3>
      
      <div class="form-group">
        <label for="email" class="form-label">メールアドレス</label>
        <input
          id="email"
          v-model="form.contactInfo.email"
          type="email"
          class="form-input"
          placeholder="example@email.com"
        />
      </div>

      <div class="form-group">
        <label for="phone" class="form-label">電話番号</label>
        <input
          id="phone"
          v-model="form.contactInfo.phone"
          type="tel"
          class="form-input"
          placeholder="090-1234-5678"
        />
      </div>

      <div class="form-group">
        <label for="social" class="form-label">SNS・その他</label>
        <input
          id="social"
          v-model="form.contactInfo.social"
          type="text"
          class="form-input"
          placeholder="@username, LINE ID, など"
        />
      </div>
    </div>

    <div class="form-actions">
      <button type="button" @click="$emit('cancel')" class="btn btn-secondary">
        キャンセル
      </button>
      <button type="submit" class="btn btn-primary">
        {{ isEdit ? '更新' : '登録' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Person, PersonForm } from '~/types'
import { kanaConverter } from '~/utils/kanaConverter'

interface Props {
  person?: Person
  isEdit?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [form: PersonForm]
  cancel: []
}>()

const form = ref<PersonForm>({
  lastName: '',
  firstName: '',
  lastNameKana: '',
  firstNameKana: '',
  relation: '',
  age: undefined,
  grade: 0,
  education: undefined,
  memo: '',
  meetDate: '',
  tags: [],
  contactInfo: {
    email: '',
    phone: '',
    social: ''
  }
})

const tagsInput = ref('')

// 振り仮名の自動変換制御フラグ
const isLastNameKanaManualEdit = ref(false)
const isFirstNameKanaManualEdit = ref(false)

// tagsInputからform.tagsへの変換
watch(tagsInput, (newValue) => {
  form.value.tags = newValue
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
})

// 姓の自動変換
watch(() => form.value.lastName, (newLastName) => {
  if (!isLastNameKanaManualEdit.value && newLastName) {
    const convertedKana = kanaConverter.convertToKana(newLastName)
    if (convertedKana) {
      form.value.lastNameKana = convertedKana
    }
  }
})

// 名の自動変換
watch(() => form.value.firstName, (newFirstName) => {
  if (!isFirstNameKanaManualEdit.value && newFirstName) {
    const convertedKana = kanaConverter.convertToKana(newFirstName)
    if (convertedKana) {
      form.value.firstNameKana = convertedKana
    }
  }
})

// 姓の振り仮名手動編集検知
watch(() => form.value.lastNameKana, () => {
  isLastNameKanaManualEdit.value = true
})

// 名の振り仮名手動編集検知
watch(() => form.value.firstNameKana, () => {
  isFirstNameKanaManualEdit.value = true
})

// 編集時のフォーム初期化
watch(() => props.person, (person) => {
  if (person) {
    form.value = {
      lastName: person.lastName || '',
      firstName: person.firstName || '',
      lastNameKana: person.lastNameKana || '',
      firstNameKana: person.firstNameKana || '',
      age: person.age,
      grade: person.grade ?? 0,
      education: person.education,
      relation: person.relation,
      memo: person.memo || '',
      meetDate: person.meetDate || '',
      tags: person.tags || [],
      contactInfo: person.contactInfo || { email: '', phone: '', social: '' }
    }
    tagsInput.value = (person.tags || []).join(', ')
    // 編集時は手動編集フラグをリセット
    isLastNameKanaManualEdit.value = false
    isFirstNameKanaManualEdit.value = false
  }
}, { immediate: true })

// バリデーション関数
const validateEmail = (email: string): boolean => {
  if (!email) return true // 空の場合は有効
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePhone = (phone: string): boolean => {
  if (!phone) return true // 空の場合は有効
  // 日本の電話番号形式をチェック（ハイフンあり/なし両対応）
  const phoneRegex = /^(0\d{1,4}-?\d{1,4}-?\d{3,4}|0\d{9,10})$/
  return phoneRegex.test(phone.replace(/[-\s]/g, ''))
}

const handleSubmit = () => {
  // 連絡先情報のバリデーション
  if (form.value.contactInfo?.email && !validateEmail(form.value.contactInfo.email)) {
    alert('有効なメールアドレスを入力してください')
    return
  }
  
  if (form.value.contactInfo?.phone && !validatePhone(form.value.contactInfo.phone)) {
    alert('有効な電話番号を入力してください（例: 090-1234-5678）')
    return
  }
  
  emit('submit', form.value)
}

// フォームリセット関数（親コンポーネントから呼び出し可能）
const resetForm = () => {
  form.value = {
    lastName: '',
    firstName: '',
    lastNameKana: '',
    firstNameKana: '',
    relation: '',
    age: undefined,
    grade: 0,
    education: undefined,
    memo: '',
    meetDate: '',
    tags: [],
    contactInfo: {
      email: '',
      phone: '',
      social: ''
    }
  }
  tagsInput.value = ''
  isLastNameKanaManualEdit.value = false
  isFirstNameKanaManualEdit.value = false
}

// フォームリセット関数を外部に公開
defineExpose({
  resetForm
})
</script>

<style scoped>
.person-form {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 480px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
}

@media (max-width: 480px) {
  .form-actions {
    flex-direction: column;
  }
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

textarea.form-input {
  resize: vertical;
  min-height: 80px;
}

.contact-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 1rem;
  margin-top: 0;
}

.name-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}
</style>