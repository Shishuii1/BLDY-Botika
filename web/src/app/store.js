import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('pharmasys_token', token);
        localStorage.setItem('pharmasys_user', JSON.stringify(user));
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem('pharmasys_token');
        localStorage.removeItem('pharmasys_user');
        set({ user: null, token: null });
      },
      loadFromStorage: () => {
        const token = localStorage.getItem('pharmasys_token');
        const userStr = localStorage.getItem('pharmasys_user');
        if (token && userStr) {
          try {
            set({ token, user: JSON.parse(userStr) });
          } catch {
            localStorage.removeItem('pharmasys_user');
          }
        }
      },
    }),
    {
      name: 'pharmasys-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export function getAuthToken() {
  return useAuthStore.getState().token || localStorage.getItem('pharmasys_token');
}

export const useCartStore = create((set, get) => ({
  items: [],
  customerId: null,
  discountType: 'none',
  addItem: (medicine, qty = 1) => {
    const items = [...get().items];
    const idx = items.findIndex((i) => i.medicine_id === medicine.medicine_id);
    if (idx >= 0) {
      items[idx].quantity += qty;
    } else {
      items.push({
        medicine_id: medicine.medicine_id,
        medicine_name: medicine.medicine_name,
        selling_price: Number(medicine.selling_price),
        quantity: qty,
        prescription_required: medicine.prescription_required,
      });
    }
    set({ items });
  },
  updateQty: (id, quantity) => {
    set({
      items: get().items.map((i) =>
        i.medicine_id === id ? { ...i, quantity: Math.max(1, quantity) } : i
      ),
    });
  },
  removeItem: (id) => set({ items: get().items.filter((i) => i.medicine_id !== id) }),
  setCustomerId: (customerId) => set({ customerId }),
  clearCustomer: () => set({ customerId: null }),
  clear: () => set({ items: [], customerId: null, discountType: 'none' }),
  subtotal: () => get().items.reduce((s, i) => s + i.selling_price * i.quantity, 0),
}));
