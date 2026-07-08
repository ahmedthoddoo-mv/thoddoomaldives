import type { Restaurant, RestaurantCuisine } from "@/types/restaurant";

export type RestaurantFilters = {
  query?: string;
  cuisine?: RestaurantCuisine | "all";
  vegetarian?: boolean;
  seafood?: boolean;
  breakfast?: boolean;
  dinner?: boolean;
};

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function includesText(source: string, query?: string) {
  if (!query) return true;
  return normalize(source).includes(normalize(query));
}

export function filterRestaurants(
  restaurants: Restaurant[],
  filters: RestaurantFilters
) {
  return restaurants.filter((restaurant) => {
    const searchableText = [
      restaurant.name,
      restaurant.tagline,
      restaurant.description,
      restaurant.location,
      restaurant.openingHours,
      ...restaurant.cuisine,
    ].join(" ");

    if (!includesText(searchableText, filters.query)) return false;
    if (
      filters.cuisine &&
      filters.cuisine !== "all" &&
      !restaurant.cuisine.includes(filters.cuisine)
    ) {
      return false;
    }
    if (filters.vegetarian && !includesText(searchableText, "vegetarian")) {
      return false;
    }
    if (filters.seafood && !restaurant.cuisine.includes("seafood")) return false;
    if (filters.breakfast && !includesText(searchableText, "breakfast")) {
      return false;
    }
    if (filters.dinner && !includesText(searchableText, "dinner")) return false;

    return true;
  });
}
