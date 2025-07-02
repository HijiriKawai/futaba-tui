import { useState } from 'react';
import fs from 'fs';
import path from 'path';
import os from 'os';
import type { Config } from '../types/futaba.js';

export function useSettingsEditor(configState: Config, setConfigState: (c: Config) => void) {
  // 設定画面用状態
  const [selected, setSelected] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [message, setMessage] = useState('');
  const [keyInputMode, setKeyInputMode] = useState(false);

  // 設定編集用の全項目リスト
  const keyConfigKeys: string[] = Object.keys(configState.keyConfig);
  const threadGridKeys: string[] = Object.keys(configState.threadGrid).map(k => `threadGrid.${k}`);
  const threadDetailKeys: string[] = Object.keys(configState.threadDetail).map(k => `threadDetail.${k}`);
  const allKeys: string[] = [...keyConfigKeys, ...threadGridKeys, ...threadDetailKeys];

  function getValue(key: string): string | number {
    if (!key) return '';
    if (keyConfigKeys.includes(key)) return configState.keyConfig[key] ?? '';
    if (threadGridKeys.includes(key)) return configState.threadGrid[key.replace('threadGrid.', '') as keyof Config['threadGrid']] ?? '';
    if (threadDetailKeys.includes(key)) return configState.threadDetail[key.replace('threadDetail.', '') as keyof Config['threadDetail']] ?? '';
    return '';
  }

  function submitEditValue(val: string) {
    const key = allKeys[selected] ?? '';
    let newConfig = { ...configState };
    if (key && keyConfigKeys.includes(key)) {
      // キー割り当ては物理キー入力で処理するのでここでは何もしない
    } else if (key && threadGridKeys.includes(key)) {
      const k = key.replace('threadGrid.', '');
      const num = Number(val);
      if (isNaN(num) || num <= 0) {
        setMessage('数値を入力してください');
        return;
      }
      newConfig = {
        ...newConfig,
        threadGrid: { ...newConfig.threadGrid, [k]: num },
      };
    } else if (key && threadDetailKeys.includes(key)) {
      const k = key.replace('threadDetail.', '');
      const num = Number(val);
      if (isNaN(num) || num <= 0) {
        setMessage('数値を入力してください');
        return;
      }
      newConfig = {
        ...newConfig,
        threadDetail: { ...newConfig.threadDetail, [k]: num },
      };
    }
    setConfigState(newConfig);
    setEditing(false);
    setMessage('変更を反映しました（wで保存）');
  }

  function saveSettingsToFile(configObj: Config) {
    const xdgConfigHome = process.env['XDG_CONFIG_HOME'] || path.join(os.homedir(), '.config');
    const dir = path.join(xdgConfigHome, 'futaba-tui');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, 'config.json');
    fs.writeFileSync(file, JSON.stringify(configObj, null, 2), 'utf-8');
  }

  return {
    selected, setSelected,
    editing, setEditing,
    editValue, setEditValue,
    message, setMessage,
    keyInputMode, setKeyInputMode,
    keyConfigKeys, threadGridKeys, threadDetailKeys, allKeys,
    getValue, submitEditValue, saveSettingsToFile
  };
}
