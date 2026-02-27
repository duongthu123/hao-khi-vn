import { describe, it, expect, beforeEach } from 'vitest';
import { Quadtree, QuadtreeItem, Rectangle, Point } from '../quadtree';

describe('Quadtree', () => {
  let quadtree: Quadtree<string>;
  const boundary: Rectangle = { x: 0, y: 0, width: 100, height: 100 };

  beforeEach(() => {
    quadtree = new Quadtree<string>(boundary, 4);
  });

  describe('insert', () => {
    it('should insert items within boundary', () => {
      const item: QuadtreeItem<string> = {
        position: { x: 50, y: 50 },
        data: 'test',
      };

      const result = quadtree.insert(item);
      expect(result).toBe(true);
      expect(quadtree.size()).toBe(1);
    });

    it('should reject items outside boundary', () => {
      const item: QuadtreeItem<string> = {
        position: { x: 150, y: 150 },
        data: 'test',
      };

      const result = quadtree.insert(item);
      expect(result).toBe(false);
      expect(quadtree.size()).toBe(0);
    });

    it('should subdivide when capacity is exceeded', () => {
      const items: QuadtreeItem<string>[] = [
        { position: { x: 10, y: 10 }, data: 'item1' },
        { position: { x: 20, y: 20 }, data: 'item2' },
        { position: { x: 30, y: 30 }, data: 'item3' },
        { position: { x: 40, y: 40 }, data: 'item4' },
        { position: { x: 50, y: 50 }, data: 'item5' },
      ];

      items.forEach((item) => quadtree.insert(item));
      expect(quadtree.size()).toBe(5);
    });
  });

  describe('query', () => {
    beforeEach(() => {
      // Insert test items
      const items: QuadtreeItem<string>[] = [
        { position: { x: 10, y: 10 }, data: 'nw' },
        { position: { x: 90, y: 10 }, data: 'ne' },
        { position: { x: 10, y: 90 }, data: 'sw' },
        { position: { x: 90, y: 90 }, data: 'se' },
        { position: { x: 50, y: 50 }, data: 'center' },
      ];

      items.forEach((item) => quadtree.insert(item));
    });

    it('should find items in query range', () => {
      const range: Rectangle = { x: 0, y: 0, width: 51, height: 51 };
      const found = quadtree.query(range);

      expect(found.length).toBe(2);
      expect(found.some((item) => item.data === 'nw')).toBe(true);
      expect(found.some((item) => item.data === 'center')).toBe(true);
    });

    it('should return empty array for non-intersecting range', () => {
      const range: Rectangle = { x: 200, y: 200, width: 50, height: 50 };
      const found = quadtree.query(range);

      expect(found.length).toBe(0);
    });

    it('should find all items when querying entire boundary', () => {
      const found = quadtree.query(boundary);
      expect(found.length).toBe(5);
    });
  });

  describe('queryCircle', () => {
    beforeEach(() => {
      // Insert test items in a grid
      for (let x = 10; x < 100; x += 20) {
        for (let y = 10; y < 100; y += 20) {
          quadtree.insert({
            position: { x, y },
            data: `item_${x}_${y}`,
          });
        }
      }
    });

    it('should find items within circular range', () => {
      const center: Point = { x: 50, y: 50 };
      const radius = 25;
      const found = quadtree.queryCircle(center, radius);

      // Verify all found items are within radius
      found.forEach((item) => {
        const dx = item.position.x - center.x;
        const dy = item.position.y - center.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        expect(distance).toBeLessThanOrEqual(radius);
      });

      expect(found.length).toBeGreaterThan(0);
    });

    it('should return empty array for circle outside boundary', () => {
      const center: Point = { x: 200, y: 200 };
      const radius = 10;
      const found = quadtree.queryCircle(center, radius);

      expect(found.length).toBe(0);
    });
  });

  describe('clear', () => {
    it('should remove all items', () => {
      const items: QuadtreeItem<string>[] = [
        { position: { x: 10, y: 10 }, data: 'item1' },
        { position: { x: 20, y: 20 }, data: 'item2' },
        { position: { x: 30, y: 30 }, data: 'item3' },
      ];

      items.forEach((item) => quadtree.insert(item));
      expect(quadtree.size()).toBe(3);

      quadtree.clear();
      expect(quadtree.size()).toBe(0);
    });
  });

  describe('size', () => {
    it('should return correct count of items', () => {
      expect(quadtree.size()).toBe(0);

      quadtree.insert({ position: { x: 10, y: 10 }, data: 'item1' });
      expect(quadtree.size()).toBe(1);

      quadtree.insert({ position: { x: 20, y: 20 }, data: 'item2' });
      expect(quadtree.size()).toBe(2);
    });
  });

  describe('performance with many items', () => {
    it('should handle large number of items efficiently', () => {
      const itemCount = 1000;
      const startTime = performance.now();

      // Insert many items
      for (let i = 0; i < itemCount; i++) {
        quadtree.insert({
          position: {
            x: Math.random() * 100,
            y: Math.random() * 100,
          },
          data: `item_${i}`,
        });
      }

      const insertTime = performance.now() - startTime;

      // Query should be fast
      const queryStart = performance.now();
      const range: Rectangle = { x: 25, y: 25, width: 50, height: 50 };
      const found = quadtree.query(range);
      const queryTime = performance.now() - queryStart;

      expect(quadtree.size()).toBe(itemCount);
      expect(found.length).toBeGreaterThan(0);
      expect(queryTime).toBeLessThan(50); // Query should be fast
      expect(insertTime).toBeLessThan(500); // Insertion should be reasonable
    });
  });
});
