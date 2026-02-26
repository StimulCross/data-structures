import { describe, expect, it } from 'vitest';
import { Deque } from '../src/deque.js';

describe('Deque', () => {
	describe('Initialization', () => {
		it('should start empty with default capacity', () => {
			const d = new Deque<number>();
			expect(d.size).toBe(0);
			expect(d.isEmpty).toBe(true);
			expect(d.capacity).toBe(16);
		});

		it('should accept initialCapacity that is a power of two', () => {
			const d = new Deque<number>(32);
			expect(d.size).toBe(0);
			expect(d.capacity).toBe(32);
		});

		it('should throw if initialCapacity is not a power of two', () => {
			expect(() => new Deque<number>(3)).toThrow(TypeError);
			expect(() => new Deque<number>(10)).toThrow(TypeError);
		});
	});

	describe('Static from', () => {
		it('should create a valid Dequeue from an array', () => {
			const values = [3, 8, 1, 5, 10, 2];
			const deque = Deque.from(values);

			expect(deque.size).toBe(6);
			expect(deque.pop()).toBe(2);
			expect(deque.shift()).toBe(3);
		});

		it('should create a valid heap from a Set', () => {
			const values = new Set([5, 3, 8]);
			const deque = Deque.from(values);

			expect(deque.size).toBe(3);
			expect(deque.pop()).toBe(8);
			expect(deque.shift()).toBe(5);
		});

		it('should handle empty iterables', () => {
			const deque = Deque.from([]);

			expect(deque.isEmpty).toBe(true);
			expect(deque.peekHead()).toBeUndefined();
			expect(deque.peekTail()).toBeUndefined();
		});

		it('should work with a custom comparator', () => {
			const values = [5, 3, 8, 1];
			const deque = Deque.from(values);

			expect(deque.pop()).toBe(1);
			expect(deque.shift()).toBe(5);
		});
	});

	describe('peeking and at()', () => {
		it('should return undefined when peeking empty deque', () => {
			const d = new Deque<number>();
			expect(d.peekHead()).toBeUndefined();
			expect(d.peekTail()).toBeUndefined();
			expect(d.at(0)).toBeUndefined();
		});

		it('should peek head and tail correctly', () => {
			const d = new Deque<number>();
			d.push(1, 2, 3);
			expect(d.peekHead()).toBe(1);
			expect(d.peekTail()).toBe(3);
		});

		it('should return element at specific positive index', () => {
			const d = new Deque<string>();
			d.push('a', 'b', 'c');
			expect(d.at(0)).toBe('a');
			expect(d.at(1)).toBe('b');
			expect(d.at(2)).toBe('c');
		});

		it('should return element at specific negative index', () => {
			const d = new Deque<string>();
			d.push('a', 'b', 'c');
			expect(d.at(-1)).toBe('c');
			expect(d.at(-2)).toBe('b');
			expect(d.at(-3)).toBe('a');
		});

		it('should return undefined for out of bounds index', () => {
			const d = new Deque<number>();
			d.push(10, 20);
			expect(d.at(2)).toBeUndefined();
			expect(d.at(-3)).toBeUndefined();
		});
	});

	describe('insertion and removal (single elements)', () => {
		it('should return undefined when removing from empty deque', () => {
			const d = new Deque<number>();
			expect(d.shift()).toBeUndefined();
			expect(d.pop()).toBeUndefined();
		});

		it('should behave as FIFO queue (push/shift)', () => {
			const d = new Deque<number>();
			d.push(1);
			d.push(2);
			d.push(3);
			expect(d.shift()).toBe(1);
			expect(d.shift()).toBe(2);
			expect(d.shift()).toBe(3);
			expect(d.isEmpty).toBe(true);
		});

		it('should behave as LIFO stack (push/pop)', () => {
			const d = new Deque<number>();
			d.push(1);
			d.push(2);
			d.push(3);
			expect(d.pop()).toBe(3);
			expect(d.pop()).toBe(2);
			expect(d.pop()).toBe(1);
			expect(d.isEmpty).toBe(true);
		});

		it('should handle unshift and pop correctly', () => {
			const d = new Deque<number>();
			d.unshift(1);
			d.unshift(2);
			expect(d.pop()).toBe(1);
			expect(d.pop()).toBe(2);
		});
	});

	describe('insertion (multiple elements)', () => {
		it('should push multiple elements in correct order', () => {
			const d = new Deque<number>();
			d.push(1, 2, 3);
			expect(d.toArray()).toEqual([1, 2, 3]);
		});

		it('should unshift multiple elements in correct order', () => {
			const d = new Deque<number>();
			d.unshift(1, 2, 3);
			expect(d.toArray()).toEqual([1, 2, 3]);
			d.unshift(4, 5);
			expect(d.toArray()).toEqual([4, 5, 1, 2, 3]);
		});

		it('should safely ignore empty push/unshift', () => {
			const d = new Deque<number>();
			d.push();
			d.unshift();
			expect(d.isEmpty).toBe(true);
		});
	});

	describe('buffer mechanics (wrap-around and growth)', () => {
		it('should maintain order during wrap-around', () => {
			const d = new Deque<number>(4);
			d.push(1, 2, 3, 4);
			d.shift();
			d.shift();
			d.push(5, 6);
			expect(d.toArray()).toEqual([3, 4, 5, 6]);
			expect(d.size).toBe(4);
		});

		it('should grow capacity when exceeding bounds via push', () => {
			const d = new Deque<number>(4);
			d.push(1, 2, 3, 4, 5);
			expect(d.capacity).toBe(8);
			expect(d.toArray()).toEqual([1, 2, 3, 4, 5]);
		});

		it('should grow capacity when exceeding bounds via unshift', () => {
			const d = new Deque<number>(4);
			d.unshift(1, 2, 3, 4, 5);
			expect(d.capacity).toBe(8);
			expect(d.toArray()).toEqual([1, 2, 3, 4, 5]);
		});

		it('should grow capacity correctly after a wrap-around', () => {
			const d = new Deque<number>(4);
			d.push(1, 2, 3, 4);
			d.shift();
			d.shift();
			d.push(5, 6, 7);
			expect(d.capacity).toBe(8);
			expect(d.toArray()).toEqual([3, 4, 5, 6, 7]);
		});

		it('should handle large volume of operations', () => {
			const d = new Deque<number>(8);
			const n = 100_000;

			for (let i = 0; i < n; i++) {
				d.push(i);
			}
			expect(d.size).toBe(n);

			for (let i = 0; i < n; i++) {
				expect(d.shift()).toBe(i);
			}
			expect(d.isEmpty).toBe(true);
		});
	});

	describe('remove by value', () => {
		it('should return false when removing from empty', () => {
			const d = new Deque<number>();
			expect(d.remove(1)).toBe(false);
		});

		it('should return false if element is not found', () => {
			const d = new Deque<number>();
			d.push(1, 2, 3);
			expect(d.remove(4)).toBe(false);
			expect(d.size).toBe(3);
		});

		it('should remove element from the front', () => {
			const d = new Deque<number>();
			d.push(1, 2, 3);
			expect(d.remove(1)).toBe(true);
			expect(d.toArray()).toEqual([2, 3]);
		});

		it('should remove element from the back', () => {
			const d = new Deque<number>();
			d.push(1, 2, 3);
			expect(d.remove(3)).toBe(true);
			expect(d.toArray()).toEqual([1, 2]);
		});

		it('should remove element from the middle', () => {
			const d = new Deque<number>();
			d.push(1, 2, 3, 4);
			expect(d.remove(2)).toBe(true);
			expect(d.toArray()).toEqual([1, 3, 4]);
		});

		it('should remove only the first matching occurrence', () => {
			const d = new Deque<number>();
			d.push(1, 2, 2, 3);
			expect(d.remove(2)).toBe(true);
			expect(d.toArray()).toEqual([1, 2, 3]);
		});

		it('should allow removing undefined if explicitly pushed', () => {
			const d = new Deque<number | undefined>();
			d.push(1, undefined, 3);
			expect(d.remove(undefined)).toBe(true);
			expect(d.toArray()).toEqual([1, 3]);
		});

		it('should shift elements from the tail when removing an element closer to the end', () => {
			const d = new Deque<number>();
			d.push(10, 20, 30, 40, 50);

			const isRemoved = d.remove(40);

			expect(isRemoved).toBe(true);
			expect(d.size).toBe(4);
			expect(d.toArray()).toEqual([10, 20, 30, 50]);
			expect(d.peekTail()).toBe(50);
		});
	});

	describe('removeAt', () => {
		it('should return undefined when removing from empty', () => {
			const d = new Deque<number>();
			expect(d.removeAt(0)).toBeUndefined();
			expect(d.removeAt(-1)).toBeUndefined();
		});

		it('should return undefined for out of bounds index', () => {
			const d = new Deque<number>();
			d.push(1, 2, 3);
			expect(d.removeAt(3)).toBeUndefined();
			expect(d.removeAt(-4)).toBeUndefined();
			expect(d.toArray()).toEqual([1, 2, 3]);
		});

		it('should remove element from the front', () => {
			const d = new Deque<number>();
			d.push(1, 2, 3);
			expect(d.removeAt(0)).toBe(1);
			expect(d.toArray()).toEqual([2, 3]);
		});

		it('should remove element from the back', () => {
			const d = new Deque<number>();
			d.push(1, 2, 3);
			expect(d.removeAt(2)).toBe(3);
			expect(d.toArray()).toEqual([1, 2]);
		});

		it('should remove element from the middle', () => {
			const d = new Deque<number>();
			d.push(1, 2, 3, 4);
			expect(d.removeAt(1)).toBe(2);
			expect(d.toArray()).toEqual([1, 3, 4]);
		});

		it('should support negative index', () => {
			const d = new Deque<number>();
			d.push(1, 2, 3, 4);
			expect(d.removeAt(-1)).toBe(4);
			expect(d.toArray()).toEqual([1, 2, 3]);
			expect(d.removeAt(-2)).toBe(2);
			expect(d.toArray()).toEqual([1, 3]);
		});

		it('should work correctly after wrap-around', () => {
			const d = new Deque<number>(4);
			d.push(1, 2, 3, 4);
			d.shift();
			d.shift();
			d.push(5, 6);
			expect(d.toArray()).toEqual([3, 4, 5, 6]);

			expect(d.removeAt(1)).toBe(4);
			expect(d.toArray()).toEqual([3, 5, 6]);
			expect(d.peekHead()).toBe(3);
			expect(d.peekTail()).toBe(6);
		});
	});

	describe('rotate', () => {
		it('should do nothing on empty deque', () => {
			const d = new Deque<number>();
			d.rotate(5);
			expect(d.isEmpty).toBe(true);
		});

		it('should rotate right by positive steps', () => {
			const d = new Deque<number>();
			d.push(1, 2, 3, 4);
			d.rotate(1);
			expect(d.toArray()).toEqual([4, 1, 2, 3]);
			d.rotate(2);
			expect(d.toArray()).toEqual([2, 3, 4, 1]);
		});

		it('should rotate left by negative steps', () => {
			const d = new Deque<number>();
			d.push(1, 2, 3, 4);
			d.rotate(-1);
			expect(d.toArray()).toEqual([2, 3, 4, 1]);
		});

		it('should handle full rotations and zero gracefully', () => {
			const d = new Deque<number>();
			d.push(1, 2, 3);
			d.rotate(0);
			expect(d.toArray()).toEqual([1, 2, 3]);
			d.rotate(3);
			expect(d.toArray()).toEqual([1, 2, 3]);
			d.rotate(-6);
			expect(d.toArray()).toEqual([1, 2, 3]);
		});
	});

	describe('clear', () => {
		it('should clear all elements without shrinking by default', () => {
			const d = new Deque<number>(4);
			d.push(1, 2, 3, 4, 5);
			d.clear();
			expect(d.size).toBe(0);
			expect(d.capacity).toBe(8);
		});

		it('should clear and shrink to initial capacity if flag is true', () => {
			const d = new Deque<number>(4);
			d.push(1, 2, 3, 4, 5);
			d.clear(true);
			expect(d.size).toBe(0);
			expect(d.capacity).toBe(4);
		});
	});

	describe('conversions', () => {
		it('should convert to array without mutating deque', () => {
			const d = new Deque<number>();
			d.push(1, 2, 3);
			expect(d.toArray()).toEqual([1, 2, 3]);
			expect(d.size).toBe(3);
		});

		it('should convert to reversed array without mutating deque', () => {
			const d = new Deque<number>();
			d.push(1, 2, 3);
			expect(d.toReversedArray()).toEqual([3, 2, 1]);
			expect(d.size).toBe(3);
		});
	});

	describe('iterators', () => {
		it('should iterate via Symbol.iterator', () => {
			const d = new Deque<number>();
			d.push(1, 2, 3);
			expect([...d]).toEqual([1, 2, 3]);
		});

		it('should iterate keys', () => {
			const d = new Deque<string>();
			d.push('a', 'b', 'c');
			expect([...d.keys()]).toEqual([0, 1, 2]);
		});

		it('should iterate values', () => {
			const d = new Deque<string>();
			d.push('a', 'b', 'c');
			expect([...d.values()]).toEqual(['a', 'b', 'c']);
		});

		it('should iterate entries', () => {
			const d = new Deque<string>();
			d.push('a', 'b');
			expect([...d.entries()]).toEqual([
				[0, 'a'],
				[1, 'b'],
			]);
		});

		it('should iterate reversed keys', () => {
			const d = new Deque<string>();
			d.push('a', 'b', 'c');
			expect([...d.keysReverse()]).toEqual([2, 1, 0]);
		});

		it('should iterate reversed values', () => {
			const d = new Deque<string>();
			d.push('a', 'b', 'c');
			expect([...d.valuesReverse()]).toEqual(['c', 'b', 'a']);
		});

		it('should iterate reversed entries', () => {
			const d = new Deque<string>();
			d.push('a', 'b');
			expect([...d.entriesReverse()]).toEqual([
				[1, 'b'],
				[0, 'a'],
			]);
		});
	});
});
