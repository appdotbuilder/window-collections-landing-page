import { db } from '../db';
import { windowCollectionsTable } from '../db/schema';
import { type CreateWindowCollectionInput, type WindowCollection } from '../schema';

export const createWindowCollection = async (input: CreateWindowCollectionInput): Promise<WindowCollection> => {
  try {
    // Insert window collection record
    const result = await db.insert(windowCollectionsTable)
      .values({
        name: input.name,
        description: input.description,
        main_image_url: input.main_image_url,
        brand_name: input.brand_name
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Window collection creation failed:', error);
    throw error;
  }
};