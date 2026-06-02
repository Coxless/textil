# textil — Product Concept

> **"Generate. Edit. Deploy."**
> アスキーアートを、作って終わりにしない。

---

## 1. プロダクト概要

| 項目 | 内容 |
|------|------|
| プロダクト名 | **textil**|
| カテゴリ | ASCII Art Creation & Editing Studio |
| スタック | TypeScript, Next.js, npm package, CLI |
| MVP ターゲット | 開発者・技術系クリエイター |

**一言で言うと：**
テキスト/画像からアスキーアートを生成し、Webブラウザ上でそのまま編集・微調整まで完結し、GitHub / Terminal / SNS に最適化した形式で書き出せるスタジオ。

---

## 2. ポジショニング

競合の分布を整理すると、市場には2種類の分断がある。

```
              編集力 高
                 │
  Monodraw ●     │     ← ここが空白
  ASCIIFlow ●    │          ★ textil
  TextPaint ●    │
─────────────────┼──────────────── 生成力（テキスト → 動画）
  TAAG ●         │      Glyphcast ●
  figlet ●       │   image-to-ascii ●
                 │      Asciify.art ●
              編集力 低
```

**既存ツールの2大弱点：**

- **Converterは「作ったら終わり」** ── 変換後の文字グリッドを直接編集する手段がない。パラメータを変えて再生成するしかなく、細部の調整に限界がある。
- **Editorは「ゼロから描く」前提** ── 画像インポートは下書きトレース程度で、変換品質を上げながら編集するループが設計されていない。

**textil のポジション：**
生成品質と編集体験の両方を持つ、唯一の統合スタジオ。

---

## 3. ターゲットユーザー

### Primary：Developer / CLI User
- README のヘッダーバナーや、CLIツールの起動画面を作りたい
- npm パッケージとして自分のプロジェクトに組み込みたい
- ターミナルで完結したい
- **Jobs-to-be-done:** 「プロっぽい README を、ツールを調べる時間なく作りたい」

### Secondary：Tech-adjacent Creator
- X（Twitter）/ Discord / Bluesky にアスキーアートの投稿をしたい
- アニメ・ゲームの素材を変換してSNSでシェアしたい（画像投稿が禁止されたコンテキストでの表現手段）
- **Jobs-to-be-done:** 「生成後に "ここだけ" 直したいのにできない」フラストレーションを解消したい

### Tertiary：Creative Developer
- アスキーアートをWebサイトの背景アニメーションやOSSのロゴに使いたい
- 生成結果を React コンポーネントとしてエクスポートしたい
- **Jobs-to-be-done:** 「ライブラリを探し回らず、一つのエコシステムで完結させたい」

---

## 4. コア機能

### 4-1. Generate（生成）

| 入力 | 対応内容 |
|------|--------|
| **テキスト** | FIGletベース、150+フォント、リアルタイムプレビュー |
| **画像 (PNG/JPG/SVG)** | 輝度マッピング + エッジ検出、複数文字セット |
| **動画 / GIF**（v2） | フレーム単位変換、エクスポートは連番テキスト or GIF |

**生成オプション：**
- 文字セット選択（Standard / Braille / Block / Custom）
- 幅・コントラスト・閾値のリアルタイム調整
- カラーモード（モノクロ / ANSIカラー / HTMLカラー）

---

### 4-2. Edit（編集）── 最重要差別化点

生成後、**文字グリッドエディタ**上で直接修正できる。

```
┌─────────────────────────────────────────────────────┐
│  [Pencil] [Eraser] [Select] [Fill] [Text] [Undo]   │ ← ツールバー
├──────────────────┬──────────────────────────────────┤
│                  │  ##@@@@@@@@@@##                  │
│  Character Panel │  #@@@@@@@@@@@@@#                 │ ← グリッドエディタ
│  ─────────────   │  @@@@▓▓▓▓▓▓@@@@                 │
│  @ # % . ·       │  @@@▓██████▓@@@                  │
│  ▓ █ ░ ▒ ▓       │  @@@▓██████▓@@@                  │
│                  │  @@@@▓▓▓▓▓▓@@@@                  │
│  Find & Replace  │  #@@@@@@@@@@@@@#                 │
│  [ @ ] → [ # ]   │  ##@@@@@@@@@@##                  │
└──────────────────┴──────────────────────────────────┘
```

**エディタ機能：**

- **鉛筆 / 消しゴム** ── 文字単位で上書き・空白化
- **選択 & 移動** ── 矩形選択でコピー・移動・削除
- **Find & Replace** ── `@` を `#` に一括置換
- **テキスト挿入** ── 任意の位置にテキストを重ねる
- **Undo / Redo** ── 100ステップ履歴
- **ズーム** ── 文字単位まで拡大して精密編集

---

### 4-3. Export（書き出し）── 出力先最適化

「どこに貼るか」を選ぶだけで、最適な形式に自動変換。

| 出力先 | 形式 | 処理 |
|--------|------|------|
| **GitHub README** | Markdown コードブロック | 幅80列にリサイズ、```コードフェンス付き |
| **Terminal / CLI** | Plain text / ANSIエスケープ | monospace確認済み、bash/zsh `echo` ワンライナーも生成 |
| **Discord / Slack** | コードブロック形式 | 最大文字数チェック + 警告 |
| **Twitter / X** | PNG画像 | monospace背景でラスタライズ、透過オプション |
| **React Component** | `.tsx` | `<pre>` または SVG テキストとして書き出し |
| **Plain text** | `.txt` | そのままコピー |
| **JSON** | 構造化データ | 行配列、カーソル位置情報含む |

---

### 4-4. Share & Embed

- **パーマリンク** ── 作成物をURLで共有（読み取り専用プレビューページ）
- **Embed code** ── `<iframe>` または `<script>` タグで外部サイトに埋め込み
- **OGP自動生成** ── SNSシェア時に作品がサムネとして表示

---

## 5. アーキテクチャ

textilは3つのレイヤーで構成される。

```
┌─────────────────────────────────────────────────────────┐
│                   @textil/web (Next.js)                 │
│         ブラウザ上のフル機能スタジオ UI                    │
└─────────────────────────┬───────────────────────────────┘
                          │ uses
┌─────────────────────────▼───────────────────────────────┐
│                   textil-cli                            │
│        $ textil generate logo.png --width 80            │
│        $ textil text "Hello" --font doom                │
│        $ textil export --target github                  │
└─────────────────────────┬───────────────────────────────┘
                          │ wraps
┌─────────────────────────▼───────────────────────────────┐
│              @textil/core (TypeScript Engine)           │
│   ・画像→ASCII変換アルゴリズム                             │
│   ・FIGletフォントレンダラー                              │
│   ・グリッドデータ構造 (編集履歴含む)                       │
│   ・出力フォーマッタ (GitHub / ANSI / PNG / JSON 等)       │
│   ・ブラウザ / Node.js 両対応 (isomorphic)               │
└─────────────────────────────────────────────────────────┘
```

### パッケージ構成

```
textil/
├── packages/
│   ├── core/          # @textil/core — isomorphic engine
│   │   ├── src/
│   │   │   ├── generator/   # image & text → grid
│   │   │   ├── editor/      # grid manipulation & history
│   │   │   ├── exporter/    # format-specific output
│   │   │   └── types/       # shared TypeScript types
│   │   └── package.json
│   │
│   ├── cli/           # textil-cli — Node.js CLI
│   │   ├── src/
│   │   │   ├── commands/    # generate, export, edit
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── web/           # @textil/web — Next.js app
│       ├── app/
│       │   ├── studio/      # メインエディタ画面
│       │   ├── share/[id]/  # パーマリンク表示
│       │   └── api/         # 変換 & 保存 API
│       └── package.json
```

---

## 6. 主要ユーザーフロー

### フロー A：開発者が README バナーを作る

```
1. textil.app を開く
2. テキスト入力: "MyProject"
3. フォント一覧から "doom" を選択（リアルタイムプレビュー）
4. 文字幅スライダーで80列に調整
5. 一部の文字が気に入らない → グリッドエディタで手修正
6. [GitHub README] ボタンをクリック
7. ```text ブロック付きMarkdownがクリップボードにコピー
8. README.md にそのまま貼り付け
```

### フロー B：SNSクリエイターが画像を変換する

```
1. PNG をドラッグ&ドロップ
2. 文字セット「Braille」、コントラスト調整
3. プレビューを見て細部を手修正（目の部分だけ密度を上げる）
4. [Twitter/X] → PNG出力ボタン
5. monospace背景付きPNGがダウンロード
6. そのままツイート
```

### フロー C：CLIから直接使う

```bash
# 画像をASCIIに変換
$ textil generate avatar.png --width 80 --charset braille

# テキストバナー
$ textil text "Hello" --font doom --width 80

# CLIの起動バナーに組み込む（JSON経由）
$ textil generate logo.png --output json | node my-cli-banner.js

# パイプ対応
$ cat logo.png | textil generate --width 60
```

## 8. ロードマップ

### v0.1 — Core Engine（OSS）
- `@textil/core` の画像→ASCII変換、FIGletレンダラー
- JSONグリッドデータ構造、エクスポーター（text / GitHub / ANSI）
- `textil-cli` の基本コマンド（generate / text / export）

### v0.2 — Web Studio（MVP）
- Next.js スタジオ UI
- 生成パラメータのリアルタイムプレビュー
- グリッドエディタ（鉛筆 / 消しゴム / 選択 / Undo）
- エクスポート: GitHub / Terminal / PNG

### v0.3 — Share & Polish
- パーマリンク & OGP
- Find & Replace
- SNS最適化エクスポート（Discord / Twitter PNG）

### v1.0 — Full Studio
- React Component エクスポート
- フォントライブラリ拡充
- チームプラン

### v2.0 — Motion
- GIF / 動画→ASCII アニメーション
- フレームタイムライン編集

*Concept v0.1 — 2026*
