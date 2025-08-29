import { db } from '../db';
import { windowsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type Window } from '../schema';

export const getWindowsByCollection = async (collectionId: number): Promise<Window[]> => {
  try {
    // Query windows for the specific collection
    const results = await db.select()
      .from(windowsTable)
      .where(eq(windowsTable.collection_id, collectionId))
      .execute();

    // Convert numeric fields back to numbers and handle gallery_image_urls
    return results.map(window => ({
      ...window,
      price: parseFloat(window.price), // Convert string back to number
      gallery_image_urls: Array.isArray(window.gallery_image_urls) 
        ? window.gallery_image_urls as string[]
        : []
    }));
  } catch (error) {
    console.error('Failed to get windows by collection:', error);
    throw error;
  }
};