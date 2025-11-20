import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ref, query, limitToFirst, startAfter, get } from 'firebase/database';
import { database } from '../firebase';

const WritingContext = createContext();
const PAGE_SIZE = 30;

export function WritingProvider({ children }) {
  const [boxes, setBoxes] = useState([]);
  const [boxMeta, setBoxMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastKey, setLastKey] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const loadBoxes = useCallback(async (lastKey = null) => {
    try {
      setLoading(true);
      let boxesRef = query(ref(database, 'boxes'), limitToFirst(PAGE_SIZE));
      if (lastKey) {
        boxesRef = query(boxesRef, startAfter(lastKey));
      }
      const snapshot = await get(boxesRef);
      if (!snapshot.exists()) {
        setHasMore(false);
        return;
      }
      const newBoxes = Object.keys(snapshot.val() || {});
      if (newBoxes.length === 0) {
        setHasMore(false);
        return;
      }
      setBoxes(prev => [...prev, ...newBoxes]);
      setLastKey(newBoxes[newBoxes.length - 1]);
      setHasMore(newBoxes.length === PAGE_SIZE);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBoxes();
  }, [loadBoxes]);

  const value = {
    boxes,
    boxMeta,
    loading,
    loadMore: () => loadBoxes(lastKey),
    hasMore,
  };

  return (
    <WritingContext.Provider value={value}>
      {children}
    </WritingContext.Provider>
  );
}

export const useWriting = () => {
  const context = useContext(WritingContext);
  if (context === undefined) {
    throw new Error('useWriting must be used within a WritingProvider');
  }
  return context;
};
