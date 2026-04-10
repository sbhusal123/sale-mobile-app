export type Category = {
  id: number;
  title: string;
  description: string;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string | null;
  search_tags: string;
  attributes: any;
  instock: boolean;
  quantity: number;
  category: {
    title: string;
    id: number;
  };
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export type OrderItem = {
  product: number;
  quantity: number;
  price: string;
};

export type Order = {
  id: number;
  items: OrderItem[];
  total_price: string;
  created_at: string;
  location: string;
  phone: string;
  special_instructions: string;
  order_status: string;
  user: number;
  chat_user?: Customer | null;
  chat_session: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  accessToken?: string;
  refreshToken?: string;
};

export const initialCategories: Category[] = [];
export const initialProducts: Product[] = [];
export const initialOrders: Order[] = [];
