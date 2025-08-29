import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { windowCollectionsTable } from '../db/schema';
import { type CreateWindowCollectionInput } from '../schema';
import { getWindowCollections } from '../handlers/get_window_collections';

// Test data for window collections
const testCollection1: CreateWindowCollectionInput = {
  name: 'Modern Windows Collection',
  description: 'Contemporary window designs for modern homes',
  main_image_url: 'https://example.com/modern-windows.jpg',
  brand_name: 'ModernCorp'
};

const testCollection2: CreateWindowCollectionInput = {
  name: 'Classic Windows Collection',
  description: 'Traditional window styles with timeless appeal',
  main_image_url: 'https://example.com/classic-windows.jpg',
  brand_name: 'ClassicWindows'
};

describe('getWindowCollections', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no collections exist', async () => {
    const result = await getWindowCollections();

    expect(result).toEqual([]);
  });

  it('should return all window collections', async () => {
    // Create test collections
    await db.insert(windowCollectionsTable)
      .values([testCollection1, testCollection2])
      .execute();

    const result = await getWindowCollections();

    expect(result).toHaveLength(2);
    
    // Find collections by name to avoid order dependencies
    const modernCollection = result.find(c => c.name === 'Modern Windows Collection');
    const classicCollection = result.find(c => c.name === 'Classic Windows Collection');

    expect(modernCollection).toBeDefined();
    expect(modernCollection!.description).toEqual(testCollection1.description);
    expect(modernCollection!.main_image_url).toEqual(testCollection1.main_image_url);
    expect(modernCollection!.brand_name).toEqual(testCollection1.brand_name);
    expect(modernCollection!.id).toBeDefined();
    expect(modernCollection!.created_at).toBeInstanceOf(Date);

    expect(classicCollection).toBeDefined();
    expect(classicCollection!.description).toEqual(testCollection2.description);
    expect(classicCollection!.main_image_url).toEqual(testCollection2.main_image_url);
    expect(classicCollection!.brand_name).toEqual(testCollection2.brand_name);
    expect(classicCollection!.id).toBeDefined();
    expect(classicCollection!.created_at).toBeInstanceOf(Date);
  });

  it('should return collections with correct field types', async () => {
    await db.insert(windowCollectionsTable)
      .values(testCollection1)
      .execute();

    const result = await getWindowCollections();

    expect(result).toHaveLength(1);
    const collection = result[0];

    // Verify all field types
    expect(typeof collection.id).toBe('number');
    expect(typeof collection.name).toBe('string');
    expect(typeof collection.description).toBe('string');
    expect(typeof collection.main_image_url).toBe('string');
    expect(typeof collection.brand_name).toBe('string');
    expect(collection.created_at).toBeInstanceOf(Date);
  });

  it('should return collections ordered by creation (database default)', async () => {
    // Insert collections with slight delay to ensure different timestamps
    await db.insert(windowCollectionsTable)
      .values(testCollection1)
      .execute();
    
    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await db.insert(windowCollectionsTable)
      .values(testCollection2)
      .execute();

    const result = await getWindowCollections();

    expect(result).toHaveLength(2);
    // First collection should be created first (assuming database default ordering)
    expect(result[0].name).toEqual('Modern Windows Collection');
    expect(result[1].name).toEqual('Classic Windows Collection');
    expect(result[0].created_at.getTime()).toBeLessThanOrEqual(result[1].created_at.getTime());
  });
});