import {useState} from 'react';
import {BOARDS} from '../constants.js';

export function useBoardSelector() {
	const [selectedBoard, setSelectedBoard] = useState(0);
	return {
		boards: BOARDS,
		selectedBoard,
		setSelectedBoard,
		board: BOARDS[selectedBoard],
	};
}
