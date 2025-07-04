import {useState} from 'react';
import fs from 'fs';
import path from 'path';
import os from 'os';
import type {Config} from '../types/futaba.js';
import {SORT_MODES} from '../constants.js';

export function useSettingsEditor(
	configState: Config,
	setConfigState: (c: Config) => void,
) {
	// 設定画面用状態
	const [selected, setSelected] = useState(0);
	const [editing, setEditing] = useState(false);
	const [editValue, setEditValue] = useState('');
	const [message, setMessage] = useState('');
	const [keyInputMode, setKeyInputMode] = useState(false);

	// 設定編集用の全項目リスト
	const keyConfigKeys: string[] = Object.keys(configState.keyConfig);
	const defaultSortModeKey = 'defaultSortMode';
	const allKeys: string[] = [...keyConfigKeys, defaultSortModeKey];

	function getValue(key: string): string | number {
		if (!key) return '';
		if (keyConfigKeys.includes(key)) return configState.keyConfig[key] ?? '';
		if (key === defaultSortModeKey) return configState.defaultSortMode;
		return '';
	}

	function submitEditValue(val: string) {
		const key = allKeys[selected] ?? '';
		let newConfig = {...configState};
		if (key && keyConfigKeys.includes(key)) {
			// キー割り当ては物理キー入力で処理するのでここでは何もしない
		} else if (key === defaultSortModeKey) {
			if (!SORT_MODES.some(m => m.name === val)) {
				setMessage('有効なソート名を選択してください');
				return;
			}
			newConfig = {
				...newConfig,
				defaultSortMode: val,
			};
		}
		setConfigState(newConfig);
		setEditing(false);
		setMessage('変更を反映しました（wで保存）');
	}

	function saveSettingsToFile(configObj: Config) {
		const xdgConfigHome =
			process.env['XDG_CONFIG_HOME'] || path.join(os.homedir(), '.config');
		const dir = path.join(xdgConfigHome, 'futaba-tui');
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});
		const file = path.join(dir, 'config.json');
		fs.writeFileSync(file, JSON.stringify(configObj, null, 2), 'utf-8');
	}

	return {
		selected,
		setSelected,
		editing,
		setEditing,
		editValue,
		setEditValue,
		message,
		setMessage,
		keyInputMode,
		setKeyInputMode,
		keyConfigKeys,
		allKeys,
		getValue,
		submitEditValue,
		saveSettingsToFile,
		defaultSortModeKey,
	};
}
