import { getMediaAssetById, mediaAssets } from "@/data/adminCms";
import { createRepository } from "@/lib/repositories/types";

export const MediaRepository = {
  ...createRepository({
    records: mediaAssets,
    searchFields: ["id", "filename", "path", "category", "caption", "altText", "source", "rightsStatus"]
  }),
  findBySlug(slug: string) {
    return mediaAssets.find((asset) => asset.id === slug || asset.filename === slug || asset.path.endsWith(slug));
  },
  findFeatured() {
    return mediaAssets.filter((asset) => asset.isHero);
  },
  findVerified() {
    return mediaAssets.filter((asset) => asset.rightsStatus === "Permission confirmed" || asset.rightsStatus === "Internal demo asset");
  },
  findByCategory(category: string) {
    return mediaAssets.filter((asset) => asset.category.toLowerCase() === category.toLowerCase());
  },
  findById(id: string) {
    return getMediaAssetById(id);
  },
  findForEntity(entityId: string) {
    return mediaAssets.filter((asset) =>
      asset.usedByEntities?.some((entity) => entity.entityId === entityId) ?? asset.usedBy.includes(entityId)
    );
  }
};
