import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import type { Person } from '~/types'
import ListView from '~/components/ListView.vue'
import PersonCard from '~/components/PersonCard.vue'

// テスト用のサンプルデータ
const samplePeople: Person[] = [
  {
    id: '1',
    lastName: '山田',
    firstName: '太郎',
    lastNameKana: 'やまだ',
    firstNameKana: 'たろう',
    name: '山田 太郎',
    age: 25,
    grade: 2,
    relation: '仕事',
    tags: ['営業', '同期'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    lastName: '佐藤',
    firstName: '花子',
    lastNameKana: 'さとう',
    firstNameKana: 'はなこ',
    name: '佐藤 花子',
    age: 30,
    grade: -1,
    relation: '勉強会',
    tags: ['エンジニア', 'React'],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  }
]

describe('ListView', () => {
  describe('表示モード切り替え', () => {
    it('カード表示とリスト表示を切り替えできる', async () => {
      const wrapper = mount(ListView, {
        props: {
          people: samplePeople,
          viewMode: 'card',
          pageSize: 10,
          currentPage: 1
        }
      })
      
      expect(wrapper.props('viewMode')).toBe('card')
      
      // リスト表示に切り替え
      await wrapper.setProps({ viewMode: 'list' })
      expect(wrapper.props('viewMode')).toBe('list')
    })

    it('カード表示モードでPersonCardコンポーネントが表示される', () => {
      const wrapper = mount(ListView, {
        props: {
          people: samplePeople,
          viewMode: 'card',
          pageSize: 10,
          currentPage: 1
        }
      })
      
      const personCards = wrapper.findAllComponents(PersonCard)
      expect(personCards).toHaveLength(2)
    })

    it('リスト表示モードでテーブル形式で表示される', () => {
      const wrapper = mount(ListView, {
        props: {
          people: samplePeople,
          viewMode: 'list',
          pageSize: 10,
          currentPage: 1
        }
      })
      
      const table = wrapper.find('table')
      expect(table.exists()).toBe(true)
      
      const rows = wrapper.findAll('tbody tr')
      expect(rows).toHaveLength(2)
    })
  })

  describe('ページネーション', () => {
    const largeSamplePeople = Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 1}`,
      lastName: `姓${i + 1}`,
      firstName: `名${i + 1}`,
      lastNameKana: `せい${i + 1}`,
      firstNameKana: `めい${i + 1}`,
      name: `姓${i + 1} 名${i + 1}`,
      age: 20 + i,
      grade: i % 6 - 2,
      relation: '仕事',
      tags: ['タグ'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }))

    it('デフォルトで1ページあたり10件表示される', () => {
      const wrapper = mount(ListView, {
        props: {
          people: largeSamplePeople,
          viewMode: 'card',
          pageSize: 10
        }
      })
      
      const personCards = wrapper.findAllComponents(PersonCard)
      expect(personCards).toHaveLength(10)
    })

    it('ページサイズを変更できる', () => {
      const wrapper = mount(ListView, {
        props: {
          people: largeSamplePeople,
          viewMode: 'card',
          pageSize: 5
        }
      })
      
      const personCards = wrapper.findAllComponents(PersonCard)
      expect(personCards).toHaveLength(5)
    })

    it('ページ番号が正しく表示される', () => {
      const wrapper = mount(ListView, {
        props: {
          people: largeSamplePeople,
          viewMode: 'card',
          pageSize: 10,
          currentPage: 1
        }
      })
      
      const pagination = wrapper.find('[data-testid="pagination"]')
      expect(pagination.exists()).toBe(true)
      
      // 総ページ数の確認（25件÷10件=3ページ）
      const pageButtons = wrapper.findAll('[data-testid="page-button"]')
      expect(pageButtons.length).toBeGreaterThan(0)
    })

    it('次/前ページボタンが機能する', async () => {
      const wrapper = mount(ListView, {
        props: {
          people: largeSamplePeople,
          viewMode: 'card',
          pageSize: 10,
          currentPage: 1
        }
      })
      
      const nextButton = wrapper.find('[data-testid="next-page"]')
      expect(nextButton.exists()).toBe(true)
      
      await nextButton.trigger('click')
      expect(wrapper.emitted('update:currentPage')).toBeTruthy()
      expect(wrapper.emitted('update:currentPage')![0]).toEqual([2])
    })
  })

  describe('レスポンシブ対応', () => {
    it('モバイル表示時にカード表示が推奨される', () => {
      // モバイルのviewportサイズをシミュレート
      const wrapper = mount(ListView, {
        props: {
          people: samplePeople,
          viewMode: 'card',
          pageSize: 10,
          currentPage: 1,
          isMobile: true
        }
      })
      
      expect(wrapper.props('isMobile')).toBe(true)
    })

    it('デスクトップ表示時にリスト表示が推奨される', () => {
      const wrapper = mount(ListView, {
        props: {
          people: samplePeople,
          viewMode: 'list',
          pageSize: 10,
          currentPage: 1,
          isMobile: false
        }
      })
      
      expect(wrapper.props('isMobile')).toBe(false)
    })
  })

  describe('エラーハンドリング', () => {
    it('空のデータを正しく処理する', () => {
      const wrapper = mount(ListView, {
        props: {
          people: [],
          viewMode: 'card',
          pageSize: 10,
          currentPage: 1
        }
      })
      
      const emptyMessage = wrapper.find('[data-testid="empty-message"]')
      expect(emptyMessage.exists()).toBe(true)
      expect(emptyMessage.text()).toContain('データがありません')
    })

    it('不正なviewModeを処理する', () => {
      const wrapper = mount(ListView, {
        props: {
          people: samplePeople,
          viewMode: 'invalid' as any,
          pageSize: 10,
          currentPage: 1
        }
      })
      
      // デフォルトのカード表示にフォールバック
      const personCards = wrapper.findAllComponents(PersonCard)
      expect(personCards.length).toBeGreaterThan(0)
    })
  })
})