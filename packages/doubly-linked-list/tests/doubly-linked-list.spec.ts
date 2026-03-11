import { describe, it, expect } from 'vitest';
import { DoublyLinkedList } from '../src/index.js';

describe('DoublyLinkedList', () => {
	describe('Creation and Initialization', () => {
		it('should create an empty list', () => {
			const list = new DoublyLinkedList();
			expect(list.size).toBe(0);
			expect(list.isEmpty).toBe(true);
			expect(list.head).toBeNull();
			expect(list.tail).toBeNull();
		});

		it('should create a list from an iterable', () => {
			const array = [1, 2, 3];
			const list = DoublyLinkedList.from(array);

			expect(list.size).toBe(3);
			expect(list.head).toBe(1);
			expect(list.tail).toBe(3);
			expect(list.toArray()).toEqual(array);
		});

		it('should create a list from a Set', () => {
			const set = new Set(['a', 'b']);
			const list = DoublyLinkedList.from(set);

			expect(list.size).toBe(2);
			expect(list.toArray()).toEqual(['a', 'b']);
		});
	});

	describe('State', () => {
		it('should correctly report size and emptiness', () => {
			const list = new DoublyLinkedList<number>();
			expect(list.isEmpty).toBe(true);

			list.push(1);
			expect(list.size).toBe(1);
			expect(list.isEmpty).toBe(false);

			list.clear();
			expect(list.size).toBe(0);
			expect(list.isEmpty).toBe(true);
		});

		it('should return correct head and tail', () => {
			const list = new DoublyLinkedList<string>();

			list.push('first');
			expect(list.head).toBe('first');
			expect(list.tail).toBe('first');

			list.push('second');
			expect(list.head).toBe('first');
			expect(list.tail).toBe('second');
		});
	});

	describe('Adding Elements', () => {
		it('should push values to the end', () => {
			const list = new DoublyLinkedList<number>();

			list.push(10);
			expect(list.head).toBe(10);
			expect(list.tail).toBe(10);

			list.push(20);
			expect(list.head).toBe(10);
			expect(list.tail).toBe(20);
			expect(list.size).toBe(2);
		});

		it('should unshift values to the beginning', () => {
			const list = new DoublyLinkedList<number>();

			list.unshift(10);
			expect(list.head).toBe(10);
			expect(list.tail).toBe(10);

			list.unshift(20);
			expect(list.head).toBe(20);
			expect(list.tail).toBe(10);
			expect(list.size).toBe(2);
		});

		it('should insert values at specified indices', () => {
			const list = DoublyLinkedList.from([1, 4]);

			const isInsertedAtStart = list.insert(0, 0);
			expect(isInsertedAtStart).toBe(true);
			expect(list.head).toBe(0);

			const isInsertedAtEnd = list.insert(list.size, 5);
			expect(isInsertedAtEnd).toBe(true);
			expect(list.tail).toBe(5);

			const isInsertedMiddleFirstHalf = list.insert(2, 2);
			expect(list.toArray()).toEqual([0, 1, 2, 4, 5]);
			expect(isInsertedMiddleFirstHalf).toBe(true);

			const isInsertedMiddleSecondHalf = list.insert(3, 3);
			expect(list.toArray()).toEqual([0, 1, 2, 3, 4, 5]);
			expect(isInsertedMiddleSecondHalf).toBe(true);

			expect(list.size).toBe(6);
		});

		it('should fail to insert at out-of-bounds index', () => {
			const list = new DoublyLinkedList<number>();
			expect(list.insert(-1, 10)).toBe(false);
			expect(list.insert(1, 10)).toBe(false);
		});
	});

	describe('Removing Elements', () => {
		it('should pop values from the end', () => {
			const list = DoublyLinkedList.from([1, 2]);

			expect(list.pop()).toBe(2);
			expect(list.size).toBe(1);
			expect(list.tail).toBe(1);

			expect(list.pop()).toBe(1);
			expect(list.size).toBe(0);
			expect(list.head).toBeNull();
			expect(list.tail).toBeNull();

			expect(list.pop()).toBeNull();
		});

		it('should shift values from the beginning', () => {
			const list = DoublyLinkedList.from([1, 2]);

			expect(list.shift()).toBe(1);
			expect(list.size).toBe(1);
			expect(list.head).toBe(2);

			expect(list.shift()).toBe(2);
			expect(list.size).toBe(0);
			expect(list.head).toBeNull();
			expect(list.tail).toBeNull();

			expect(list.shift()).toBeNull();
		});

		it('should remove specific values', () => {
			const list = DoublyLinkedList.from([1, 2, 3, 4]);

			expect(list.remove(1)).toBe(true);
			expect(list.head).toBe(2);

			expect(list.remove(4)).toBe(true);
			expect(list.tail).toBe(3);

			list.push(5);
			expect(list.remove(3)).toBe(true);
			expect(list.toArray()).toEqual([2, 5]);

			expect(list.remove(100)).toBe(false);
		});

		it('should handle removing the only item via remove()', () => {
			const list = DoublyLinkedList.from([42]);
			expect(list.remove(42)).toBe(true);
			expect(list.isEmpty).toBe(true);
			expect(list.head).toBeNull();
			expect(list.tail).toBeNull();
		});

		it('should remove by index', () => {
			const list = DoublyLinkedList.from([10, 20, 30, 40, 50, 60]);

			expect(list.removeByIndex(0)).toBe(10);
			expect(list.removeByIndex(list.size - 1)).toBe(60);

			expect(list.removeByIndex(1)).toBe(30);
			expect(list.removeByIndex(2)).toBe(50);

			expect(list.toArray()).toEqual([20, 40]);
		});

		it('should fail to remove by out-of-bounds index', () => {
			const list = DoublyLinkedList.from([1, 2]);
			expect(list.removeByIndex(-1)).toBeNull();
			expect(list.removeByIndex(2)).toBeNull();
		});

		it('should clear the list', () => {
			const list = DoublyLinkedList.from([1, 2, 3]);
			list.clear();

			expect(list.size).toBe(0);
			expect(list.head).toBeNull();
			expect(list.tail).toBeNull();
			expect(list.toArray()).toEqual([]);
		});
	});

	describe('Searching and Querying', () => {
		it('should check if list contains a value', () => {
			const list = DoublyLinkedList.from(['a', 'b', 'c']);

			expect(list.contains('b')).toBe(true);
			expect(list.contains('z')).toBe(false);
		});

		it('should return the index of a value', () => {
			const list = DoublyLinkedList.from([10, 20, 30]);

			expect(list.indexOf(10)).toBe(0);
			expect(list.indexOf(20)).toBe(1);
			expect(list.indexOf(30)).toBe(2);
			expect(list.indexOf(40)).toBe(-1);
		});

		it('should find a value using a predicate', () => {
			const list = DoublyLinkedList.from([
				{ id: 1, name: 'John' },
				{ id: 2, name: 'Jane' },
			]);

			const found = list.find(user => user.name === 'Jane');
			expect(found).toEqual({ id: 2, name: 'Jane' });

			const notFound = list.find(user => user.id === 99);
			expect(notFound).toBeNull();
		});
	});

	describe('Iterators and Conversion', () => {
		it('should convert to an array', () => {
			const list = DoublyLinkedList.from([1, 2, 3]);
			expect(list.toArray()).toEqual([1, 2, 3]);
		});

		it('should convert to a reversed array', () => {
			const list = DoublyLinkedList.from([1, 2, 3]);
			expect(list.toReversedArray()).toEqual([3, 2, 1]);
		});

		it('should be iterable using standard for...of', () => {
			const list = DoublyLinkedList.from([1, 2, 3]);
			const result = [];

			for (const value of list) {
				result.push(value);
			}

			expect(result).toEqual([1, 2, 3]);
		});

		it('should be iterable in reverse', () => {
			const list = DoublyLinkedList.from([1, 2, 3]);
			const result = [];

			for (const value of list.reverse()) {
				result.push(value);
			}

			expect(result).toEqual([3, 2, 1]);
		});

		it('should yield nothing when iterating over an empty list', () => {
			const list = new DoublyLinkedList();
			expect([...list]).toEqual([]);
			expect([...list.reverse()]).toEqual([]);
		});
	});
});
