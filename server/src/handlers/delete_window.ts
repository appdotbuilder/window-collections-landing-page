import { db } from '../db';
import { windowsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteWindow = async (id: number): Promise<boolean> => {
  try {
    // Delete window record by ID
    const result = await db.delete(windowsTable)
      .where(eq(windowsTable.id, id))
      .execute();

    // Return true if a record was deleted (rowCount > 0)
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Window deletion failed:', error);
    throw error;
  }
};