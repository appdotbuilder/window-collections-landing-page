import { db } from '../db';
import { windowCollectionsTable, windowsTable } from '../db/schema';
import { type WindowCollectionWithWindows } from '../schema';
import { eq } from 'drizzle-orm';

export const getWindowCollectionById = async (id: number): Promise<WindowCollectionWithWindows | null> => {
  try {
    // Get window collection with its windows using a join
    const results = await db.select()
      .from(windowCollectionsTable)
      .leftJoin(windowsTable, eq(windowsTable.collection_id, windowCollectionsTable.id))
      .where(eq(windowCollectionsTable.id, id))
      .execute();

    if (results.length === 0) {
      return null;
    }

    // Extract collection data from first result (all rows have same collection data)
    const collectionData = results[0].window_collections;

    // Extract and process windows data from all results
    const windows = results
      .filter(result => result.windows !== null) // Filter out null windows from left join
      .map(result => ({
        ...result.windows!,
        price: parseFloat(result.windows!.price), // Convert numeric to number
        gallery_image_urls: result.windows!.gallery_image_urls as string[] // Type assertion for jsonb
      }));

    // Return collection with windows
    return {
      ...collectionData,
      windows
    };
  } catch (error) {
    console.error('Get window collection by ID failed:', error);
    throw error;
  }
};