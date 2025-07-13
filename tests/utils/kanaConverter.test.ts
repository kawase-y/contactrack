import { describe, it, expect } from 'vitest'
import { kanaConverter } from '~/utils/kanaConverter'

describe('KanaConverter', () => {
  describe('姓の漢字→ひらがな変換', () => {
    it('一般的な姓を正しく変換できる', () => {
      expect(kanaConverter.convertToKana('田中')).toBe('たなか')
      expect(kanaConverter.convertToKana('山田')).toBe('やまだ')
      expect(kanaConverter.convertToKana('佐藤')).toBe('さとう')
      expect(kanaConverter.convertToKana('高橋')).toBe('たかはし')
    })

    it('単一文字の姓を変換できる', () => {
      expect(kanaConverter.convertToKana('田')).toBe('た')
      expect(kanaConverter.convertToKana('山')).toBe('やま')
      expect(kanaConverter.convertToKana('川')).toBe('がわ')
    })
  })

  describe('名の漢字→ひらがな変換', () => {
    it('一般的な男性名を正しく変換できる', () => {
      expect(kanaConverter.convertToKana('太郎')).toBe('たろう')
      expect(kanaConverter.convertToKana('次郎')).toBe('じろう')
      expect(kanaConverter.convertToKana('三郎')).toBe('さぶろう')
      expect(kanaConverter.convertToKana('裕介')).toBe('ゆうすけ')
      expect(kanaConverter.convertToKana('健太')).toBe('けんた')
    })

    it('一般的な女性名を正しく変換できる', () => {
      expect(kanaConverter.convertToKana('花子')).toBe('はなこ')
      expect(kanaConverter.convertToKana('美子')).toBe('みこ')
      expect(kanaConverter.convertToKana('裕子')).toBe('ゆうこ')
      expect(kanaConverter.convertToKana('真理')).toBe('まり')
      expect(kanaConverter.convertToKana('由美')).toBe('ゆみ')
    })

    it('単一文字の名前を変換できる', () => {
      expect(kanaConverter.convertToKana('太')).toBe('た')
      expect(kanaConverter.convertToKana('美')).toBe('み')
      expect(kanaConverter.convertToKana('愛')).toBe('あい')
      expect(kanaConverter.convertToKana('光')).toBe('ひかり')
    })

    it('複数文字の名前でも正しく変換できる', () => {
      expect(kanaConverter.convertToKana('智也')).toBe('ともや')
      expect(kanaConverter.convertToKana('和也')).toBe('かずや')
      expect(kanaConverter.convertToKana('大輔')).toBe('だいすけ')
      expect(kanaConverter.convertToKana('康介')).toBe('こうすけ')
    })
  })

  describe('エッジケース', () => {
    it('空文字列を正しく処理する', () => {
      expect(kanaConverter.convertToKana('')).toBe('')
    })

    it('ひらがなはそのまま返す', () => {
      expect(kanaConverter.convertToKana('たろう')).toBe('たろう')
      expect(kanaConverter.convertToKana('はなこ')).toBe('はなこ')
    })

    it('カタカナはそのまま返す', () => {
      expect(kanaConverter.convertToKana('タロウ')).toBe('タロウ')
      expect(kanaConverter.convertToKana('ハナコ')).toBe('ハナコ')
    })

    it('マッピングにない漢字は空文字を返す', () => {
      expect(kanaConverter.convertToKana('麒麟')).toBe('')
      expect(kanaConverter.convertToKana('鳳凰')).toBe('')
    })

    it('混在文字列を正しく処理する', () => {
      expect(kanaConverter.convertToKana('田a中')).toBe('たaなか')
      expect(kanaConverter.convertToKana('山-田')).toBe('やま-た')
    })
  })

  describe('文字種判定', () => {
    it('ひらがなを正しく判定する', () => {
      expect(kanaConverter.isHiragana('あ')).toBe(true)
      expect(kanaConverter.isHiragana('ん')).toBe(true)
      expect(kanaConverter.isHiragana('ア')).toBe(false)
      expect(kanaConverter.isHiragana('漢')).toBe(false)
    })

    it('カタカナを正しく判定する', () => {
      expect(kanaConverter.isKatakana('ア')).toBe(true)
      expect(kanaConverter.isKatakana('ン')).toBe(true)
      expect(kanaConverter.isKatakana('あ')).toBe(false)
      expect(kanaConverter.isKatakana('漢')).toBe(false)
    })

    it('漢字を正しく判定する', () => {
      expect(kanaConverter.isKanji('漢')).toBe(true)
      expect(kanaConverter.isKanji('田')).toBe(true)
      expect(kanaConverter.isKanji('あ')).toBe(false)
      expect(kanaConverter.isKanji('ア')).toBe(false)
    })
  })
})