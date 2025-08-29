import { db } from '../db';
import { windowCollectionsTable } from '../db/schema';
import { type WindowCollection } from '../schema';

export const getWindowCollections = async (): Promise<WindowCollection[]> => {
  try {
    const results = await db.select()
      .from(windowCollectionsTable)
      .execute();

    // Return the results as-is since no numeric conversions are needed
    // All fields are text, serial, or timestamp types
    return results;
  } catch (error) {
    console.error('Failed to fetch window collections:', error);
    throw error;
  }
};