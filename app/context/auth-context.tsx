import { Category, Order, Product, User, initialCategories, initialOrders, initialProducts } from '@/app/data/mock-data';
import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { Alert } from 'react-native';

type AuthContextType = {
  user: User | null;
  users: User[];
  categories: Category[];
  products: Product[];
  orders: Order[];

  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;

  addProduct: (product: Omit<Product, 'id'>) => void;
  editProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  addCategory: (category: Omit<Category, 'id'>) => void;
  editCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  addOrder: (order: Omit<Order, 'id'>) => void;
  editOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const builtInUsers: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@gmail.com', password: 'admin' },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(builtInUsers);

  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const login = (email: string, password: string) => {
    const matched = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!matched) {
      Alert.alert('लगइन असफल', 'अवैध इमेल वा पासवर्ड');
      return false;
    }
    setUser(matched);
    return true;
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
    const newUser: User = {
      id: `u${Date.now()}`,
      name,
      email,
      password,
    };
    setUsers((prevUsers) => [...prevUsers, newUser]);
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  // Products CRUD
  const addProduct = (product: Omit<Product, 'id'>) => {
    setProducts((prev) => [...prev, { ...product, id: `p${Date.now()}` }]);
  };
  const editProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };
  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Categories CRUD
  const addCategory = (category: Omit<Category, 'id'>) => {
    setCategories((prev) => [...prev, { ...category, id: `c${Date.now()}` }]);
  };
  const editCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };
  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Orders CRUD
  const addOrder = (order: Omit<Order, 'id'>) => {
    setOrders((prev) => [...prev, { ...order, id: `o${Date.now()}` }]);
  };
  const editOrder = (id: string, updates: Partial<Order>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
  };
  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        categories,
        products,
        orders,
        login,
        register,
        logout,
        addProduct,
        editProduct,
        deleteProduct,
        addCategory,
        editCategory,
        deleteCategory,
        addOrder,
        editOrder,
        deleteOrder,
      }}>
      {children}
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
