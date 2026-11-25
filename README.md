# ポートフォリオサイト

Vite + TypeScript で作ったポートフォリオです。GitHub Pages で公開します。

## 機能
- タイピングアニメーション、スクロールで表示されるアニメーション
- ダークモード(選んだテーマを記憶)
- 作品のカテゴリ絞り込みと詳細ポップアップ
- GitHub API でリポジトリ一覧を自動表示
- お問い合わせフォーム(Formspree)

## ローカルで動かす
```powershell
cd C:\dev\portfolio
npm install
npm run dev
```
表示された `http://localhost:5173` をブラウザで開きます。

## 自分用に書き換える場所
| ファイル | 内容 |
|---|---|
| `src/config.ts` | GitHubユーザー名、FormspreeのID、スキル、トップの文字 |
| `src/works.ts` | 作品一覧(サンプルを書き換える) |
| `public/images/` | 作品のスクリーンショット |
| `index.html` | 自己紹介文 |

## GitHub Pages で公開する
1. GitHub で新しいリポジトリを作る(`ユーザー名.github.io` という名前にすると URL がシンプルになります)
2. このフォルダを push する
   ```powershell
   git init
   git add .
   git commit -m "first commit"
   git branch -M main
   git remote add origin https://github.com/ユーザー名/リポジトリ名.git
   git push -u origin main
   ```
3. リポジトリの **Settings → Pages → Source** を **GitHub Actions** にする
4. 数分後、`https://ユーザー名.github.io/` で公開されます。以降は push するたびに自動で更新されます

## お問い合わせフォームを有効にする
1. https://formspree.io で無料登録し、フォームを作る
2. 発行された ID(`https://formspree.io/f/xxxxxxx` の `xxxxxxx`)を `src/config.ts` の `formspreeId` に入れる
