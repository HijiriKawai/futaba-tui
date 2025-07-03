import React from 'react';
import { Box, Text } from 'ink';
import type { Res } from '../types/futaba.js';
import config, { generateHelpText } from '../config.js';

type UrlSelectMode = { urls: string[]; resIdx: number } | null;

type Props = {
  responses: Res[];
  selected: number;
  resThumb: string | null;
  mediaThumbCache: { [url: string]: string };
  scrollOffset: number;
  setScrollOffset: (offset: number) => void;
  hideDeletedRes?: boolean;
  urlSelectMode?: UrlSelectMode;
  boxHeight?: number;
};

export default function ThreadDetail({ responses, selected, resThumb, mediaThumbCache, scrollOffset, setScrollOffset, hideDeletedRes, urlSelectMode, boxHeight }: Props) {
  // レスごとの高さを見積もる
  function estimateResHeight(res: Res): number {
    // ヘッダー（No/日付/名前/そうだね）
    const headerLines = 1;
    // 本文の行数（空行除外）
    const bodyLines = res.body.split('\n').filter(line => line.trim() !== '').length;
    // 画像・動画の数
    const imageCount = (res.mediaUrls?.filter(url => /\.(jpe?g|png|gif)$/i.test(url)).length || 0);
    const videoCount = (res.mediaUrls?.filter(url => /\.(webm|mp4)$/i.test(url)).length || 0);
    // 画像は1つにつき7行、動画は1つにつき1行
    const imageLines = imageCount * 7;
    const videoLines = videoCount * 1;
    // border上下+2, marginBottom+1
    const borderLines = 2;
    const marginBottom = 1;
    return headerLines + bodyLines + imageLines + videoLines + borderLines + marginBottom;
  }

  // filteredとresHeightsをuseMemoで作成
  const filtered: Res[] = React.useMemo(() => (
    (hideDeletedRes
      ? responses.filter(res =>
          !(res.body.startsWith('書き込みをした人によって削除されました') ||
            res.body.startsWith('スレッドを立てた人によって削除されました') ||
            res.body.startsWith('削除依頼によって隔離されました')))
      : responses).filter((r): r is Res => !!r)
  ), [responses, hideDeletedRes]);

  const resHeights = React.useMemo(() => filtered.map(estimateResHeight), [filtered]);

  // boxHeightに収まるだけレスを表示
  let total = 0;
  let visibleResponses: (Res | undefined)[] = [];
  for (let i = scrollOffset; i < filtered.length; i++) {
    const h = resHeights[i];
    if (h == null) break;
    if (total + h > (boxHeight ?? 20)) break;
    if (filtered[i]) visibleResponses.push(filtered[i]);
    total += h;
  }

  // scrollOffset調整
  React.useEffect(() => {
    // selectedがvisibleResponsesに含まれているか
    let acc = 0, found = false;
    for (let i = scrollOffset; i < filtered.length; i++) {
      const h = resHeights[i];
      if (h == null) break;
      if (acc + h > (boxHeight ?? 20)) break;
      acc += h;
      if (i === selected) found = true;
    }
    if (!found && selected < filtered.length) {
      // selectedが一番下に来るようなscrollOffsetを計算
      let t = 0, s = selected;
      while (s >= 0) {
        const h = resHeights[s];
        if (h == null) break;
        t += h;
        if (t > (boxHeight ?? 20)) break;
        s--;
      }
      setScrollOffset(Math.max(0, s + 1));
    } else if (selected < scrollOffset) {
      setScrollOffset(selected);
    }
  }, [selected, scrollOffset, boxHeight, filtered, resHeights, setScrollOffset]);

  return (
    <Box flexDirection="column">
      <Text color="cyan">
        {(() => {
          const firstBody = responses[0]?.body;
          if (!firstBody) return generateHelpText(config.helpText.threadDetail, config.keyConfig);
          const first = firstBody.replace(/\n/g, '');
          const head = first.length > 10 ? first.slice(0, 10) + '…' : first;
          return `${head}（${generateHelpText(config.helpText.threadDetail, config.keyConfig).replace(/^[^（]*（/, '')}`;
        })()}
      </Text>
      <Text color="yellow">
        全{responses.length}件中、{Math.min(scrollOffset + 1, responses.length)}〜{Math.min(scrollOffset + visibleResponses.length, responses.length)}件を表示中
        {hideDeletedRes && (responses.length - filtered.length > 0) && (
          `　${responses.length - filtered.length}件の非表示があります`
        )}
      </Text>
      {responses.length === 0 ? (
        <Text color="yellow">レスが見つかりません</Text>
      ) : (
        visibleResponses.map((res, idx) => {
          if (!res) return null;
          const realIdx = scrollOffset + idx;
          return (
						<Box
							key={res.num}
							flexDirection="column"
							borderStyle="round"
							borderColor={selected === realIdx ? 'blue' : 'white'}
							paddingLeft={1}
							marginBottom={1}
						>
							<Text>
								<Text color="red">{res.rsc}</Text>{' '}
								<Text color="yellow">No.{res.num}</Text>{' '}
								<Text color="cyan">{res.date}</Text>{' '}
								<Text color="magenta">{res.name}</Text>{' '}
								<Text color="green">そうだね:{res.sod}</Text>
							</Text>
							{res.body.split('\n').map((line, i) =>
								line.startsWith('書き込みをした人によって削除されました') ||
								line.startsWith('スレッドを立てた人によって削除されました') ||
								line.startsWith('削除依頼によって隔離されました') ? (
									<Text key={i} color="red">
										{line}
									</Text>
								) : line.startsWith('>') ? (
									<Text key={i} color="green">
										{line}
									</Text>
								) : (
									<Text key={i}>{line}</Text>
								),
							)}
							{/* 画像・動画表示 */}
							{res.mediaUrls &&
								res.mediaUrls.map((url, i) => {
									if (/\.(jpe?g|png|gif)$/i.test(url)) {
										if (mediaThumbCache[url]) {
											return <Text key={i}>{mediaThumbCache[url]}</Text>;
										} else {
											return (
												<Text key={i} color="green">
													画像: {url}
												</Text>
											);
										}
									} else if (/\.(webm|mp4)$/i.test(url)) {
										return (
											<Text key={i} color="yellow">
												動画: {url}
											</Text>
										);
									}
									return null;
								})}
							{selected === realIdx && res.imgUrl && !resThumb && (
								<Text color="green">画像: {res.imgUrl}</Text>
							)}
						</Box>
					);
        })
      )}
      {/* URL選択モード時のURL一覧表示 */}
      {urlSelectMode && urlSelectMode.urls.length > 1 && (
        <Box flexDirection="column" marginTop={1} borderStyle="round" borderColor="yellow">
          <Text color="yellow">URLを選択してください（1〜{urlSelectMode.urls.length}、q/escでキャンセル）</Text>
          {urlSelectMode.urls.map((url, i) => (
            <Text key={i} color="cyan">{i+1}: {url}</Text>
          ))}
        </Box>
      )}
    </Box>
  );
}
