import { db } from '../db';
import { windowCollectionsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteWindowCollection = async (id: number): Promise<boolean> => {
  try {
    // Delete the window collection - associated windows will be cascade deleted
    const result = await db.delete(windowCollectionsTable)
      .where(eq(windowCollectionsTable.id, id))
      .returning()
      .execute();

    // Return true if a record was deleted, false if no record was found
    return result.length > 0;
  } catch (error) {
    console.error('Window collection deletion failed:', error);
    throw error;
  }
};