import React from 'react';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('./Editor'), {
  ssr: false,
  loading: () => <div className="h-48 animate-pulse bg-gray-100 rounded-lg"/>
});

export default Editor;
