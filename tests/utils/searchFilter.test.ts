import { describe, it, expect } from 'vitest'
import type { Person } from '~/types'
import { 
  filterByRelation, 
  filterByGradeRange, 
  filterByTags, 
  filterByAgeRange, 
  advancedSearch 
} from '~/utils/searchFilter'

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
  },
  {
    id: '3',
    lastName: '田中',
    firstName: '一郎',
    lastNameKana: 'たなか',
    firstNameKana: 'いちろう',
    name: '田中 一郎',
    age: 35,
    grade: 5,
    relation: '学生時代',
    tags: ['大学', '研究'],
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z'
  }
]

// まだ実装していない関数をテスト（Red phase）
describe('SearchFilter', () => {
  describe('filterByRelation', () => {
    it('関係性で正しくフィルタリングできる', () => {
      
      const result = filterByRelation(samplePeople, '仕事')
      
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('山田 太郎')
    })

    it('複数の関係性で同時にフィルタリングできる', () => {
      
      const result = filterByRelation(samplePeople, ['仕事', '勉強会'])
      
      expect(result).toHaveLength(2)
      expect(result.map(p => p.name)).toEqual(['山田 太郎', '佐藤 花子'])
    })
  })

  describe('filterByGradeRange', () => {
    it('年次範囲で正しくフィルタリングできる', () => {
      const result = filterByGradeRange(samplePeople, { min: 0, max: 3 })
      
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('山田 太郎')
    })

    it('最小値のみ指定でフィルタリングできる', () => {
      const result = filterByGradeRange(samplePeople, { min: 2 })
      
      expect(result).toHaveLength(2)
      expect(result.map(p => p.name)).toEqual(['山田 太郎', '田中 一郎'])
    })
  })

  describe('filterByTags', () => {
    it('単一タグでフィルタリングできる', () => {
      const result = filterByTags(samplePeople, ['営業'])
      
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('山田 太郎')
    })

    it('複数タグでOR検索ができる', () => {
      const result = filterByTags(samplePeople, ['営業', 'エンジニア'])
      
      expect(result).toHaveLength(2)
    })
  })

  describe('filterByAgeRange', () => {
    it('年齢範囲でフィルタリングできる', () => {
      const result = filterByAgeRange(samplePeople, { min: 25, max: 30 })
      
      expect(result).toHaveLength(2)
      expect(result.map(p => p.age)).toEqual([25, 30])
    })
  })

  describe('advancedSearch', () => {
    it('複数条件を組み合わせて検索できる', () => {
      const filters = {
        relation: ['仕事', '勉強会'],
        gradeRange: { min: -2, max: 5 },
        tags: ['営業', 'エンジニア'],
        ageRange: { min: 20, max: 35 }
      }
      
      const result = advancedSearch(samplePeople, filters)
      
      expect(result).toHaveLength(2)
    })
  })
})