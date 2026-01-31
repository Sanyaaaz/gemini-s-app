
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Language, UserRole, Product, InventoryItem, CartItem, Order, WeatherInfo } from '../types';

interface AppContextType {
  user: User | null;
  language: Language;
  setLanguage: (lang: Language) => void;
  login: (role: UserRole, phone?: string) => void;
  updateProfile: (updates: Partial<User>) => void;
  logout: () => void;
  inventory: InventoryItem[];
  addToInventory: (item: InventoryItem) => void;
  marketplace: Product[];
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  orders: Order[];
  placeOrder: () => void;
  isOnline: boolean;
  weather: WeatherInfo;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const weather: WeatherInfo = {
    temp: 32,
    condition: 'Sunny',
    forecast: 'Rain expected in 2 days'
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('km_user');
    const savedInv = localStorage.getItem('km_inventory');
    const savedOrders = localStorage.getItem('km_orders');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedInv) setInventory(JSON.parse(savedInv));
    if (savedOrders) setOrders(JSON.parse(savedOrders));

    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  const login = (role: UserRole, phone?: string) => {
    const newUser: User = { 
      id: role === 'FARMER' ? 'f1' : 'b1', 
      name: role === 'FARMER' ? 'Arjun Singh' : 'Rahul Kumar', 
      role, 
      language,
      phone: phone || '+91 98765 43210',
      location: 'Punjab, India',
      landSize: role === 'FARMER' ? '5.2' : undefined,
      primaryCrops: role === 'FARMER' ? ['Wheat', 'Potato'] : undefined
    };
    setUser(newUser);
    localStorage.setItem('km_user', JSON.stringify(newUser));
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('km_user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('km_user');
  };

  const addToInventory = (item: InventoryItem) => {
    const newInv = [...inventory, item];
    setInventory(newInv);
    localStorage.setItem('km_inventory', JSON.stringify(newInv));
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, cartQuantity: p.cartQuantity + 1 } : p);
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(p => p.id !== productId));
  };

  const clearCart = () => setCart([]);

  const placeOrder = () => {
    if (cart.length === 0) return;
    const total = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);
    const newOrder: Order = {
      id: 'ORD-' + Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString(),
      items: [...cart],
      total,
      status: 'PENDING',
      type: user?.role === 'FARMER' ? 'PURCHASE' : 'SALE'
    };
    const newOrders = [newOrder, ...orders];
    setOrders(newOrders);
    localStorage.setItem('km_orders', JSON.stringify(newOrders));
    clearCart();
  };

  const marketplace: Product[] = [
    { id: 'p1', name: 'Premium Wheat Seeds', category: 'INPUT', price: 500, unit: 'kg', quantity: 100, sellerId: 's1', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80' },
    { id: 'p2', name: 'Nano Urea Fertilizer', category: 'INPUT', price: 1200, unit: 'bottle', quantity: 50, sellerId: 's2', image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=400&q=80' },
    { id: 'p3', name: 'Fresh Potatoes', category: 'CROP', price: 25, unit: 'kg', quantity: 500, sellerId: 'f1', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80' },
    { id: 'p4', name: 'Organic Red Tomatoes', category: 'CROP', price: 40, unit: 'kg', quantity: 300, sellerId: 'f1', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80' },
  ];

  return (
    <AppContext.Provider value={{ 
      user, language, setLanguage, login, updateProfile, logout, 
      inventory, addToInventory, marketplace, cart, addToCart, removeFromCart, clearCart,
      orders, placeOrder, isOnline, weather 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
