import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { windowCollectionsTable, windowsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { deleteWindowCollection } from '../handlers/delete_window_collection';

describe('deleteWindowCollection', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing window collection', async () => {
    // Create a test window collection
    const collectionResult = await db.insert(windowCollectionsTable)
      .values({
        name: 'Test Collection',
        description: 'A collection for testing',
        main_image_url: 'https://example.com/collection.jpg',
        brand_name: 'Test Brand'
      })
      .returning()
      .execute();

    const collectionId = collectionResult[0].id;

    // Delete the collection
    const result = await deleteWindowCollection(collectionId);

    // Should return true for successful deletion
    expect(result).toBe(true);

    // Verify collection is deleted from database
    const collections = await db.select()
      .from(windowCollectionsTable)
      .where(eq(windowCollectionsTable.id, collectionId))
      .execute();

    expect(collections).toHaveLength(0);
  });

  it('should delete window collection and cascade delete associated windows', async () => {
    // Create a test window collection
    const collectionResult = await db.insert(windowCollectionsTable)
      .values({
        name: 'Test Collection',
        description: 'A collection for testing',
        main_image_url: 'https://example.com/collection.jpg',
        brand_name: 'Test Brand'
      })
      .returning()
      .execute();

    const collectionId = collectionResult[0].id;

    // Create associated windows
    await db.insert(windowsTable)
      .values([
        {
          collection_id: collectionId,
          price: '299.99',
          description: 'Test Window 1',
          main_image_url: 'https://example.com/window1.jpg',
          gallery_image_urls: JSON.stringify(['https://example.com/gallery1.jpg'])
        },
        {
          collection_id: collectionId,
          price: '399.99',
          description: 'Test Window 2',
          main_image_url: 'https://example.com/window2.jpg',
          gallery_image_urls: JSON.stringify(['https://example.com/gallery2.jpg'])
        }
      ])
      .execute();

    // Verify windows exist before deletion
    const windowsBefore = await db.select()
      .from(windowsTable)
      .where(eq(windowsTable.collection_id, collectionId))
      .execute();

    expect(windowsBefore).toHaveLength(2);

    // Delete the collection
    const result = await deleteWindowCollection(collectionId);

    expect(result).toBe(true);

    // Verify collection is deleted
    const collections = await db.select()
      .from(windowCollectionsTable)
      .where(eq(windowCollectionsTable.id, collectionId))
      .execute();

    expect(collections).toHaveLength(0);

    // Verify associated windows are cascade deleted
    const windowsAfter = await db.select()
      .from(windowsTable)
      .where(eq(windowsTable.collection_id, collectionId))
      .execute();

    expect(windowsAfter).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent window collection', async () => {
    // Try to delete a collection that doesn't exist
    const result = await deleteWindowCollection(999);

    // Should return false for non-existent collection
    expect(result).toBe(false);
  });

  it('should handle deletion of collection with no associated windows', async () => {
    // Create a test window collection without any windows
    const collectionResult = await db.insert(windowCollectionsTable)
      .values({
        name: 'Empty Collection',
        description: 'A collection with no windows',
        main_image_url: 'https://example.com/empty.jpg',
        brand_name: 'Empty Brand'
      })
      .returning()
      .execute();

    const collectionId = collectionResult[0].id;

    // Delete the collection
    const result = await deleteWindowCollection(collectionId);

    expect(result).toBe(true);

    // Verify collection is deleted
    const collections = await db.select()
      .from(windowCollectionsTable)
      .where(eq(windowCollectionsTable.id, collectionId))
      .execute();

    expect(collections).toHaveLength(0);
  });

  it('should handle multiple deletions correctly', async () => {
    // Create multiple test collections
    const collectionsResult = await db.insert(windowCollectionsTable)
      .values([
        {
          name: 'Collection 1',
          description: 'First collection',
          main_image_url: 'https://example.com/col1.jpg',
          brand_name: 'Brand 1'
        },
        {
          name: 'Collection 2',
          description: 'Second collection',
          main_image_url: 'https://example.com/col2.jpg',
          brand_name: 'Brand 2'
        }
      ])
      .returning()
      .execute();

    const collection1Id = collectionsResult[0].id;
    const collection2Id = collectionsResult[1].id;

    // Delete first collection
    const result1 = await deleteWindowCollection(collection1Id);
    expect(result1).toBe(true);

    // Delete second collection
    const result2 = await deleteWindowCollection(collection2Id);
    expect(result2).toBe(true);

    // Try to delete first collection again
    const result3 = await deleteWindowCollection(collection1Id);
    expect(result3).toBe(false);

    // Verify both collections are deleted
    const remainingCollections = await db.select()
      .from(windowCollectionsTable)
      .execute();

    expect(remainingCollections).toHaveLength(0);
  });
});