# Design system

## Direction

GPT Image 2 で作成した「夜空・紫紺・金・発光する水晶・静かな日本語」のコンセプトを、オリジナルの CSS と SVG に翻訳しています。競合のロゴ、画像、固有レイアウトは使いません。

## Color

- Canvas: `#07091f`
- Elevated night: `#0c1034`
- Violet: `#7456d9`
- Soft violet: `#b286ff`
- Gold: `#f0c77a`
- Warm highlight: `#ffe0a7`
- Primary text: `#f8f4ff`
- Secondary text: `#b8b3cf`

## Typography

- 見出し: `Yu Mincho` 系。占いらしい余韻と上質さ
- 本文/UI: `Hiragino Kaku Gothic ProN` / `Yu Gothic` 系。可読性優先
- 英字ラベル: 大きな letter-spacing と小さいサイズで階層を補助

## Layout and components

- 最大幅 1160px、desktop余白120px、mobile余白88px
- Sticky header、Hero、利用状況、テーマ選択、任意プロフィール
- Reading result、Premium preview、3-step説明、料金、FAQ、native dialog
- 900px未満で1カラム中心、mobileは固定CTA

## Motion and accessibility

- CTA hoverは2px上昇、カード抽選は720ms
- `prefers-reduced-motion: reduce` でスクロールとアニメーションを停止
- スキップリンク、`aria-pressed`、`aria-live="polite"`、3pxフォーカス
- 色だけに依存せず、主要操作は高さ52px以上
