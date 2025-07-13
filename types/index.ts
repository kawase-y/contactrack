// 学歴の選択肢
export type Education = '専門学校' | '学卒' | '修士' | 'ドクター' | '不明';

// 人物情報の型定義
export interface Person {
  id: string;
  lastName: string; // 姓
  firstName: string; // 名
  lastNameKana?: string; // 姓（振り仮名）
  firstNameKana?: string; // 名（振り仮名）
  name: string; // 表示用フルネーム（後方互換性のため残す）
  age?: number;
  grade?: number; // 年次 (自分からの差: +2=2年先輩, 0=同期, -1=1年後輩)
  education?: Education; // 学歴
  relation: string; // 関係性 (例: "大学同期", "会社同僚", "サークル仲間")
  memo?: string;
  meetDate?: string; // 出会った日
  tags?: string[];
  contactInfo?: {
    email?: string;
    phone?: string;
    social?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// フォーム用の型
export interface PersonForm {
  lastName: string; // 姓
  firstName: string; // 名
  lastNameKana?: string; // 姓（振り仮名）
  firstNameKana?: string; // 名（振り仮名）
  age?: number;
  grade?: number;
  education?: Education; // 学歴
  relation: string;
  memo?: string;
  meetDate?: string;
  tags?: string[];
  contactInfo?: {
    email?: string;
    phone?: string;
    social?: string;
  };
}

// 検索フィルター用の型
export interface SearchFilter {
  name?: string;
  relation?: string;
  tags?: string[];
  ageRange?: {
    min?: number;
    max?: number;
  };
}