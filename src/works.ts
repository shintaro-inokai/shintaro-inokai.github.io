// ★ 作品はここに追加します。画像は public/images/ に置き、"images/ファイル名" と書きます

export type Category = "Web制作" | "デザイン" | "プログラミング";

export interface Work {
  title: string;
  category: Category;
  summary: string;
  description: string;
  tech: string[];
  image?: string;
  url?: string; // 公開サイトのURL
  repo?: string; // GitHubリポジトリのURL
  year: number;
}

export const works: Work[] = [];