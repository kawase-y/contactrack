import type { Person } from '~/types'

// 基本統計情報の型定義
export interface BasicStats {
  totalPeople: number
  averageAge: number
  ageRange: {
    min: number
    max: number
  }
  mostCommonRelation: string
}

// 年齢分布の型定義
export interface AgeDistribution {
  range: string
  count: number
}

// 年次分布の型定義
export interface GradeDistribution {
  grade: number
  label: string
  count: number
}

// 関係性分布の型定義
export interface RelationDistribution {
  relation: string
  count: number
  percentage: number
}

// タグ頻度の型定義
export interface TagFrequency {
  tag: string
  count: number
  percentage: number
}

// 連絡先完成度の型定義
export interface ContactCompleteness {
  totalPeople: number
  withEmail: number
  withPhone: number
  withSocial: number
  withAllContacts: number
  emailPercentage: number
  phonePercentage: number
  socialPercentage: number
  completePercentage: number
}

// 包括的なレポートの型定義
export interface StatisticsReport {
  basicStats: BasicStats
  ageDistribution: AgeDistribution[]
  gradeDistribution: GradeDistribution[]
  relationDistribution: RelationDistribution[]
  tagFrequency: TagFrequency[]
  contactCompleteness: ContactCompleteness
  generatedAt: string
}

// 基本統計情報を取得
export function getBasicStats(people: Person[]): BasicStats {
  if (people.length === 0) {
    return {
      totalPeople: 0,
      averageAge: 0,
      ageRange: { min: 0, max: 0 },
      mostCommonRelation: 'なし'
    }
  }

  // 年齢が定義されている人のみを対象
  const peopleWithAge = people.filter(person => person.age !== undefined && person.age !== null)
  
  let averageAge = 0
  let minAge = 0
  let maxAge = 0
  
  if (peopleWithAge.length > 0) {
    const ages = peopleWithAge.map(person => person.age!)
    averageAge = ages.reduce((sum, age) => sum + age, 0) / ages.length
    minAge = Math.min(...ages)
    maxAge = Math.max(...ages)
  }

  // 最も多い関係性を計算
  const relationCounts = new Map<string, number>()
  people.forEach(person => {
    const relation = person.relation || 'その他'
    relationCounts.set(relation, (relationCounts.get(relation) || 0) + 1)
  })

  let mostCommonRelation = 'なし'
  let maxCount = 0
  relationCounts.forEach((count, relation) => {
    if (count > maxCount) {
      maxCount = count
      mostCommonRelation = relation
    }
  })

  return {
    totalPeople: people.length,
    averageAge,
    ageRange: { min: minAge, max: maxAge },
    mostCommonRelation
  }
}

// 年齢分布を取得
export function getAgeDistribution(
  people: Person[], 
  options: { min?: number; max?: number; step?: number } = {}
): AgeDistribution[] {
  const { min = 20, max = 44, step = 5 } = options
  
  const peopleWithAge = people.filter(person => person.age !== undefined && person.age !== null)
  
  const distribution: AgeDistribution[] = []
  
  for (let start = min; start < max; start += step) {
    const end = Math.min(start + step - 1, max - 1)
    const count = peopleWithAge.filter(person => 
      person.age! >= start && person.age! <= end
    ).length
    
    distribution.push({
      range: step === 10 ? `${start}-${start + 9}` : `${start}-${end}`,
      count
    })
  }
  
  return distribution
}

// 年次分布を取得
export function getGradeDistribution(people: Person[]): GradeDistribution[] {
  const gradeCounts = new Map<number, number>()
  
  people.forEach(person => {
    if (person.grade !== undefined && person.grade !== null) {
      const grade = person.grade
      gradeCounts.set(grade, (gradeCounts.get(grade) || 0) + 1)
    }
  })
  
  const distribution = Array.from(gradeCounts.entries())
    .map(([grade, count]) => ({
      grade,
      label: grade === 0 ? '同期' : grade > 0 ? `+${grade}` : `${grade}`,
      count
    }))
    .sort((a, b) => a.grade - b.grade)
  
  return distribution
}

// 関係性分布を取得
export function getRelationDistribution(people: Person[]): RelationDistribution[] {
  const relationCounts = new Map<string, number>()
  
  people.forEach(person => {
    const relation = person.relation || 'その他'
    relationCounts.set(relation, (relationCounts.get(relation) || 0) + 1)
  })
  
  const total = people.length
  const distribution = Array.from(relationCounts.entries())
    .map(([relation, count]) => ({
      relation,
      count,
      percentage: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.count - a.count) // カウント順にソート（降順）
  
  return distribution
}

// タグ頻度を取得
export function getTagFrequency(people: Person[], limit?: number): TagFrequency[] {
  const tagCounts = new Map<string, number>()
  
  people.forEach(person => {
    if (person.tags && Array.isArray(person.tags)) {
      person.tags.forEach(tag => {
        if (tag && typeof tag === 'string') {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
        }
      })
    }
  })
  
  // タグを持つ人の総数を計算
  const peopleWithTags = people.filter(person => 
    person.tags && Array.isArray(person.tags) && person.tags.length > 0
  ).length
  
  let frequency = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({
      tag,
      count,
      percentage: peopleWithTags > 0 ? Math.round((count / peopleWithTags) * 10000) / 100 : 0
    }))
    .sort((a, b) => b.count - a.count) // カウント順にソート（降順）
  
  if (limit) {
    frequency = frequency.slice(0, limit)
  }
  
  return frequency
}

// 連絡先完成度を取得
export function getContactCompleteness(people: Person[]): ContactCompleteness {
  const total = people.length
  
  if (total === 0) {
    return {
      totalPeople: 0,
      withEmail: 0,
      withPhone: 0,
      withSocial: 0,
      withAllContacts: 0,
      emailPercentage: 0,
      phonePercentage: 0,
      socialPercentage: 0,
      completePercentage: 0
    }
  }
  
  let withEmail = 0
  let withPhone = 0
  let withSocial = 0
  let withAllContacts = 0
  
  people.forEach(person => {
    const hasEmail = !!(person.email && person.email.trim())
    const hasPhone = !!(person.phone && person.phone.trim())
    const hasSocial = !!(person.social && person.social.trim())
    
    if (hasEmail) withEmail++
    if (hasPhone) withPhone++
    if (hasSocial) withSocial++
    if (hasEmail && hasPhone && hasSocial) withAllContacts++
  })
  
  return {
    totalPeople: total,
    withEmail,
    withPhone,
    withSocial,
    withAllContacts,
    emailPercentage: Math.round((withEmail / total) * 100),
    phonePercentage: Math.round((withPhone / total) * 100),
    socialPercentage: Math.round((withSocial / total) * 100),
    completePercentage: Math.round((withAllContacts / total) * 100)
  }
}

// 包括的なレポートを生成
export function generateReport(people: Person[]): StatisticsReport {
  return {
    basicStats: getBasicStats(people),
    ageDistribution: getAgeDistribution(people),
    gradeDistribution: getGradeDistribution(people),
    relationDistribution: getRelationDistribution(people),
    tagFrequency: getTagFrequency(people),
    contactCompleteness: getContactCompleteness(people),
    generatedAt: new Date().toISOString()
  }
}