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

export const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
