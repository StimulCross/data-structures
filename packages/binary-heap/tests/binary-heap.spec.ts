import { describe, expect, it } from 'vitest';
import { BinaryHeap } from '../src/binary-heap.js';

describe('BinaryHeap', () => {
	describe('Initialization', () => {
		it('should be empty upon initialization', () => {
			const heap = new BinaryHeap();

			expect(heap.isEmpty).toBe(true);
			expect(heap.size).toBe(0);
		});

		it('should return undefined when peeking an empty heap', () => {
			const heap = new BinaryHeap();

			expect(heap.peek()).toBeUndefined();
		});

		it('should return undefined when popping from an empty heap', () => {
			const heap = new BinaryHeap();

			expect(heap.pop()).toBeUndefined();
		});
	});

	describe('Static from', () => {
		it('should create a valid Max-Heap from an array', () => {
			const values = [3, 8, 1, 5, 10, 2];
			const heap = BinaryHeap.from(values);

			expect(heap.size).toBe(6);
			expect(heap.pop()).toBe(10);
			expect(heap.pop()).toBe(8);
		});

		it('should create a valid heap from a Set', () => {
			const values = new Set([5, 3, 8]);
			const heap = BinaryHeap.from(values);

			expect(heap.size).toBe(3);
			expect(heap.pop()).toBe(8);
		});

		it('should handle empty iterables', () => {
			const heap = BinaryHeap.from([]);

			expect(heap.isEmpty).toBe(true);
			expect(heap.peek()).toBeUndefined();
		});

		it('should work with a custom comparator', () => {
			const values = [5, 3, 8, 1];
			const minHeap = BinaryHeap.from(values, (a, b) => a - b);

			expect(minHeap.pop()).toBe(1);
			expect(minHeap.pop()).toBe(3);
		});
	});

	describe('Pushing', () => {
		it('should update size when pushing elements', () => {
			const heap = new BinaryHeap();

			heap.push(5);
			heap.push(10);

			expect(heap.isEmpty).toBe(false);
			expect(heap.size).toBe(2);
		});

		it('should maintain the maximum element at the top by default', () => {
			const heap = new BinaryHeap();

			heap.push(10);
			expect(heap.peek()).toBe(10);

			heap.push(5);
			expect(heap.peek()).toBe(10);

			heap.push(20);
			expect(heap.peek()).toBe(20);

			heap.push(15);
			expect(heap.peek()).toBe(20);
		});
	});

	describe('Popping', () => {
		it('should extract elements in descending order by default (Max-Heap)', () => {
			const heap = new BinaryHeap();
			const values = [5, 3, 8, 1, 10, 2];

			for (const val of values) {
				heap.push(val);
			}

			const extracted: number[] = [];
			while (!heap.isEmpty) {
				const top = heap.pop();

				if (top !== undefined) {
					extracted.push(top);
				}
			}

			expect(extracted).toEqual([10, 8, 5, 3, 2, 1]);
			expect(heap.size).toBe(0);
		});

		it('should handle duplicate values correctly', () => {
			const heap = new BinaryHeap();
			const values = [3, 1, 3, 1, 5];

			for (const val of values) {
				heap.push(val);
			}

			const extracted: number[] = [];

			while (!heap.isEmpty) {
				const top = heap.pop();

				if (top !== undefined) {
					extracted.push(top);
				}
			}

			expect(extracted).toEqual([5, 3, 3, 1, 1]);
		});
	});

	describe('pushPop', () => {
		it('should return the pushed value when the heap is empty', () => {
			const heap = new BinaryHeap();

			expect(heap.pushPop(5)).toBe(5);
			expect(heap.isEmpty).toBe(true);
		});

		it('should return the pushed value if it has a higher priority than the root', () => {
			const heap = new BinaryHeap();
			heap.push(10);
			heap.push(5);

			expect(heap.pushPop(20)).toBe(20);
			expect(heap.size).toBe(2);
			expect(heap.peek()).toBe(10);
		});

		it('should replace the root and return the old root if the pushed value has a lower priority', () => {
			const heap = new BinaryHeap();
			heap.push(10);
			heap.push(8);

			expect(heap.pushPop(9)).toBe(10);
			expect(heap.size).toBe(2);
			expect(heap.peek()).toBe(9);
		});
	});

	describe('replaceTop', () => {
		it('should insert the value and return undefined when the heap is empty', () => {
			const heap = new BinaryHeap();

			expect(heap.replaceTop(5)).toBeUndefined();
			expect(heap.size).toBe(1);
			expect(heap.peek()).toBe(5);
		});

		it('should replace the root element and return the old root', () => {
			const heap = new BinaryHeap();
			heap.push(10);
			heap.push(5);

			expect(heap.replaceTop(20)).toBe(10);
			expect(heap.size).toBe(2);
			expect(heap.peek()).toBe(20);
		});

		it('should maintain heap property after replacing top', () => {
			const heap = BinaryHeap.from([20, 15, 10]);

			heap.replaceTop(5);
			expect(heap.peek()).toBe(15);
		});
	});

	describe('remove', () => {
		it('should return false when removing from empty heap', () => {
			const heap = new BinaryHeap<number>();

			const isRemoved = heap.remove(123);
			expect(isRemoved).toBe(false);
			expect(heap.isEmpty).toBe(true);
			expect(heap.size).toBe(0);
		});

		it('should return false if value is not found', () => {
			const heap = BinaryHeap.from([5, 3, 8, 1]);

			const isRemoved = heap.remove(999);
			expect(isRemoved).toBe(false);
			expect(heap.size).toBe(4);

			const extracted: number[] = [];

			while (!heap.isEmpty) {
				extracted.push(heap.pop()!);
			}

			expect(extracted).toEqual([8, 5, 3, 1]);
		});

		it('should remove the root value and keep heap valid', () => {
			const heap = BinaryHeap.from([5, 3, 8, 1, 10, 2]);

			const isRemoved = heap.remove(10);

			expect(isRemoved).toBe(true);
			expect(heap.size).toBe(5);

			const extracted: number[] = [];

			while (!heap.isEmpty) {
				extracted.push(heap.pop()!);
			}

			expect(extracted).toEqual([8, 5, 3, 2, 1]);
		});

		it('should remove a leaf value and keep heap valid', () => {
			const heap = BinaryHeap.from([5, 3, 8, 1, 10, 2]);

			const isRemoved = heap.remove(1);
			expect(isRemoved).toBe(true);
			expect(heap.size).toBe(5);

			const extracted: number[] = [];

			while (!heap.isEmpty) {
				extracted.push(heap.pop()!);
			}

			expect(extracted).toEqual([10, 8, 5, 3, 2]);
		});

		it('should remove an internal value and keep heap valid', () => {
			const heap = BinaryHeap.from([5, 3, 8, 1, 10, 2]);

			const isRemoved = heap.remove(5);
			expect(isRemoved).toBe(true);
			expect(heap.size).toBe(5);

			const extracted: number[] = [];

			while (!heap.isEmpty) {
				extracted.push(heap.pop()!);
			}

			expect(extracted).toEqual([10, 8, 3, 2, 1]);
		});

		it('should remove only one occurrence when duplicates exist', () => {
			const heap = BinaryHeap.from([5, 5, 5, 2, 8]);

			const isRemoved = heap.remove(5);
			expect(isRemoved).toBe(true);
			expect(heap.size).toBe(4);

			const extracted: number[] = [];

			while (!heap.isEmpty) {
				extracted.push(heap.pop()!);
			}

			expect(extracted).toEqual([8, 5, 5, 2]);
		});

		it('should work with custom comparator (Min-Heap)', () => {
			const heap = BinaryHeap.from([5, 3, 8, 1, 10, 2], (a, b) => a - b);

			const isRemoved = heap.remove(3);
			expect(isRemoved).toBe(true);
			expect(heap.size).toBe(5);

			const extracted: number[] = [];

			while (!heap.isEmpty) {
				extracted.push(heap.pop()!);
			}

			expect(extracted).toEqual([1, 2, 5, 8, 10]);
		});

		it('should remove last element directly when found at last index (idx === lastIdx)', () => {
			const heap = new BinaryHeap<number>();
			heap.push(10);
			heap.push(9);
			heap.push(8);

			heap.push(-1);

			const before = heap.toArray();
			expect(before.at(-1)).toBe(-1);

			const isRemoved = heap.remove(-1);
			expect(isRemoved).toBe(true);

			const after = heap.toArray();
			expect(after).toHaveLength(3);
			expect(after).not.toContain(-1);

			const extracted: number[] = [];

			while (!heap.isEmpty) {
				extracted.push(heap.pop()!);
			}

			expect(extracted).toEqual([10, 9, 8]);
		});

		it('should sift up when replacement is better than its parent', () => {
			const heap = BinaryHeap.from([50, 30, 40, 20, 10, 35, 36]);
			expect(heap.toArray()).toEqual([50, 30, 40, 20, 10, 35, 36]);

			const isRemoved = heap.remove(20);
			expect(isRemoved).toBe(true);

			expect(heap.toArray()).toEqual([50, 36, 40, 30, 10, 35]);

			const extracted: number[] = [];

			while (!heap.isEmpty) {
				extracted.push(heap.pop()!);
			}

			expect(extracted).toEqual([50, 40, 36, 35, 30, 10]);
		});
	});

	describe('Custom Comparator', () => {
		it('should work with custom compare function for Min-Heap behavior', () => {
			const minHeap = new BinaryHeap<number>((a, b) => a - b);
			const values = [5, 3, 8, 1];

			for (const val of values) {
				minHeap.push(val);
			}

			const extracted: number[] = [];
			while (!minHeap.isEmpty) {
				const min = minHeap.pop();

				if (min !== undefined) {
					extracted.push(min);
				}
			}

			expect(extracted).toEqual([1, 3, 5, 8]);
		});

		it('should work with complex object types', () => {
			interface Node {
				id: number;
				priority: number;
			}

			const heap = new BinaryHeap<Node>((a, b) => a.priority - b.priority);

			heap.push({ id: 1, priority: 10 });
			heap.push({ id: 2, priority: 5 });
			heap.push({ id: 3, priority: 20 });

			expect(heap.pop()).toEqual({ id: 2, priority: 5 });
			expect(heap.pop()).toEqual({ id: 1, priority: 10 });
			expect(heap.pop()).toEqual({ id: 3, priority: 20 });
		});
	});

	describe('toArray', () => {
		it('should return an empty array for an empty heap', () => {
			const heap = new BinaryHeap();

			expect(heap.toArray()).toEqual([]);
		});

		it('should return an array containing all elements', () => {
			const heap = BinaryHeap.from([5, 10, 3]);
			const arr = heap.toArray();

			expect(arr).toHaveLength(3);
			expect(arr).toContain(5);
			expect(arr).toContain(10);
			expect(arr).toContain(3);
		});

		it('should return a new array instance to prevent internal mutation', () => {
			const heap = BinaryHeap.from([1, 2]);
			const arr = heap.toArray();

			arr.push(3);
			expect(heap.size).toBe(2);
		});
	});

	describe('Iterator', () => {
		it('should iterate over all elements without modifying the heap', () => {
			const heap = BinaryHeap.from([5, 10, 3]);
			const items: number[] = [];

			for (const item of heap) {
				items.push(item);
			}

			expect(items).toHaveLength(3);
			expect(items).toContain(5);
			expect(items).toContain(10);
			expect(heap.size).toBe(3);
		});

		it('should not execute loop body for an empty heap', () => {
			const heap = new BinaryHeap();
			let count = 0;

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			for (const _ of heap) {
				count++;
			}

			expect(count).toBe(0);
		});
	});

	describe('Clearing', () => {
		it('should clear the heap', () => {
			const heap = new BinaryHeap();
			heap.push(5);
			heap.clear();

			expect(heap.size).toBe(0);
			expect(heap.isEmpty).toBe(true);
			expect(heap.peek()).toBeUndefined();
			expect(heap.pop()).toBeUndefined();
		});
	});
});
