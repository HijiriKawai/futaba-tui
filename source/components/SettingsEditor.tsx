import React, { useEffect, useRef } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

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
}: SettingsEditorProps) {
  const currentKey = (selected >= 0 && selected < allKeys.length) ? allKeys[selected] : '';
  const initialValueRef = useRef<string>('');

  // 編集開始時にTextInputの初期値を設定値で初期化
  useEffect(() => {
    if (editing && currentKey && !keyConfigKeys.includes(currentKey)) {
      initialValueRef.current = String(getValue(currentKey) ?? '');
      onEditValueChange(initialValueRef.current);
    }
  }, [editing, currentKey]);

  return (
    <Box flexDirection="column">
      <Text color="cyan">設定画面（↑↓:移動 Enter:編集 設定キー:保存 q/esc:戻る）</Text>
      {allKeys.map((key, idx) => (
        <Box key={key}>
          <Text color={selected === idx ? 'yellow' : undefined}>
            {selected === idx ? '> ' : '  '}{key}: </Text>
          {editing && selected === idx && !keyConfigKeys.includes(key) ? (
            <TextInput
              value={editValue}
              onChange={onEditValueChange}
              onSubmit={onEditSubmit}
              placeholder={String(getValue(key) ?? '')}
            />
          ) : (
            <Text>{getValue(key)}</Text>
          )}
        </Box>
      ))}
      {editing && keyConfigKeys.includes(currentKey ?? '') && (
        <Text color="green">割り当てたいキーを押してください（Escでキャンセル）</Text>
      )}
      {message && <Text color="magenta">{message}</Text>}
    </Box>
  );
}
