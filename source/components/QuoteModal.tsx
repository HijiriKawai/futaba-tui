import React from 'react';
import {Box, Text} from 'ink';
import type {Res} from '../types/futaba.js';
import config, {generateHelpText} from '../config.js';

type Props = {
	res?: Res[];
	message?: string;
	onClose: () => void;
	onSelect?: (idx: number) => void;
};

export default function QuoteModal({res, message}: Props) {
	return (
		<Box
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			width="100%"
			height="100%"
		>
			<Box
				flexDirection="column"
				borderStyle="round"
				borderColor="cyan"
				width="100%"
				height="100%"
				alignItems="flex-start"
			>
				{res && res.length > 0 ? (
					<>
						<Text color="cyan" backgroundColor="gray">
							引用元レス{res.length > 1 ? '（複数）' : ''}
						</Text>
						{res.map((r, idx) => (
							<Box key={idx} flexDirection="column" marginBottom={1}>
								<Text backgroundColor="gray">
									{`${idx + 1}: `}
									{r.rsc} {r.date} No.{r.num} {r.name} そうだね:{r.sod}
								</Text>
								{r.body.split('\n').map((line, i) =>
									line.startsWith('書き込みをした人によって削除されました') ||
									line.startsWith('スレッドを立てた人によって削除されました') ||
									line.startsWith('削除依頼によって隔離されました') ? (
										<Text key={i} color="red" backgroundColor="gray">
											{line}
										</Text>
									) : line.startsWith('>') ? (
										<Text key={i} color="green" backgroundColor="gray">
											{line}
										</Text>
									) : (
										<Text key={i} backgroundColor="gray">
											{line}
										</Text>
									),
								)}
							</Box>
						))}
					</>
				) : (
					<Text color="red" backgroundColor="gray">
						{message ?? '引用元が見つかりません'}
					</Text>
				)}
				<Text color="white" backgroundColor="gray">
					{res && res.length > 0
						? generateHelpText(config.helpText.quoteModal, config.keyConfig)
						: generateHelpText(config.helpText.quoteModal, config.keyConfig)}
				</Text>
			</Box>
		</Box>
	);
}
