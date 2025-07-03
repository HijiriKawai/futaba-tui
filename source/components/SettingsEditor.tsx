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
}: SettingsEditorProps & {
	defaultSortModeKey: string;
	setEditing: (v: boolean) => void;
}) {
	const currentKey =
		selected >= 0 && selected < allKeys.length ? allKeys[selected] : '';
	const isDefaultSortMode = currentKey === defaultSortModeKey;

	// ソート選択肢
	const sortItems = SORT_MODES.map(m => ({label: m.name, value: m.name}));
	return (
		<Box flexDirection="column">
			<Text color="cyan">
				設定画面（↑↓:移動 Enter:編集 設定キー:保存 q/esc:戻る）
			</Text>
			{allKeys.map((key, idx) => (
				<Box key={key}>
					<Text color={selected === idx ? 'yellow' : undefined}>
						{selected === idx ? '> ' : '  '}
						{key}: {getValue(key)}
					</Text>
					{editing && selected === idx && !keyConfigKeys.includes(key) ? (
						isDefaultSortMode ? (
							<Box>
								<SelectInput
									items={sortItems}
									initialIndex={sortItems.findIndex(i => i.value === editValue)}
									onSelect={item => item && onEditSubmit(item.value)}
								/>
							</Box>
						) : (
							<TextInput
								value={editValue}
								onChange={onEditValueChange}
								onSubmit={onEditSubmit}
								placeholder={String(getValue(key) ?? '')}
							/>
						)
					) : null}
				</Box>
			))}
			{editing && keyConfigKeys.includes(currentKey ?? '') && (
				<Text color="green">
					割り当てたいキーを押してください（Escでキャンセル）
				</Text>
			)}
			{message && <Text color="magenta">{message}</Text>}
		</Box>
	);
}
