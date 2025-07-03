import fs from 'fs';
import path from 'path';
import os from 'os';
import type { Config } from '../types/futaba.js';

export const defaultConfig = {
  keyConfig: {
    up: 'up', down: 'down', left: 'left', right: 'right', enter: 'enter', openImage: 'o', openLink: 'l', toggleDeleted: 'x', history: 'h', reload: 'r', back: 'b', quit: 'q', sortPrev: '[', sortNext: ']', quoteJump: 'c', urlSelectCancel: 'q', urlSelectCancelEsc: 'escape', quoteModalCancel: 'q', quoteModalCancelEsc: 'escape', quoteModalCancelEnter: 'enter', clearHistory: 'C', toggleHistoryAll: 'A', settings: 's', saveSettings: 'w',
  },
  helpText: {
    board: '板を選択してください（{up}{down}:移動 {enter}:決定 {quit}:終了）',
    threadList: 'スレッド一覧（{up}{down}{left}{right}:移動 {enter}:詳細 {back}:板選択 {reload}:リロード {openImage}:画像 {sortPrev}{sortNext}:ソート {history}:履歴 {quit}:終了）',
    threadDetail: 'レス一覧（{up}{down}:移動 {back}:戻る {reload}:リロード {openImage}:画像 {openLink}:リンク {toggleDeleted}:削除非表示 {history}:履歴 {quit}:終了）',
    historyList: '履歴一覧（{up}{down}:移動 {enter}:開く {back}:戻る {quit}:終了 {clearHistory}:クリア {toggleHistoryAll}:全表示）',
    urlSelectModal: 'URLを選択してください（数字:選択 {urlSelectCancel}/{urlSelectCancelEsc}:キャンセル）',
    quoteModal: '数字:ジャンプ {quoteModalCancel}/{quoteModalCancelEsc}/{quoteModalCancelEnter}:閉じる',
  },
  threadGrid: { cols: 5, rows: 3 },
  threadDetail: { windowSize: 7 },
  defaultSortMode: '勢順',
};

export function getConfigFilePath(): string {
  const xdgConfigHome = process.env['XDG_CONFIG_HOME'] || path.join(os.homedir(), '.config');
  const dir = path.join(xdgConfigHome, 'futaba-tui');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, 'config.json');
}

export function loadConfig(): Config {
  const file = getConfigFilePath();
  if (fs.existsSync(file)) {
    try {
      const json = JSON.parse(fs.readFileSync(file, 'utf-8'));
      return {
        ...defaultConfig,
        ...json,
        keyConfig: { ...defaultConfig.keyConfig, ...(json.keyConfig || {}) },
        threadGrid: { ...defaultConfig.threadGrid, ...(json.threadGrid || {}) },
        threadDetail: { ...defaultConfig.threadDetail, ...(json.threadDetail || {}) },
        defaultSortMode: (json.defaultSortMode && json.defaultSortMode !== '') ? json.defaultSortMode : defaultConfig.defaultSortMode,
      };
    } catch {}
  }
  return defaultConfig;
}

export function saveConfig(configObj: Config) {
  const file = getConfigFilePath();
  const objToSave = {
    ...configObj,
    helpText: defaultConfig.helpText,
  };
  fs.writeFileSync(file, JSON.stringify(objToSave, null, 2), 'utf-8');
}
