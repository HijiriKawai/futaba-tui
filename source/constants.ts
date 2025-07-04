import type {Board, SortMode} from './types/futaba.js';

export const BOARDS: Board[] = [
	{key: 'img', name: 'img', url: 'https://img.2chan.net/b/'},
];

export const SORT_MODES: SortMode[] = [
	{name: 'カタログ', param: ''},
	{name: '新順', param: '&sort=1'},
	{name: '古順', param: '&sort=2'},
	{name: '多順', param: '&sort=3'},
	{name: '勢順', param: '&sort=6'},
	{name: '少順', param: '&sort=4'},
	{name: 'そ順', param: '&sort=8'},
];
