import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { windowsTable, windowCollectionsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { deleteWindow } from '../handlers/delete_window';

describe('deleteWindow', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a window successfully', async () => {
    // Create prerequisite window collection
    const collectionResult = await db.insert(windowCollectionsTable)
      .values({
        name: 'Test Collection',
        description: 'A collection for testing',
        main_image_url: 'https://example.com/image.jpg',
        brand_name: 'Test Brand'
      })
      .returning()
      .execute();

    const collectionId = collectionResult[0].id;

    // Create a test window
    const windowResult = await db.insert(windowsTable)
      .values({
        collection_id: collectionId,
        price: '199.99',
        description: 'Test window',
        main_image_url: 'https://example.com/window.jpg',
        gallery_image_urls: '["https://example.com/gallery1.jpg"]'
      })
      .returning()
      .execute();

    const windowId = windowResult[0].id;

    // Delete the window
    const result = await deleteWindow(windowId);

    // Should return true for successful deletion
    expect(result).toBe(true);

    // Verify window is deleted from database
    const windows = await db.select()
      .from(windowsTable)
      .where(eq(windowsTable.id, windowId))
      .execute();

    expect(windows).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent window', async () => {
    // Try to delete a window with ID that doesn't exist
    const result = await deleteWindow(999999);

    // Should return false for non-existent window
    expect(result).toBe(false);
  });

  it('should not affect other windows when deleting one window', async () => {
    // Create prerequisite window collection
    const collectionResult = await db.insert(windowCollectionsTable)
      .values({
        name: 'Test Collection',
        description: 'A collection for testing',
        main_image_url: 'https://example.com/image.jpg',
        brand_name: 'Test Brand'
      })
      .returning()
      .execute();

    const collectionId = collectionResult[0].id;

    // Create two test windows
    const window1Result = await db.insert(windowsTable)
      .values({
        collection_id: collectionId,
        price: '199.99',
        description: 'First test window',
        main_image_url: 'https://example.com/window1.jpg',
        gallery_image_urls: '[]'
      })
      .returning()
      .execute();

    const window2Result = await db.insert(windowsTable)
      .values({
        collection_id: collectionId,
        price: '299.99',
        description: 'Second test window',
        main_image_url: 'https://example.com/window2.jpg',
        gallery_image_urls: '[]'
      })
      .returning()
      .execute();

    const window1Id = window1Result[0].id;
    const window2Id = window2Result[0].id;

    // Delete the first window
    const result = await deleteWindow(window1Id);

    // Should return true for successful deletion
    expect(result).toBe(true);

    // Verify first window is deleted
    const deletedWindows = await db.select()
      .from(windowsTable)
      .where(eq(windowsTable.id, window1Id))
      .execute();

    expect(deletedWindows).toHaveLength(0);

    // Verify second window still exists
    const remainingWindows = await db.select()
      .from(windowsTable)
      .where(eq(windowsTable.id, window2Id))
      .execute();

    expect(remainingWindows).toHaveLength(1);
    expect(remainingWindows[0].description).toBe('Second test window');
  });

  it('should handle deletion of window with complex gallery data', async () => {
    // Create prerequisite window collection
    const collectionResult = await db.insert(windowCollectionsTable)
      .values({
        name: 'Gallery Collection',
        description: 'Collection with gallery windows',
        main_image_url: 'https://example.com/collection.jpg',
        brand_name: 'Gallery Brand'
      })
      .returning()
      .execute();

    const collectionId = collectionResult[0].id;

    // Create window with multiple gallery images
    const windowResult = await db.insert(windowsTable)
      .values({
        collection_id: collectionId,
        price: '1599.99',
        description: 'Premium window with gallery',
        main_image_url: 'https://example.com/premium.jpg',
        gallery_image_urls: JSON.stringify([
          'https://example.com/gallery1.jpg',
          'https://example.com/gallery2.jpg',
          'https://example.com/gallery3.jpg'
        ])
      })
      .returning()
      .execute();

    const windowId = windowResult[0].id;

    // Delete the window with complex gallery data
    const result = await deleteWindow(windowId);

    // Should return true for successful deletion
    expect(result).toBe(true);

    // Verify window is completely removed from database
    const windows = await db.select()
      .from(windowsTable)
      .where(eq(windowsTable.id, windowId))
      .execute();

    expect(windows).toHaveLength(0);
  });
});