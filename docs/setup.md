# 初期設定ガイド

## 必要なもの

Node.js 20 以上だけです。GitHub Codespaces を使う場合はインストール不要です。

## ローカルで開く

```bash
npm install
npm run dev
```

表示された `http://localhost:5173` をブラウザで開きます。

## 動作確認

1. 「無料でカードを引く」を押す
2. 恋愛・仕事・金運・自分探しから選ぶ
3. ニックネームと生年月日は空欄でもよい
4. 「オラクルカードを引く」を押す
5. 結果、残り回数、連続日数を確認する
6. ページ下部の開発用リセットで保存データを消せる

## 品質確認

```bash
npm run lint
npm test -- --run
npm run build
npm run preview
```

プレビューは同じく `http://localhost:5173` です。`npm run dev` が動いている場合は先に `Ctrl+C` で終了します。

## Codespaces

Codespaces URLを開くと `.devcontainer/devcontainer.json` が Node.js 22 環境を作り、`npm install` を実行します。ポート5173は自動転送されます。

## トラブル時

- ポート使用中: `PORT=5174 npm run dev` として `http://localhost:5174` を開く
- 結果が残る: フッターの「開発用：履歴をリセット」を押す
- 画面が更新されない: ブラウザを再読み込みする
- Node の確認: `node --version` が `v20` 以上であることを確認する

外部 API、API Key、データベース、決済アカウントはこのローカル版には不要です。
