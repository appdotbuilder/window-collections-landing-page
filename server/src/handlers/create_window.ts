import { db } from '../db';
import { windowsTable, windowCollectionsTable } from '../db/schema';
import { type CreateWindowInput, type Window } from '../schema';
import { eq } from 'drizzle-orm';

export const createWindow = async (input: CreateWindowInput): Promise<Window> => {
  try {
    // Verify that the collection exists first to prevent foreign key constraint errors
    const existingCollection = await db.select()
      .from(windowCollectionsTable)
      .where(eq(windowCollectionsTable.id, input.collection_id))
      .limit(1)
      .execute();

    if (existingCollection.length === 0) {
      throw new Error(`Window collection with id ${input.collection_id} not found`);
    }

    // Insert window record
    const result = await db.insert(windowsTable)
      .values({
        collection_id: input.collection_id,
        price: input.price.toString(), // Convert number to string for numeric column
        description: input.description,
        main_image_url: input.main_image_url,
        gallery_image_urls: JSON.stringify(input.gallery_image_urls) // Convert array to JSON string
      })
      .returning()
      .execute();

    // Convert numeric and JSON fields back to proper types before returning
    const window = result[0];
    return {
      ...window,
      price: parseFloat(window.price), // Convert string back to number
      gallery_image_urls: typeof window.gallery_image_urls === 'string' 
        ? JSON.parse(window.gallery_image_urls) 
        : window.gallery_image_urls as string[] // Handle case where it's already parsed
    };
  } catch (error) {
    console.error('Window creation failed:', error);
    throw error;
  }
};