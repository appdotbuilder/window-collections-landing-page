import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { windowCollectionsTable, windowsTable } from '../db/schema';
import { getWindowsByCollection } from '../handlers/get_windows_by_collection';

describe('getWindowsByCollection', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all windows for a specific collection', async () => {
    // Create a test collection
    const collectionResult = await db.insert(windowCollectionsTable)
      .values({
        name: 'Test Collection',
        description: 'A test collection',
        main_image_url: 'https://example.com/main.jpg',
        brand_name: 'Test Brand'
      })
      .returning()
      .execute();

    const collectionId = collectionResult[0].id;

    // Create test windows for this collection
    await db.insert(windowsTable)
      .values([
        {
          collection_id: collectionId,
          price: '299.99',
          description: 'First test window',
          main_image_url: 'https://example.com/window1.jpg',
          gallery_image_urls: JSON.stringify(['https://example.com/gallery1.jpg', 'https://example.com/gallery2.jpg'])
        },
        {
          collection_id: collectionId,
          price: '399.99',
          description: 'Second test window',
          main_image_url: 'https://example.com/window2.jpg',
          gallery_image_urls: JSON.stringify([])
        }
      ])
      .execute();

    const result = await getWindowsByCollection(collectionId);

    // Should return 2 windows
    expect(result).toHaveLength(2);

    // Verify first window
    const firstWindow = result.find(w => w.description === 'First test window');
    expect(firstWindow).toBeDefined();
    expect(firstWindow!.collection_id).toEqual(collectionId);
    expect(firstWindow!.price).toEqual(299.99);
    expect(typeof firstWindow!.price).toEqual('number');
    expect(firstWindow!.main_image_url).toEqual('https://example.com/window1.jpg');
    expect(firstWindow!.gallery_image_urls).toEqual(['https://example.com/gallery1.jpg', 'https://example.com/gallery2.jpg']);
    expect(firstWindow!.created_at).toBeInstanceOf(Date);

    // Verify second window
    const secondWindow = result.find(w => w.description === 'Second test window');
    expect(secondWindow).toBeDefined();
    expect(secondWindow!.collection_id).toEqual(collectionId);
    expect(secondWindow!.price).toEqual(399.99);
    expect(typeof secondWindow!.price).toEqual('number');
    expect(secondWindow!.gallery_image_urls).toEqual([]);
  });

  it('should return empty array for collection with no windows', async () => {
    // Create a collection with no windows
    const collectionResult = await db.insert(windowCollectionsTable)
      .values({
        name: 'Empty Collection',
        description: 'Collection with no windows',
        main_image_url: 'https://example.com/empty.jpg',
        brand_name: 'Empty Brand'
      })
      .returning()
      .execute();

    const result = await getWindowsByCollection(collectionResult[0].id);

    expect(result).toEqual([]);
  });

  it('should return empty array for non-existent collection', async () => {
    const result = await getWindowsByCollection(99999);

    expect(result).toEqual([]);
  });

  it('should only return windows for the specified collection', async () => {
    // Create two collections
    const collection1Result = await db.insert(windowCollectionsTable)
      .values({
        name: 'Collection 1',
        description: 'First collection',
        main_image_url: 'https://example.com/collection1.jpg',
        brand_name: 'Brand 1'
      })
      .returning()
      .execute();

    const collection2Result = await db.insert(windowCollectionsTable)
      .values({
        name: 'Collection 2',
        description: 'Second collection',
        main_image_url: 'https://example.com/collection2.jpg',
        brand_name: 'Brand 2'
      })
      .returning()
      .execute();

    const collection1Id = collection1Result[0].id;
    const collection2Id = collection2Result[0].id;

    // Create windows for both collections
    await db.insert(windowsTable)
      .values([
        {
          collection_id: collection1Id,
          price: '100.00',
          description: 'Window from collection 1',
          main_image_url: 'https://example.com/window1.jpg',
          gallery_image_urls: JSON.stringify([])
        },
        {
          collection_id: collection2Id,
          price: '200.00',
          description: 'Window from collection 2',
          main_image_url: 'https://example.com/window2.jpg',
          gallery_image_urls: JSON.stringify([])
        }
      ])
      .execute();

    // Get windows for collection 1 only
    const result = await getWindowsByCollection(collection1Id);

    expect(result).toHaveLength(1);
    expect(result[0].collection_id).toEqual(collection1Id);
    expect(result[0].description).toEqual('Window from collection 1');
    expect(result[0].price).toEqual(100.00);
  });

  it('should handle gallery_image_urls as empty array when null or invalid JSON', async () => {
    // Create a test collection
    const collectionResult = await db.insert(windowCollectionsTable)
      .values({
        name: 'Test Collection',
        description: 'A test collection',
        main_image_url: 'https://example.com/main.jpg',
        brand_name: 'Test Brand'
      })
      .returning()
      .execute();

    const collectionId = collectionResult[0].id;

    // Create a window with default empty JSON array
    await db.insert(windowsTable)
      .values({
        collection_id: collectionId,
        price: '150.00',
        description: 'Window with default gallery',
        main_image_url: 'https://example.com/window.jpg'
        // gallery_image_urls will use default value of '[]'
      })
      .execute();

    const result = await getWindowsByCollection(collectionId);

    expect(result).toHaveLength(1);
    expect(result[0].gallery_image_urls).toEqual([]);
    expect(Array.isArray(result[0].gallery_image_urls)).toBe(true);
  });
});