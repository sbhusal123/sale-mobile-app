import React, { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import apiClient, { setAuthCallbacks, setAuthToken } from '../api/client';
import LoadingOverlay from '../components/LoadingOverlay';
import { Category, Order, Product, User, initialOrders } from '../data/mock-data';
import { storage } from '../utils/storage';

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
  chatUsers: any[];
  config: Config | null;

  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  fetchCategories: (search?: string) => Promise<void>;
  fetchProducts: (filters?: { search?: string; category?: number | null }) => Promise<void>;
  fetchConfig: () => Promise<void>;
  fetchChatUsers: () => Promise<void>;
  updateConfig: (updates: Partial<Config>) => Promise<boolean>;
  syncFcmToken: (tokenOverride?: string) => Promise<void>;

  addProduct: (product: Omit<Product, 'id' | 'category'> & { category: number }) => Promise<boolean>;
  editProduct: (id: number, updates: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;

  addCategory: (category: Omit<Category, 'id'>) => Promise<Category | null>;
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
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInProgress, setAuthInProgress] = useState(false);
  const [users, setUsers] = useState<User[]>(builtInUsers);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [chatUsers, setChatUsers] = useState<any[]>([]);
  const [config, setConfig] = useState<Config | null>(null);

  const logout = useCallback(async () => {
    try {
      setAuthToken(null);
      setUser(null);
      await storage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

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
  }, [logout]);

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
    loadSession().catch(err => {
      console.error('loadSession outer error:', err);
      setLoading(false);
    });
  }, []);

  const fetchCategories = useCallback(async (search?: string) => {
    try {
      let url = 'categories/';
      if (search) {
        url += `?search=${encodeURIComponent(search)}`;
      }
      const response = await apiClient.get(url);
      setCategories(response.data);
    } catch (error) {
      console.error('Fetch categories error:', error);
    }
  }, []);

  const fetchProducts = useCallback(async (filters?: { search?: string; category?: number | null }) => {
    try {
      let url = 'products/';
      const params: string[] = [];

      if (filters?.search) {
        params.push(`search=${encodeURIComponent(filters.search)}`);
      }

      if (filters?.category) {
        params.push(`category=${filters.category}`);
      }

      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await apiClient.get(url);
      setProducts(response.data);
    } catch (error) {
      console.error('Fetch products error:', error);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await apiClient.get('orders/');
      setOrders(response.data);
    } catch (error: any) {
      console.error('Fetch orders error:', error);
    }
  }, []);

  const fetchChatUsers = useCallback(async () => {
    try {
      const response = await apiClient.get('chat-users/');
      setChatUsers(response.data?.results || response.data || []);
    } catch (error: any) {
      console.error('Fetch chat users error:', error);
    }
  }, []);

  const fetchConfig = useCallback(async () => {
    try {
      const response = await apiClient.get('config/');
      setConfig(response.data);
    } catch (error) {
      console.error('Fetch config error:', error);
    }
  }, []);

  const updateConfig = useCallback(async (updates: Partial<Config>) => {
    try {
      const response = await apiClient.patch('config/', updates);
      setConfig(response.data);
      return true;
    } catch (error) {
      console.error('Update config error:', error);
      return false;
    }
  }, []);

  const syncFcmToken = useCallback(async (tokenOverride?: string) => {
    try {
      const token = tokenOverride || await storage.getItem('@fcm_token');
      const deviceId = await DeviceInfo.getUniqueId();

      // Get the latest session to ensure we have a valid accessToken
      const storedSession = await storage.getItem(USER_STORAGE_KEY);
      const session = storedSession ? JSON.parse(storedSession) : null;
      const accessToken = session?.accessToken;


      console.log("session::", storedSession)
      console.log("accessToken::", accessToken)

      if (accessToken) {
        console.log('🚀 Sending FCM registration to backend...', { deviceId });
        const response = await apiClient.post('notifications/register/', {
          registration_id: token,
          device_id: deviceId,
        }, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          }
        });
        console.log('✅ FCM Token registered with backend:', response.status);
      } else {
        console.log('⚠️ Skipping FCM sync: missing token or auth', { hasToken: !!token, hasAuth: !!accessToken });
      }
    } catch (error: any) {
      console.log('❌ Failed to register FCM token', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
  }, []); // Dependencies empty because we read from storage

  useEffect(() => {
    if (user && user.accessToken) {
      fetchCategories();
      fetchProducts();
      fetchOrders();
      fetchChatUsers();
      fetchConfig();
      syncFcmToken();
    }
  }, [user, fetchCategories, fetchProducts, fetchOrders, fetchConfig, syncFcmToken]);

  const login = useCallback(async (email: string, password: string) => {
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
      Alert.alert(t('auth.login_failed'), t('auth.invalid_credentials'));
      return false;
    } finally {
      setAuthInProgress(false);
    }
  }, [t]);

  const register = useCallback((name: string, email: string, password: string) => {
    if (!name || !email || !password) {
      Alert.alert(t('auth.register_failed'), t('auth.fill_all_fields'));
      return false;
    }
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      Alert.alert(t('auth.register_failed'), t('auth.email_exists'));
      return false;
    }
    const newUser: User = { id: `u${Date.now()}`, name, email, password };
    setUsers((prevUsers) => [...prevUsers, newUser]);
    setUser(newUser);
    return true;
  }, [t, users]);

  const addProduct = useCallback(async (product: Omit<Product, 'id' | 'category'> & { category: number }) => {
    try {
      const formData = new FormData();
      Object.keys(product).forEach((key) => {
        const value = (product as any)[key];
        if (key === 'image' && value && (value.startsWith('file://') || value.startsWith('content://'))) {
          formData.append('image', {
            uri: value,
            type: 'image/jpeg',
            name: 'product_image.jpg',
          } as any);
        } else if (value !== null && value !== undefined) {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
        }
      });

      const response = await apiClient.post('products/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProducts((prev) => [...prev, response.data]);
      return true;
    } catch (error) {
      console.error('Add product error:', error);
      return false;
    }
  }, []);

  const editProduct = useCallback(async (id: number, updates: Partial<Product>) => {
    try {
      const hasNewImage = !!(updates.image && (updates.image.startsWith('file://') || updates.image.startsWith('content://')));
      let response;

      if (hasNewImage) {
        const formData = new FormData();
        Object.keys(updates).forEach((key) => {
          const value = (updates as any)[key];
          if (key === 'image' && value && (value.startsWith('file://') || value.startsWith('content://'))) {
            formData.append('image', {
              uri: value,
              type: 'image/jpeg',
              name: 'product_image.jpg',
            } as any);
          } else if (key === 'category' && typeof value === 'object' && value !== null) {
            formData.append(key, value.id);
          } else if (value !== null && value !== undefined) {
            formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
          }
        });

        response = await apiClient.patch(`products/${id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        const jsonPayload: any = { ...updates };
        if (jsonPayload.image && typeof jsonPayload.image === 'string' && !(jsonPayload.image.startsWith('file://') || jsonPayload.image.startsWith('content://'))) {
          delete jsonPayload.image;
        }
        if (jsonPayload.category && typeof jsonPayload.category === 'object') {
          jsonPayload.category = jsonPayload.category.id;
        }
        response = await apiClient.patch(`products/${id}/`, jsonPayload);
      }

      setProducts((prev) => prev.map((p) => (p.id === id ? response.data : p)));
      return true;
    } catch (error) {
      console.error('Edit product error:', error);
      return false;
    }
  }, []);

  const deleteProduct = useCallback(async (id: number) => {
    try {
      await apiClient.delete(`products/${id}/`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (error) {
      console.error('Delete product error:', error);
      return false;
    }
  }, []);

  const addCategory = useCallback(async (category: Omit<Category, 'id'>) => {
    try {
      const response = await apiClient.post('categories/', category);
      setCategories((prev) => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Add category error:', error);
      return null;
    }
  }, []);

  const editCategory = useCallback(async (id: number, updates: Partial<Category>) => {
    try {
      const response = await apiClient.patch(`categories/${id}/`, updates);
      setCategories((prev) => prev.map((c) => (c.id === id ? response.data : c)));
      return true;
    } catch (error) {
      console.error('Edit category error:', error);
      return false;
    }
  }, []);

  const deleteCategory = useCallback(async (id: number) => {
    try {
      await apiClient.delete(`categories/${id}/`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      return true;
    } catch (error) {
      console.error('Delete category error:', error);
      return false;
    }
  }, []);

  const addOrder = useCallback(async (order: Omit<Order, 'id' | 'created_at' | 'user'>) => {
    try {
      const response = await apiClient.post('orders/', order);
      setOrders((prev) => [...prev, response.data]);
      return true;
    } catch (error) {
      console.error('Add order error:', error);
      return false;
    }
  }, []);

  const editOrder = useCallback(async (id: number, updates: Partial<Order>) => {
    try {
      const response = await apiClient.patch(`orders/${id}/`, updates);
      setOrders((prev) => prev.map((o) => (o.id === id ? response.data : o)));
      return true;
    } catch (error) {
      console.error('Edit order error:', error);
      return false;
    }
  }, []);

  const deleteOrder = useCallback(async (id: number) => {
    try {
      await apiClient.delete(`orders/${id}/`);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      return true;
    } catch (error) {
      console.error('Delete order error:', error);
      return false;
    }
  }, []);

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
        fetchChatUsers,
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
        chatUsers,
        fetchConfig,
        updateConfig,
        syncFcmToken,
      }}>
      {children}
      <LoadingOverlay visible={authInProgress} message={t('auth.logging_in')} />
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
