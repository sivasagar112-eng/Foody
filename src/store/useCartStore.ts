// src/store/useCartStore.ts
import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';

export interface CartItem {
  id: string; // unique item id in cart
  menuItem: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
    is_veg: boolean;
    description?: string;
  };
  quantity: number;
  restaurantId: string;
}

export interface PromoCode {
  code: string;
  discount_type: 'Percentage' | 'Flat';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number;
}

export interface Order {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  status: 'Placed' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  subtotal_amount: number;
  delivery_fee: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  delivery_address_id: string;
  delivery_address_line: string;
  payment_method: string;
  created_at: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

interface CartState {
  cartItems: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  promoCode: PromoCode | null;
  selectedAddressId: string | null;
  paymentMethod: 'UPI' | 'Card' | 'COD';
  activeOrder: Order | null;
  error: string | null;
  addItem: (menuItem: any, restaurant: { id: string; name: string }) => { success: boolean; promptRestaurantChange?: boolean };
  forceAddItem: (menuItem: any, restaurant: { id: string; name: string }) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => Promise<{ success: boolean; error: string | null }>;
  removePromoCode: () => void;
  setSelectedAddressId: (addressId: string) => void;
  setPaymentMethod: (method: 'UPI' | 'Card' | 'COD') => void;
  getCartTotals: () => {
    subtotal: number;
    deliveryFee: number;
    tax: number;
    discount: number;
    total: number;
  };
  placeOrder: (userId: string, addressLine: string) => Promise<{ success: boolean; orderId?: string; error: string | null }>;
  clearActiveOrder: () => void;
  simulateOrderProgress: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cartItems: [],
  restaurantId: null,
  restaurantName: null,
  promoCode: null,
  selectedAddressId: null,
  paymentMethod: 'UPI',
  activeOrder: null,
  error: null,

  addItem: (menuItem, restaurant) => {
    const { cartItems, restaurantId } = get();

    if (restaurantId && restaurantId !== restaurant.id) {
      return { success: false, promptRestaurantChange: true };
    }

    const existingIdx = cartItems.findIndex(item => item.menuItem.id === menuItem.id);
    let updatedItems = [...cartItems];

    if (existingIdx !== -1) {
      updatedItems[existingIdx].quantity += 1;
    } else {
      updatedItems.push({
        id: 'cart-' + Math.random().toString(36).substr(2, 9),
        menuItem: {
          id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          image_url: menuItem.image_url,
          is_veg: menuItem.is_veg,
          description: menuItem.description
        },
        quantity: 1,
        restaurantId: restaurant.id
      });
    }

    set({
      cartItems: updatedItems,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name
    });

    return { success: true };
  },

  forceAddItem: (menuItem, restaurant) => {
    set({
      cartItems: [
        {
          id: 'cart-' + Math.random().toString(36).substr(2, 9),
          menuItem: {
            id: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            image_url: menuItem.image_url,
            is_veg: menuItem.is_veg,
            description: menuItem.description
          },
          quantity: 1,
          restaurantId: restaurant.id
        }
      ],
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      promoCode: null // Reset promo code when restaurant changes
    });
  },

  removeItem: (menuItemId) => {
    const { cartItems } = get();
    const existingIdx = cartItems.findIndex(item => item.menuItem.id === menuItemId);

    if (existingIdx === -1) return;

    let updatedItems = [...cartItems];
    if (updatedItems[existingIdx].quantity > 1) {
      updatedItems[existingIdx].quantity -= 1;
      set({ cartItems: updatedItems });
    } else {
      updatedItems.splice(existingIdx, 1);
      if (updatedItems.length === 0) {
        set({ cartItems: [], restaurantId: null, restaurantName: null, promoCode: null });
      } else {
        set({ cartItems: updatedItems });
      }
    }
  },

  updateQuantity: (menuItemId, quantity) => {
    const { cartItems } = get();
    if (quantity <= 0) {
      get().removeItem(menuItemId);
      return;
    }

    const updatedItems = cartItems.map(item =>
      item.menuItem.id === menuItemId ? { ...item, quantity } : item
    );
    set({ cartItems: updatedItems });
  },

  clearCart: () => {
    set({ cartItems: [], restaurantId: null, restaurantName: null, promoCode: null });
  },

  applyPromoCode: async (code) => {
    const { subtotal } = get().getCartTotals();
    try {
      // Safely invoke Supabase Edge Function or run local check
      const { data, error } = await supabase.functions.invoke('validate-promo', {
        body: { code, amount: subtotal }
      });

      if (error) {
        throw error;
      }

      if (data && data.promo) {
        const promo = data.promo;
        set({
          promoCode: {
            code: promo.code,
            discount_type: promo.discount_type,
            discount_value: promo.discount_value,
            min_order_amount: promo.min_order_amount,
            max_discount_amount: promo.max_discount_amount
          }
        });
        return { success: true, error: null };
      }
      return { success: false, error: 'Promo code details unavailable' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Invalid coupon code' };
    }
  },

  removePromoCode: () => {
    set({ promoCode: null });
  },

  setSelectedAddressId: (addressId) => {
    set({ selectedAddressId: addressId });
  },

  setPaymentMethod: (method) => {
    set({ paymentMethod: method });
  },

  getCartTotals: () => {
    const { cartItems, promoCode } = get();
    const subtotal = cartItems.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0);

    let discount = 0;
    if (promoCode) {
      if (promoCode.discount_type === 'Percentage') {
        discount = (subtotal * promoCode.discount_value) / 100;
        if (promoCode.max_discount_amount) {
          discount = Math.min(discount, promoCode.max_discount_amount);
        }
      } else {
        discount = promoCode.discount_value;
      }
    }

    // Delivery fee is $2.0, waived above $15 subtotal
    const deliveryFee = subtotal === 0 ? 0 : subtotal > 15 ? 0 : 2.0;
    // 5% GST/Tax
    const tax = subtotal === 0 ? 0 : parseFloat((subtotal * 0.05).toFixed(2));
    const total = subtotal === 0 ? 0 : parseFloat((subtotal + deliveryFee + tax - discount).toFixed(2));

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      deliveryFee,
      tax,
      discount: parseFloat(discount.toFixed(2)),
      total: total < 0 ? 0 : total
    };
  },

  placeOrder: async (userId, addressLine) => {
    const { cartItems, restaurantId, restaurantName, selectedAddressId, paymentMethod } = get();
    const { subtotal, deliveryFee, tax, discount, total } = get().getCartTotals();

    if (!restaurantId || cartItems.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }
    if (!selectedAddressId) {
      return { success: false, error: 'Please select a delivery address' };
    }

    try {
      // Securely recalculate totals on server
      const { data: verifiedTotals, error: verificationError } = await supabase.functions.invoke('calculate-order', {
        body: {
          items: cartItems.map(item => ({ menu_item_id: item.menuItem.id, quantity: item.quantity })),
          promoCode: get().promoCode?.code
        }
      });

      if (verificationError) {
        console.warn('Order totals server verification failed, using client calculations:', verificationError);
      }

      const finalTotal = verifiedTotals?.total ?? total;
      const finalDiscount = verifiedTotals?.discount ?? discount;

      // Insert Order Row
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          restaurant_id: restaurantId,
          subtotal_amount: subtotal,
          delivery_fee: deliveryFee,
          tax_amount: tax,
          discount_amount: finalDiscount,
          total_amount: finalTotal,
          delivery_address_id: selectedAddressId,
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'COD' ? 'Pending' : 'Paid'
        });

      if (orderError) throw orderError;

      const orderRow = orderData && orderData[0];
      const newOrderId = orderRow?.id || 'ord-' + Math.random().toString(36).substr(2, 9);

      // Insert Order Items
      const orderItemsInsert = cartItems.map(item => ({
        order_id: newOrderId,
        menu_item_id: item.menuItem.id,
        quantity: item.quantity,
        price: item.menuItem.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsInsert);

      if (itemsError) throw itemsError;

      // Prepare order details for tracking screen
      const newOrder: Order = {
        id: newOrderId,
        restaurant_id: restaurantId,
        restaurant_name: restaurantName || 'Restaurant',
        status: 'Placed',
        subtotal_amount: subtotal,
        delivery_fee: deliveryFee,
        tax_amount: tax,
        discount_amount: finalDiscount,
        total_amount: finalTotal,
        delivery_address_id: selectedAddressId,
        delivery_address_line: addressLine,
        payment_method: paymentMethod,
        created_at: new Date().toISOString(),
        items: cartItems.map(item => ({
          id: item.menuItem.id,
          name: item.menuItem.name,
          price: item.menuItem.price,
          quantity: item.quantity
        }))
      };

      set({ activeOrder: newOrder });
      get().clearCart();

      return { success: true, orderId: newOrderId, error: null };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to place order' };
    }
  },

  clearActiveOrder: () => {
    set({ activeOrder: null });
  },

  simulateOrderProgress: () => {
    const { activeOrder } = get();
    if (!activeOrder) return;

    let nextStatus: Order['status'] = 'Placed';

    switch (activeOrder.status) {
      case 'Placed':
        nextStatus = 'Preparing';
        break;
      case 'Preparing':
        nextStatus = 'Out for Delivery';
        break;
      case 'Out for Delivery':
        nextStatus = 'Delivered';
        break;
      case 'Delivered':
        return; // already finished
      default:
        return;
    }

    // Update state locally
    const updatedOrder = { ...activeOrder, status: nextStatus, updated_at: new Date().toISOString() };
    set({ activeOrder: updatedOrder });

    // Also update order in in-memory list if mock is running
    const { data } = supabase.from('orders').select('*');
    if (data) {
      const idx = data.findIndex((o: any) => o.id === activeOrder.id);
      if (idx !== -1) {
        data[idx].status = nextStatus;
      }
    }
  }
}));
