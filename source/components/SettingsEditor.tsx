import React from 'react';
import {Box, Text} from 'ink';
import TextInput from 'ink-text-input';
import {SORT_MODES} from '../constants.js';
import SelectInput from 'ink-select-input';

export type SettingsEditorProps = {
	selected: number;
	editing: boolean;
	editValue: string;
	message: string;
	keyConfigKeys: string[];
	allKeys: string[];
	getValue: (key: string) => string | number;
	onEditValueChange: (v: string) => void;
	onEditSubmit: (v: string) => void;
	defaultSortModeKey: string;
	BOX_HEIGHT: number;
	boxPadding: number;
	boxBorder: number;
};

export default function SettingsEditor({
	selected,
	editing,
	editValue,
	message,
	keyConfigKeys,
	allKeys,
	getValue,
	onEditValueChange,
	onEditSubmit,
	defaultSortModeKey,
	BOX_HEIGHT,
	boxPadding,
	boxBorder,
}: SettingsEditorProps) {
	const currentKey =
		selected >= 0 && selected < allKeys.length ? allKeys[selected] : '';
	const isDefaultSortMode = currentKey === defaultSortModeKey;

	// ソート選択肢
	const sortItems = SORT_MODES.map(m => ({label: m.name, value: m.name}));

	const HEADER_LINES = 1; // 設定画面のヘッダー
	const FOOTER_LINES = 1; // メッセージや余白
	const visibleRows =
		BOX_HEIGHT - 2 * boxPadding - 2 * boxBorder - HEADER_LINES - FOOTER_LINES;

	// 1項目あたりの高さ（border上下+2, marginBottom+1, 本体1）
	const ITEM_HEIGHT = 1 + 2 + 1; // 本体+border+margin
	const maxVisible = Math.max(1, Math.floor(visibleRows / ITEM_HEIGHT));

	// スクロール位置計算
	let start = 0;
	if (selected < Math.floor(maxVisible / 2)) {
		start = 0;
	} else if (selected > allKeys.length - Math.ceil(maxVisible / 2)) {
		start = Math.max(0, allKeys.length - maxVisible);
	} else {
		start = selected - Math.floor(maxVisible / 2);
	}
	const end = Math.min(start + maxVisible, allKeys.length);
	const visibleKeys = allKeys.slice(start, end);

	return (
		<Box flexDirection="column">
			<Text color="cyan" bold>
				設定画面（↑↓:移動 Enter:編集 設定キー:保存 q/esc:戻る）
			</Text>
			{visibleKeys.map((key, idx) => {
				const realIdx = start + idx;
				return (
					<Box
						key={key}
						flexDirection="column"
						borderStyle="round"
						borderColor={selected === realIdx ? 'blue' : 'white'}
						marginBottom={1}
						paddingLeft={1}
					>
						<Text
							color={selected === realIdx ? 'yellow' : undefined}
							bold={selected === realIdx}
						>
							{selected === realIdx ? '> ' : '  '}
							{key}: {getValue(key)}
						</Text>
						{editing && selected === realIdx && !keyConfigKeys.includes(key) ? (
							isDefaultSortMode ? (
								<Box>
									<SelectInput
										items={sortItems}
										initialIndex={sortItems.findIndex(
											i => i.value === editValue,
										)}
										onSelect={item => item && onEditSubmit(item.value)}
									/>
								</Box>
							) : (
								<Text color="white" inverse>
									<TextInput
										value={editValue}
										onChange={onEditValueChange}
										onSubmit={onEditSubmit}
										placeholder={String(getValue(key) ?? '')}
									/>
								</Text>
							)
						) : null}
					</Box>
				);
			})}
			{editing && keyConfigKeys.includes(currentKey ?? '') && (
				<Text color="green" bold>
					割り当てたいキーを押してください（Escでキャンセル）
				</Text>
			)}
			{message && <Text color="magenta">{message}</Text>}
		</Box>
	);
}
