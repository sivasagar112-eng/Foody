// src/services/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://uivyobknbgkzykwjfepg.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Detect if we should use Mock Data
// We use mock data if the anon key is missing or explicitly requested in env
export const isMock = !supabaseAnonKey || supabaseAnonKey.trim() === '' || process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true';

if (isMock) {
  console.log('Foody is running in MOCK MODE because Supabase Anon Key is empty or USE_MOCK_DATA is set to true.');
} else {
  console.log('Foody is connecting to LIVE Supabase at:', supabaseUrl);
}

// ---- MOCK DATABASE STATE ----
const mockCategories = [
  { id: 'cat-1', name: 'Pizza', image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60' },
  { id: 'cat-2', name: 'Burgers', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60' },
  { id: 'cat-3', name: 'Biryani', image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60' },
  { id: 'cat-4', name: 'Desserts', image_url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&auto=format&fit=crop&q=60' },
  { id: 'cat-5', name: 'Chinese', image_url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60' },
  { id: 'cat-6', name: 'Healthy', image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60' },
];

const mockRestaurants = [
  {
    id: 'rest-1',
    name: 'The Pizza Haven',
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    cuisine_tags: ['Pizza', 'Italian', 'Fast Food'],
    rating: 4.5,
    reviews_count: 342,
    delivery_time_mins: 25,
    delivery_fee: 1.99,
    cost_for_two: 15.00,
    address: '42 Pizzaland Avenue, Food Court',
    opening_hours: '10:00 AM - 11:00 PM',
    lat: 12.9715,
    lng: 77.5946,
    is_featured: true,
  },
  {
    id: 'rest-2',
    name: 'Burger Castle',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    cuisine_tags: ['Burgers', 'Fast Food', 'Beverages'],
    rating: 4.2,
    reviews_count: 512,
    delivery_time_mins: 20,
    delivery_fee: 0.99,
    cost_for_two: 12.00,
    address: '88 Beef Street, Downtown',
    opening_hours: '11:00 AM - 12:00 AM',
    lat: 12.9698,
    lng: 77.5921,
    is_featured: true,
  },
  {
    id: 'rest-3',
    name: 'Royal Biryani House',
    image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    cuisine_tags: ['Biryani', 'Indian', 'Mughlai'],
    rating: 4.7,
    reviews_count: 829,
    delivery_time_mins: 35,
    delivery_fee: 2.99,
    cost_for_two: 18.00,
    address: '101 Spice Road, Old Town',
    opening_hours: '12:00 PM - 11:30 PM',
    lat: 12.9752,
    lng: 77.5978,
    is_featured: true,
  },
  {
    id: 'rest-4',
    name: 'Sweet Delights',
    image_url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&auto=format&fit=crop&q=80',
    cuisine_tags: ['Desserts', 'Bakery', 'Sweets'],
    rating: 4.6,
    reviews_count: 215,
    delivery_time_mins: 15,
    delivery_fee: 1.49,
    cost_for_two: 8.00,
    address: '7 Sweet Boulevard, Dessert District',
    opening_hours: '09:00 AM - 10:00 PM',
    lat: 12.9654,
    lng: 77.5912,
    is_featured: false,
  },
  {
    id: 'rest-5',
    name: 'Wok & Roll',
    image_url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&auto=format&fit=crop&q=80',
    cuisine_tags: ['Chinese', 'Noodles', 'Asian'],
    rating: 4.1,
    reviews_count: 186,
    delivery_time_mins: 30,
    delivery_fee: 2.49,
    cost_for_two: 14.00,
    address: '55 Bamboo Lane, East Side',
    opening_hours: '11:30 AM - 11:00 PM',
    lat: 12.9810,
    lng: 77.6010,
    is_featured: false,
  },
  {
    id: 'rest-6',
    name: 'Green & Lean',
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    cuisine_tags: ['Healthy', 'Salads', 'Juices'],
    rating: 4.4,
    reviews_count: 145,
    delivery_time_mins: 20,
    delivery_fee: 1.99,
    cost_for_two: 16.00,
    address: '12 Fit Gym Way, Health Plaza',
    opening_hours: '08:00 AM - 09:00 PM',
    lat: 12.9734,
    lng: 77.5899,
    is_featured: false,
  },
];

const mockMenuItems = [
  // Pizza Haven Items
  { id: 'item-1', restaurant_id: 'rest-1', category_id: 'cat-1', name: 'Margherita Pizza', description: 'Classic cheese and tomato sauce base topped with fresh basil leaves.', price: 9.99, image_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=60', is_veg: true, is_available: true },
  { id: 'item-2', restaurant_id: 'rest-1', category_id: 'cat-1', name: 'Pepperoni Feast Pizza', description: 'Loaded with spicy beef pepperoni and double mozzarella cheese.', price: 12.99, image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=60', is_veg: false, is_available: true },
  { id: 'item-3', restaurant_id: 'rest-1', category_id: 'cat-1', name: 'Garlic Bread Sticks', description: 'Baked bread sticks brushed with garlic butter and herbs, served with marinara.', price: 4.99, image_url: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=500&auto=format&fit=crop&q=60', is_veg: true, is_available: true },
  { id: 'item-4', restaurant_id: 'rest-1', category_id: 'cat-4', name: 'Coffee Tiramisu', description: 'Traditional Italian dessert layered with coffee-soaked ladyfingers and mascarpone.', price: 5.99, image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=60', is_veg: true, is_available: true },

  // Burger Castle Items
  { id: 'item-5', restaurant_id: 'rest-2', category_id: 'cat-2', name: 'Classic Cheeseburger', description: 'Juicy flame-grilled beef patty, cheddar cheese, pickles, lettuce, and secret sauce.', price: 7.99, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60', is_veg: false, is_available: true },
  { id: 'item-6', restaurant_id: 'rest-2', category_id: 'cat-2', name: 'Double Bacon Burger', description: 'Double beef patty, double cheddar, crispy bacon, onion rings, and BBQ sauce.', price: 10.99, image_url: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&auto=format&fit=crop&q=60', is_veg: false, is_available: true },
  { id: 'item-7', restaurant_id: 'rest-2', category_id: 'cat-2', name: 'Peri Peri French Fries', description: 'Crispy golden fries tossed in spicy peri peri seasoning.', price: 2.99, image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=60', is_veg: true, is_available: true },
  { id: 'item-8', restaurant_id: 'rest-2', category_id: 'cat-2', name: 'Classic Chocolate Shake', description: 'Creamy milk chocolate shake topped with whipped cream.', price: 3.99, image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=60', is_veg: true, is_available: true },

  // Royal Biryani Items
  { id: 'item-9', restaurant_id: 'rest-3', category_id: 'cat-3', name: 'Chicken Dum Biryani', description: 'Basmati rice cooked in layers with aromatic spices and tender chicken, served with raita.', price: 11.99, image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60', is_veg: false, is_available: true },
  { id: 'item-10', restaurant_id: 'rest-3', category_id: 'cat-3', name: 'Paneer Tikka Biryani', description: 'Fragrant basmati rice layered with spiced paneer cubes and grilled vegetables.', price: 10.99, image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60', is_veg: true, is_available: true },
  { id: 'item-11', restaurant_id: 'rest-3', category_id: 'cat-3', name: 'Butter Garlic Naan', description: 'Soft tandoori flatbread brushed with garlic and butter.', price: 2.49, image_url: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60', is_veg: true, is_available: true },

  // Sweet Delights Items
  { id: 'item-12', restaurant_id: 'rest-4', category_id: 'cat-4', name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with a rich molten chocolate center.', price: 4.99, image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=60', is_veg: true, is_available: true },
  { id: 'item-13', restaurant_id: 'rest-4', category_id: 'cat-4', name: 'Red Velvet Cupcake', description: 'Soft red velvet cupcake with smooth cream cheese frosting.', price: 3.49, image_url: 'https://images.unsplash.com/photo-1614707267537-b85acf00c4b8?w=500&auto=format&fit=crop&q=60', is_veg: true, is_available: true },
  { id: 'item-14', restaurant_id: 'rest-4', category_id: 'cat-4', name: 'Blueberry Cheesecake Slice', description: 'Creamy cold set cheesecake with a thick graham cracker crust and sweet blueberry compote.', price: 5.49, image_url: 'https://images.unsplash.com/photo-1524351199679-46cddf530c04?w=500&auto=format&fit=crop&q=60', is_veg: true, is_available: true },

  // Wok & Roll Items
  { id: 'item-15', restaurant_id: 'rest-5', category_id: 'cat-5', name: 'Veg Hakka Noodles', description: 'Stir-fried noodles with crisp colorful veggies and soya sauce.', price: 8.99, image_url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60', is_veg: true, is_available: true },
  { id: 'item-16', restaurant_id: 'rest-5', category_id: 'cat-5', name: 'Kung Pao Chicken', description: 'Stir-fried chicken cubes with peanuts, bell peppers, and chili sauce.', price: 10.99, image_url: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=60', is_veg: false, is_available: true },
  { id: 'item-17', restaurant_id: 'rest-5', category_id: 'cat-5', name: 'Crispy Spring Rolls (4 pcs)', description: 'Golden fried rolls stuffed with seasoned julienned vegetables.', price: 4.49, image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60', is_veg: true, is_available: true },

  // Green & Lean Items
  { id: 'item-18', restaurant_id: 'rest-6', category_id: 'cat-6', name: 'Avocado Salad Bowl', description: 'Fresh mixed greens, sliced avocados, cherry tomatoes, cucumbers, dressed in olive oil.', price: 9.49, image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60', is_veg: true, is_available: true },
  { id: 'item-19', restaurant_id: 'rest-6', category_id: 'cat-6', name: 'Quinoa Bowl with Tofu', description: 'Fluffy quinoa, grilled tofu cubes, steamed broccoli, and tahini dressing.', price: 10.99, image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60', is_veg: true, is_available: true },
  { id: 'item-20', restaurant_id: 'rest-6', category_id: 'cat-6', name: 'Cold Pressed Orange Juice', description: '100% natural, fresh oranges cold-pressed daily, no added sugar.', price: 4.99, image_url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&auto=format&fit=crop&q=60', is_veg: true, is_available: true },
];

const mockPromoCodes = [
  { code: 'SAVE20', discount_type: 'Percentage', discount_value: 20, min_order_amount: 15.0, max_discount_amount: 10.0 },
  { code: 'FOODY50', discount_type: 'Percentage', discount_value: 50, min_order_amount: 10.0, max_discount_amount: 15.0 },
  { code: 'FLAT5', discount_type: 'Flat', discount_value: 5, min_order_amount: 20.0, max_discount_amount: 5.0 },
];

// STATEFUL IN-MEMORY STORAGE (for mock mode)
let mockSessionUser: any = null;
let mockAddresses: any[] = [
  { id: 'addr-1', user_id: 'user-123', label: 'Home', address_line: 'Flat 402, Block A, Green Meadows', city: 'Bengaluru', pincode: '560001', is_default: true, lat: 12.9716, lng: 77.5946 },
  { id: 'addr-2', user_id: 'user-123', label: 'Work', address_line: 'Tower B, Tech Park, Outer Ring Road', city: 'Bengaluru', pincode: '560103', is_default: false, lat: 12.9250, lng: 77.6890 }
];
let mockOrders: any[] = [];
let mockFavorites: string[] = ['rest-1', 'rest-3']; // restaurant ids
let mockReviews: any[] = [];

// Helper to simulate network latency
const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

// Create a stateful mock supabase client
const mockSupabase = {
  auth: {
    signUp: async ({ email, password, options }: any) => {
      await delay(600);
      if (email.includes('error')) {
        return { data: null, error: { message: 'Invalid email address or signup error.' } };
      }
      mockSessionUser = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        email,
        phone: options?.data?.phone || '',
        user_metadata: options?.data || {},
        created_at: new Date().toISOString()
      };
      return {
        data: { user: mockSessionUser, session: { access_token: 'mock-token', user: mockSessionUser } },
        error: null
      };
    },
    signInWithPassword: async ({ email, password }: any) => {
      await delay(600);
      if (password === 'wrong') {
        return { data: null, error: { message: 'Invalid login credentials. Please use correct password.' } };
      }
      mockSessionUser = {
        id: 'user-123',
        email: email || 'user@example.com',
        phone: '9876543210',
        user_metadata: { full_name: 'Sagar Kumar', phone: '9876543210' },
        created_at: new Date().toISOString()
      };
      return {
        data: { user: mockSessionUser, session: { access_token: 'mock-token', user: mockSessionUser } },
        error: null
      };
    },
    signInWithOtp: async ({ phone }: any) => {
      await delay(500);
      return { data: { message: 'OTP Sent successfully' }, error: null };
    },
    verifyOtp: async ({ phone, token }: any) => {
      await delay(600);
      if (token === '000000' || token === '123456') {
        mockSessionUser = {
          id: 'user-123',
          email: 'phoneuser@example.com',
          phone: phone,
          user_metadata: { full_name: 'OTP User', phone: phone },
          created_at: new Date().toISOString()
        };
        return {
          data: { user: mockSessionUser, session: { access_token: 'mock-token', user: mockSessionUser } },
          error: null
        };
      }
      return { data: null, error: { message: 'Invalid OTP code entered. Please try again.' } };
    },
    signOut: async () => {
      await delay(200);
      mockSessionUser = null;
      return { error: null };
    },
    resetPasswordForEmail: async (email: string) => {
      await delay(400);
      return { data: {}, error: null };
    },
    getSession: async () => {
      return { data: { session: mockSessionUser ? { access_token: 'mock-token', user: mockSessionUser } : null }, error: null };
    },
    onAuthStateChange: (callback: any) => {
      // Return unsubscriber mock
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },
  from: (table: string) => {
    return {
      select: (columns = '*') => {
        let queryResult: any[] = [];
        if (table === 'categories') {
          queryResult = [...mockCategories];
        } else if (table === 'restaurants') {
          queryResult = [...mockRestaurants];
        } else if (table === 'menu_items') {
          queryResult = [...mockMenuItems];
        } else if (table === 'addresses') {
          queryResult = [...mockAddresses];
        } else if (table === 'orders') {
          queryResult = [...mockOrders];
        } else if (table === 'favorites') {
          // Join-like response for favorites
          queryResult = mockFavorites.map(restId => ({
            restaurant_id: restId,
            restaurants: mockRestaurants.find(r => r.id === restId)
          }));
        } else if (table === 'promo_codes') {
          queryResult = [...mockPromoCodes];
        } else if (table === 'profiles') {
          queryResult = mockSessionUser ? [{
            id: mockSessionUser.id,
            full_name: mockSessionUser.user_metadata?.full_name || 'Foody User',
            email: mockSessionUser.email,
            phone: mockSessionUser.phone || '',
            avatar_url: mockSessionUser.user_metadata?.avatar_url || ''
          }] : [];
        }

        const chain = {
          eq: (column: string, value: any) => {
            if (column === 'restaurant_id') {
              queryResult = queryResult.filter(item => item.restaurant_id === value);
            } else if (column === 'user_id') {
              queryResult = queryResult.filter(item => item.user_id === value);
            } else if (column === 'id') {
              queryResult = queryResult.filter(item => item.id === value);
            } else if (column === 'code') {
              queryResult = queryResult.filter(item => item.code === value);
            }
            return chain;
          },
          order: (column: string, { ascending = false } = {}) => {
            queryResult.sort((a, b) => {
              if (a[column] < b[column]) return ascending ? -1 : 1;
              if (a[column] > b[column]) return ascending ? 1 : -1;
              return 0;
            });
            return chain;
          },
          single: () => {
            return Promise.resolve({ data: queryResult[0] || null, error: queryResult.length ? null : { message: 'Row not found' } });
          },
          then: (resolve: any) => resolve({ data: queryResult, error: null })
        };
        return chain;
      },
      insert: (data: any) => {
        let insertData = Array.isArray(data) ? data : [data];
        if (table === 'addresses') {
          const inserted = insertData.map(d => {
            const row = { id: 'addr-' + Math.random().toString(36).substr(2, 9), ...d, created_at: new Date().toISOString() };
            if (d.is_default) {
              mockAddresses.forEach(a => a.is_default = false);
            }
            mockAddresses.push(row);
            return row;
          });
          return Promise.resolve({ data: inserted, error: null });
        } else if (table === 'orders') {
          const inserted = insertData.map(d => {
            const row = {
              id: 'ord-' + Math.random().toString(36).substr(2, 9),
              status: 'Placed',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...d
            };
            mockOrders.push(row);
            return row;
          });
          return Promise.resolve({ data: inserted, error: null });
        } else if (table === 'order_items') {
          // Just return mock success
          return Promise.resolve({ data: insertData, error: null });
        } else if (table === 'favorites') {
          insertData.forEach(d => {
            if (!mockFavorites.includes(d.restaurant_id)) {
              mockFavorites.push(d.restaurant_id);
            }
          });
          return Promise.resolve({ data: insertData, error: null });
        } else if (table === 'reviews') {
          const inserted = insertData.map(d => {
            const row = { id: 'rev-' + Math.random().toString(36).substr(2, 9), ...d, created_at: new Date().toISOString() };
            mockReviews.push(row);
            // Increment rating in mock restaurants
            const rest = mockRestaurants.find(r => r.id === d.restaurant_id);
            if (rest) {
              rest.reviews_count = (rest.reviews_count || 0) + 1;
              rest.rating = Number(((rest.rating * (rest.reviews_count - 1) + d.rating) / rest.reviews_count).toFixed(1));
            }
            return row;
          });
          return Promise.resolve({ data: inserted, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      },
      update: (data: any) => {
        const chain = {
          eq: (column: string, value: any) => {
            if (table === 'profiles' && column === 'id' && mockSessionUser && mockSessionUser.id === value) {
              mockSessionUser.user_metadata = { ...mockSessionUser.user_metadata, ...data };
            } else if (table === 'addresses' && column === 'id') {
              const idx = mockAddresses.findIndex(a => a.id === value);
              if (idx !== -1) {
                if (data.is_default) {
                  mockAddresses.forEach(a => a.is_default = false);
                }
                mockAddresses[idx] = { ...mockAddresses[idx], ...data };
              }
            }
            return Promise.resolve({ data, error: null });
          }
        };
        return chain;
      },
      delete: () => {
        const chain = {
          eq: (column: string, value: any) => {
            if (table === 'favorites' && column === 'restaurant_id') {
              mockFavorites = mockFavorites.filter(id => id !== value);
            } else if (table === 'addresses' && column === 'id') {
              mockAddresses = mockAddresses.filter(a => a.id !== value);
            }
            return Promise.resolve({ data: null, error: null });
          }
        };
        return chain;
      }
    };
  },
  functions: {
    invoke: async (functionName: string, options: any = {}) => {
      await delay(500);
      if (functionName === 'calculate-order') {
        const { items, promoCode } = options.body || {};
        let subtotal = 0;
        (items || []).forEach((it: any) => {
          const menuItem = mockMenuItems.find(m => m.id === it.menu_item_id);
          if (menuItem) {
            subtotal += menuItem.price * it.quantity;
          }
        });
        let discount = 0;
        if (promoCode) {
          const promo = mockPromoCodes.find(p => p.code === promoCode);
          if (promo) {
            if (promo.discount_type === 'Percentage') {
              discount = (subtotal * promo.discount_value) / 100;
              if (promo.max_discount_amount) {
                discount = Math.min(discount, promo.max_discount_amount);
              }
            } else {
              discount = promo.discount_value;
            }
          }
        }
        const deliveryFee = subtotal > 15 ? 0 : 2.0;
        const tax = parseFloat((subtotal * 0.05).toFixed(2)); // 5% GST
        const total = parseFloat((subtotal + deliveryFee + tax - discount).toFixed(2));
        return {
          data: { subtotal, deliveryFee, tax, discount, total },
          error: null
        };
      }
      if (functionName === 'validate-promo') {
        const { code, amount } = options.body || {};
        const promo = mockPromoCodes.find(p => p.code === code);
        if (!promo) {
          return { data: null, error: { message: 'Invalid promo code' } };
        }
        if (amount < promo.min_order_amount) {
          return { data: null, error: { message: `Minimum order amount of $${promo.min_order_amount} required.` } };
        }
        return { data: { valid: true, promo }, error: null };
      }
      return { data: null, error: { message: 'Function not found' } };
    }
  }
};

// Export active client instance (either real or mock)
export const supabase = isMock
  ? (mockSupabase as any)
  : createClient(supabaseUrl, supabaseAnonKey);
