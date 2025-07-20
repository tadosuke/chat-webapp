import { describe, it, expect } from 'vitest'
import { getCurrentTime } from '../../../../server/services/time.js'

describe('time', () => {
  describe('getCurrentTime', () => {
    it('HH:MM形式の時刻文字列を返す', () => {
      const result = getCurrentTime();
      
      // HH:MM形式（例: "15:48", "07:05"）かどうかをチェック
      expect(result).toMatch(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/);
    });

    it('時と分が2桁で0埋めされる', () => {
      // この関数は現在時刻を返すので、常に2桁の形式になっていることを検証
      const result = getCurrentTime();
      
      expect(result).toHaveLength(5); // "HH:MM"は5文字
      expect(result[2]).toBe(':'); // 3文字目がコロン
    });

    it('現在時刻に近い値を返す', () => {
      const before = new Date();
      const result = getCurrentTime();
      const after = new Date();
      
      // 現在時刻から取得した時刻をパース
      const [hours, minutes] = result.split(':').map(Number);
      
      // 取得した時刻が前後の時刻の範囲内にあることを確認
      const resultTime = new Date();
      resultTime.setHours(hours, minutes, 0, 0);
      
      // 分単位での比較（秒は無視）
      const beforeMinutes = before.getHours() * 60 + before.getMinutes();
      const afterMinutes = after.getHours() * 60 + after.getMinutes();
      const resultMinutes = hours * 60 + minutes;
      
      expect(resultMinutes).toBeGreaterThanOrEqual(beforeMinutes);
      expect(resultMinutes).toBeLessThanOrEqual(afterMinutes);
    });

    it('連続して呼び出しても正常に動作する', () => {
      const result1 = getCurrentTime();
      const result2 = getCurrentTime();
      
      // どちらもHH:MM形式であることを確認
      expect(result1).toMatch(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/);
      expect(result2).toMatch(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/);
    });
  });
})