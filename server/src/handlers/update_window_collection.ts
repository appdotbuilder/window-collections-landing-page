import { db } from '../db';
import { windowCollectionsTable } from '../db/schema';
import { type UpdateWindowCollectionInput, type WindowCollection } from '../schema';
import { eq } from 'drizzle-orm';

export const updateWindowCollection = async (input: UpdateWindowCollectionInput): Promise<WindowCollection | null> => {
  try {
    const { id, ...updateFields } = input;

    // Check if window collection exists
    const existingCollection = await db.select()
      .from(windowCollectionsTable)
      .where(eq(windowCollectionsTable.id, id))
      .execute();

    if (existingCollection.length === 0) {
      return null;
    }

    // Only update if there are fields to update (excluding id)
    if (Object.keys(updateFields).length === 0) {
      return existingCollection[0];
    }

    // Update the window collection
    const result = await db.update(windowCollectionsTable)
      .set(updateFields)
      .where(eq(windowCollectionsTable.id, id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Window collection update failed:', error);
    throw error;
  }
};