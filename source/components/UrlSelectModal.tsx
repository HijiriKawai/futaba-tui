import React from 'react';
import { Box, Text } from 'ink';
import config, { generateHelpText } from '../config.js';

type Props = {
  urls: string[];
  onSelect: (idx: number) => void;
  onCancel: () => void;
};

export default function UrlSelectModal({ urls }: Props) {
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
				borderColor="yellow"
				alignItems="flex-start"
				width="100%"
				height="100%"
			>
				<Text color="yellow" backgroundColor="gray">
					{generateHelpText(config.helpText.urlSelectModal, config.keyConfig)}
				</Text>
				{urls.map((url, i) => (
					<Text key={i} color="cyan" backgroundColor="gray">
						{i + 1}: {url}
					</Text>
				))}
			</Box>
		</Box>
	);
}
