
export type UserRole = 'FARMER' | 'BUYER' | 'GUEST';

export type Language = 'en' | 'hi' | 'pa';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  language: Language;
  phone?: string;
  location?: string;
  landSize?: string;
  primaryCrops?: string[];
  avatar?: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'CROP' | 'INPUT';
  price: number;
  unit: string;
  quantity: number;
  sellerId: string;
  expiryDate?: string;
  image: string;
}

export interface InventoryItem extends Product {
  addedDate: string;
  lossRecord?: number;
}

export interface Recommendation {
  title: string;
  description: string;
  type: 'LOAN' | 'SCHEME' | 'LAW';
  link: string;
}

export interface CartItem extends Product {
  cartQuantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'PENDING' | 'COMPLETED' | 'SHIPPED';
  type: 'PURCHASE' | 'SALE';
}

export interface WeatherInfo {
  temp: number;
  condition: string;
  forecast: string;
}
