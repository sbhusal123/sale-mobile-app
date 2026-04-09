import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { storage } from '../utils/storage';
import { useAuth } from './auth-context';

const NOTIFICATIONS_STORAGE_KEY = '@notifications_list';

export type Notification = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'time' | 'read'>) => void;
  clearAll: () => void;
  markAsRead: (id: string) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { syncFcmToken } = useAuth();
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    loadNotifications();
    setupFCM();
  }, []);

  // Effect to sync token when both token and auth sync function (user) are ready
  useEffect(() => {
    if (fcmToken) {
      syncFcmToken(fcmToken);
    }
  }, [fcmToken, syncFcmToken]);

  const setupFCM = async () => {
    const hasPermission = await requestUserPermission();
    if (hasPermission) {
      // Get FCM token
      try {
        const token = await messaging().getToken();
        console.log('🔥 FCM Token:', token);
        await storage.setItem('@fcm_token', token);
        setFcmToken(token);
      } catch (error) {
        console.log('Failed to get FCM token', error);
      }

      // Listen to foreground messages
      const unsubscribe = messaging().onMessage(async remoteMessage => {
        console.log('📩 Foreground Message:', remoteMessage);
        if (remoteMessage.notification) {
          addNotification({
            title: remoteMessage.notification.title || 'New Notification',
            body: remoteMessage.notification.body || '',
          });
        }
      });

      // Handle token refreshes
      const tokenUnsubscribe = messaging().onTokenRefresh(token => {
        console.log('🔄 FCM Token Refreshed:', token);
        storage.setItem('@fcm_token', token);
        setFcmToken(token);
      });

      return () => {
        unsubscribe();
        tokenUnsubscribe();
      };
    }
  };

  const loadNotifications = async () => {
    try {
      const stored = await storage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
  };

  const saveNotifications = async (list: Notification[]) => {
    try {
      await storage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save notifications', e);
    }
  };

  const requestUserPermission = async () => {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      return enabled;
    } else if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const addNotification = (notif: Omit<Notification, 'id' | 'time' | 'read'>) => {
    const newNotif: Notification = {
      ...notif,
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setNotifications(prev => {
      const newList = [newNotif, ...prev];
      saveNotifications(newList);
      return newList;
    });
  };

  const clearAll = () => {
    setNotifications([]);
    saveNotifications([]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const newList = prev.map(n => n.id === id ? { ...n, read: true } : n);
      saveNotifications(newList);
      return newList;
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        clearAll,
        markAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
