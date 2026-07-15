"use client";

import { useEffect, useState } from "react";
import type { AdminManagedProperty } from "@/data/adminContent";
import { adminPropertyToGuesthouse } from "@/lib/properties/propertyDomain";
import { PropertyRepository } from "@/lib/repositories";
import type { Guesthouse } from "@/types/guesthouse";

export { adminPropertyToGuesthouse } from "@/lib/properties/propertyDomain";

const STORAGE_KEY = "ithoddoo.demo.properties.v1";
const STORE_EVENT = "ithoddoo:properties-changed";

function isBrowser() {
  return typeof window !== "undefined";
}

function emitStoreChange() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(STORE_EVENT));
}

function readStoredProperties(): AdminManagedProperty[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed.filter(isPropertyLike) : [];
  } catch {
    return [];
  }
}

function writeStoredProperties(properties: AdminManagedProperty[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dedupeProperties(properties)));
  emitStoreChange();
}

function isPropertyLike(value: unknown): value is AdminManagedProperty {
  if (!value || typeof value !== "object") {
    return false;
  }

  const property = value as Partial<AdminManagedProperty>;
  return Boolean(property.id && property.slug && property.name && Array.isArray(property.roomTypes));
}

function dedupeProperties(properties: AdminManagedProperty[]) {
  const byId = new Map<string, AdminManagedProperty>();
  const slugOwner = new Map<string, string>();

  properties.forEach((property) => {
    const slug = property.slug.toLowerCase();
    const existingSlugOwner = slugOwner.get(slug);

    if (existingSlugOwner && existingSlugOwner !== property.id) {
      return;
    }

    byId.set(property.id, property);
    slugOwner.set(slug, property.id);
  });

  return Array.from(byId.values());
}

function mergeProperties(defaultProperties: AdminManagedProperty[], storedProperties: AdminManagedProperty[]) {
  return dedupeProperties([...defaultProperties, ...storedProperties]);
}

function createLogo(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "IT";
}

export function getDefaultAdminProperties() {
  return PropertyRepository.findAll();
}

export function getAdminProperties() {
  return mergeProperties(getDefaultAdminProperties(), readStoredProperties());
}

export function getAdminPropertyById(id: string) {
  return getAdminProperties().find((property) => property.id === id);
}

export function getPublicStayProperties() {
  const publicGuesthouses = PropertyRepository.findPublicAll();
  const adminGuesthouses = getAdminProperties()
    .filter((property) => property.isPublished && !property.isArchived && property.verificationStatus === "Verified")
    .map(adminPropertyToGuesthouse);
  const bySlug = new Map<string, Guesthouse>();

  publicGuesthouses.forEach((guesthouse) => bySlug.set(guesthouse.slug, guesthouse));
  adminGuesthouses.forEach((guesthouse) => bySlug.set(guesthouse.slug, guesthouse));

  return Array.from(bySlug.values());
}

export function getPublicStayPropertyBySlug(slug: string) {
  return getPublicStayProperties().find((property) => property.slug === slug);
}

export function getPreviewPropertyBySlug(slug: string) {
  const property = getAdminProperties().find((item) => item.slug === slug || item.id === slug);
  return property ? adminPropertyToGuesthouse(property) : undefined;
}

export function saveAdminProperty(property: AdminManagedProperty) {
  const storedProperties = readStoredProperties();
  const nextProperty = {
    ...property,
    logo: property.logo || createLogo(property.name),
    updated: "Just now"
  };
  const existingIndex = storedProperties.findIndex((storedProperty) => storedProperty.id === nextProperty.id);
  const nextStoredProperties =
    existingIndex >= 0
      ? storedProperties.map((storedProperty) => (storedProperty.id === nextProperty.id ? nextProperty : storedProperty))
      : [...storedProperties, nextProperty];

  writeStoredProperties(nextStoredProperties);
  return nextProperty;
}

export function createAdminProperty(property: AdminManagedProperty) {
  return saveAdminProperty(property);
}

export function updateAdminProperty(id: string, updates: Partial<AdminManagedProperty>) {
  const property = getAdminPropertyById(id);

  if (!property) {
    return undefined;
  }

  return saveAdminProperty({ ...property, ...updates });
}

export function publishAdminProperty(id: string) {
  return updateAdminProperty(id, { isPublished: true });
}

export function unpublishAdminProperty(id: string) {
  return updateAdminProperty(id, { isPublished: false });
}

export function verifyAdminProperty(id: string) {
  return updateAdminProperty(id, { verificationStatus: "Verified" });
}

export function featureAdminProperty(id: string, featured = true) {
  return updateAdminProperty(id, { isFeatured: featured });
}

export function archiveAdminProperty(id: string, archived = true) {
  return updateAdminProperty(id, { isArchived: archived, isPublished: false });
}

export function suspendAdminProperty(id: string) {
  return updateAdminProperty(id, { verificationStatus: "Suspended", isPublished: false });
}

export function deleteDemoProperty(id: string) {
  const storedProperties = readStoredProperties();
  const storedProperty = storedProperties.find((property) => property.id === id);

  if (!storedProperty) {
    return archiveAdminProperty(id, true);
  }

  writeStoredProperties(storedProperties.filter((property) => property.id !== id));
  return storedProperty;
}

export function resetDemoProperties() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
  emitStoreChange();
}

export function subscribeToPropertyStore(callback: () => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  window.addEventListener(STORE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(STORE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useAdminProperties() {
  const [properties, setProperties] = useState<AdminManagedProperty[]>(() => getDefaultAdminProperties());

  useEffect(() => {
    setProperties(getAdminProperties());
    return subscribeToPropertyStore(() => setProperties(getAdminProperties()));
  }, []);

  return properties;
}

export function usePublicStayProperties() {
  const [properties, setProperties] = useState<Guesthouse[]>(() => PropertyRepository.findPublicAll());

  useEffect(() => {
    setProperties(getPublicStayProperties());
    return subscribeToPropertyStore(() => setProperties(getPublicStayProperties()));
  }, []);

  return properties;
}
