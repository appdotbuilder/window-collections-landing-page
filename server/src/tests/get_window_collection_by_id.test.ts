import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { windowCollectionsTable, windowsTable } from '../db/schema';
import { getWindowCollectionById } from '../handlers/get_window_collection_by_id';

describe('getWindowCollectionById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null for non-existent collection', async () => {
    const result = await getWindowCollectionById(999);
    expect(result).toBeNull();
  });

  it('should return collection with no windows', async () => {
    // Create a window collection without any windows
    const [collection] = await db.insert(windowCollectionsTable)
      .values({
        name: 'Empty Collection',
        description: 'Collection with no windows',
        main_image_url: 'https://example.com/collection.jpg',
        brand_name: 'Test Brand'
      })
      .returning()
      .execute();

    const result = await getWindowCollectionById(collection.id);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(collection.id);
    expect(result!.name).toEqual('Empty Collection');
    expect(result!.description).toEqual('Collection with no windows');
    expect(result!.main_image_url).toEqual('https://example.com/collection.jpg');
    expect(result!.brand_name).toEqual('Test Brand');
    expect(result!.windows).toEqual([]);
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should return collection with single window', async () => {
    // Create window collection
    const [collection] = await db.insert(windowCollectionsTable)
      .values({
        name: 'Single Window Collection',
        description: 'Collection with one window',
        main_image_url: 'https://example.com/collection.jpg',
        brand_name: 'Test Brand'
      })
      .returning()
      .execute();

    // Create window in the collection
    await db.insert(windowsTable)
      .values({
        collection_id: collection.id,
        price: '299.99',
        description: 'Single pane window',
        main_image_url: 'https://example.com/window.jpg',
        gallery_image_urls: JSON.stringify(['https://example.com/gallery1.jpg'])
      })
      .execute();

    const result = await getWindowCollectionById(collection.id);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(collection.id);
    expect(result!.name).toEqual('Single Window Collection');
    expect(result!.windows).toHaveLength(1);

    const window = result!.windows[0];
    expect(window.collection_id).toEqual(collection.id);
    expect(window.price).toEqual(299.99);
    expect(typeof window.price).toEqual('number');
    expect(window.description).toEqual('Single pane window');
    expect(window.main_image_url).toEqual('https://example.com/window.jpg');
    expect(window.gallery_image_urls).toEqual(['https://example.com/gallery1.jpg']);
    expect(window.created_at).toBeInstanceOf(Date);
  });

  it('should return collection with multiple windows', async () => {
    // Create window collection
    const [collection] = await db.insert(windowCollectionsTable)
      .values({
        name: 'Multi Window Collection',
        description: 'Collection with multiple windows',
        main_image_url: 'https://example.com/collection.jpg',
        brand_name: 'Multi Brand'
      })
      .returning()
      .execute();

    // Create multiple windows in the collection
    await db.insert(windowsTable)
      .values([
        {
          collection_id: collection.id,
          price: '199.99',
          description: 'Basic window',
          main_image_url: 'https://example.com/window1.jpg',
          gallery_image_urls: JSON.stringify([])
        },
        {
          collection_id: collection.id,
          price: '399.99',
          description: 'Premium window',
          main_image_url: 'https://example.com/window2.jpg',
          gallery_image_urls: JSON.stringify([
            'https://example.com/gallery1.jpg',
            'https://example.com/gallery2.jpg'
          ])
        },
        {
          collection_id: collection.id,
          price: '599.99',
          description: 'Luxury window',
          main_image_url: 'https://example.com/window3.jpg',
          gallery_image_urls: JSON.stringify(['https://example.com/luxury.jpg'])
        }
      ])
      .execute();

    const result = await getWindowCollectionById(collection.id);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(collection.id);
    expect(result!.name).toEqual('Multi Window Collection');
    expect(result!.windows).toHaveLength(3);

    // Verify all windows have correct types and data
    result!.windows.forEach(window => {
      expect(window.collection_id).toEqual(collection.id);
      expect(typeof window.price).toEqual('number');
      expect(window.price).toBeGreaterThan(0);
      expect(window.description).toBeDefined();
      expect(window.main_image_url).toMatch(/^https:/);
      expect(Array.isArray(window.gallery_image_urls)).toBe(true);
      expect(window.created_at).toBeInstanceOf(Date);
    });

    // Verify specific window details
    const basicWindow = result!.windows.find(w => w.description === 'Basic window');
    expect(basicWindow!.price).toEqual(199.99);
    expect(basicWindow!.gallery_image_urls).toEqual([]);

    const premiumWindow = result!.windows.find(w => w.description === 'Premium window');
    expect(premiumWindow!.price).toEqual(399.99);
    expect(premiumWindow!.gallery_image_urls).toHaveLength(2);

    const luxuryWindow = result!.windows.find(w => w.description === 'Luxury window');
    expect(luxuryWindow!.price).toEqual(599.99);
    expect(luxuryWindow!.gallery_image_urls).toEqual(['https://example.com/luxury.jpg']);
  });

  it('should handle collections with complex gallery arrays correctly', async () => {
    // Create window collection
    const [collection] = await db.insert(windowCollectionsTable)
      .values({
        name: 'Gallery Test Collection',
        description: 'Testing complex gallery arrays',
        main_image_url: 'https://example.com/collection.jpg',
        brand_name: 'Gallery Brand'
      })
      .returning()
      .execute();

    // Create window with complex gallery array
    await db.insert(windowsTable)
      .values({
        collection_id: collection.id,
        price: '799.99',
        description: 'Gallery rich window',
        main_image_url: 'https://example.com/main.jpg',
        gallery_image_urls: JSON.stringify([
          'https://example.com/gallery/img1.jpg',
          'https://example.com/gallery/img2.jpg',
          'https://example.com/gallery/img3.jpg',
          'https://example.com/gallery/img4.jpg',
          'https://example.com/gallery/img5.jpg'
        ])
      })
      .execute();

    const result = await getWindowCollectionById(collection.id);

    expect(result).not.toBeNull();
    expect(result!.windows).toHaveLength(1);

    const window = result!.windows[0];
    expect(window.gallery_image_urls).toHaveLength(5);
    expect(window.gallery_image_urls[0]).toEqual('https://example.com/gallery/img1.jpg');
    expect(window.gallery_image_urls[4]).toEqual('https://example.com/gallery/img5.jpg');
    
    // Verify all gallery URLs are strings
    window.gallery_image_urls.forEach(url => {
      expect(typeof url).toEqual('string');
      expect(url).toMatch(/^https:/);
    });
  });
});