import { useState, useEffect } from 'react';
import { fetchResponses } from '../api/fetchResponses.js';
import terminalImage from 'terminal-image';
import { Res } from '../types/futaba.js';

export function useThreadDetail(boardUrl: string, threadId: string | null) {
  const [responses, setResponses] = useState<Res[]>([]);
  const [selectedRes, setSelectedRes] = useState(0);
  const [resThumb, setResThumb] = useState<string | null>(null);
  const [mediaThumbCache, setMediaThumbCache] = useState<{ [url: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!threadId) return;
    setLoading(true);
    fetchResponses(boardUrl, threadId)
      .then(res => { setResponses(res); setSelectedRes(0); })
      .catch(() => setError('レス一覧の取得に失敗しました'))
      .finally(() => setLoading(false));
  }, [boardUrl, threadId]);

  useEffect(() => {
    let cancelled = false;
    async function loadResThumb() {
      const res = responses[selectedRes];
      if (res && res.imgUrl) {
        try {
          // 0レス目（スレ画）のサムネイルは/cat/から取得
          const imgFile = res.imgUrl.split('/').pop() || threadId;
          const buffer = await (await fetch(boardUrl + 'src/' + imgFile, { method: 'GET' })).arrayBuffer();
          const img = await terminalImage.buffer(Buffer.from(buffer),
            { width: '40%', preserveAspectRatio: true }
          );
          if (!cancelled) setResThumb(img);
        } catch {
          if (!cancelled) setResThumb(null);
        }
      } else {
        setResThumb(null);
      }
    }
    loadResThumb();
    return () => { cancelled = true; };
  }, [responses, selectedRes, boardUrl, threadId]);

  // mediaUrls画像のキャッシュ
  useEffect(() => {
    async function loadMediaThumbs() {
      const newCache: { [url: string]: string } = {};
      for (const res of responses) {
        if (res.mediaUrls) {
          for (const url of res.mediaUrls) {
            if (/\.(jpg|png|gif)$/i.test(url) && !mediaThumbCache[url]) {
              try {
                const buffer = await (await fetch(url, { method: 'GET' })).arrayBuffer();
                const img = await terminalImage.buffer(Buffer.from(buffer),
                  { width: '15%', height: '15%', preserveAspectRatio: true }
                );
                newCache[url] = img;
              } catch {
                newCache[url] = '';
              }
            }
          }
        }
      }
      if (Object.keys(newCache).length > 0) {
        setMediaThumbCache(prev => ({ ...prev, ...newCache }));
      }
    }
    loadMediaThumbs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responses]);

  return {
    responses,
    selectedRes,
    setSelectedRes,
    resThumb,
    mediaThumbCache,
    loading,
    error,
  };
}
