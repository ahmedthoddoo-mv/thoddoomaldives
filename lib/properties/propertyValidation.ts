import type { AdminManagedProperty } from "@/data/adminContent";
import { normalizePropertySlug } from "@/lib/properties/propertySlug";

export type PropertyValidationResult = {
  valid: boolean;
  errors: string[];
};

export function validatePropertyForSave({
  property,
  existingProperties
}: {
  property: AdminManagedProperty;
  existingProperties: AdminManagedProperty[];
}): PropertyValidationResult {
  const errors: string[] = [];
  const normalizedSlug = normalizePropertySlug(property.slug);
  const duplicateSlug = existingProperties.some(
    (existingProperty) => existingProperty.id !== property.id && normalizePropertySlug(existingProperty.slug) === normalizedSlug
  );
  const hasContact = property.whatsapp.trim().length > 0 || property.email.trim().length > 0;
  const hasRoom = property.roomTypes.some((room) => room.name.trim().length > 0);
  const hasStartingPrice = property.roomTypes.some((room) => /\d/.test(room.price));

  if (!property.name.trim()) {
    errors.push("Property name is required.");
  }

  if (!normalizedSlug) {
    errors.push("A valid slug is required.");
  }

  if (duplicateSlug) {
    errors.push("Slug must be unique.");
  }

  if (!property.island.trim()) {
    errors.push("Island is required.");
  }

  if (!hasContact) {
    errors.push("Add a WhatsApp number or email address.");
  }

  if (!property.shortDescription.trim()) {
    errors.push("Short description is required.");
  }

  if (!hasRoom) {
    errors.push("Add at least one room.");
  }

  if (!hasStartingPrice) {
    errors.push("Add a starting price for at least one room.");
  }

  if (!property.coverImage.trim()) {
    errors.push("Hero image path is required.");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
