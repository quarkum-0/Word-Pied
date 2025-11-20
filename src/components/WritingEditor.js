import React, { useEffect, useState } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../firebase';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { FiEdit, FiSave, FiMaximize2 } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import Toolbar from './Toolbar';
import styles from './WritingEditor.module.css';

const WritingEditor = ({ boxNumber }) => {
  const { currentTheme } = useTheme();
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [lastEditor, setLastEditor] = useState('Anonymous');
  const [lastEditTime, setLastEditTime] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: true,
        linkOnPaste: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'text-primary-500 hover:text-primary-700 underline',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none p-3 min-h-[150px]',
      },
    },
    immediatelyRender: false,
  });

  // Load content from Firebase for this specific box
  useEffect(() => {
    if (boxNumber === undefined) return;

    const boxDbRef = ref(database, `boxes/${boxNumber}`);
    const metaDbRef = ref(database, `boxMeta/${boxNumber}`);

    const updateContent = (snapshot) => {
      const data = snapshot.val();
      if (data !== null) {
        const decodedContent = safeDecodeContent(data.content || data);
        setContent(decodedContent);
        if (editor && !editor.isFocused) {
          editor.commands.setContent(decodedContent);
        }
      }
    };

    const updateMeta = (snapshot) => {
      const data = snapshot.val();
      if (data !== null) {
        setLastEditor(data.lastEditor || 'Anonymous');
        setLastEditTime(data.lastEditTime || null);
      }
    };

    // Try local storage first for immediate render
    const localText = typeof window !== 'undefined' ? localStorage.getItem(`boxText_${boxNumber}`) : null;
    if (localText) {
      try {
        const parsed = JSON.parse(localText);
        const decoded = safeDecodeContent(parsed.content || localText);
        setContent(decoded);
        setLastEditor(parsed.lastEditor || 'Anonymous');
        setLastEditTime(parsed.lastEditTime || null);
        if (editor) editor.commands.setContent(decoded);
      } catch (e) {
        setContent(safeDecodeContent(localText));
        if (editor) editor.commands.setContent(safeDecodeContent(localText));
      }
    }

    const contentUnsubscribe = onValue(boxDbRef, updateContent);
    const metaUnsubscribe = onValue(metaDbRef, updateMeta);

    return () => {
      contentUnsubscribe();
      metaUnsubscribe();
    };
  }, [boxNumber, editor]);

  const saveContent = () => {
    if (!editor) return;
    const newContent = editor.getHTML();
    const username = typeof window !== 'undefined' ? localStorage.getItem('username') || 'Anonymous' : 'Anonymous';
    const encodedContent = safeEncodeContent(newContent);

    const contentRef = ref(database, `boxes/${boxNumber}`);
    const metaRef = ref(database, `boxMeta/${boxNumber}`);

    const metadata = {
      lastEditor: username,
      lastEditTime: new Date().toISOString(),
      content: encodedContent
    };

    set(contentRef, encodedContent);
    set(metaRef, {
      lastEditor: metadata.lastEditor,
      lastEditTime: metadata.lastEditTime
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(`boxText_${boxNumber}`, JSON.stringify(metadata));
    }
    setIsEditing(false);
  };

  return (
    <div className={styles.editorWrapper}>
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 rounded-t-lg bg-opacity-50 bg-gray-50 dark:bg-gray-800/50">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Pied {boxNumber + 1}</h3>
        <div className="flex gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              title="Edit"
            >
              <FiEdit size={14} />
            </button>
          ) : (
            <button
              onClick={saveContent}
              className="p-1.5 rounded hover:bg-primary-100 dark:hover:bg-primary-900 text-primary-600 dark:text-primary-400 transition-colors"
              title="Save"
            >
              <FiSave size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-grow overflow-hidden relative">
        {isEditing ? (
          <div className="flex flex-col h-full">
            <div className="border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <Toolbar editor={editor} />
            </div>
            <EditorContent editor={editor} className={`${styles.editorContent} p-3 overflow-y-auto`} />
          </div>
        ) : (
          <div
            className={`${styles.contentPreview} p-4 overflow-y-auto h-full prose dark:prose-invert max-w-none`}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>

      {lastEditor && (
        <div className="text-xs text-gray-500 dark:text-gray-400 p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 rounded-b-lg flex flex-col gap-1 mt-auto">
          <span className="font-medium block">By: {lastEditor}</span>
          {lastEditTime && (
            <span className="text-[10px] opacity-75 block" title={new Date(lastEditTime).toLocaleString()}>
              {formatTimeAgo(lastEditTime)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Helper functions
const safeEncodeContent = (content) => {
  try {
    return btoa(unescape(encodeURIComponent(content)));
  } catch (e) {
    return content;
  }
};

const safeDecodeContent = (encodedContent) => {
  try {
    return decodeURIComponent(escape(atob(encodedContent)));
  } catch (e) {
    return encodedContent;
  }
};

const formatTimeAgo = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export default WritingEditor;
