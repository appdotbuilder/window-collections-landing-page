import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { windowCollectionsTable } from '../db/schema';
import { type CreateWindowCollectionInput } from '../schema';
import { createWindowCollection } from '../handlers/create_window_collection';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateWindowCollectionInput = {
  name: 'Premium Collection',
  description: 'A premium line of energy-efficient windows',
  main_image_url: 'https://example.com/collection-main.jpg',
  brand_name: 'WindowTech Pro'
};

describe('createWindowCollection', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a window collection', async () => {
    const result = await createWindowCollection(testInput);

    // Basic field validation
    expect(result.name).toEqual('Premium Collection');
    expect(result.description).toEqual(testInput.description);
    expect(result.main_image_url).toEqual(testInput.main_image_url);
    expect(result.brand_name).toEqual('WindowTech Pro');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.id).toBeGreaterThan(0);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save window collection to database', async () => {
    const result = await createWindowCollection(testInput);

    // Query using proper drizzle syntax
    const collections = await db.select()
      .from(windowCollectionsTable)
      .where(eq(windowCollectionsTable.id, result.id))
      .execute();

    expect(collections).toHaveLength(1);
    expect(collections[0].name).toEqual('Premium Collection');
    expect(collections[0].description).toEqual(testInput.description);
    expect(collections[0].main_image_url).toEqual(testInput.main_image_url);
    expect(collections[0].brand_name).toEqual('WindowTech Pro');
    expect(collections[0].created_at).toBeInstanceOf(Date);
  });

  it('should create multiple unique collections', async () => {
    const input1 = { ...testInput, name: 'Collection One' };
    const input2 = { ...testInput, name: 'Collection Two', brand_name: 'Different Brand' };

    const result1 = await createWindowCollection(input1);
    const result2 = await createWindowCollection(input2);

    // Verify different IDs
    expect(result1.id).not.toEqual(result2.id);
    expect(result1.name).toEqual('Collection One');
    expect(result2.name).toEqual('Collection Two');
    expect(result2.brand_name).toEqual('Different Brand');

    // Verify both are in database
    const allCollections = await db.select()
      .from(windowCollectionsTable)
      .execute();

    expect(allCollections).toHaveLength(2);
    expect(allCollections.map(c => c.name)).toContain('Collection One');
    expect(allCollections.map(c => c.name)).toContain('Collection Two');
  });

  it('should handle special characters in fields', async () => {
    const specialInput: CreateWindowCollectionInput = {
      name: 'Collection with "Quotes" & Symbols',
      description: 'Description with émojis 🪟 and special chars: @#$%',
      main_image_url: 'https://example.com/image-with-dashes_and_underscores.jpg',
      brand_name: "Brand's Name with Apostrophe"
    };

    const result = await createWindowCollection(specialInput);

    expect(result.name).toEqual('Collection with "Quotes" & Symbols');
    expect(result.description).toEqual('Description with émojis 🪟 and special chars: @#$%');
    expect(result.brand_name).toEqual("Brand's Name with Apostrophe");

    // Verify in database
    const saved = await db.select()
      .from(windowCollectionsTable)
      .where(eq(windowCollectionsTable.id, result.id))
      .execute();

    expect(saved[0].name).toEqual(specialInput.name);
    expect(saved[0].description).toEqual(specialInput.description);
    expect(saved[0].brand_name).toEqual(specialInput.brand_name);
  });

  it('should set created_at timestamp correctly', async () => {
    const beforeCreate = new Date();
    const result = await createWindowCollection(testInput);
    const afterCreate = new Date();

    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterCreate.getTime());

    // Verify timestamp persists in database
    const saved = await db.select()
      .from(windowCollectionsTable)
      .where(eq(windowCollectionsTable.id, result.id))
      .execute();

    expect(saved[0].created_at).toBeInstanceOf(Date);
    expect(saved[0].created_at.getTime()).toEqual(result.created_at.getTime());
  });
});