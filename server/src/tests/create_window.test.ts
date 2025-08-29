import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { windowsTable, windowCollectionsTable } from '../db/schema';
import { type CreateWindowInput, type CreateWindowCollectionInput } from '../schema';
import { createWindow } from '../handlers/create_window';
import { eq } from 'drizzle-orm';

// Test collection data
const testCollection: CreateWindowCollectionInput = {
  name: 'Test Collection',
  description: 'A collection for testing',
  main_image_url: 'https://example.com/collection.jpg',
  brand_name: 'Test Brand'
};

// Test window data
const testWindowInput: CreateWindowInput = {
  collection_id: 1, // Will be updated after creating collection
  price: 299.99,
  description: 'A beautiful test window with great features',
  main_image_url: 'https://example.com/window.jpg',
  gallery_image_urls: [
    'https://example.com/gallery1.jpg',
    'https://example.com/gallery2.jpg'
  ]
};

describe('createWindow', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper function to create a test collection
  const createTestCollection = async (): Promise<number> => {
    const result = await db.insert(windowCollectionsTable)
      .values(testCollection)
      .returning()
      .execute();
    return result[0].id;
  };

  it('should create a window successfully', async () => {
    const collectionId = await createTestCollection();
    const input = { ...testWindowInput, collection_id: collectionId };
    
    const result = await createWindow(input);

    // Basic field validation
    expect(result.collection_id).toEqual(collectionId);
    expect(result.price).toEqual(299.99);
    expect(typeof result.price).toBe('number'); // Verify numeric conversion
    expect(result.description).toEqual('A beautiful test window with great features');
    expect(result.main_image_url).toEqual('https://example.com/window.jpg');
    expect(result.gallery_image_urls).toEqual([
      'https://example.com/gallery1.jpg',
      'https://example.com/gallery2.jpg'
    ]);
    expect(Array.isArray(result.gallery_image_urls)).toBe(true); // Verify array parsing
    expect(result.id).toBeDefined();
    expect(result.id).toBeGreaterThan(0);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save window to database correctly', async () => {
    const collectionId = await createTestCollection();
    const input = { ...testWindowInput, collection_id: collectionId };
    
    const result = await createWindow(input);

    // Query the database to verify the window was saved
    const windows = await db.select()
      .from(windowsTable)
      .where(eq(windowsTable.id, result.id))
      .execute();

    expect(windows).toHaveLength(1);
    const savedWindow = windows[0];
    expect(savedWindow.collection_id).toEqual(collectionId);
    expect(parseFloat(savedWindow.price)).toEqual(299.99); // Verify numeric storage
    expect(savedWindow.description).toEqual(input.description);
    expect(savedWindow.main_image_url).toEqual(input.main_image_url);
    expect(savedWindow.created_at).toBeInstanceOf(Date);
    
    // Verify gallery URLs are stored as JSON
    const parsedGalleryUrls = typeof savedWindow.gallery_image_urls === 'string'
      ? JSON.parse(savedWindow.gallery_image_urls)
      : savedWindow.gallery_image_urls;
    expect(parsedGalleryUrls).toEqual(input.gallery_image_urls);
  });

  it('should handle empty gallery URLs array', async () => {
    const collectionId = await createTestCollection();
    const input = {
      ...testWindowInput,
      collection_id: collectionId,
      gallery_image_urls: []
    };
    
    const result = await createWindow(input);

    expect(result.gallery_image_urls).toEqual([]);
    expect(Array.isArray(result.gallery_image_urls)).toBe(true);
    
    // Verify in database
    const windows = await db.select()
      .from(windowsTable)
      .where(eq(windowsTable.id, result.id))
      .execute();
    
    const savedWindow = windows[0];
    const parsedGalleryUrls = typeof savedWindow.gallery_image_urls === 'string'
      ? JSON.parse(savedWindow.gallery_image_urls)
      : savedWindow.gallery_image_urls;
    expect(parsedGalleryUrls).toEqual([]);
  });

  it('should handle single gallery URL', async () => {
    const collectionId = await createTestCollection();
    const input = {
      ...testWindowInput,
      collection_id: collectionId,
      gallery_image_urls: ['https://example.com/single.jpg']
    };
    
    const result = await createWindow(input);

    expect(result.gallery_image_urls).toEqual(['https://example.com/single.jpg']);
    expect(result.gallery_image_urls).toHaveLength(1);
  });

  it('should throw error for non-existent collection', async () => {
    const input = { ...testWindowInput, collection_id: 999 };
    
    await expect(createWindow(input)).rejects.toThrow(/collection with id 999 not found/i);
  });

  it('should handle very high precision prices correctly', async () => {
    const collectionId = await createTestCollection();
    const input = {
      ...testWindowInput,
      collection_id: collectionId,
      price: 1999.99
    };
    
    const result = await createWindow(input);

    expect(result.price).toEqual(1999.99);
    expect(typeof result.price).toBe('number');
    
    // Verify database storage and retrieval precision
    const windows = await db.select()
      .from(windowsTable)
      .where(eq(windowsTable.id, result.id))
      .execute();
    
    expect(parseFloat(windows[0].price)).toEqual(1999.99);
  });

  it('should create multiple windows for same collection', async () => {
    const collectionId = await createTestCollection();
    
    const input1 = { ...testWindowInput, collection_id: collectionId, description: 'Window 1' };
    const input2 = { ...testWindowInput, collection_id: collectionId, description: 'Window 2' };
    
    const result1 = await createWindow(input1);
    const result2 = await createWindow(input2);

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.collection_id).toEqual(collectionId);
    expect(result2.collection_id).toEqual(collectionId);
    expect(result1.description).toEqual('Window 1');
    expect(result2.description).toEqual('Window 2');
    
    // Verify both windows exist in database
    const windows = await db.select()
      .from(windowsTable)
      .where(eq(windowsTable.collection_id, collectionId))
      .execute();
    
    expect(windows).toHaveLength(2);
  });
});