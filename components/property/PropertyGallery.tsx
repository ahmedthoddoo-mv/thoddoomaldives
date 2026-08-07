"use client";

import MediaGallery from "@/components/media/MediaGallery";
import { mediaItemsFromUrls } from "@/lib/business-media/public";
import type { BusinessMediaItem } from "@/types/business-media";

export default function PropertyGallery({
  images,
  propertyName,
  media
}: {
  images: string[];
  propertyName: string;
  media?: BusinessMediaItem[];
}) {
  const items = media && media.length > 0 ? media : mediaItemsFromUrls(images, propertyName);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <MediaGallery
          mode="public"
          businessName={propertyName}
          items={items}
          title={`${propertyName} gallery`}
          description="Explore the current guesthouse gallery, cover photo, and featured imagery."
        />
      </div>
    </div>
  );
}
