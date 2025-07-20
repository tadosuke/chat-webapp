/**
 * 猫の雑学取得機能の実装
 * https://alexwohlbruck.github.io/cat-facts/docs/ のAPIを使用
 */

/**
 * 猫の雑学データの型定義
 */
interface CatFact {
  _id: string;
  text: string;
  type: string;
  user: string;
  upvotes: number;
  userUpvoted: null;
}

/**
 * 外部APIから猫の雑学を取得する関数
 * @returns 猫の雑学テキスト
 */
export async function getCatFact(): Promise<string> {
  try {
    const response = await fetch('https://cat-fact.herokuapp.com/facts/random');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: CatFact = await response.json();
    return data.text;
  } catch (error) {
    console.error('Cat fact API error:', error);
    // APIエラー時のフォールバック
    return '猫の雑学の取得に失敗しました。しばらく後で再試行してください。';
  }
}