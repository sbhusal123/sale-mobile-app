import React, { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import apiClient, { setAuthCallbacks, setAuthToken } from '../api/client';
import { Category, Order, Product, User, initialOrders } from '../data/mock-data';
import { storage } from '../utils/storage';
import LoadingOverlay from '../components/LoadingOverlay';

const USER_STORAGE_KEY = '@user_session';

export type Config = {
  google_api_key?: string;
  whatsapp_phone_number_id?: string;
  whatsapp_access_token?: string;
  whatsapp_verify_token?: string;
  subscription_plan?: string;
  subscription_end_date?: string;
  domain?: string;
  api_key?: string;
  system_prompt?: string;
  model_name?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  authInProgress: boolean;
  users: User[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  config: Config | null;

  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  fetchCategories: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchConfig: () => Promise<void>;
  updateConfig: (updates: Partial<Config>) => Promise<boolean>;

  addProduct: (product: Omit<Product, 'id' | 'category'> & { category: number }) => Promise<boolean>;
  editProduct: (id: number, updates: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;

  addCategory: (category: Omit<Category, 'id'>) => Promise<boolean>;
  editCategory: (id: number, updates: Partial<Category>) => Promise<boolean>;
  deleteCategory: (id: number) => Promise<boolean>;

  fetchOrders: () => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'created_at' | 'user'>) => Promise<boolean>;
  editOrder: (id: number, updates: Partial<Order>) => Promise<boolean>;
  deleteOrder: (id: number) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const builtInUsers: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@gmail.com', password: 'admin' },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInProgress, setAuthInProgress] = useState(false);
  const [users, setUsers] = useState<User[]>(builtInUsers);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [config, setConfig] = useState<Config | null>(null);

  const lastRegisteredToken = useRef<string | null>(null);

  // FCM Logic
  const requestUserPermission = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    }
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
      getFcmToken();
    }
  };

  const getFcmToken = async () => {
    try {
      const fcmToken = await messaging().getToken();
      if (fcmToken && fcmToken !== lastRegisteredToken.current) {
        console.log('FCM Token:', fcmToken);
        
        let deviceId = await storage.getItem('@device_id');
        if (!deviceId) {
          deviceId = `device_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
          await storage.setItem('@device_id', deviceId);
        }

        if (user && user.accessToken) {
          lastRegisteredToken.current = fcmToken;
          await registerDeviceToken(fcmToken, deviceId);
        }
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
  };

  const registerDeviceToken = async (registration_id: string, device_id: string) => {
    try {
      await apiClient.post('notifications/register/', {
        registration_id,
        device_id,
      });
      console.log('Device registered with backend:', registration_id);
    } catch (error: any) {
      if (error.response?.status === 401) {
        lastRegisteredToken.current = null; // Clear to allow retry after refresh
      }
      console.warn('Notification registration failed:', error.message);
    }
  };

  useEffect(() => {
    if (user && user.accessToken) {
      const handleRefresh = async (token: string) => {
        if (token === lastRegisteredToken.current) return;
        
        let deviceId = await storage.getItem('@device_id');
        if (!deviceId) {
          deviceId = `device_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
          await storage.setItem('@device_id', deviceId);
        }
        lastRegisteredToken.current = token;
        registerDeviceToken(token, deviceId);
      };

      requestUserPermission();
      
      const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
        if (remoteMessage.notification) {
          Alert.alert(
            remoteMessage.notification.title || 'नयाँ सूचना',
            remoteMessage.notification.body || 'तपाईंको पसलमा नयाँ अपडेट आएको छ।'
          );
        }
      });

      const unsubscribeAutoRefresh = messaging().onTokenRefresh(token => {
        console.log('FCM Token refreshed:', token);
        handleRefresh(token);
      });

      return () => {
        unsubscribeOnMessage();
        unsubscribeAutoRefresh();
      };
    }
  }, [user]);

  const logout = async () => {
    try {
      setAuthToken(null);
      setUser(null);
      lastRegisteredToken.current = null;
      await storage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Register Auth Callbacks for the interceptor
  useEffect(() => {
    setAuthCallbacks(
      async (accessToken: string, refreshToken: string) => {
        setUser((prevUser) => {
          if (!prevUser) return null;
          const updatedUser = { ...prevUser, accessToken, refreshToken };
          storage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser)).catch(err => {
            console.error('Failed to sync refreshed tokens to storage:', err);
          });
          return updatedUser;
        });
      },
      () => {
        logout();
      }
    );
  }, []);

  // Initialize session from storage
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedUser = await storage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          if (parsedUser.accessToken) {
            setAuthToken(parsedUser.accessToken);
            setUser(parsedUser);
          }
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('categories/');
      setCategories(response.data);
    } catch (error) {
      console.error('Fetch categories error:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('products/');
      setProducts(response.data);
    } catch (error) {
      console.error('Fetch products error:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      // Trying plural with trailing slash based on user's 404 log
      const response = await apiClient.get('orders/');
      setOrders(response.data);
    } catch (error: any) {
      console.error('Fetch orders error:', error);
      if (error.response?.status === 404) {
         console.warn('Orders endpoint not found at orders/. Please verify backend URL.');
      }
    }
  };

  const fetchConfig = async () => {
    try {
      const response = await apiClient.get('config/');
      setConfig(response.data);
    } catch (error) {
      console.error('Fetch config error:', error);
    }
  };

  const updateConfig = async (updates: Partial<Config>) => {
    try {
      const response = await apiClient.patch('config/', updates);
      setConfig(response.data);
      return true;
    } catch (error) {
      console.error('Update config error:', error);
      return false;
    }
  };

  useEffect(() => {
    if (user && user.accessToken) {
      fetchCategories();
      fetchProducts();
      fetchOrders();
      fetchConfig();
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    setAuthInProgress(true);
    try {
      const response = await apiClient.post('auth/login/', {
        username: email,
        password: password,
      });

      const data = response.data;
      const loggedInUser: User = {
        id: String(data.user.id),
        email: data.user.email,
        name: data.user.name,
        accessToken: data.access,
        refreshToken: data.refresh,
      };

      setAuthToken(data.access);
      setUser(loggedInUser);
      await storage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
      return true;
    } catch (error: any) {
      Alert.alert('लगइन असफल', 'अवैध इमेल वा पासवर्ड');
      return false;
    } finally {
      setAuthInProgress(false);
    }
  };

  const register = (name: string, email: string, password: string) => {
    if (!name || !email || !password) {
      Alert.alert('दर्ता असफल', 'सबै क्षेत्रहरू भर्नुहोस्');
      return false;
    }
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      Alert.alert('दर्ता असफल', 'इमेल पहिले नै प्रयोगमा छ');
      return false;
    }
    const newUser: User = { id: `u${Date.now()}`, name, email, password };
    setUsers((prevUsers) => [...prevUsers, newUser]);
    setUser(newUser);
    return true;
  };


  const addProduct = async (product: Omit<Product, 'id' | 'category'> & { category: number }) => {
    try {
      const response = await apiClient.post('products/', product);
      setProducts((prev) => [...prev, response.data]);
      return true;
    } catch (error) {
      console.error('Add product error:', error);
      return false;
    }
  };

  const editProduct = async (id: number, updates: Partial<Product>) => {
    try {
      const response = await apiClient.patch(`products/${id}/`, updates);
      setProducts((prev) => prev.map((p) => (p.id === id ? response.data : p)));
      return true;
    } catch (error) {
      console.error('Edit product error:', error);
      return false;
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await apiClient.delete(`products/${id}/`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (error) {
      console.error('Delete product error:', error);
      return false;
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const response = await apiClient.post('categories/', category);
      setCategories((prev) => [...prev, response.data]);
      return true;
    } catch (error) {
      console.error('Add category error:', error);
      return false;
    }
  };

  const editCategory = async (id: number, updates: Partial<Category>) => {
    try {
      const response = await apiClient.patch(`categories/${id}/`, updates);
      setCategories((prev) => prev.map((c) => (c.id === id ? response.data : c)));
      return true;
    } catch (error) {
      console.error('Edit category error:', error);
      return false;
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      await apiClient.delete(`categories/${id}/`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      return true;
    } catch (error) {
      console.error('Delete category error:', error);
      return false;
    }
  };

  const addOrder = async (order: Omit<Order, 'id' | 'created_at' | 'user'>) => {
    try {
      const response = await apiClient.post('orders/', order);
      setOrders((prev) => [...prev, response.data]);
      return true;
    } catch (error) {
      console.error('Add order error:', error);
      return false;
    }
  };

  const editOrder = async (id: number, updates: Partial<Order>) => {
    try {
      const response = await apiClient.patch(`orders/${id}/`, updates);
      setOrders((prev) => prev.map((o) => (o.id === id ? response.data : o)));
      return true;
    } catch (error) {
      console.error('Edit order error:', error);
      return false;
    }
  };

  const deleteOrder = async (id: number) => {
    try {
      await apiClient.delete(`orders/${id}/`);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      return true;
    } catch (error) {
      console.error('Delete order error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authInProgress,
        users,
        categories,
        products,
        orders,
        login,
        register,
        logout,
        fetchCategories,
        fetchProducts,
        fetchOrders,
        addProduct,
        editProduct,
        deleteProduct,
        addCategory,
        editCategory,
        deleteCategory,
        addOrder,
         editOrder,
        deleteOrder,
        config,
        fetchConfig,
        updateConfig,
      }}>
      {children}
      <LoadingOverlay visible={authInProgress} message="लगइन हुँदैछ..." />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
