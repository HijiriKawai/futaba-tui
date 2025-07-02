# futaba-tui

ふたばちゃんねるのTUI専ブラ

## 主な機能

- 板・スレッド・レスの閲覧・移動
- 画像・リンクの外部アプリ/ブラウザでのオープン
- 削除レスの非表示トグル・非表示件数表示
- 引用元ジャンプ・引用元モーダル表示
- 履歴保存・履歴一覧からの再表示
- キー割り当て・ウィンドウサイズ等のカスタマイズ（設定ファイル対応）
- XDG Base Directory対応（Linux等で~/.config/futaba-tui/config.jsonも利用可）

## インストール

```bash
npm install --global futaba-tui
```

## 設定ファイルによるカスタマイズ

### 設定ファイルの場所

以下のいずれか（上から順に優先）

- カレントディレクトリ: `futaba-tui.config.json`
- ホームディレクトリ: `~/.futaba-tui.config.json`
- XDG_CONFIG_HOMEまたは`~/.config/futaba-tui/config.json`

### 設定例（デフォルト値）

```json
{
  "keyConfig": {
    "up": "up",         // 上矢印キー
    "down": "down",     // 下矢印キー
    "left": "left",     // 左矢印キー
    "right": "right",   // 右矢印キー
    "enter": "enter",   // Enterキー
    "openImage": "o",   // 画像を開く
    "openLink": "l",    // リンクを開く
    "toggleDeleted": "x", // 削除レス非表示
    "history": "h",     // 履歴画面
    "reload": "r",      // リロード
    "back": "b",        // 戻る
    "quit": "q",        // 終了
    "sortPrev": "[",    // ソート前
    "sortNext": "]",    // ソート次
    "quoteJump": "c",   // 引用ジャンプ
    "urlSelectCancel": "q", // URL選択モーダルキャンセル
    "urlSelectCancelEsc": "escape", // esc
    "quoteModalCancel": "q", // 引用モーダルキャンセル
    "quoteModalCancelEsc": "escape", // esc
    "quoteModalCancelEnter": "enter", // enter
    "clearHistory": "C", // 履歴クリア
    "toggleHistoryAll": "A" // 全履歴表示トグル
  },
  "threadGrid": {
    "cols": 5,   // スレッド一覧の列数
    "rows": 3    // スレッド一覧の行数
  },
  "threadDetail": {
    "windowSize": 7 // レス一覧の表示数
  }
}
```

### キー割り当てのカスタマイズ例

```json
{
  "keyConfig": {
    "up": "w",
    "down": "s",
    "left": "a",
    "right": "d",
    "enter": "z",
    "openImage": "i",
    "openLink": "k",
    "toggleDeleted": "x",
    "history": "h",
    "reload": "r",
    "back": "b",
    "quit": "q",
    "sortPrev": "<",
    "sortNext": ">",
    "quoteJump": "c",
    "urlSelectCancel": "q",
    "urlSelectCancelEsc": "escape",
    "quoteModalCancel": "q",
    "quoteModalCancelEsc": "escape",
    "quoteModalCancelEnter": "z",
    "clearHistory": "C",
    "toggleHistoryAll": "A"
  }
}
```

### 設定可能な項目

- `keyConfig`: すべての操作キー（上下左右・決定・戻る・終了・画像・リンク・ソート・履歴・削除非表示・引用ジャンプ・モーダルキャンセル・履歴クリア・全履歴表示トグル等）
- `threadGrid.cols`/`rows`: スレッド一覧の表示列数・行数
- `threadDetail.windowSize`: レス一覧のウィンドウサイズ
