import { useState, useEffect } from 'react';
import { fetchThreads } from '../api/fetchThreads.js';
import terminalImage from 'terminal-image';
import { Thread } from '../types/futaba.js';

export function useThreadGrid(boardUrl: string, sortMode: number) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState(0);
  const [thumbCache, setThumbCache] = useState<{ [imgFile: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchThreads(boardUrl, sortMode)
      .then(setThreads)
      .catch(() => setError('スレッド一覧の取得に失敗しました'))
      .finally(() => setLoading(false));
  }, [boardUrl, sortMode]);

  useEffect(() => {
    async function loadThumbs() {
      const promises = threads.map(async thread => {
        if (thread.imgUrl) {
          const imgFile = thread.imgUrl.split('/').pop() || thread.id;
          if (!thumbCache[imgFile]) {
            try {
              const imgUrl = boardUrl + 'cat/' + imgFile;
              const buffer = await (await fetch(imgUrl, { method: 'GET' })).arrayBuffer();
              const img = await terminalImage.buffer(Buffer.from(buffer),
                { width: '15%', height: '15%', preserveAspectRatio: true }
              );
              return { imgFile, img };
            } catch {
              return { imgFile, img: ''};
            }
          }
        }
        return null;
      });
      const results = await Promise.all(promises);
      const newCache: { [imgFile: string]: string } = {};
      results.forEach(r => { if (r && r.img) newCache[r.imgFile] = r.img; });
      if (Object.keys(newCache).length > 0)
        setThumbCache(prev => ({ ...prev, ...newCache }));
    }
    loadThumbs();
  }, [threads, boardUrl]);

  return {
    threads,
    selectedThread,
    setSelectedThread,
    thumbCache,
    loading,
    error,
  };
}
