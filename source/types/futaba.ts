export type Board = {
  key: string;
  name: string;
  url: string;
};

export type Thread = {
  id: string;
  title: string;
  imgUrl?: string;
};

export type Res = {
  num: string;
  name: string;
  date: string;
  body: string;
  imgUrl?: string;
  rsc?: string;
  sod?: string;
  mediaUrls?: string[];
};

export type SortMode = {
  name: string;
  param: string;
};

export type HistoryItem = {
	boardName: string;
	threadId: string;
	thumbUrl?: string;
	firstResHead: string;
	accessedAt: string;
};

export type Config = {
  keyConfig: Record<string, string>;
  helpText: Record<string, string>;
  threadGrid: {
    cols: number;
    rows: number;
  };
  threadDetail: {
    windowSize: number;
  };
};

export type InkKey = {
  upArrow?: boolean;
  downArrow?: boolean;
  leftArrow?: boolean;
  rightArrow?: boolean;
  return?: boolean;
  escape?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  meta?: boolean;
};

