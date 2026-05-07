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
  categoryId: string;
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

export type MenuData = {
  restaurantId: string;
  categories: MenuCategory[];
  items: MenuItem[];
};

export type ApiResult = {
  error?: string;
  statusCode?: number;
  message?: string | string[];
};

export function getErrorMessage(result: unknown, fallback: string) {
  const response = result as ApiResult | null;

  if (!response?.error && !response?.statusCode) return null;

  return Array.isArray(response.message)
    ? response.message.join(", ")
    : response.message || response.error || fallback;
}

export const MENU_CATEGORY_SUGGESTIONS = [
  "Starters",
  "Main Course",
  "Biryani",
  "Pizza",
  "Burger",
  "Sandwich",
  "Pasta",
  "Desserts",
  "Beverages",
  "Coffee",
  "Tea",
  "Tandoori",
  "Rice",
  "Bread",
];

export const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
