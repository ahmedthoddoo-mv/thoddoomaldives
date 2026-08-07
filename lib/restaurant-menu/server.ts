import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { RestaurantMenuCategory, RestaurantMenuData, RestaurantMenuItem } from "@/types/restaurant-menu";

function normalizeMenuCategory(row: Record<string, unknown>): RestaurantMenuCategory {
  return {
    id: String(row.id ?? ""),
    restaurantId: String(row.restaurant_id ?? ""),
    name: String(row.name ?? ""),
    slug: typeof row.slug === "string" ? row.slug : null,
    sortOrder: Number(row.sort_order ?? 0),
    isPublic: Boolean(row.is_public)
  };
}

function normalizeMenuItem(row: Record<string, unknown>): RestaurantMenuItem {
  return {
    id: String(row.id ?? ""),
    restaurantId: String(row.restaurant_id ?? ""),
    categoryId: String(row.category_id ?? ""),
    name: String(row.name ?? ""),
    description: typeof row.description === "string" ? row.description : null,
    priceMvr: typeof row.price_mvr === "number" ? row.price_mvr : null,
    sortOrder: Number(row.sort_order ?? 0),
    isAvailable: Boolean(row.is_available),
    isPublic: Boolean(row.is_public)
  };
}

export async function getPublicRestaurantMenuData(restaurantId: string): Promise<RestaurantMenuData> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return { categories: [], items: [] };

  const [{ data: categoriesData, error: categoriesError }, { data: itemsData, error: itemsError }] = await Promise.all([
    supabase
      .from("restaurant_menu_categories" as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .select("id, restaurant_id, name, slug, sort_order, is_public")
      .eq("restaurant_id", restaurantId)
      .eq("is_public", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("restaurant_menu_items" as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .select("id, restaurant_id, category_id, name, description, price_mvr, sort_order, is_available, is_public")
      .eq("restaurant_id", restaurantId)
      .eq("is_public", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
  ]);

  if (categoriesError || itemsError) {
    return { categories: [], items: [] };
  }

  const categories = (categoriesData ?? []).map((row) => normalizeMenuCategory(row as unknown as Record<string, unknown>));
  const items = (itemsData ?? []).map((row) => normalizeMenuItem(row as unknown as Record<string, unknown>));

  return { categories, items };
}
