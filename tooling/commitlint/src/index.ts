export const name = 'commitlint'

// ES Modules形式での設定をエクスポート
export default {
  extends: ['gitmoji'],
  parserPreset: 'conventional-changelog-gitmoji-config',
  rules: {
    // type-enumルールを上書きして 'env' を追加
    'type-enum': [
      2, // エラーレベル (0: disable, 1: warning, 2: error)
      'always', // 常に適用
      [
        'feat',
        'fix',
        'refactor',
        'docs',
        'test',
        'perf',
        'revert',
        'style',
        'build',
        'ci',
        'wip',
        'chore',
        'env', // <--- 'env' を追加
      ],
    ],
    'subject-case': [2, 'always', 'sentence-case'], // サブジェクトのケースをセンテンスケースに設定
  },
}
