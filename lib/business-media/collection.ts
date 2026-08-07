import type { EditableBusinessMediaItem } from "@/types/business-media";

export function normalizeEditableBusinessMediaItems<T extends EditableBusinessMediaItem>(items: T[]): T[] {
  if (items.length === 0) {
    return [];
  }

  const firstCoverId = items.find((item) => item.isCover)?.id ?? items[0].id;
  let featuredSeen = false;

  return items.map((item, index) => {
    const isFeatured = item.isFeatured && !featuredSeen;
    if (isFeatured) {
      featuredSeen = true;
    }

    return {
      ...item,
      sortOrder: index,
      isCover: item.id === firstCoverId,
      isFeatured
    };
  });
}

export function moveEditableBusinessMediaItem<T extends EditableBusinessMediaItem>(
  items: T[],
  fromId: string,
  toId: string
) {
  const fromIndex = items.findIndex((item) => item.id === fromId);
  const toIndex = items.findIndex((item) => item.id === toId);

  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
    return items;
  }

  const reordered = [...items];
  const [selected] = reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, selected);
  return normalizeEditableBusinessMediaItems(reordered);
}
