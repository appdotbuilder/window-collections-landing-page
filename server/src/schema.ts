import { z } from 'zod';

// Window schema
export const windowSchema = z.object({
  id: z.number(),
  collection_id: z.number(),
  price: z.number().positive(),
  description: z.string(),
  main_image_url: z.string().url(),
  gallery_image_urls: z.array(z.string().url()),
  created_at: z.coerce.date()
});

export type Window = z.infer<typeof windowSchema>;

// Window Collection schema
export const windowCollectionSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  main_image_url: z.string().url(),
  brand_name: z.string(),
  created_at: z.coerce.date()
});

export type WindowCollection = z.infer<typeof windowCollectionSchema>;

// Input schema for creating window collections
export const createWindowCollectionInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  main_image_url: z.string().url("Must be a valid URL"),
  brand_name: z.string().min(1, "Brand name is required")
});

export type CreateWindowCollectionInput = z.infer<typeof createWindowCollectionInputSchema>;

// Input schema for updating window collections
export const updateWindowCollectionInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  main_image_url: z.string().url("Must be a valid URL").optional(),
  brand_name: z.string().min(1, "Brand name is required").optional()
});

export type UpdateWindowCollectionInput = z.infer<typeof updateWindowCollectionInputSchema>;

// Input schema for creating windows
export const createWindowInputSchema = z.object({
  collection_id: z.number(),
  price: z.number().positive("Price must be positive"),
  description: z.string().min(1, "Description is required"),
  main_image_url: z.string().url("Must be a valid URL"),
  gallery_image_urls: z.array(z.string().url("Must be a valid URL")).default([])
});

export type CreateWindowInput = z.infer<typeof createWindowInputSchema>;

// Input schema for updating windows
export const updateWindowInputSchema = z.object({
  id: z.number(),
  collection_id: z.number().optional(),
  price: z.number().positive("Price must be positive").optional(),
  description: z.string().min(1, "Description is required").optional(),
  main_image_url: z.string().url("Must be a valid URL").optional(),
  gallery_image_urls: z.array(z.string().url("Must be a valid URL")).optional()
});

export type UpdateWindowInput = z.infer<typeof updateWindowInputSchema>;

// Extended window collection with windows
export const windowCollectionWithWindowsSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  main_image_url: z.string().url(),
  brand_name: z.string(),
  created_at: z.coerce.date(),
  windows: z.array(windowSchema)
});

export type WindowCollectionWithWindows = z.infer<typeof windowCollectionWithWindowsSchema>;