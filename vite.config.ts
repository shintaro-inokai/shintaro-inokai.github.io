import { defineConfig } from "vite";

// GitHub Pagesでは https://ユーザー名.github.io/リポジトリ名/ で公開されるため、
// ビルド時にリポジトリ名をベースパスにします(GitHub Actionsが自動で設定)
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
});
