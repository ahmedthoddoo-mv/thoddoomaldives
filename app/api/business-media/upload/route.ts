import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { authorizeBusinessMediaMutation } from "@/lib/business-media/auth";
import {
  ensureBusinessMediaSeeded,
  listManagedBusinessMedia,
  revalidateBusinessMediaPaths,
  syncBusinessPrimaryImage
} from "@/lib/business-media/server";
import type { BusinessMediaType } from "@/types/business-media";

const uploadBucket = "business-media";
const maxUploadBytes = 8 * 1024 * 1024;
const supportedMimeTypes = new Set(["image/webp"]);

function sanitizeText(value: string, maxLength: number) {
  return value.replace(/[<>]/g, "").trim().slice(0, maxLength);
}

function sanitizeFilename(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").slice(0, 120) || "business-media.webp";
}

function parseBusinessType(value: FormDataEntryValue | null): BusinessMediaType | null {
  if (value === "property" || value === "restaurant" || value === "experience" || value === "transfer") {
    return value;
  }
  return null;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const businessType = parseBusinessType(formData.get("businessType"));
  const businessIdEntry = formData.get("businessId");
  const businessId = typeof businessIdEntry === "string" ? businessIdEntry : "";
  const file = formData.get("file");

  if (!businessType || !businessId || !(file instanceof File)) {
    return NextResponse.json({ message: "A business type, business id, and image file are required." }, { status: 400 });
  }
  if (file.size <= 0 || file.size > maxUploadBytes) {
    return NextResponse.json({ message: "Each image must be smaller than 8MB." }, { status: 400 });
  }
  if (!supportedMimeTypes.has(file.type)) {
    return NextResponse.json({ message: "Images must be converted to WebP before upload." }, { status: 400 });
  }

  try {
    const { db, context } = await authorizeBusinessMediaMutation(businessType, businessId);
    await ensureBusinessMediaSeeded(db, context);
    const existingItems = await listManagedBusinessMedia(db, businessType, businessId);
    const nextSortOrder = existingItems.length;
    const buffer = await file.arrayBuffer();
    const fileName = sanitizeFilename(file.name.endsWith(".webp") ? file.name : `${file.name}.webp`);
    const storagePath = `${businessType}/${businessId}/${Date.now()}-${randomUUID()}-${fileName}`;

    const { error: storageError } = await db.storage.from(uploadBucket).upload(storagePath, buffer, {
      contentType: "image/webp",
      upsert: false
    });
    if (storageError) {
      return NextResponse.json({ message: storageError.message }, { status: 500 });
    }

    const publicUrl = db.storage.from(uploadBucket).getPublicUrl(storagePath).data.publicUrl;
    const captionEntry = formData.get("caption");
    const altTextEntry = formData.get("altText");
    const mediaPurposeEntry = formData.get("mediaPurpose");
    const caption = sanitizeText(typeof captionEntry === "string" ? captionEntry : "", 240);
    const altText = sanitizeText(
      typeof altTextEntry === "string" ? altTextEntry : context.businessName,
      240
    ) || context.businessName;
    const mediaPurposeRaw = typeof mediaPurposeEntry === "string" ? mediaPurposeEntry : "gallery";
    const validPurposes = new Set(["gallery","menu","logo","interior","exterior","food","cover"]);
    const mediaPurpose = validPurposes.has(mediaPurposeRaw) ? mediaPurposeRaw : "gallery";
    const width = Number.parseInt(String(formData.get("width") ?? ""), 10);
    const height = Number.parseInt(String(formData.get("height") ?? ""), 10);

    const { data: mediaAsset, error: assetError } = await db
      .from("media_assets")
      .insert({
        application_id: context.applicationId,
        partner_id: context.partnerId,
        property_id: context.businessType === "property" ? context.businessId : null,
        filename: fileName,
        path: publicUrl,
        storage_bucket: uploadBucket,
        storage_path: storagePath,
        category: nextSortOrder === 0 ? "Hero" : "Gallery",
        media_type: nextSortOrder === 0 ? "hero" : "gallery",
        file_type: "image/webp",
        width: Number.isFinite(width) ? width : null,
        height: Number.isFinite(height) ? height : null,
        alt_text: altText,
        caption,
        rights_status: "permission_confirmed",
        archived: false,
        sort_order: nextSortOrder,
        visibility: "public"
      })
      .select("id")
      .single();
    if (assetError) {
      await db.storage.from(uploadBucket).remove([storagePath]);
      return NextResponse.json({ message: assetError.message }, { status: 500 });
    }

    const { error: mediaError } = await db.from("business_media").insert({
      business_type: context.businessType,
      business_id: context.businessId,
      media_asset_id: mediaAsset.id,
      partner_id: context.partnerId,
      application_id: context.applicationId,
      caption,
      alt_text: altText,
      sort_order: nextSortOrder,
      is_cover: nextSortOrder === 0,
      is_featured: false,
      is_public: true,
      media_purpose: mediaPurpose
    });
    if (mediaError) {
      await db.from("media_assets").delete().eq("id", mediaAsset.id);
      await db.storage.from(uploadBucket).remove([storagePath]);
      return NextResponse.json({ message: mediaError.message }, { status: 500 });
    }

    await syncBusinessPrimaryImage(db, context);
    revalidateBusinessMediaPaths(context);

    const items = await listManagedBusinessMedia(db, businessType, businessId);
    const uploadedItem = items.find((item) => item.mediaAssetId === mediaAsset.id);
    return NextResponse.json({ item: uploadedItem });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Media upload failed." },
      { status: 500 }
    );
  }
}
