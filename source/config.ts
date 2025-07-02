import fs from 'fs';
import path from 'path';
import os from 'os';

// デフォルト設定
const defaultConfig = {
  keyConfig: {
    up: 'up', // 上矢印
    down: 'down', // 下矢印
    left: 'left', // 左矢印
    right: 'right', // 右矢印
    enter: 'enter', // Enterキー
    openImage: 'o',
    openLink: 'l',
    toggleDeleted: 'x',
    history: 'h',
    reload: 'r',
    back: 'b',
    quit: 'q',
    sortPrev: '[',
    sortNext: ']',
    // 数字キーは1-9固定
    quoteJump: 'c', // 引用ジャンプ（例）
    urlSelectCancel: 'q', // URL選択モーダルキャンセル
    urlSelectCancelEsc: 'escape', // esc
    quoteModalCancel: 'q', // 引用モーダルキャンセル
    quoteModalCancelEsc: 'escape', // esc
    quoteModalCancelEnter: 'enter', // enter
    clearHistory: 'C', // 履歴クリア
    toggleHistoryAll: 'A', // 全履歴表示トグル
  },
  helpText: {
    board: '板を選択してください（{up}{down}:移動 {enter}:決定 {quit}:終了）',
    threadList: 'スレッド一覧（{up}{down}{left}{right}:移動 {enter}:詳細 {back}:板選択 {reload}:リロード {openImage}:画像 {sortPrev}{sortNext}:ソート {history}:履歴 {quit}:終了）',
    threadDetail: 'レス一覧（{up}{down}:移動 {back}:戻る {reload}:リロード {openImage}:画像 {openLink}:リンク {toggleDeleted}:削除非表示 {history}:履歴 {quit}:終了）',
    historyList: '履歴一覧（{up}{down}:移動 {enter}:開く {back}:戻る {quit}:終了 {clearHistory}:クリア {toggleHistoryAll}:全表示）',
    urlSelectModal: 'URLを選択してください（数字:選択 {urlSelectCancel}/{urlSelectCancelEsc}:キャンセル）',
    quoteModal: '数字:ジャンプ {quoteModalCancel}/{quoteModalCancelEsc}/{quoteModalCancelEnter}:閉じる',
  },
  threadGrid: {
    cols: 5,
    rows: 3,
  },
  threadDetail: {
    windowSize: 7,
  },
};

// XDG Base Directory対応
const xdgConfigHome = process.env['XDG_CONFIG_HOME'] || path.join(os.homedir(), '.config');
const xdgConfigPath = path.join(xdgConfigHome, 'futaba-tui', 'config.json');

// 設定ファイルの探索パス
const configFileNames = [
  path.join(process.cwd(), 'futaba-tui.config.json'),
  path.join(os.homedir(), '.futaba-tui.config.json'),
  xdgConfigPath,
];

function loadConfig() {
  for (const file of configFileNames) {
    if (fs.existsSync(file)) {
      try {
        const json = JSON.parse(fs.readFileSync(file, 'utf-8'));
        return {
          ...defaultConfig,
          ...json,
          keyConfig: { ...defaultConfig.keyConfig, ...(json.keyConfig || {}) },
          threadGrid: { ...defaultConfig.threadGrid, ...(json.threadGrid || {}) },
          threadDetail: { ...defaultConfig.threadDetail, ...(json.threadDetail || {}) },
        };
      } catch (e) {
        // パース失敗時はデフォルト
        return defaultConfig;
      }
    }
  }
  return defaultConfig;
}

const keySymbolMap: Record<string, string> = {
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  enter: 'Enter',
  escape: 'Esc',
};

function generateHelpText(template: string, keyConfig: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const val = keyConfig[key];
    if (!val) return `{${key}}`;
    // 特殊キーは記号に変換
    return keySymbolMap[val] || val;
  });
}

const config = loadConfig();
export { generateHelpText };
export default config;
