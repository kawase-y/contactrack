<template>
  <div class="card person-card" @click="$emit('edit', person)">
    <div class="person-header">
      <div class="name-info">
        <h3 class="person-name">{{ person.name }}</h3>
        <p v-if="fullNameKana" class="person-name-kana">{{ fullNameKana }}</p>
      </div>
      <span v-if="gradeText" class="person-grade">{{ gradeText }}</span>
    </div>
    
    <div class="person-info">
      <p class="person-relation">{{ person.relation }}</p>
      <p v-if="person.age" class="person-age">{{ person.age }}歳</p>
      <p v-if="person.education" class="person-education">{{ person.education }}</p>
    </div>
    
    <div v-if="person.memo" class="person-memo">
      <p>{{ person.memo }}</p>
    </div>
    
    <div v-if="person.tags && person.tags.length" class="person-tags">
      <span v-for="tag in person.tags" :key="tag" class="tag">{{ tag }}</span>
    </div>
    
    <!-- 連絡先情報 -->
    <div v-if="hasContactInfo" class="contact-info">
      <div v-if="person.contactInfo?.email" class="contact-item">
        <span class="contact-icon">📧</span>
        <a :href="`mailto:${person.contactInfo.email}`" class="contact-link" @click.stop>
          {{ person.contactInfo.email }}
        </a>
      </div>
      <div v-if="person.contactInfo?.phone" class="contact-item">
        <span class="contact-icon">📱</span>
        <a :href="`tel:${person.contactInfo.phone}`" class="contact-link" @click.stop>
          {{ person.contactInfo.phone }}
        </a>
      </div>
      <div v-if="person.contactInfo?.social" class="contact-item">
        <span class="contact-icon">💬</span>
        <span class="contact-text">{{ person.contactInfo.social }}</span>
      </div>
    </div>
    
    <div class="person-actions">
      <button @click.stop="$emit('edit', person)" class="btn btn-sm">編集</button>
      <button @click.stop="$emit('delete', person.id)" class="btn btn-sm btn-danger">削除</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Person } from '~/types'

interface Props {
  person: Person
}

const props = defineProps<Props>()
defineEmits<{
  edit: [person: Person]
  delete: [id: string]
}>()

const hasContactInfo = computed(() => {
  const contact = props.person.contactInfo
  return contact && (contact.email || contact.phone || contact.social)
})

// 年次を表示用テキストに変換
const gradeText = computed(() => {
  const grade = props.person.grade
  if (grade === undefined || grade === null) return ''
  
  if (grade === 0) return '0'
  if (grade > 0) return `+${grade}`
  if (grade < 0) return `${grade}`
  
  return ''
})

// 振り仮名の表示用テキスト
const fullNameKana = computed(() => {
  const lastKana = props.person.lastNameKana
  const firstKana = props.person.firstNameKana
  
  if (lastKana && firstKana) {
    return `${lastKana} ${firstKana}`
  } else if (lastKana || firstKana) {
    return `${lastKana || ''}${firstKana || ''}`
  }
  
  return ''
})
</script>

<style scoped>
.person-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.person-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.person-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.name-info {
  flex: 1;
}

.person-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}

.person-name-kana {
  font-size: 0.85rem;
  color: #666;
  margin: 0.25rem 0 0 0;
  font-style: italic;
}

.person-grade {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.person-info {
  margin-bottom: 0.5rem;
}

.person-relation {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

.person-age {
  color: #888;
  margin: 0;
  font-size: 0.8rem;
}

.person-education {
  color: #666;
  margin: 0;
  font-size: 0.8rem;
  background: #f0f8ff;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  display: inline-block;
}

.person-memo {
  margin-bottom: 0.75rem;
  color: #555;
  font-size: 0.9rem;
  line-height: 1.4;
}

.person-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.tag {
  background: #f0f0f0;
  color: #333;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.75rem;
}

.person-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.contact-info {
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #007bff;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
}

.contact-item:last-child {
  margin-bottom: 0;
}

.contact-icon {
  font-size: 0.9rem;
  width: 16px;
  text-align: center;
}

.contact-link {
  color: #007bff;
  text-decoration: none;
  transition: color 0.2s;
}

.contact-link:hover {
  color: #0056b3;
  text-decoration: underline;
}

.contact-text {
  color: #495057;
}
</style>