import { describe, it, expect } from 'vitest'
import type { Person } from '~/types'
import { 
  getBasicStats,
  getAgeDistribution,
  getGradeDistribution,
  getRelationDistribution,
  getTagFrequency,
  getContactCompleteness,
  generateReport
} from '~/utils/statistics'

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
    email: 'yamada@example.com',
    phone: '090-1234-5678',
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
    email: 'sato@example.com',
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
  },
  {
    id: '4',
    lastName: '高橋',
    firstName: '美咲',
    lastNameKana: 'たかはし',
    firstNameKana: 'みさき',
    name: '高橋 美咲',
    age: 28,
    grade: 0,
    relation: '仕事',
    tags: ['営業', 'マネージャー'],
    phone: '080-9876-5432',
    social: 'https://twitter.com/misaki',
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z'
  }
]

describe('Statistics', () => {
  describe('getBasicStats', () => {
    it('基本統計情報を正しく計算できる', () => {
      const stats = getBasicStats(samplePeople)
      
      expect(stats.totalPeople).toBe(4)
      expect(stats.averageAge).toBe(29.5) // (25+30+35+28)/4
      expect(stats.ageRange.min).toBe(25)
      expect(stats.ageRange.max).toBe(35)
      expect(stats.mostCommonRelation).toBe('仕事') // 2回出現
    })

    it('空のデータでも正しく処理する', () => {
      const stats = getBasicStats([])
      
      expect(stats.totalPeople).toBe(0)
      expect(stats.averageAge).toBe(0)
      expect(stats.ageRange.min).toBe(0)
      expect(stats.ageRange.max).toBe(0)
      expect(stats.mostCommonRelation).toBe('なし')
    })

    it('年齢未定義の人がいても正しく処理する', () => {
      const testPeople = [
        ...samplePeople,
        {
          id: '5',
          lastName: '鈴木',
          firstName: '次郎',
          lastNameKana: 'すずき',
          firstNameKana: 'じろう',
          name: '鈴木 次郎',
          age: undefined,
          grade: 1,
          relation: '買い物',
          tags: [],
          createdAt: '2024-01-05T00:00:00Z',
          updatedAt: '2024-01-05T00:00:00Z'
        }
      ]
      
      const stats = getBasicStats(testPeople)
      expect(stats.totalPeople).toBe(5)
      expect(stats.averageAge).toBe(29.5) // 年齢不明者は除外して計算
    })
  })

  describe('getAgeDistribution', () => {
    it('年齢分布を正しく計算できる', () => {
      const distribution = getAgeDistribution(samplePeople)
      
      expect(distribution).toEqual([
        { range: '20-24', count: 0 },
        { range: '25-29', count: 2 }, // 25歳、28歳
        { range: '30-34', count: 1 }, // 30歳
        { range: '35-39', count: 1 }, // 35歳
        { range: '40-43', count: 0 }
      ])
    })

    it('年齢範囲を指定できる', () => {
      const distribution = getAgeDistribution(samplePeople, { min: 20, max: 40, step: 10 })
      
      expect(distribution).toEqual([
        { range: '20-29', count: 2 },
        { range: '30-39', count: 2 }
      ])
    })
  })

  describe('getGradeDistribution', () => {
    it('年次分布を正しく計算できる', () => {
      const distribution = getGradeDistribution(samplePeople)
      
      expect(distribution).toEqual([
        { grade: -1, label: '-1', count: 1 },
        { grade: 0, label: '同期', count: 1 },
        { grade: 2, label: '+2', count: 1 },
        { grade: 5, label: '+5', count: 1 }
      ])
    })

    it('年次順にソートされる', () => {
      const distribution = getGradeDistribution(samplePeople)
      
      for (let i = 0; i < distribution.length - 1; i++) {
        expect(distribution[i].grade).toBeLessThan(distribution[i + 1].grade)
      }
    })
  })

  describe('getRelationDistribution', () => {
    it('関係性分布を正しく計算できる', () => {
      const distribution = getRelationDistribution(samplePeople)
      
      expect(distribution).toEqual([
        { relation: '仕事', count: 2, percentage: 50 },
        { relation: '勉強会', count: 1, percentage: 25 },
        { relation: '学生時代', count: 1, percentage: 25 }
      ])
    })

    it('カウント順にソートされる', () => {
      const distribution = getRelationDistribution(samplePeople)
      
      for (let i = 0; i < distribution.length - 1; i++) {
        expect(distribution[i].count).toBeGreaterThanOrEqual(distribution[i + 1].count)
      }
    })
  })

  describe('getTagFrequency', () => {
    it('タグ頻度を正しく計算できる', () => {
      const frequency = getTagFrequency(samplePeople)
      
      expect(frequency).toEqual([
        { tag: '営業', count: 2, percentage: 50 },
        { tag: '同期', count: 1, percentage: 25 },
        { tag: 'エンジニア', count: 1, percentage: 25 },
        { tag: 'React', count: 1, percentage: 25 },
        { tag: '大学', count: 1, percentage: 25 },
        { tag: '研究', count: 1, percentage: 25 },
        { tag: 'マネージャー', count: 1, percentage: 25 }
      ])
    })

    it('上位N個のタグを取得できる', () => {
      const frequency = getTagFrequency(samplePeople, 3)
      
      expect(frequency).toHaveLength(3)
      expect(frequency[0].tag).toBe('営業')
      expect(frequency[0].count).toBe(2)
    })
  })

  describe('getContactCompleteness', () => {
    it('連絡先完成度を正しく計算できる', () => {
      const completeness = getContactCompleteness(samplePeople)
      
      expect(completeness).toEqual({
        totalPeople: 4,
        withEmail: 2,
        withPhone: 2,
        withSocial: 1,
        withAllContacts: 0, // 全ての連絡先が揃っている人はいない
        emailPercentage: 50,
        phonePercentage: 50,
        socialPercentage: 25,
        completePercentage: 0
      })
    })

    it('連絡先がない場合も正しく処理する', () => {
      const peopleWithoutContacts = samplePeople.map(person => ({
        ...person,
        email: undefined,
        phone: undefined,
        social: undefined
      }))
      
      const completeness = getContactCompleteness(peopleWithoutContacts)
      
      expect(completeness.withEmail).toBe(0)
      expect(completeness.withPhone).toBe(0)
      expect(completeness.withSocial).toBe(0)
      expect(completeness.emailPercentage).toBe(0)
    })
  })

  describe('generateReport', () => {
    it('包括的なレポートを生成できる', () => {
      const report = generateReport(samplePeople)
      
      expect(report).toHaveProperty('basicStats')
      expect(report).toHaveProperty('ageDistribution')
      expect(report).toHaveProperty('gradeDistribution')
      expect(report).toHaveProperty('relationDistribution')
      expect(report).toHaveProperty('tagFrequency')
      expect(report).toHaveProperty('contactCompleteness')
      expect(report).toHaveProperty('generatedAt')
      
      expect(report.basicStats.totalPeople).toBe(4)
      expect(new Date(report.generatedAt)).toBeInstanceOf(Date)
    })

    it('レポートの日時が現在時刻に近い', () => {
      const report = generateReport(samplePeople)
      const now = new Date()
      const reportTime = new Date(report.generatedAt)
      
      // 生成時刻が現在時刻から1秒以内であることを確認
      expect(Math.abs(now.getTime() - reportTime.getTime())).toBeLessThan(1000)
    })
  })

  describe('エラーハンドリング', () => {
    it('不正なデータでもクラッシュしない', () => {
      const invalidPeople = [
        {
          id: '1',
          lastName: '',
          firstName: '',
          name: '',
          age: -1,
          grade: null,
          relation: '',
          tags: null,
          createdAt: '',
          updatedAt: ''
        } as any
      ]
      
      expect(() => getBasicStats(invalidPeople)).not.toThrow()
      expect(() => getAgeDistribution(invalidPeople)).not.toThrow()
      expect(() => getGradeDistribution(invalidPeople)).not.toThrow()
      expect(() => getRelationDistribution(invalidPeople)).not.toThrow()
      expect(() => getTagFrequency(invalidPeople)).not.toThrow()
      expect(() => getContactCompleteness(invalidPeople)).not.toThrow()
    })
  })
})