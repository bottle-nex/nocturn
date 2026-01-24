import { create } from 'zustand';

interface CartItem {
    id: string;
    [key: string]: unknown;
}

interface CartStoreType {
    items: CartItem[];
    setItems: (items: CartItem[]) => void;
    addItem: (item: CartItem) => void;
    removeItem: (itemId: string) => void;
    clearCart: () => void;
}

export const useCartStore = create<CartStoreType>((set, get) => ({
    items: [],
    setItems: (items: CartItem[]) => {
        set({ items });
    },
    addItem: (item: CartItem) => {
        set((state) => ({ items: [...state.items, item] }));
    },
    removeItem: (itemId: string) => {
        set((state) => ({
            items: state.items.filter((i) => i.id !== itemId),
        }));
    },
    clearCart: () => {
        set({
            items: [],
        });
    },
}));
