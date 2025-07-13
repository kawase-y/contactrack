import type { Person } from '~/types'

export type SortOrder = 'asc' | 'desc'
export type SortField = 'name' | 'age' | 'grade' | 'createdAt' | 'updatedAt' | 'relation'

export interface SortCriteria {
  field: SortField
  order: SortOrder
}

// 名前でソート（振り仮名オプション付き）
export function sortByName(people: Person[], order: SortOrder = 'asc', useKana: boolean = false): Person[] {
  return [...people].sort((a, b) => {
    let aValue: string
    let bValue: string
    
    if (useKana) {
      aValue = (a.lastNameKana || '') + (a.firstNameKana || '')
      bValue = (b.lastNameKana || '') + (b.firstNameKana || '')
    } else {
      aValue = a.name || ''
      bValue = b.name || ''
    }
    
    const result = aValue.localeCompare(bValue, 'ja')
    return order === 'asc' ? result : -result
  })
}

// 年齢でソート
export function sortByAge(people: Person[], order: SortOrder = 'asc'): Person[] {
  return [...people].sort((a, b) => {
    // undefined の年齢は最後に配置
    if (a.age === undefined && b.age === undefined) return 0
    if (a.age === undefined) return 1
    if (b.age === undefined) return -1
    
    const result = a.age - b.age
    return order === 'asc' ? result : -result
  })
}

// 年次でソート
export function sortByGrade(people: Person[], order: SortOrder = 'asc'): Person[] {
  return [...people].sort((a, b) => {
    // undefined の年次は最後に配置
    if (a.grade === undefined && b.grade === undefined) return 0
    if (a.grade === undefined) return 1
    if (b.grade === undefined) return -1
    
    const result = a.grade - b.grade
    return order === 'asc' ? result : -result
  })
}

// 作成日でソート
export function sortByCreatedAt(people: Person[], order: SortOrder = 'asc'): Person[] {
  return [...people].sort((a, b) => {
    const aDate = new Date(a.createdAt)
    const bDate = new Date(b.createdAt)
    
    const result = aDate.getTime() - bDate.getTime()
    return order === 'asc' ? result : -result
  })
}

// 更新日でソート
export function sortByUpdatedAt(people: Person[], order: SortOrder = 'asc'): Person[] {
  return [...people].sort((a, b) => {
    const aDate = new Date(a.updatedAt)
    const bDate = new Date(b.updatedAt)
    
    const result = aDate.getTime() - bDate.getTime()
    return order === 'asc' ? result : -result
  })
}

// 関係性でソート
export function sortByRelation(people: Person[], order: SortOrder = 'asc'): Person[] {
  return [...people].sort((a, b) => {
    const result = (a.relation || '').localeCompare(b.relation || '', 'ja')
    return order === 'asc' ? result : -result
  })
}

// 複数条件でソート
export function sortPeople(people: Person[], criteria: SortCriteria[]): Person[] {
  if (criteria.length === 0) return [...people]
  
  return [...people].sort((a, b) => {
    for (const criterion of criteria) {
      let result = 0
      
      switch (criterion.field) {
        case 'name':
          result = (a.name || '').localeCompare(b.name || '', 'ja')
          break
        case 'age':
          if (a.age === undefined && b.age === undefined) result = 0
          else if (a.age === undefined) result = 1
          else if (b.age === undefined) result = -1
          else result = a.age - b.age
          break
        case 'grade':
          if (a.grade === undefined && b.grade === undefined) result = 0
          else if (a.grade === undefined) result = 1
          else if (b.grade === undefined) result = -1
          else result = a.grade - b.grade
          break
        case 'relation':
          result = (a.relation || '').localeCompare(b.relation || '', 'ja')
          break
        case 'createdAt':
          result = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'updatedAt':
          result = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
      }
      
      if (result !== 0) {
        return criterion.order === 'asc' ? result : -result
      }
    }
    
    return 0
  })
}