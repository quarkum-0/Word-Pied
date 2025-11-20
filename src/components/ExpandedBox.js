import React, { useEffect, useState } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../firebase';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { FiLink, FiX, FiCheck, FiBold, FiItalic, FiList, FiCode } from 'react-icons/fi';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const EditorContent = dynamic(
  () => import('@tiptap/react').then(mod => mod.EditorContent),
  { ssr: false }
);

const ExpandedMenuBar = ({ editor }) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  if (!editor) return null;

  const setLink = () => {
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    let safeUrl = linkUrl;
    if (!/^https?:\/\//.test(linkUrl)) {
      safeUrl = `https://${linkUrl}`;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: safeUrl }).run();
    setLinkUrl('');
    setShowLinkInput(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 mb-4 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive('bold') ? 'bg-gray-300 dark:bg-gray-700' : ''}`}
        title="Bold"
      >
        <FiBold size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive('italic') ? 'bg-gray-300 dark:bg-gray-700' : ''}`}
        title="Italic"
      >
        <FiItalic size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive('bulletList') ? 'bg-gray-300 dark:bg-gray-700' : ''}`}
        title="Bullet List"
      >
        <FiList size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive('codeBlock') ? 'bg-gray-300 dark:bg-gray-700' : ''}`}
        title="Code Block"
      >
        <FiCode size={18} />
      </button>
      <div className="relative ml-auto">
        <button
          onClick={() => setShowLinkInput(!showLinkInput)}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive('link') ? 'bg-gray-300 dark:bg-gray-700' : ''}`}
          title="Add Link"
        >
          <FiLink size={18} />
        </button>
        {showLinkInput && (
          <div className="absolute right-0 mt-1 p-3 bg-white dark:bg-gray-800 rounded shadow-lg z-10 flex">
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://"
              className="px-3 py-2 text-sm w-64 border dark:border-gray-600 rounded dark:bg-gray-700"
              onKeyDown={(e) => e.key === 'Enter' && setLink()}
            />
            <button
              onClick={setLink}
              className="ml-2 px-3 py-2 bg-primary-500 text-white rounded text-sm"
            >
              Set
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ExpandedBox = ({ boxNumber, onClose }) => {
  const [content, setContent] = useState('');
  const [lastEditor, setLastEditor] = useState(null);
  const [lastEditTime, setLastEditTime] = useState(null);
  const [username, setUsername] = useState('Anonymous');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUsername(localStorage.getItem('username') || 'Anonymous');
    }
  }, []);

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
    content: content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  useEffect(() => {
    const boxDbRef = ref(database, `boxes/${boxNumber}`);
    const metaDbRef = ref(database, `boxMeta/${boxNumber}`);

    const updateContent = (snapshot) => {
      const data = snapshot.val();
      if (data !== null) {
        const decodedContent = safeDecodeContent(data.content || data);
        setContent(decodedContent);
        if (editor) {
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
    };
    set(contentRef, encodedContent);
    set(metaRef, {
      lastEditor: metadata.lastEditor,
      lastEditTime: metadata.lastEditTime,
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem(`boxText_${boxNumber}`, JSON.stringify({
        content: encodedContent,
        lastEditor: metadata.lastEditor,
        lastEditTime: metadata.lastEditTime,
      }));
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] border border-gray-200 dark:border-gray-700"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
            Pied {boxNumber + 1}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={saveContent}
              className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 text-blue-500 dark:text-blue-400 transition-colors"
              title="Save changes"
            >
              <FiCheck size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              title="Close"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>
        <div className="flex-grow overflow-auto p-6">
          <ExpandedMenuBar editor={editor} />
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 min-h-[400px]">
            <EditorContent
              editor={editor}
              className="p-4 min-h-[400px] focus:outline-none"
              immediatelyRender={false}
            />
          </div>
        </div>
        {lastEditor && (
          <div className="text-sm text-gray-400 dark:text-gray-500 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
            Last edited by: {lastEditor} {lastEditTime && (
              <span title={new Date(lastEditTime).toLocaleString()}>
                • {formatTimeAgo(lastEditTime)}
              </span>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ExpandedBox;

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
