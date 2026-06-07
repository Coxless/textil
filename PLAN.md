# textil — 開発計画

> 各 Phase は「Plan → 実装」が1セッションで完結できる粒度に設計されている。

---

## Phase 0 — Monorepo 基盤セットアップ ✅ 完了

**目標:** 全パッケージが共存するモノレポ環境を構築する

> **備考:** パッケージマネージャーは pnpm ではなく **bun** を採用（`mise` で管理）。

### 成果物
- bun workspaces + Turborepo 構成（`mise` による bun@1.3.14 / node@22 管理）
- `packages/core`, `packages/cli`, `packages/web` の骨格
- 共通 TypeScript / ESLint / Prettier 設定
- Vitest テスト基盤（core / cli）
- CI（GitHub Actions: mise-action → bun install → turbo lint build test）

### タスク
- [x] `package.json` workspaces + `turbo.json` 設定（bun workspaces）
- [x] `tsconfig.base.json` 作成、各パッケージから extends
- [x] `packages/core/package.json` + `src/index.ts` スケルトン
- [x] `packages/cli/package.json` + `src/index.ts` スケルトン
- [x] `packages/web/` — Next.js 15 App Router (TypeScript) 手動構築
- [x] Vitest セットアップ（core / cli）
- [x] GitHub Actions: `mise-action → bun install → turbo lint test`

### 完了基準
`bun run build` と `bun run test` がすべて green になること

**実装結果:** `turbo build` / `turbo test` / `turbo lint` すべて green 確認済み（2026-06-02）

---

## Phase 1 — @textil/core: 型定義 & グリッドデータ構造

**目標:** エンジン全体の土台となる型とグリッド操作ロジックを確立する

### 成果物
- `AsciiGrid` 型（セル配列 + メタデータ）
- `GridEditor` クラス（セル読み書き・Undo/Redo 100ステップ）
- ユニットテスト完備

### タスク
- [x] `src/types/grid.ts` — `Cell`, `AsciiGrid`, `GridSnapshot` 型
- [x] `src/types/options.ts` — `GenerateOptions`, `ExportTarget` 型
- [x] `src/editor/GridEditor.ts` — セル読み書き, 矩形選択, コピー/移動
- [x] `src/editor/History.ts` — コマンドパターンで Undo/Redo
- [x] `src/editor/operations.ts` — fill, findReplace, textInsert
- [x] ユニットテスト: GridEditor + History（100ステップ境界含む）

### 完了基準
`GridEditor` の全操作がテストで検証済みで、Undo/Redo が正確に機能すること

**実装結果:** 全テスト green 確認済み（2026-06-03）

---

## Phase 2 — @textil/core: テキスト生成（FIGlet エンジン） ✅ 完了

**目標:** テキスト → ASCII グリッドの生成エンジンを実装する

### 成果物
- FIGlet フォントパーサー（`.flf` 形式）
- バンドル済みフォント 10+ 種（doom / banner / slant 等）
- `generateText(text, options) → AsciiGrid` API
- ブラウザ / Node.js 両対応（isomorphic）

### タスク
- [x] `src/generator/figlet/parser.ts` — `.flf` ファイルパース
- [x] `src/generator/figlet/renderer.ts` — 文字合成、スマッシングルール
- [x] `src/generator/figlet/fonts/` — フォントファイル同梱（12種）
- [x] `src/generator/text.ts` — `generateText()` 公開 API
- [x] フォント幅スケーリング（target width → truncate/pad）
- [x] ユニットテスト: 各フォントで "Hello" が期待グリッドに一致

### 完了基準
`generateText("Hello", { font: "doom", width: 80 })` が正しい AsciiGrid を返すこと

**実装結果:** 全 90 テスト green 確認済み（2026-06-03）

---

## Phase 3 — @textil/core: 画像生成エンジン ✅ 完了

**目標:** 画像ファイル → ASCII グリッドの変換パイプラインを実装する

### 成果物
- `generateImage(source, options) → AsciiGrid` API
- 輝度マッピング変換（Standard / Braille / Block / Custom charset）
- エッジ検出オプション（Sobel フィルタ）
- Node.js: `sharp` バックエンド / ブラウザ: Canvas API バックエンド

### タスク
- [x] `src/generator/image/loader/node.ts` — sharp バックエンド（dynamic import）
- [x] `src/generator/image/loader/browser.ts` — Canvas API バックエンド
- [x] `src/generator/image/sampler.ts` — ピクセル→文字マッピング（standard / braille / block）
- [x] `src/generator/image/edge.ts` — Sobel フィルタ実装
- [x] `src/generator/image/charsets.ts` — Standard / Braille / Block 定義
- [x] `src/generator/image.ts` — `generateImage()` 公開 API
- [x] テスト（PNG ヘルパー + 各モジュール単体テスト + 統合テスト）

### 完了基準
`generateImage(pngBuffer, { width: 40, charset: "braille" })` が AsciiGrid を返すこと

**実装結果:** 全 143 テスト green 確認済み（2026-06-05）

---

## Phase 4 — @textil/core: エクスポーター ✅ 完了

**目標:** AsciiGrid → 各出力形式への変換ロジックを実装する

### 成果物
- `export(grid, target) → string | Buffer` API
- 対応フォーマット: `plain` / `github` / `ansi` / `json`
- 幅制限チェック・警告機能

### タスク
- [x] `src/exporter/plain.ts` — プレーンテキスト出力
- [x] `src/exporter/github.ts` — Markdown コードブロック生成、幅80列リサイズ
- [x] `src/exporter/ansi.ts` — ANSIエスケープ色付き出力
- [x] `src/exporter/json.ts` — 構造化 JSON（行配列 + メタデータ）
- [x] `src/exporter/index.ts` — `export(grid, target)` ディスパッチ
- [x] ユニットテスト: 各フォーマットの出力文字列を検証

### 完了基準
全エクスポートターゲットがテストで検証済みで、`@textil/core` の公開 API が確定すること

**実装結果:** 全 173 テスト green 確認済み（2026-06-05）

---

## Phase 5 — textil-cli: 基本コマンド実装 ✅ 完了

**目標:** `@textil/core` をラップした CLI ツールを動作させる

### 成果物
- `textil text "Hello" --font doom --width 80`
- `textil generate avatar.png --width 80 --charset braille`
- `textil export --target github`
- stdin パイプ対応

### タスク
- [x] CLI フレームワーク選定・セットアップ（commander.js）
- [x] `src/commands/text.ts` — テキスト生成コマンド
- [x] `src/commands/generate.ts` — 画像生成コマンド（stdin パイプ含む）
- [x] `src/commands/export.ts` — エクスポートコマンド（--target フラグ）
- [x] `src/commands/interactive.ts` — グリッドを `$EDITOR` で開く簡易編集
- [x] e2e テスト: 実際の CLI 呼び出しで出力を検証
- [x] `package.json` の `bin` フィールド設定

### 完了基準
README のサンプルコマンドがすべて動作すること

**実装結果:** 全 21 テスト green 確認済み（2026-06-05）

---

## Phase 6 — @textil/web: スタジオ UI 基盤（テキスト生成） ✅ 完了

**目標:** ブラウザ上でテキスト生成のリアルタイムプレビューができる Web UI を構築する

### 成果物
- `/studio` ページ（メインエディタ画面）
- テキスト入力 → フォント選択 → リアルタイムプレビュー
- 幅スライダー
- レスポンシブ不要（デスクトップ専用）

### タスク
- [x] `app/studio/page.tsx` — スタジオページ骨格
- [x] `components/studio/TextInput.tsx` — テキスト入力パネル
- [x] `components/studio/FontPicker.tsx` — フォント一覧グリッド（サムネプレビュー付き）
- [x] `components/studio/WidthSlider.tsx` — 幅スライダー（40〜160）
- [x] `components/studio/Preview.tsx` — `<pre>` ベースの ASCII プレビュー
- [x] `hooks/useGenerator.ts` — `@textil/core` ラップ、デバウンス付き
- [x] Storybook or Vitest + Testing Library でコンポーネントテスト

### 完了基準
ブラウザでテキストを入力するとリアルタイムにプレビューが更新されること

**実装結果:** スタジオ UI 基盤実装済み（2026-06-06）

---

## Phase 7 — @textil/web: 画像アップロード & 生成 UI ✅ 完了

**目標:** 画像ドラッグ&ドロップ → パラメータ調整 → プレビューのフローを実装する

### 成果物
- ドラッグ&ドロップ / クリックでアップロード
- 文字セット切り替え（Standard / Braille / Block）
- コントラスト / 閾値スライダー
- リアルタイムプレビュー更新

### タスク
- [x] `components/studio/ImageUploader.tsx` — DropZone UI
- [x] `hooks/useImageGenerator.ts` — Canvas API で画像読み込み → `generateImage()`
- [x] `components/studio/CharsetSelector.tsx`
- [x] `components/studio/ImageControls.tsx` — コントラスト / 閾値スライダー
- [x] プレビューコンポーネントを テキスト/画像 両モードに対応させる
- [x] 大サイズ画像のパフォーマンス最適化（Web Worker or throttle）

### 完了基準
PNG をドロップしてパラメータを調整すると即座にプレビューが更新されること

**実装結果:** 画像アップロード & 生成 UI 実装済み（2026-06-06）

---

## Phase 8 — @textil/web: グリッドエディタ ✅ 完了

**目標:** 生成した ASCII グリッドをブラウザ上で直接編集できるエディタを実装する（最重要差別化機能）

### 成果物
- 文字グリッドエディタ（鉛筆 / 消しゴム / 選択 / テキスト挿入）
- Find & Replace パネル
- Undo / Redo（100ステップ）
- ズーム（文字単位まで拡大）

### タスク
- [x] `components/editor/GridCanvas.tsx` — Canvas または DOM ベースのグリッド描画
- [x] `components/editor/Toolbar.tsx` — ツール切り替えバー
- [x] `hooks/useGridEditor.ts` — `@textil/core` の `GridEditor` をラップ
- [x] 鉛筆ツール: クリック / ドラッグで文字上書き
- [x] 消しゴムツール: 文字を空白に
- [x] 矩形選択ツール: コピー / 移動 / 削除
- [x] テキスト挿入ツール: キーボード入力で直接書き込み
- [x] Find & Replace パネル（`@textil/core` の `findReplace` を呼ぶ）
- [x] ズームコントロール（50% 〜 400%）
- [x] Undo / Redo ボタン & キーボードショートカット（Ctrl+Z / Ctrl+Y）

### 完了基準
生成後にエディタで文字を修正し Undo/Redo が正確に動作すること

**実装結果:** グリッドエディタ全機能実装済み（2026-06-06）

---

## Phase 9 — @textil/web: エクスポート UI ✅ 完了

**目標:** 「どこに貼るか」を選んで最適形式でダウンロード / コピーできる UI を実装する

### 成果物
- エクスポートモーダル（ターゲット選択）
- GitHub / Terminal / Discord / Plain text → クリップボードコピー
- Twitter/X → PNG ダウンロード
- React Component → `.tsx` ダウンロード

### タスク
- [x] `components/export/ExportModal.tsx` — ターゲット選択モーダル
- [x] `components/export/TargetCard.tsx` — 各ターゲットのプレビュー + コピーボタン
- [x] GitHub: コードブロック付きMarkdown、幅チェック警告
- [x] Terminal / ANSI: `echo` ワンライナー生成
- [x] Discord / Slack: 最大文字数チェック（2000文字）+ 警告
- [x] PNG エクスポート: Canvas に monospace フォントで描画、`toBlob()` でダウンロード
- [x] React Component: `<pre>` ラップの `.tsx` テンプレート生成
- [x] クリップボード API 対応（HTTPS 必須の fallback 含む）

### 完了基準
全ターゲットで出力が生成でき、PNG が視覚的に正しくレンダリングされること

**実装結果:** 6ターゲット（GitHub / Terminal / Discord / Plain / PNG / React）実装済み、確認済み（2026-06-06）

---

## Phase 10 — カラー対応 ✅ 完了

**目標:** モノクロ専用だったグリッドにRGBカラー情報を追加し、対応エクスポーターでカラー出力・非対応エクスポーターでは制限表示を行う

### 成果物
- `Cell` 型へのカラーフィールド追加（`fg` / `bg` オプショナル RGB）
- カラーモード / モノクロモードの切り替え
- 画像生成: ピクセル輝度マッピングに加えて元の RGB カラーを保持
- テキスト生成: 指定カラーを `Cell` に付与するオプション
- ANSIエクスポーター: カラー付き ANSI エスケープ出力
- JSONエクスポーター: カラーフィールド含む構造化出力
- カラー非対応エクスポーター（plain / github / discord / React Component）: カラー付きグリッドを渡した場合は警告表示 + モノクロへのダウングレード確認 UI
- PNG エクスポーター: カラー情報を使ってフルカラー描画
- Web スタジオ: プレビューのカラー描画 & モード切り替えトグル

### タスク

#### @textil/core
- [ ] `src/types/grid.ts` — `Cell` に `fg?: RGBColor`, `bg?: RGBColor` 追加（`RGBColor = [number, number, number]`）
- [ ] `src/types/options.ts` — `GenerateOptions` に `colorMode: "color" | "mono"` 追加; `ExportColorSupport` 型（各ターゲットの対応フラグ）
- [ ] `src/generator/image/sampler.ts` — カラーモード時にピクセル RGB を `Cell.fg` へ格納
- [ ] `src/generator/text.ts` — `GenerateOptions` の `color` フィールドで文字セル全体に単色付与
- [ ] `src/exporter/ansi.ts` — `Cell.fg` / `Cell.bg` を ANSI 256 / TrueColor エスケープに変換
- [ ] `src/exporter/json.ts` — カラーフィールドを出力に含める
- [ ] `src/exporter/plain.ts` / `github.ts` — カラー付きグリッドを受け取った場合に警告を返す（`ExportWarning` 型）
- [ ] `src/exporter/index.ts` — `exportColorSupport` マップをエクスポート（各ターゲットの対応可否）
- [ ] ユニットテスト: カラーセル生成 / ANSI エスケープ出力 / 非対応エクスポーター警告

#### @textil/web
- [ ] `hooks/useImageGenerator.ts` — `colorMode` パラメータを追加し Canvas から RGB 取得
- [ ] `hooks/useGenerator.ts` — テキスト生成にカラーオプション追加
- [ ] `components/studio/ModeToggle.tsx` — カラー / モノクロ切り替えトグル
- [ ] `components/studio/ColorPicker.tsx` — テキストモード用の FG / BG カラー指定 UI
- [ ] `components/studio/Preview.tsx` — `Cell.fg` / `Cell.bg` を CSS `color` / `background-color` で描画
- [ ] `components/export/ExportModal.tsx` — カラーグリッド時に非対応ターゲット（plain / github / discord / React）を無効化 or 警告バッジ表示
- [ ] `components/export/TargetCard.tsx` — 「カラー非対応 — モノクロに変換して出力します」警告 UI
- [ ] PNG エクスポート: `Cell.fg` を Canvas の `fillStyle` に反映してカラー描画

### 完了基準
- カラーモードで生成した画像のプレビューに色が付くこと
- ANSI エクスポートでカラー付き出力が得られること
- plain / github エクスポートではカラー非対応の警告が表示されること
- モノクロモードでは既存の動作が変わらないこと

**実装結果:** Phase 10 カラー対応実装済み（2026-06-07）。`Cell` 型を `{ char, fg?, bg? }` オブジェクトへ全面移行、画像生成カラーモード・テキスト単色指定・ANSI TrueColor エクスポート・JSON カラーフィールド・Web Preview/PNG カラー描画・ModeToggle/ColorPicker UI コンポーネント追加。CLI パッケージも Cell オブジェクト形式へ対応。`turbo lint build test` 全 9 タスク green（Core 185 件 / Web 39 件 / CLI テスト通過）。

---

## Phase 11 — Web サイト改善 ✅ 完了

**目標:** ルート URL から直接利用できるようにし、UI デザインをモダンダーク風に刷新する

> **プライバシー方針:** サーバー側でユーザーの入力内容を一切保持しない原則を採用。
> スタジオ本体（テキスト入力・画像アップロード・生成・エクスポート）は
> `@textil/core` がブラウザ内で完結しており、サーバーにデータは送信されない。
> パーマリンク機能（サーバーストレージ必要）は削除。

### 成果物
- ルート `/` にスタジオを移動（`/studio` は `/` へリダイレクト）
- Inter フォント採用（`next/font/google`）
- サイドバー: ガラス質感 + violet→cyan グラデーションブランド
- Export ボタン: グラデーション + グロー効果
- メインエリア: 微細ドットグリッド背景
- セクション区切りと `SectionLabel` でコントロール群を整理

### タスク
- [x] `app/page.tsx` をスタジオ本体に（旧 `studio/page.tsx` の内容を移動・再デザイン）
- [x] `app/studio/page.tsx` を `/` へのリダイレクトに変更
- [x] `app/layout.tsx` に Inter フォント追加
- [x] `app/globals.css` に `.dot-grid` / `.scrollbar-thin` / `@theme` 追加
- [x] サイドバーデザイン刷新（グラデーションブランド・ガラス効果・セクションラベル）
- [x] Export ボタンをグラデーション CTA ボタンに変更

### 完了基準
`/` にアクセスするだけでスタジオが使えること、デザインが刷新されていること

**実装結果:** Phase 11 実装済み（2026-06-07）

---

## Phase 12 — polish & npm 公開

**目標:** `@textil/core` と `textil-cli` を npm に公開し、OSS として使えるようにする

### 成果物
- npm publish (`@textil/core`, `textil-cli`)
- README（使い方・API リファレンス）
- Changelog / semver 管理
- textil.app 本番デプロイ（Vercel）

### タスク
- [ ] `@textil/core` の公開 API 最終整理と型エクスポート確認
- [ ] `packages/core/README.md` — API ドキュメント
- [ ] `packages/cli/README.md` — コマンドリファレンス
- [ ] `changeset` セットアップ（バージョン管理 / CHANGELOG 自動生成）
- [ ] npm publish CI（tag push で自動リリース）
- [ ] Vercel プロジェクト設定 + 環境変数
- [ ] 本番デプロイ & E2E スモークテスト

### 完了基準
`npm install @textil/core` で動作し、textil.app が本番アクセス可能なこと

---

## フェーズ全体マップ

```
Phase 0  │ Monorepo 基盤
Phase 1  │ Core: 型 & グリッド構造       ┐
Phase 2  │ Core: テキスト生成 (FIGlet)   │ @textil/core
Phase 3  │ Core: 画像生成                │
Phase 4  │ Core: エクスポーター           ┘
Phase 5  │ CLI: 基本コマンド              → textil-cli
Phase 6  │ Web: テキスト生成 UI          ┐
Phase 7  │ Web: 画像アップロード UI       │
Phase 8  │ Web: グリッドエディタ          │ @textil/web
Phase 9  │ Web: エクスポート UI           │
Phase 10 │ カラー対応                     ┘
Phase 11 │ Web: Share & Permalink
Phase 12 │ npm 公開 & 本番デプロイ
```

> **Phase 0–4** = v0.1 (Core Engine OSS)  
> **Phase 5** = v0.1 の一部  
> **Phase 6–9** = v0.2 (Web Studio MVP)  
> **Phase 10** = v0.2.5 (Color Support)  
> **Phase 11** = v0.3 (Share & Polish)  
> **Phase 12** = v1.0 リリース準備
