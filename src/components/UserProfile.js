import React, { useState, useEffect } from 'react';
import { FiUser, FiSave, FiX } from 'react-icons/fi';
import styles from './UserProfile.module.css';

const UserProfile = () => {
  const [username, setUsername] = useState('Anonymous');
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUsername = localStorage.getItem('username');
      if (savedUsername) {
        setUsername(savedUsername);
      }
    }
  }, []);

  const handleSaveUsername = () => {
    const newUsername = username.trim() || 'Anonymous';
    if (typeof window !== 'undefined') {
      localStorage.setItem('username', newUsername);
    }
    setUsername(newUsername);
    setShowPopup(false);
  };

  return (
    <div className={styles.profileWrapper}>
      <button
        onClick={() => setShowPopup(!showPopup)}
        className={styles.profileButton}
        title="User Profile"
      >
        <FiUser size={20} />
        <span>{username}</span>
      </button>

      {showPopup && (
        <div className={styles.popup}>
          <div className={styles.popupHeader}>
            <h3 className={styles.popupTitle}>Display Name</h3>
            <button onClick={() => setShowPopup(false)} className={styles.closeButton}>
              <FiX size={20} />
            </button>
          </div>

          <div className={styles.inputGroup}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter name"
              className={styles.input}
              maxLength={20}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveUsername()}
            />
            <button
              onClick={handleSaveUsername}
              className={styles.saveButton}
              title="Save"
            >
              <FiSave size={18} />
            </button>
          </div>

          <p className={styles.helperText}>
            This name will appear on your edits. It is stored locally in your browser.
          </p>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
