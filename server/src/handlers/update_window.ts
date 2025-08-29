import { db } from '../db';
import { windowsTable } from '../db/schema';
import { type UpdateWindowInput, type Window } from '../schema';
import { eq } from 'drizzle-orm';

export const updateWindow = async (input: UpdateWindowInput): Promise<Window | null> => {
  try {
    // Extract id and other fields separately
    const { id, ...updateData } = input;

    // If no fields to update, return null
    if (Object.keys(updateData).length === 0) {
      return null;
    }

    // Build the update object, converting numeric fields
    const updateValues: any = {};
    
    if (updateData.collection_id !== undefined) {
      updateValues.collection_id = updateData.collection_id;
    }
    
    if (updateData.price !== undefined) {
      updateValues.price = updateData.price.toString(); // Convert number to string for numeric column
    }
    
    if (updateData.description !== undefined) {
      updateValues.description = updateData.description;
    }
    
    if (updateData.main_image_url !== undefined) {
      updateValues.main_image_url = updateData.main_image_url;
    }
    
    if (updateData.gallery_image_urls !== undefined) {
      updateValues.gallery_image_urls = updateData.gallery_image_urls;
    }

    // Update the window record
    const result = await db.update(windowsTable)
      .set(updateValues)
      .where(eq(windowsTable.id, id))
      .returning()
      .execute();

    // If no record was updated, return null
    if (result.length === 0) {
      return null;
    }

    // Convert numeric fields back to numbers before returning
    const window = result[0];
    return {
      ...window,
      price: parseFloat(window.price), // Convert string back to number
      gallery_image_urls: window.gallery_image_urls as string[] // Ensure proper type casting for jsonb field
    };
  } catch (error) {
    console.error('Window update failed:', error);
    throw error;
  }
};