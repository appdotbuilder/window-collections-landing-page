import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { windowCollectionsTable } from '../db/schema';
import { type UpdateWindowCollectionInput, type CreateWindowCollectionInput } from '../schema';
import { updateWindowCollection } from '../handlers/update_window_collection';
import { eq } from 'drizzle-orm';

// Test input data
const createTestCollection: CreateWindowCollectionInput = {
  name: 'Test Collection',
  description: 'A collection for testing',
  main_image_url: 'https://example.com/image.jpg',
  brand_name: 'Test Brand'
};

const updateTestInput: UpdateWindowCollectionInput = {
  id: 1, // Will be updated after creating test collection
  name: 'Updated Collection Name',
  description: 'Updated description',
  main_image_url: 'https://example.com/updated-image.jpg',
  brand_name: 'Updated Brand'
};

describe('updateWindowCollection', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a window collection successfully', async () => {
    // Create a test collection first
    const created = await db.insert(windowCollectionsTable)
      .values(createTestCollection)
      .returning()
      .execute();

    const collectionId = created[0].id;
    const updateInput = { ...updateTestInput, id: collectionId };

    const result = await updateWindowCollection(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(collectionId);
    expect(result!.name).toEqual('Updated Collection Name');
    expect(result!.description).toEqual('Updated description');
    expect(result!.main_image_url).toEqual('https://example.com/updated-image.jpg');
    expect(result!.brand_name).toEqual('Updated Brand');
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should update only specified fields', async () => {
    // Create a test collection first
    const created = await db.insert(windowCollectionsTable)
      .values(createTestCollection)
      .returning()
      .execute();

    const collectionId = created[0].id;
    const partialUpdate: UpdateWindowCollectionInput = {
      id: collectionId,
      name: 'Partially Updated Name'
    };

    const result = await updateWindowCollection(partialUpdate);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(collectionId);
    expect(result!.name).toEqual('Partially Updated Name');
    expect(result!.description).toEqual(createTestCollection.description); // Should remain unchanged
    expect(result!.main_image_url).toEqual(createTestCollection.main_image_url); // Should remain unchanged
    expect(result!.brand_name).toEqual(createTestCollection.brand_name); // Should remain unchanged
  });

  it('should save updated data to database', async () => {
    // Create a test collection first
    const created = await db.insert(windowCollectionsTable)
      .values(createTestCollection)
      .returning()
      .execute();

    const collectionId = created[0].id;
    const updateInput = { ...updateTestInput, id: collectionId };

    await updateWindowCollection(updateInput);

    // Verify the data was saved to database
    const collections = await db.select()
      .from(windowCollectionsTable)
      .where(eq(windowCollectionsTable.id, collectionId))
      .execute();

    expect(collections).toHaveLength(1);
    expect(collections[0].name).toEqual('Updated Collection Name');
    expect(collections[0].description).toEqual('Updated description');
    expect(collections[0].main_image_url).toEqual('https://example.com/updated-image.jpg');
    expect(collections[0].brand_name).toEqual('Updated Brand');
  });

  it('should return null for non-existent window collection', async () => {
    const nonExistentUpdate: UpdateWindowCollectionInput = {
      id: 999, // Non-existent ID
      name: 'Updated Name'
    };

    const result = await updateWindowCollection(nonExistentUpdate);

    expect(result).toBeNull();
  });

  it('should return existing collection when no update fields provided', async () => {
    // Create a test collection first
    const created = await db.insert(windowCollectionsTable)
      .values(createTestCollection)
      .returning()
      .execute();

    const collectionId = created[0].id;
    const emptyUpdate: UpdateWindowCollectionInput = {
      id: collectionId
    };

    const result = await updateWindowCollection(emptyUpdate);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(collectionId);
    expect(result!.name).toEqual(createTestCollection.name);
    expect(result!.description).toEqual(createTestCollection.description);
    expect(result!.main_image_url).toEqual(createTestCollection.main_image_url);
    expect(result!.brand_name).toEqual(createTestCollection.brand_name);
  });

  it('should handle multiple field updates correctly', async () => {
    // Create a test collection first
    const created = await db.insert(windowCollectionsTable)
      .values(createTestCollection)
      .returning()
      .execute();

    const collectionId = created[0].id;
    
    // First update
    const firstUpdate: UpdateWindowCollectionInput = {
      id: collectionId,
      name: 'First Update',
      description: 'First description update'
    };

    await updateWindowCollection(firstUpdate);

    // Second update
    const secondUpdate: UpdateWindowCollectionInput = {
      id: collectionId,
      brand_name: 'Second Brand Update',
      main_image_url: 'https://example.com/second-update.jpg'
    };

    const result = await updateWindowCollection(secondUpdate);

    expect(result).not.toBeNull();
    expect(result!.name).toEqual('First Update'); // Should remain from first update
    expect(result!.description).toEqual('First description update'); // Should remain from first update
    expect(result!.brand_name).toEqual('Second Brand Update'); // Updated in second update
    expect(result!.main_image_url).toEqual('https://example.com/second-update.jpg'); // Updated in second update
  });
});