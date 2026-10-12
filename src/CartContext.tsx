import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { sanitizeCart, setQuantity } from "./shop";
import type { CartItem } from "./types";
const key = "audiophile-cart-v1";
type CartState = {
  cart: CartItem[];
  update: (id: number, quantity: number) => void;
  add: (id: number, quantity: number) => void;
  clear: () => void;
  storageError: boolean;
};
const Context = createContext<CartState | null>(null);
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      return sanitizeCart(JSON.parse(localStorage.getItem(key) ?? "[]"));
    } catch {
      return [];
    }
  });
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(cart));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [cart]);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === key) {
        try {
          setCart(sanitizeCart(JSON.parse(event.newValue ?? "[]")));
        } catch {
          setCart([]);
        }
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  return (
    <Context.Provider
      value={{
        cart,
        update: (id, quantity) => setCart((c) => setQuantity(c, id, quantity)),
        add: (id, quantity) =>
          setCart((c) =>
            setQuantity(
              c,
              id,
              (c.find((i) => i.id === id)?.quantity ?? 0) + quantity,
            ),
          ),
        clear: () => setCart([]),
        storageError,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useCart = () => useContext(Context)!;
