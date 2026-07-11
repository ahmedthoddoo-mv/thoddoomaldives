import { restaurants } from "@/data/restaurants";
import { createRepository } from "@/lib/repositories/types";

export const RestaurantRepository = {
  ...createRepository({
    records: restaurants,
    searchFields: ["id", "slug", "name", "tagline", "description", "location", "priceRange"]
  }),
  findVerified() {
    return restaurants.filter((restaurant) => restaurant.featured);
  }
};
