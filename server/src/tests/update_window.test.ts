import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { windowsTable, windowCollectionsTable } from '../db/schema';
import { type UpdateWindowInput, type CreateWindowCollectionInput, type CreateWindowInput } from '../schema';
import { updateWindow } from '../handlers/update_window';
import { eq } from 'drizzle-orm';

describe('updateWindow', () => {
  let testCollectionId: number;
  let testWindowId: number;

  beforeEach(async () => {
    await createDB();
    
    // Create test collection first
    const collectionData: CreateWindowCollectionInput = {
      name: 'Test Collection',
      description: 'A collection for testing',
      main_image_url: 'https://example.com/collection.jpg',
      brand_name: 'Test Brand'
    };

    const collectionResult = await db.insert(windowCollectionsTable)
      .values(collectionData)
      .returning()
      .execute();
    
    testCollectionId = collectionResult[0].id;

    // Create test window
    const windowData: CreateWindowInput = {
      collection_id: testCollectionId,
      price: 299.99,
      description: 'Test window for updates',
      main_image_url: 'https://example.com/window.jpg',
      gallery_image_urls: ['https://example.com/gallery1.jpg', 'https://example.com/gallery2.jpg']
    };

    const windowResult = await db.insert(windowsTable)
      .values({
        ...windowData,
        price: windowData.price.toString(), // Convert for numeric column
      })
      .returning()
      .execute();
    
    testWindowId = windowResult[0].id;
  });

  afterEach(resetDB);

  it('should update window price', async () => {
    const updateData: UpdateWindowInput = {
      id: testWindowId,
      price: 399.99
    };

    const result = await updateWindow(updateData);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testWindowId);
    expect(result!.price).toEqual(399.99);
    expect(typeof result!.price).toBe('number');
    
    // Verify other fields remain unchanged
    expect(result!.description).toEqual('Test window for updates');
    expect(result!.main_image_url).toEqual('https://example.com/window.jpg');
    expect(result!.collection_id).toEqual(testCollectionId);
  });

  it('should update window description', async () => {
    const updateData: UpdateWindowInput = {
      id: testWindowId,
      description: 'Updated window description'
    };

    const result = await updateWindow(updateData);

    expect(result).not.toBeNull();
    expect(result!.description).toEqual('Updated window description');
    expect(result!.price).toEqual(299.99); // Price should remain unchanged
  });

  it('should update multiple fields', async () => {
    const updateData: UpdateWindowInput = {
      id: testWindowId,
      price: 449.99,
      description: 'Completely updated window',
      main_image_url: 'https://example.com/new-window.jpg'
    };

    const result = await updateWindow(updateData);

    expect(result).not.toBeNull();
    expect(result!.price).toEqual(449.99);
    expect(result!.description).toEqual('Completely updated window');
    expect(result!.main_image_url).toEqual('https://example.com/new-window.jpg');
    expect(result!.collection_id).toEqual(testCollectionId); // Should remain unchanged
  });

  it('should update gallery image URLs', async () => {
    const newGalleryUrls = [
      'https://example.com/new-gallery1.jpg',
      'https://example.com/new-gallery2.jpg',
      'https://example.com/new-gallery3.jpg'
    ];

    const updateData: UpdateWindowInput = {
      id: testWindowId,
      gallery_image_urls: newGalleryUrls
    };

    const result = await updateWindow(updateData);

    expect(result).not.toBeNull();
    expect(result!.gallery_image_urls).toEqual(newGalleryUrls);
    expect(Array.isArray(result!.gallery_image_urls)).toBe(true);
  });

  it('should update collection_id to valid collection', async () => {
    // Create another test collection
    const newCollectionData: CreateWindowCollectionInput = {
      name: 'Another Collection',
      description: 'Another test collection',
      main_image_url: 'https://example.com/collection2.jpg',
      brand_name: 'Another Brand'
    };

    const newCollectionResult = await db.insert(windowCollectionsTable)
      .values(newCollectionData)
      .returning()
      .execute();
    
    const newCollectionId = newCollectionResult[0].id;

    const updateData: UpdateWindowInput = {
      id: testWindowId,
      collection_id: newCollectionId
    };

    const result = await updateWindow(updateData);

    expect(result).not.toBeNull();
    expect(result!.collection_id).toEqual(newCollectionId);
  });

  it('should return null for non-existent window', async () => {
    const updateData: UpdateWindowInput = {
      id: 99999, // Non-existent window ID
      price: 199.99
    };

    const result = await updateWindow(updateData);

    expect(result).toBeNull();
  });

  it('should return null when no update fields provided', async () => {
    const updateData: UpdateWindowInput = {
      id: testWindowId
      // No update fields provided
    };

    const result = await updateWindow(updateData);

    expect(result).toBeNull();
  });

  it('should save updated window to database', async () => {
    const updateData: UpdateWindowInput = {
      id: testWindowId,
      price: 549.99,
      description: 'Database verification test'
    };

    await updateWindow(updateData);

    // Query database directly to verify changes
    const windows = await db.select()
      .from(windowsTable)
      .where(eq(windowsTable.id, testWindowId))
      .execute();

    expect(windows).toHaveLength(1);
    expect(parseFloat(windows[0].price)).toEqual(549.99);
    expect(windows[0].description).toEqual('Database verification test');
  });

  it('should handle empty gallery URLs array', async () => {
    const updateData: UpdateWindowInput = {
      id: testWindowId,
      gallery_image_urls: []
    };

    const result = await updateWindow(updateData);

    expect(result).not.toBeNull();
    expect(result!.gallery_image_urls).toEqual([]);
    expect(Array.isArray(result!.gallery_image_urls)).toBe(true);
  });

  it('should maintain data integrity after partial update', async () => {
    const updateData: UpdateWindowInput = {
      id: testWindowId,
      main_image_url: 'https://example.com/updated-main.jpg'
    };

    const result = await updateWindow(updateData);

    expect(result).not.toBeNull();
    
    // Verify updated field
    expect(result!.main_image_url).toEqual('https://example.com/updated-main.jpg');
    
    // Verify unchanged fields maintain their original values
    expect(result!.price).toEqual(299.99);
    expect(result!.description).toEqual('Test window for updates');
    expect(result!.collection_id).toEqual(testCollectionId);
    expect(result!.gallery_image_urls).toEqual(['https://example.com/gallery1.jpg', 'https://example.com/gallery2.jpg']);
    expect(result!.created_at).toBeInstanceOf(Date);
  });
});