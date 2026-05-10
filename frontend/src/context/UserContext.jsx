import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { apiUrl } from '../services/api';

const UserContext = createContext(null);

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function UserProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState({
    profile: false,
    documents: false,
    notifications: false,
  });
  const seenPopupIdsRef = useRef(new Set());

  const userId = localStorage.getItem('user_id');

  const setLoadingFlag = (key, value) => {
    setLoading((current) => ({ ...current, [key]: value }));
  };

  const fetchProfile = useCallback(async () => {
    const currentUserId = localStorage.getItem('user_id');
    if (!currentUserId) {
      setProfile(null);
      return null;
    }

    setLoadingFlag('profile', true);
    try {
      const res = await fetch(apiUrl(`/user/${currentUserId}`));
      const data = await res.json();
      if (!data.error) {
        setProfile(data);
        return data;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingFlag('profile', false);
    }
    return null;
  }, []);

  const fetchDocuments = useCallback(async () => {
    const currentUserId = localStorage.getItem('user_id');
    if (!currentUserId) {
      setDocuments([]);
      return [];
    }

    setLoadingFlag('documents', true);
    try {
      const res = await fetch(apiUrl(`/document/list/${currentUserId}`));
      const data = await res.json();
      if (data.status === 'success') {
        const nextDocuments = Array.isArray(data.data) ? data.data : [];
        setDocuments(nextDocuments);
        return nextDocuments;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingFlag('documents', false);
    }
    return [];
  }, []);

  const fetchNotifications = useCallback(async () => {
    const currentUserId = localStorage.getItem('user_id');
    if (!currentUserId) {
      setNotifications([]);
      return [];
    }

    setLoadingFlag('notifications', true);
    try {
      const res = await fetch(apiUrl(`/notification/list/${currentUserId}`));
      const data = await res.json();
      if (data.status === 'success') {
        const nextNotifications = Array.isArray(data.data) ? data.data : [];
        setNotifications(nextNotifications);
        return nextNotifications;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingFlag('notifications', false);
    }
    return [];
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchProfile(), fetchDocuments(), fetchNotifications()]);
  }, [fetchDocuments, fetchNotifications, fetchProfile]);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setDocuments([]);
      setNotifications([]);
      setToasts([]);
      seenPopupIdsRef.current = new Set();
      return;
    }

    refreshAll();
  }, [userId, refreshAll]);

  const readStorageKey = userId ? `notification-read-${userId}` : null;
  const readIds = useMemo(() => (
    readStorageKey ? new Set(readJson(readStorageKey, [])) : new Set()
  ), [readStorageKey, notifications]);

  useEffect(() => {
    if (!userId || notifications.length === 0) {
      return;
    }

    const unseen = notifications.filter(
      (item) => !readIds.has(item.id) && !seenPopupIdsRef.current.has(item.id)
    );

    if (unseen.length > 0) {
      unseen.slice(0, 2).forEach((item) => {
        seenPopupIdsRef.current.add(item.id);
        setToasts((current) => {
          if (current.some((toast) => toast.id === item.id)) {
            return current;
          }
          return [...current, item];
        });
      });
    }
  }, [notifications, readIds, userId]);

  useEffect(() => {
    if (toasts.length === 0) {
      return undefined;
    }

    const timers = toasts.map((toast) => (
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, 4500)
    ));

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [toasts]);

  const markNotificationRead = useCallback((notificationId) => {
    const currentUserId = localStorage.getItem('user_id');
    if (!currentUserId) return;

    const key = `notification-read-${currentUserId}`;
    const existing = new Set(readJson(key, []));
    existing.add(notificationId);
    localStorage.setItem(key, JSON.stringify([...existing]));
    setToasts((current) => current.filter((item) => item.id !== notificationId));
    setNotifications((current) => [...current]);
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    const currentUserId = localStorage.getItem('user_id');
    if (!currentUserId) return;

    const key = `notification-read-${currentUserId}`;
    localStorage.setItem(key, JSON.stringify(notifications.map((item) => item.id)));
    setToasts([]);
    setNotifications((current) => [...current]);
  }, [notifications]);

  const unreadCount = notifications.filter((item) => !readIds.has(item.id)).length;

  const uploadDocument = useCallback(async ({ documentName, documentType, file }) => {
    const currentUserId = localStorage.getItem('user_id');
    if (!currentUserId) {
      throw new Error('You need to sign in before uploading documents.');
    }

    const formData = new FormData();
    formData.append('user_id', currentUserId);
    formData.append('document_name', documentName);
    formData.append('document_type', documentType);
    formData.append('file', file);

    const res = await fetch(apiUrl('/document/upload'), {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Document upload failed.');
    }

    await Promise.all([fetchDocuments(), fetchNotifications(), fetchProfile()]);
    return data.data;
  }, [fetchDocuments, fetchNotifications, fetchProfile]);

  const verifyDocuments = useCallback(async () => {
    const currentUserId = localStorage.getItem('user_id');
    if (!currentUserId) {
      throw new Error('You need to sign in before verifying documents.');
    }

    const res = await fetch(apiUrl(`/document/verify/${currentUserId}`), {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Document verification failed.');
    }

    await Promise.all([fetchDocuments(), fetchNotifications(), fetchProfile()]);
    return data.data;
  }, [fetchDocuments, fetchNotifications, fetchProfile]);

  const value = {
    profile,
    documents,
    notifications,
    unreadCount,
    loading,
    toasts,
    fetchProfile,
    fetchDocuments,
    fetchNotifications,
    refreshAll,
    uploadDocument,
    verifyDocuments,
    markNotificationRead,
    markAllNotificationsRead,
    dismissToast: (notificationId) => setToasts((current) => current.filter((item) => item.id !== notificationId)),
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
