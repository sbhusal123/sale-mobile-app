export type Category = {
  id: string;
  title: string;
  description: string;
};

export type Product = {
  id: string;
  title: string;
  categoryId: string;
  unitPrice: number;
  stockQty: number;
  images: string[];
};

export type Order = {
  id: string;
  productId: string;
  qty: number;
  totalPrice: number;
  address: string;
  contact: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export const initialCategories: Category[] = [
  { id: 'c1', title: 'Electronics', description: 'Phones, laptops, and gadgets' },
  { id: 'c2', title: 'Apparel', description: 'Clothing, shoes, and accessories' },
  { id: 'c3', title: 'Home', description: 'Furniture and home essentials' },
];

export const initialProducts: Product[] = [
  {
    id: 'p1',
    title: 'Smartphone X200',
    categoryId: 'c1',
    unitPrice: 649,
    stockQty: 14,
    images: ['https://via.placeholder.com/240x170.png?text=Smartphone'],
  },
  {
    id: 'p2',
    title: 'Running Sneakers',
    categoryId: 'c2',
    unitPrice: 89,
    stockQty: 36,
    images: ['https://via.placeholder.com/240x170.png?text=Sneakers'],
  },
  {
    id: 'p3',
    title: 'Modular Desk',
    categoryId: 'c3',
    unitPrice: 299,
    stockQty: 7,
    images: ['https://via.placeholder.com/240x170.png?text=Desk'],
  },
];

export const initialOrders: Order[] = [
  { id: 'o1', productId: 'p1', qty: 2, totalPrice: 1298, address: '123 Maple St', contact: '555-2486' },
  { id: 'o2', productId: 'p2', qty: 1, totalPrice: 89, address: '789 Oak Ave', contact: '555-7143' },
  { id: 'o3', productId: 'p3', qty: 3, totalPrice: 897, address: '456 Pine Rd', contact: '555-3162' },
];
