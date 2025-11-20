import React from 'react';
import { EditorContent } from '@tiptap/react';

const Editor = ({ editor, className }) => {
  if (!editor) {
    return <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">Loading editor...</div>;
  }

  return (
    <EditorContent 
      editor={editor} 
      className={className || "min-h-[200px] border dark:border-gray-700 rounded-md"}
    />
  );
};

export default Editor;
