export type RestaurantMenuCategory = {
  id: string;
  restaurantId: string;
  name: string;
  slug?: string | null;
  sortOrder: number;
  isPublic: boolean;
};

export type RestaurantMenuItem = {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description?: string | null;
  priceMvr?: number | null;
  sortOrder: number;
  isAvailable: boolean;
  isPublic: boolean;
};

export type RestaurantMenuData = {
  categories: RestaurantMenuCategory[];
  items: RestaurantMenuItem[];
};
