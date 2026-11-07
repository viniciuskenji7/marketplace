'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { products as initialProducts } from '../data/products';
import type { Product } from '../types/Product';

export interface DemoCartItem {
  product: Product;
  quantity: number;
}

export interface DemoOrder {
  id: string;
  customerName: string;
  email: string;
  items: DemoCartItem[];
  total: number;
  createdAt: string;
}

interface DemoStoreValue {
  products: Product[];
  cartItems: DemoCartItem[];
  orders: DemoOrder[];
  latestOrder: DemoOrder | null;
  addToCart: (productId: number) => void;
  setCartQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  placeOrder: (customerName: string, email: string) => DemoOrder | null;
  saveProduct: (product: Omit<Product, 'id'>, id?: number) => void;
  deleteProduct: (productId: number) => void;
}

const DemoStoreContext = createContext<DemoStoreValue | null>(null);

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  const [products, setProducts] = useState(initialProducts);
  const [cartItems, setCartItems] = useState<DemoCartItem[]>([]);
  const [orders, setOrders] = useState<DemoOrder[]>([]);
  const [latestOrder, setLatestOrder] = useState<DemoOrder | null>(null);

  const value = useMemo<DemoStoreValue>(
    () => ({
      products,
      cartItems,
      orders,
      latestOrder,
      addToCart: (productId) => {
        const product = products.find((item) => item.id === productId);
        if (!product) return;

        setCartItems((current) => {
          const existing = current.find((item) => item.product.id === productId);
          if (existing) {
            return current.map((item) =>
              item.product.id === productId
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            );
          }
          return [...current, { product, quantity: 1 }];
        });
      },
      setCartQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          setCartItems((current) =>
            current.filter((item) => item.product.id !== productId),
          );
          return;
        }
        setCartItems((current) =>
          current.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item,
          ),
        );
      },
      removeFromCart: (productId) => {
        setCartItems((current) =>
          current.filter((item) => item.product.id !== productId),
        );
      },
      placeOrder: (customerName, email) => {
        if (cartItems.length === 0) return null;

        const order: DemoOrder = {
          id: crypto.randomUUID(),
          customerName,
          email,
          items: cartItems,
          total: cartItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0,
          ),
          createdAt: new Date().toISOString(),
        };
        setOrders((current) => [order, ...current]);
        setLatestOrder(order);
        setCartItems([]);
        return order;
      },
      saveProduct: (product, id) => {
        if (id !== undefined) {
          setProducts((current) =>
            current.map((item) => (item.id === id ? { ...product, id } : item)),
          );
          return;
        }
        setProducts((current) => [
          ...current,
          { ...product, id: Math.max(0, ...current.map((item) => item.id)) + 1 },
        ]);
      },
      deleteProduct: (productId) => {
        setProducts((current) => current.filter((item) => item.id !== productId));
      },
    }),
    [products, cartItems, orders, latestOrder],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <DemoStoreContext.Provider value={value}>
        {children}
      </DemoStoreContext.Provider>
    </QueryClientProvider>
  );
}

export function useDemoStore() {
  const store = useContext(DemoStoreContext);
  if (!store) {
    throw new Error('useDemoStore precisa ser usado dentro de Providers.');
  }
  return store;
}
