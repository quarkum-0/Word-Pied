import React, { useState } from 'react';
import { FiBold, FiItalic, FiUnderline, FiList, FiCode, FiLink, FiType } from 'react-icons/fi';
import styles from './Toolbar.module.css';

const Toolbar = ({ editor }) => {
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

    const ToolbarButton = ({ onClick, isActive, icon: Icon, title }) => (
        <button
            onClick={onClick}
            className={`${styles.toolbarButton} ${isActive ? styles.active : ''}`}
            title={title}
        >
            <Icon size={16} />
        </button>
    );

    return (
        <div className={styles.toolbar}>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                icon={FiBold}
                title="Bold"
            />
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                icon={FiItalic}
                title="Italic"
            />
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
                icon={FiType}
                title="Strikethrough"
            />

            <div className={styles.separator} />

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                icon={() => <span className="font-bold text-xs">H1</span>}
                title="Heading 1"
            />
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                icon={() => <span className="font-bold text-xs">H2</span>}
                title="Heading 2"
            />

            <div className={styles.separator} />

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                icon={FiList}
                title="Bullet List"
            />
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                isActive={editor.isActive('codeBlock')}
                icon={FiCode}
                title="Code Block"
            />

            <div className={styles.separator} />

            <div className="relative">
                <ToolbarButton
                    onClick={() => setShowLinkInput(!showLinkInput)}
                    isActive={editor.isActive('link')}
                    icon={FiLink}
                    title="Link"
                />
                {showLinkInput && (
                    <div className={styles.linkPopup}>
                        <input
                            type="text"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://example.com"
                            className={styles.linkInput}
                            onKeyDown={(e) => e.key === 'Enter' && setLink()}
                            autoFocus
                        />
                        <button
                            onClick={setLink}
                            className={styles.linkAddButton}
                        >
                            Add
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Toolbar;
