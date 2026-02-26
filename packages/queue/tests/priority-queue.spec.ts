import { describe, it, expect } from 'vitest';
import { PriorityQueue } from '../src/index.js';

const minCompare = (a: number, b: number): number => a - b;

describe('PriorityQueue', () => {
	describe('Initialization', () => {
		it('should have infinite capacity by default', () => {
			const q = new PriorityQueue<number>(minCompare);

			expect(q.capacity).toBe(Infinity);
			expect(q.size).toBe(0);
			expect(q.isEmpty).toBe(true);
			expect(q.isFull).toBe(false);
		});

		it('should accept capacity greater than zero', () => {
			const q = new PriorityQueue<number>(minCompare, { capacity: 2 });

			expect(q.capacity).toBe(2);
			expect(q.isEmpty).toBe(true);
			expect(q.isFull).toBe(false);
		});

		it('should throw when capacity is zero', () => {
			expect(() => new PriorityQueue<number>(minCompare, { capacity: 0 })).toThrow(/greater than zero/iu);
		});

		it('should throw when capacity is negative', () => {
			expect(() => new PriorityQueue<number>(minCompare, { capacity: -1 })).toThrow(/greater than zero/iu);
		});

		it('should throw when capacity is not integer', () => {
			expect(() => new PriorityQueue<number>(minCompare, { capacity: 5.5 })).toThrow(/greater than zero/iu);
		});

		it('should throw when capacity is not safe integer', () => {
			expect(() => new PriorityQueue<number>(minCompare, { capacity: Number.MAX_SAFE_INTEGER + 1 })).toThrow(
				/greater than zero/iu,
			);
		});
	});

	describe('Enqueue', () => {
		it('should enqueue and increase size', () => {
			const q = new PriorityQueue<string>((a, b) => a.localeCompare(b), { capacity: 3 });

			expect(q.enqueue('a')).toBe(true);
			expect(q.size).toBe(1);
			expect(q.isEmpty).toBe(false);
		});

		it('should return false when enqueue on full queue without force', () => {
			const q = new PriorityQueue<number>(minCompare, { capacity: 2 });

			expect(q.enqueue(1)).toBe(true);
			expect(q.enqueue(2)).toBe(true);
			expect(q.isFull).toBe(true);

			expect(q.enqueue(3)).toBe(false);
			expect(q.size).toBe(2);
		});

		it('should allow enqueue when full if force is true', () => {
			const q = new PriorityQueue<number>(minCompare, { capacity: 2 });

			expect(q.enqueue(1)).toBe(true);
			expect(q.enqueue(2)).toBe(true);
			expect(q.isFull).toBe(true);

			expect(q.enqueue(3, true)).toBe(true);
			expect(q.size).toBe(3);
			expect(q.isFull).toBe(true);
		});

		it('should maintain priority order after enqueuing', () => {
			const q = new PriorityQueue<number>(minCompare);

			q.enqueue(10);
			q.enqueue(5);
			q.enqueue(20);

			expect(q.peek()).toBe(5);
		});
	});

	describe('Dequeue and peek', () => {
		it('should return null when dequeue from empty queue', () => {
			const q = new PriorityQueue<number>(minCompare);

			expect(q.dequeue()).toBeNull();
			expect(q.size).toBe(0);
			expect(q.isEmpty).toBe(true);
		});

		it('should return null when peek on empty queue', () => {
			const q = new PriorityQueue<number>(minCompare);

			expect(q.peek()).toBeNull();
			expect(q.size).toBe(0);
		});

		it('should peek without removing the front element', () => {
			const q = new PriorityQueue<number>(minCompare);

			q.enqueue(20);
			q.enqueue(10);

			expect(q.peek()).toBe(10);
			expect(q.size).toBe(2);
			expect(q.dequeue()).toBe(10);
			expect(q.dequeue()).toBe(20);
		});

		it('should dequeue in priority order (Min-Heap)', () => {
			const q = new PriorityQueue<number>(minCompare);

			q.enqueue(30);
			q.enqueue(10);
			q.enqueue(20);

			expect(q.dequeue()).toBe(10);
			expect(q.dequeue()).toBe(20);
			expect(q.dequeue()).toBe(30);
			expect(q.dequeue()).toBeNull();
		});
	});

	describe('Remove', () => {
		it('should return false when removing from empty queue', () => {
			const q = new PriorityQueue<number>(minCompare);

			expect(q.remove(123)).toBe(false);
			expect(q.size).toBe(0);
			expect(q.isEmpty).toBe(true);
		});

		it('should remove the only element', () => {
			const q = new PriorityQueue<number>(minCompare);

			q.enqueue(10);

			expect(q.remove(10)).toBe(true);
			expect(q.size).toBe(0);
			expect(q.isEmpty).toBe(true);
			expect(q.peek()).toBeNull();
			expect(q.dequeue()).toBeNull();
		});

		it('should remove an element and maintain priority order', () => {
			const q = new PriorityQueue<number>(minCompare);

			q.enqueue(10);
			q.enqueue(20);
			q.enqueue(30);
			q.enqueue(5);

			expect(q.remove(20)).toBe(true);
			expect(q.size).toBe(3);

			expect(q.dequeue()).toBe(5);
			expect(q.dequeue()).toBe(10);
			expect(q.dequeue()).toBe(30);
			expect(q.dequeue()).toBeNull();
		});

		it('should remove first occurrence when duplicates exist', () => {
			const q = new PriorityQueue<number>(minCompare);

			q.enqueue(10);
			q.enqueue(5);
			q.enqueue(5);
			q.enqueue(20);

			expect(q.remove(5)).toBe(true);
			expect(q.size).toBe(3);

			expect(q.dequeue()).toBe(5);
			expect(q.dequeue()).toBe(10);
			expect(q.dequeue()).toBe(20);
		});

		it('should not mutate queue when item not found', () => {
			const q = new PriorityQueue<number>(minCompare);

			q.enqueue(10);
			q.enqueue(20);

			expect(q.remove(999)).toBe(false);
			expect(q.size).toBe(2);
			expect(q.peek()).toBe(10);
		});

		it('should update isFull correctly after removals with limited capacity (including forced overflow)', () => {
			const q = new PriorityQueue<number>(minCompare, { capacity: 2 });

			expect(q.enqueue(10)).toBe(true);
			expect(q.enqueue(20)).toBe(true);
			expect(q.isFull).toBe(true);

			expect(q.enqueue(30, true)).toBe(true);
			expect(q.size).toBe(3);
			expect(q.isFull).toBe(true);

			expect(q.remove(20)).toBe(true);
			expect(q.size).toBe(2);
			expect(q.isFull).toBe(true);

			expect(q.remove(10)).toBe(true);
			expect(q.size).toBe(1);
			expect(q.isFull).toBe(false);
		});
	});

	describe('Clear', () => {
		it('should clear the queue', () => {
			const q = new PriorityQueue<number>(minCompare);

			q.enqueue(10);
			q.enqueue(20);

			q.clear();

			expect(q.size).toBe(0);
			expect(q.isEmpty).toBe(true);
			expect(q.peek()).toBeNull();
			expect(q.dequeue()).toBeNull();
		});
	});

	describe('Iteration', () => {
		describe('toArray()', () => {
			it('should return an empty array for an empty queue', () => {
				const q = new PriorityQueue<number>(minCompare);

				expect(q.toArray()).toEqual([]);
				expect(q.size).toBe(0);
				expect(q.isEmpty).toBe(true);
			});

			it('should return all entries and not mutate the queue', () => {
				const q = new PriorityQueue<number>(minCompare);

				q.enqueue(20);
				q.enqueue(10);
				q.enqueue(30);

				const arr = q.toArray();
				expect(arr).toHaveLength(3);
				expect(arr).toContain(10);
				expect(arr).toContain(20);
				expect(arr).toContain(30);

				expect(q.size).toBe(3);
				expect(q.peek()).toBe(10);
			});

			it('should return a snapshot not affected by later queue mutations', () => {
				const q = new PriorityQueue<number>(minCompare);

				q.enqueue(10);
				q.enqueue(20);

				const arr = q.toArray();

				q.dequeue();
				q.enqueue(30);

				expect(arr).toHaveLength(2);
				expect(arr).toContain(10);
				expect(arr).toContain(20);

				const updatedArr = q.toArray();
				expect(updatedArr).toHaveLength(2);
				expect(updatedArr).toContain(20);
				expect(updatedArr).toContain(30);
			});
		});

		describe('Iterator', () => {
			it('should iterate over all elements', () => {
				const q = new PriorityQueue<number>(minCompare);

				q.enqueue(20);
				q.enqueue(10);
				q.enqueue(30);

				const iterated = [...q];

				expect(iterated).toHaveLength(3);
				expect(iterated).toContain(10);
				expect(iterated).toContain(20);
				expect(iterated).toContain(30);
			});
		});
	});
});
