import type { Person } from '~/types'

// 関係性でフィルタリング
export function filterByRelation(people: Person[], relation: string | string[]): Person[] {
  const relations = Array.isArray(relation) ? relation : [relation]
  return people.filter(person => relations.includes(person.relation))
}

// 数値範囲でフィルタリングする汎用関数
function filterByNumericRange(
  people: Person[], 
  range: { min?: number; max?: number }, 
  getValue: (person: Person) => number | undefined
): Person[] {
  return people.filter(person => {
    const value = getValue(person)
    if (value === undefined) return false
    
    const minCheck = range.min !== undefined ? value >= range.min : true
    const maxCheck = range.max !== undefined ? value <= range.max : true
    
    return minCheck && maxCheck
  })
}

// 年次範囲でフィルタリング  
export function filterByGradeRange(people: Person[], range: { min?: number; max?: number }): Person[] {
  return filterByNumericRange(people, range, person => person.grade)
}

// タグでフィルタリング（OR検索）
export function filterByTags(people: Person[], targetTags: string[]): Person[] {
  return people.filter(person => {
    if (!person.tags || person.tags.length === 0) return false
    return targetTags.some(tag => person.tags!.includes(tag))
  })
}

// 年齢範囲でフィルタリング
export function filterByAgeRange(people: Person[], range: { min?: number; max?: number }): Person[] {
  return filterByNumericRange(people, range, person => person.age)
}

// 高度な検索（複数条件組み合わせ）
export function advancedSearch(people: Person[], filters: {
  relation?: string[]
  gradeRange?: { min?: number; max?: number }
  tags?: string[]
  ageRange?: { min?: number; max?: number }
}): Person[] {
  let result = people

  if (filters.relation) {
    result = filterByRelation(result, filters.relation)
  }

  if (filters.gradeRange) {
    result = filterByGradeRange(result, filters.gradeRange)
  }

  if (filters.tags) {
    result = filterByTags(result, filters.tags)
  }

  if (filters.ageRange) {
    result = filterByAgeRange(result, filters.ageRange)
  }

  return result
}