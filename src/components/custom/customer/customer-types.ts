export type RestaurantLocation = {
  latitude: number;
  longitude: number;
  formattedAddress: string | null;
};

export type Restaurant = {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  ownerId: string;
  phone: string;
  isVerified: boolean;
  location: RestaurantLocation;
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
  distanceMeters?: number;
};

export type MenuCategory = {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  displayOrder: number;
  createdAt: string;
};

export type MenuItem = {
  id: string;
  restaurantId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  image: string | null;
  price: number;
  discountedPrice: number | null;
  isAvailable: boolean;
  isVeg: boolean | null;
  isBestseller: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  category?: MenuCategory | null;
};

export type RestaurantMenu = {
  restaurantId: string;
  categories: MenuCategory[];
  items: MenuItem[];
};

export type RestaurantFilters = {
  search?: string;
  isOpen?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  radiusKm?: number;
};

export type CustomerAddress = {
  id: string;
  label: string;
  address: string;
  isDefault?: boolean;
};

export type CartItemStatus =
  | "valid"
  | "unavailable"
  | "deleted"
  | "price_changed"
  | "restaurant_closed";

export type CartPricing = {
  itemTotal: number;
  discountedSubtotal: number;
  discount: number;
  deliveryFee: number;
  platformFee: number;
  taxes: number;
  total: number;
};

export type CartItem = {
  id: string;
  cartId: string;
  menuItemId: string;
  restaurantId: string;
  itemName: string;
  itemImage: string | null;
  price: number;
  discountedPrice: number | null;
  isVeg: boolean | null;
  quantity: number;
  status: CartItemStatus;
  message?: string;
  currentPrice?: number | null;
  currentDiscountedPrice?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CartResponse = {
  id: string;
  userId: string;
  restaurantId: string;
  restaurant: {
    id: string;
    name: string;
    image: string | null;
    isOpen: boolean;
  };
  items: CartItem[];
  pricing: CartPricing;
  validation: {
    isValid: boolean;
    issues: {
      itemId?: string;
      menuItemId?: string;
      status: CartItemStatus;
      message: string;
      currentPrice?: number | null;
      currentDiscountedPrice?: number | null;
    }[];
  };
  createdAt: string;
  updatedAt: string;
};

export const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export type Address = {
  id: string;
  userId: string;
  label: string | null;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrderStatus =
  | 'PENDING_PAYMENT' | 'PAYMENT_FAILED' | 'PLACED' | 'CONFIRMED'
  | 'PREPARING' | 'READY_FOR_PICKUP' | 'OUT_FOR_DELIVERY'
  | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'EXPIRED';

export type OrderItem = {
  id: string;
  orderId: string;
  menuItemId: string | null;
  itemName: string;
  itemImage: string | null;
  quantity: number;
  price: number;
  discountedPrice: number | null;
  isVeg: boolean | null;
  createdAt: string;
};

export type Order = {
  id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  restaurantPhone: string;
  deliveryFullName: string;
  deliveryPhone: string;
  deliveryAddressLine1: string;
  deliveryAddressLine2: string | null;
  deliveryCity: string;
  deliveryState: string;
  deliveryCountry: string;
  deliveryPostalCode: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  paymentStatus: PaymentStatus;
  paymentMethod: string | null;
  paymentReferenceId: string | null;
  status: OrderStatus;
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  platformFee: number;
  discountAmount: number;
  totalAmount: number;
  estimatedDeliveryTime: number | null;
  notes: string | null;
  cancelReason: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type CheckoutResponse = {
  orderId: string;
  paymentDetails: {
    provider: string;
    providerOrderId: string;
    amount: number;
    currency: string;
    key?: string;
    clientSecret?: string;
  };
};
