/**
 * Quadtree Spatial Indexing
 * Efficient spatial data structure for collision detection and range queries
 */

export interface Point {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface QuadtreeItem<T = any> {
  position: Point;
  data: T;
}

/**
 * Quadtree node for spatial partitioning
 */
export class Quadtree<T = any> {
  private boundary: Rectangle;
  private capacity: number;
  private items: QuadtreeItem<T>[];
  private divided: boolean;
  private northeast?: Quadtree<T>;
  private northwest?: Quadtree<T>;
  private southeast?: Quadtree<T>;
  private southwest?: Quadtree<T>;

  constructor(boundary: Rectangle, capacity: number = 4) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.items = [];
    this.divided = false;
  }

  /**
   * Check if a point is within the boundary
   */
  private contains(point: Point): boolean {
    return (
      point.x >= this.boundary.x &&
      point.x < this.boundary.x + this.boundary.width &&
      point.y >= this.boundary.y &&
      point.y < this.boundary.y + this.boundary.height
    );
  }

  /**
   * Check if two rectangles intersect
   */
  private intersects(range: Rectangle): boolean {
    return !(
      range.x > this.boundary.x + this.boundary.width ||
      range.x + range.width < this.boundary.x ||
      range.y > this.boundary.y + this.boundary.height ||
      range.y + range.height < this.boundary.y
    );
  }

  /**
   * Subdivide the quadtree into four quadrants
   */
  private subdivide(): void {
    const x = this.boundary.x;
    const y = this.boundary.y;
    const w = this.boundary.width / 2;
    const h = this.boundary.height / 2;

    this.northeast = new Quadtree<T>({ x: x + w, y, width: w, height: h }, this.capacity);
    this.northwest = new Quadtree<T>({ x, y, width: w, height: h }, this.capacity);
    this.southeast = new Quadtree<T>({ x: x + w, y: y + h, width: w, height: h }, this.capacity);
    this.southwest = new Quadtree<T>({ x, y: y + h, width: w, height: h }, this.capacity);

    this.divided = true;
  }

  /**
   * Insert an item into the quadtree
   */
  insert(item: QuadtreeItem<T>): boolean {
    // Check if point is within boundary
    if (!this.contains(item.position)) {
      return false;
    }

    // If there's space and not divided, add to this node
    if (this.items.length < this.capacity && !this.divided) {
      this.items.push(item);
      return true;
    }

    // Subdivide if not already divided
    if (!this.divided) {
      this.subdivide();
    }

    // Try to insert into children
    if (this.northeast!.insert(item)) return true;
    if (this.northwest!.insert(item)) return true;
    if (this.southeast!.insert(item)) return true;
    if (this.southwest!.insert(item)) return true;

    return false;
  }

  /**
   * Query items within a rectangular range
   */
  query(range: Rectangle, found: QuadtreeItem<T>[] = []): QuadtreeItem<T>[] {
    // Check if range intersects this boundary
    if (!this.intersects(range)) {
      return found;
    }

    // Check items in this node
    for (const item of this.items) {
      if (this.pointInRectangle(item.position, range)) {
        found.push(item);
      }
    }

    // Query children if divided
    if (this.divided) {
      this.northeast!.query(range, found);
      this.northwest!.query(range, found);
      this.southeast!.query(range, found);
      this.southwest!.query(range, found);
    }

    return found;
  }

  /**
   * Query items within a circular range
   */
  queryCircle(center: Point, radius: number, found: QuadtreeItem<T>[] = []): QuadtreeItem<T>[] {
    // Create bounding box for circle
    const range: Rectangle = {
      x: center.x - radius,
      y: center.y - radius,
      width: radius * 2,
      height: radius * 2,
    };

    // Check if range intersects this boundary
    if (!this.intersects(range)) {
      return found;
    }

    // Check items in this node
    for (const item of this.items) {
      const dx = item.position.x - center.x;
      const dy = item.position.y - center.y;
      const distanceSquared = dx * dx + dy * dy;
      
      if (distanceSquared <= radius * radius) {
        found.push(item);
      }
    }

    // Query children if divided
    if (this.divided) {
      this.northeast!.queryCircle(center, radius, found);
      this.northwest!.queryCircle(center, radius, found);
      this.southeast!.queryCircle(center, radius, found);
      this.southwest!.queryCircle(center, radius, found);
    }

    return found;
  }

  /**
   * Check if a point is within a rectangle
   */
  private pointInRectangle(point: Point, rect: Rectangle): boolean {
    return (
      point.x >= rect.x &&
      point.x < rect.x + rect.width &&
      point.y >= rect.y &&
      point.y < rect.y + rect.height
    );
  }

  /**
   * Clear all items from the quadtree
   */
  clear(): void {
    this.items = [];
    this.divided = false;
    this.northeast = undefined;
    this.northwest = undefined;
    this.southeast = undefined;
    this.southwest = undefined;
  }

  /**
   * Get total number of items in the quadtree
   */
  size(): number {
    let count = this.items.length;
    
    if (this.divided) {
      count += this.northeast!.size();
      count += this.northwest!.size();
      count += this.southeast!.size();
      count += this.southwest!.size();
    }
    
    return count;
  }
}
