<template>
  <div class="list-view">
    <!-- 表示モード切り替えボタン -->
    <div class="view-controls mb-4">
      <div class="flex items-center gap-2">
        <button
          @click="$emit('update:viewMode', 'card')"
          :class="[
            'px-3 py-2 rounded-md text-sm font-medium transition-colors',
            viewMode === 'card'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
        >
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
          カード表示
        </button>
        <button
          @click="$emit('update:viewMode', 'list')"
          :class="[
            'px-3 py-2 rounded-md text-sm font-medium transition-colors',
            viewMode === 'list'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
        >
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
          </svg>
          リスト表示
        </button>
      </div>
      
      <!-- ページサイズ選択 -->
      <div class="flex items-center gap-2 ml-auto">
        <label class="text-sm text-gray-600">表示件数:</label>
        <select 
          :value="pageSize"
          @change="$emit('update:pageSize', parseInt($event.target.value))"
          class="px-2 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="5">5件</option>
          <option value="10">10件</option>
          <option value="20">20件</option>
          <option value="50">50件</option>
        </select>
      </div>
    </div>

    <!-- データが空の場合 -->
    <div v-if="people.length === 0" data-testid="empty-message" class="text-center py-8 text-gray-500">
      <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
      </svg>
      <p class="text-lg font-medium">データがありません</p>
      <p class="text-sm">新しい人物を追加してください。</p>
    </div>

    <!-- コンテンツエリア -->
    <div v-else>
      <!-- カード表示 -->
      <div v-if="effectiveViewMode === 'card'" class="grid gap-4" :class="gridCols">
        <PersonCard
          v-for="person in paginatedPeople"
          :key="person.id"
          :person="person"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
        />
      </div>

      <!-- リスト表示 -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名前</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">年齢</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">年次</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">関係性</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">タグ</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="person in paginatedPeople" :key="person.id" class="hover:bg-gray-50">
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ person.name }}</div>
                    <div v-if="person.lastNameKana && person.firstNameKana" class="text-sm text-gray-500">
                      {{ person.lastNameKana }} {{ person.firstNameKana }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ person.age || '-' }}歳
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatGrade(person.grade) }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {{ person.relation }}
                </span>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="tag in person.tags?.slice(0, 3)" 
                    :key="tag"
                    class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                  >
                    {{ tag }}
                  </span>
                  <span v-if="person.tags && person.tags.length > 3" class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                    +{{ person.tags.length - 3 }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  @click="$emit('edit', person)"
                  class="text-blue-600 hover:text-blue-900 mr-2"
                >
                  編集
                </button>
                <button
                  @click="$emit('delete', person)"
                  class="text-red-600 hover:text-red-900"
                >
                  削除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ページネーション -->
      <div v-if="totalPages > 1" data-testid="pagination" class="mt-6 flex items-center justify-between">
        <div class="flex items-center text-sm text-gray-700">
          <span>
            {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, people.length) }} 件 
            / 全 {{ people.length }} 件
          </span>
        </div>
        
        <div class="flex items-center space-x-2">
          <button
            @click="$emit('update:currentPage', currentPage - 1)"
            :disabled="currentPage <= 1"
            class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            前へ
          </button>
          
          <div class="flex space-x-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="$emit('update:currentPage', page)"
              :data-testid="'page-button'"
              :class="[
                'px-3 py-2 text-sm font-medium rounded-md',
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
          </div>
          
          <button
            @click="$emit('update:currentPage', currentPage + 1)"
            :disabled="currentPage >= totalPages"
            data-testid="next-page"
            class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            次へ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Person } from '~/types'
import PersonCard from '~/components/PersonCard.vue'

interface Props {
  people: Person[]
  viewMode: 'card' | 'list'
  pageSize: number
  currentPage: number
  isMobile?: boolean
}

interface Emits {
  (e: 'update:viewMode', value: 'card' | 'list'): void
  (e: 'update:pageSize', value: number): void
  (e: 'update:currentPage', value: number): void
  (e: 'edit', person: Person): void
  (e: 'delete', person: Person): void
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 10,
  currentPage: 1,
  isMobile: false
})

const emit = defineEmits<Emits>()

// 有効な表示モード（不正な値の場合はカード表示にフォールバック）
const effectiveViewMode = computed(() => {
  return ['card', 'list'].includes(props.viewMode) ? props.viewMode : 'card'
})

// グリッドのカラム数（レスポンシブ対応）
const gridCols = computed(() => {
  if (props.isMobile) {
    return 'grid-cols-1'
  }
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
})

// 総ページ数
const totalPages = computed(() => {
  return Math.ceil(props.people.length / props.pageSize)
})

// 現在のページに表示する人物データ
const paginatedPeople = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize
  const end = start + props.pageSize
  return props.people.slice(start, end)
})

// ページネーションで表示するページ番号
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, props.currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// 年次フォーマット関数
const formatGrade = (grade: number | undefined): string => {
  if (grade === undefined || grade === null) return '-'
  if (grade === 0) return '同期'
  if (grade > 0) return `+${grade}`
  return `${grade}`
}
</script>

<style scoped>
.list-view {
  width: 100%;
}

.view-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

@media (max-width: 640px) {
  .view-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .view-controls > div {
    justify-content: center;
  }
}
</style>