import { useEffect, useState, useRef } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../firebase';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { FiLink, FiEdit2, FiCheck, FiBold, FiItalic, FiList, FiMaximize2, FiCode } from 'react-icons/fi';
import { motion } from 'framer-motion';
import ExpandedBox from './ExpandedBox';
import styles from './WritingBox.module.css';
import { useTheme } from '../context/ThemeContext';

const MenuBar = ({ editor }) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  if (!editor) {
    return null;
  }

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
    <div className="flex flex-wrap items-center gap-1 p-2 mb-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${editor.isActive('bold') ? 'bg-gray-100 dark:bg-gray-700 text-blue-500' : 'text-gray-600 dark:text-gray-400'}`}
        title="Bold"
      >
        <FiBold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${editor.isActive('italic') ? 'bg-gray-100 dark:bg-gray-700 text-blue-500' : 'text-gray-600 dark:text-gray-400'}`}
        title="Italic"
      >
        <FiItalic size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${editor.isActive('bulletList') ? 'bg-gray-100 dark:bg-gray-700 text-blue-500' : 'text-gray-600 dark:text-gray-400'}`}
        title="Bullet List"
      >
        <FiList size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${editor.isActive('codeBlock') ? 'bg-gray-100 dark:bg-gray-700 text-blue-500' : 'text-gray-600 dark:text-gray-400'}`}
        title="Code Block"
      >
        <FiCode size={16} />
      </button>
      <div className="relative ml-auto">
        <button
          onClick={() => setShowLinkInput(!showLinkInput)}
          className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${editor.isActive('link') ? 'bg-gray-100 dark:bg-gray-700 text-blue-500' : 'text-gray-600 dark:text-gray-400'}`}
          title="Add Link"
        >
          <FiLink size={16} />
        </button>
        {showLinkInput && (
          <div className="absolute right-0 mt-1 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 flex">
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://"
              className="px-2 py-1 text-sm w-40 border border-gray-200 dark:border-gray-600 rounded-md dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && setLink()}
            />
            <button
              onClick={setLink}
              className="ml-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-colors"
            >
              Set
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const WritingBox = ({ boxNumber, onExpand }) => {
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [lastEditor, setLastEditor] = useState(null);
  const [lastEditTime, setLastEditTime] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const boxRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: true,
        linkOnPaste: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'text-blue-500 hover:text-blue-700 underline',
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none text-sm',
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

    const localText = localStorage.getItem(`boxText_${boxNumber}`);
    if (localText) {
      try {
        const parsed = JSON.parse(localText);
        const decoded = safeDecodeContent(parsed.content || localText);
        setContent(decoded);
        setLastEditor(parsed.lastEditor || 'Anonymous');
        setLastEditTime(parsed.lastEditTime || null);
        if (editor) {
          editor.commands.setContent(decoded);
        }
      } catch (e) {
        const decoded = safeDecodeContent(localText);
        setContent(decoded);
        if (editor) {
          editor.commands.setContent(decoded);
        }
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

  const handleExpand = () => {
    setIsExpanded(true);
    if (onExpand) {
      onExpand(boxNumber);
    }
  };

  return (
    <>
      <motion.div
        className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-[340px] border border-gray-200 dark:border-gray-700"
        whileHover={{ y: -4 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        ref={boxRef}
      >
        {/* Header Section */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 tracking-tight">
            Pied {boxNumber + 1}
          </h3>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform translate-x-2 group-hover:translate-x-0">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  aria-label="Edit content"
                  title="Edit content"
                >
                  <FiEdit2 size={18} />
                </button>
                <button
                  onClick={handleExpand}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  aria-label="Expand box"
                  title="Expand box"
                >
                  <FiMaximize2 size={18} />
                </button>
              </>
            ) : (
              <button
                onClick={saveContent}
                className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors"
                aria-label="Save changes"
                title="Save changes"
              >
                <FiCheck size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 pb-6 flex-grow overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 h-full overflow-hidden relative group/content transition-colors hover:border-gray-200 dark:hover:border-gray-700">
            <div className="relative h-full overflow-hidden">
              {isEditing ? (
                <div className={`${styles.editorContainer} scrollStyle p-4 h-full overflow-y-auto`}>
                  <MenuBar editor={editor} />
                  <EditorContent
                    editor={editor}
                    className={styles.writingBox}
                  />
                </div>
              ) : (
                <div
                  className={`${styles.contentPreview} scrollStyle ${styles.writingBox} p-5 text-gray-600 dark:text-gray-300 text-sm leading-relaxed`}
                  dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-400 italic">Empty box...</p>' }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer Section */}
        {lastEditor && (
          <div className="px-6 pb-4">
            <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
              Edited by {lastEditor}
              {lastEditTime && (
                <span className="text-gray-300 dark:text-gray-600">
                  • {formatTimeAgo(lastEditTime)}
                </span>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {isExpanded && (
        <ExpandedBox
          boxNumber={boxNumber}
          onClose={() => setIsExpanded(false)}
        />
      )}
    </>
  );
};

export default WritingBox;

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
