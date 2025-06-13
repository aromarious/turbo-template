/**
 * @type {import('lint-staged').Configuration}
 */
module.exports = {
  // アプリケーションとパッケージのsrcディレクトリのみ対象
  "{apps,packages}/*/src/**/*.{js,jsx,ts,tsx}": [
    "pnpm lint:fix", //
    "pnpm format:fix",
  ],
  // ドキュメントとREADME
  "{docs,apps,packages}/**/*.{md,json}": [
    "pnpm format:fix", //
  ],
  // 設定ファイル（toolingディレクトリは除外）
  "{apps,packages}/**/*.{json,yml,yaml}": [
    "pnpm format:fix", //
  ],
  // TypeScriptファイルがステージされている場合にメッセージを表示
  "{apps,packages}/*/src/**/*.{ts,tsx}": [
    "echo '\n⚠️  TypeScript files detected in staged changes.\n💡 Please run type checking manually if needed: pnpm typecheck\n'",
  ],
};
