"use server";

import { normalizeEditableBusinessMediaItems } from "@/lib/business-media/collection";
import { authorizeBusinessMediaMutation } from "@/lib/business-media/auth";
import {
  ensureBusinessMediaCover,
  ensureBusinessMediaSeeded,
  revalidateBusinessMediaPaths,
  syncBusinessPrimaryImage
} from "@/lib/business-media/server";
import type { EditableBusinessMediaItem, BusinessMediaType } from "@/types/business-media";

type BusinessMediaActionResult = {
  ok: boolean;
  message: string;
};

function sanitizeText(value: string, maxLength: number) {
  return value.replace(/[<>]/g, "").trim().slice(0, maxLength);
}

export async function saveBusinessMediaMetadata(input: {
  businessType: BusinessMediaType;
  businessId: string;
  items: EditableBusinessMediaItem[];
}): Promise<BusinessMediaActionResult> {
  const { db, context } = await authorizeBusinessMediaMutation(input.businessType, input.businessId);
  await ensureBusinessMediaSeeded(db, context);

  const { data: currentRows, error: currentError } = await db
    .from("business_media")
    .select("id, media_asset_id")
    .eq("business_type", context.businessType)
    .eq("business_id", context.businessId);
  if (currentError) {
    return { ok: false, message: currentError.message };
  }

  const allowedIds = new Set((currentRows ?? []).map((row) => row.id));
  const normalizedItems = normalizeEditableBusinessMediaItems(
    input.items
      .filter((item) => allowedIds.has(item.id))
      .map((item) => ({
        ...item,
        caption: sanitizeText(item.caption, 240),
        altText: sanitizeText(item.altText, 240)
      }))
  );

  if (normalizedItems.length !== (currentRows ?? []).length) {
    return { ok: false, message: "The media list is out of date. Refresh and try again." };
  }

  const { error: clearFlagsError } = await db
    .from("business_media")
    .update({ is_cover: false, is_featured: false, updated_at: new Date().toISOString() })
    .eq("business_type", context.businessType)
    .eq("business_id", context.businessId);
  if (clearFlagsError) {
    return { ok: false, message: clearFlagsError.message };
  }

  for (const item of normalizedItems) {
    const { error: updateError } = await db
      .from("business_media")
      .update({
        caption: item.caption,
        alt_text: item.altText,
        sort_order: item.sortOrder,
        is_cover: item.isCover,
        is_featured: item.isFeatured,
        is_public: item.isPublic,
        media_purpose: item.mediaPurpose,
        updated_at: new Date().toISOString()
      })
      .eq("id", item.id)
      .eq("business_type", context.businessType)
      .eq("business_id", context.businessId);
    if (updateError) {
      return { ok: false, message: updateError.message };
    }
  }

  await ensureBusinessMediaCover(db, context);
  await syncBusinessPrimaryImage(db, context);
  revalidateBusinessMediaPaths(context);
  return { ok: true, message: "Media gallery saved." };
}

export async function deleteBusinessMediaItem(input: {
  businessType: BusinessMediaType;
  businessId: string;
  mediaId: string;
}): Promise<BusinessMediaActionResult> {
  const { db, context } = await authorizeBusinessMediaMutation(input.businessType, input.businessId);
  await ensureBusinessMediaSeeded(db, context);

  const { data: row, error: rowError } = await db
    .from("business_media")
    .select("id, media_asset_id")
    .eq("id", input.mediaId)
    .eq("business_type", context.businessType)
    .eq("business_id", context.businessId)
    .maybeSingle();
  if (rowError) {
    return { ok: false, message: rowError.message };
  }
  if (!row) {
    return { ok: false, message: "Media item was not found." };
  }

  const { data: asset, error: assetError } = await db
    .from("media_assets")
    .select("storage_bucket, storage_path")
    .eq("id", row.media_asset_id)
    .maybeSingle();
  if (assetError) {
    return { ok: false, message: assetError.message };
  }
  const { error: deleteError } = await db.from("business_media").delete().eq("id", row.id);
  if (deleteError) {
    return { ok: false, message: deleteError.message };
  }

  const { count: remainingReferences, error: referenceError } = await db
    .from("business_media")
    .select("id", { count: "exact", head: true })
    .eq("media_asset_id", row.media_asset_id);
  if (referenceError) {
    return { ok: false, message: referenceError.message };
  }

  if ((remainingReferences ?? 0) === 0) {
    if (asset?.storage_bucket && asset.storage_path) {
      const { error: storageError } = await db.storage.from(asset.storage_bucket).remove([asset.storage_path]);
      if (storageError) {
        return { ok: false, message: storageError.message };
      }
    }

    const { error: assetDeleteError } = await db.from("media_assets").delete().eq("id", row.media_asset_id);
    if (assetDeleteError) {
      return { ok: false, message: assetDeleteError.message };
    }
  }

  await ensureBusinessMediaCover(db, context);
  await syncBusinessPrimaryImage(db, context);
  revalidateBusinessMediaPaths(context);
  return { ok: true, message: "Media item deleted." };
}
