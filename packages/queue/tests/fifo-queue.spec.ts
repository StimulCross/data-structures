import { describe, it, expect } from 'vitest';
import { FifoQueue } from '../src/index.js';

describe('FifoQueue', () => {
	describe('Initialization', () => {
		it('should have infinite capacity by default', () => {
			const q = new FifoQueue<number>();

			expect(q.capacity).toBe(Infinity);
			expect(q.size).toBe(0);
			expect(q.isEmpty).toBe(true);
			expect(q.isFull).toBe(false);
		});

		it('should accept capacity greater than zero', () => {
			const q = new FifoQueue<number>({ capacity: 2 });

			expect(q.capacity).toBe(2);
			expect(q.isEmpty).toBe(true);
			expect(q.isFull).toBe(false);
		});

		it('should throw when capacity is zero', () => {
			expect(() => new FifoQueue<number>({ capacity: 0 })).toThrow(/greater than zero/iu);
		});

		it('should throw when capacity is negative', () => {
			expect(() => new FifoQueue<number>({ capacity: -1 })).toThrow(/greater than zero/iu);
		});

		it('should throw when capacity is not integer', () => {
			expect(() => new FifoQueue<number>({ capacity: 5.5 })).toThrow(/greater than zero/iu);
		});

		it('should throw when capacity is not sage integer', () => {
			expect(() => new FifoQueue<number>({ capacity: Number.MAX_SAFE_INTEGER + 1 })).toThrow(
				/greater than zero/iu,
			);
		});
	});

	describe('Enqueue', () => {
		it('should enqueue and increase size', () => {
			const q = new FifoQueue<string>({ capacity: 3 });

			expect(q.enqueue('a')).toBe(true);
			expect(q.size).toBe(1);
			expect(q.isEmpty).toBe(false);
		});

		it('should return false when enqueue on full queue without force', () => {
			const q = new FifoQueue<number>({ capacity: 2 });

			expect(q.enqueue(1)).toBe(true);
			expect(q.enqueue(2)).toBe(true);
			expect(q.isFull).toBe(true);

			expect(q.enqueue(3)).toBe(false);
			expect(q.size).toBe(2);
		});

		it('should allow enqueue when full if force is true', () => {
			const q = new FifoQueue<number>({ capacity: 2 });

			expect(q.enqueue(1)).toBe(true);
			expect(q.enqueue(2)).toBe(true);
			expect(q.isFull).toBe(true);

			expect(q.enqueue(3, true)).toBe(true);
			expect(q.size).toBe(3);
			expect(q.isFull).toBe(true);
		});
	});

	describe('Dequeue and pick', () => {
		it('should return null when dequeue from empty queue', () => {
			const q = new FifoQueue<number>();

			expect(q.dequeue()).toBeNull();
			expect(q.size).toBe(0);
			expect(q.isEmpty).toBe(true);
		});

		it('should return null when peek on empty queue', () => {
			const q = new FifoQueue<number>();

			expect(q.peek()).toBeNull();
			expect(q.size).toBe(0);
		});

		it('should peek without removing the front element', () => {
			const q = new FifoQueue<number>();

			q.enqueue(10);
			q.enqueue(20);

			expect(q.peek()).toBe(10);
			expect(q.size).toBe(2);
			expect(q.dequeue()).toBe(10);
			expect(q.dequeue()).toBe(20);
		});

		it('should dequeue in FIFO order', () => {
			const q = new FifoQueue<string>();

			q.enqueue('first');
			q.enqueue('second');
			q.enqueue('third');

			expect(q.dequeue()).toBe('first');
			expect(q.dequeue()).toBe('second');
			expect(q.dequeue()).toBe('third');
			expect(q.dequeue()).toBeNull();
		});
	});

	describe('Remove', () => {
		describe('remove(item)', () => {
			it('should return false when removing from empty queue', () => {
				const q = new FifoQueue<number>();

				expect(q.remove(123)).toBe(false);
				expect(q.size).toBe(0);
				expect(q.isEmpty).toBe(true);
				expect([...q]).toEqual([]);
			});

			it('should remove the only element', () => {
				const q = new FifoQueue<number>();

				q.enqueue(10);

				expect(q.remove(10)).toBe(true);
				expect(q.size).toBe(0);
				expect(q.isEmpty).toBe(true);
				expect(q.peek()).toBeNull();
				expect(q.dequeue()).toBeNull();
			});

			it('should remove from front (head) and keep FIFO order', () => {
				const q = new FifoQueue<number>();

				q.enqueue(1);
				q.enqueue(2);
				q.enqueue(3);

				expect(q.remove(1)).toBe(true);
				expect(q.size).toBe(2);
				expect(q.peek()).toBe(2);
				expect([...q]).toEqual([2, 3]);

				expect(q.dequeue()).toBe(2);
				expect(q.dequeue()).toBe(3);
				expect(q.dequeue()).toBeNull();
			});

			it('should remove from middle and keep FIFO order', () => {
				const q = new FifoQueue<number>();

				q.enqueue(1);
				q.enqueue(2);
				q.enqueue(3);
				q.enqueue(4);

				expect(q.remove(3)).toBe(true);
				expect(q.size).toBe(3);
				expect([...q]).toEqual([1, 2, 4]);

				expect(q.dequeue()).toBe(1);
				expect(q.dequeue()).toBe(2);
				expect(q.dequeue()).toBe(4);
				expect(q.dequeue()).toBeNull();
			});

			it('should remove from back (tail) and keep FIFO order', () => {
				const q = new FifoQueue<number>();

				q.enqueue(1);
				q.enqueue(2);
				q.enqueue(3);

				expect(q.remove(3)).toBe(true);
				expect(q.size).toBe(2);
				expect([...q]).toEqual([1, 2]);
			});

			it('should remove first occurrence when duplicates exist', () => {
				const q = new FifoQueue<number>();

				q.enqueue(1);
				q.enqueue(2);
				q.enqueue(3);
				q.enqueue(2);

				expect(q.remove(2)).toBe(true);
				expect([...q]).toEqual([1, 3, 2]);
				expect(q.size).toBe(3);

				expect(q.remove(2)).toBe(true);
				expect([...q]).toEqual([1, 3]);
				expect(q.size).toBe(2);
			});

			it('should not mutate queue when item not found', () => {
				const q = new FifoQueue<number>();

				q.enqueue(1);
				q.enqueue(2);
				q.enqueue(3);

				expect(q.remove(999)).toBe(false);
				expect(q.size).toBe(3);
				expect(q.peek()).toBe(1);
				expect([...q]).toEqual([1, 2, 3]);
			});

			it('should update isFull correctly after removals with limited capacity (including forced overflow)', () => {
				const q = new FifoQueue<number>({ capacity: 2 });

				expect(q.enqueue(1)).toBe(true);
				expect(q.enqueue(2)).toBe(true);
				expect(q.isFull).toBe(true);

				expect(q.enqueue(3, true)).toBe(true);
				expect(q.size).toBe(3);
				expect(q.isFull).toBe(true);

				expect(q.remove(2)).toBe(true);
				expect(q.size).toBe(2);
				expect(q.isFull).toBe(true);

				expect(q.remove(1)).toBe(true);
				expect(q.size).toBe(1);
				expect(q.isFull).toBe(false);

				expect([...q]).toEqual([3]);
			});
		});

		describe('removeAt(index))', () => {
			it('should return null when removing from empty queue', () => {
				const q = new FifoQueue<number>();

				expect(q.removeAt(0)).toBeNull();
				expect(q.removeAt(-1)).toBeNull();
				expect(q.size).toBe(0);
				expect(q.isEmpty).toBe(true);
				expect([...q]).toEqual([]);
			});

			it('should support negative index from the end', () => {
				const q = new FifoQueue<number>();

				q.enqueue(1);
				q.enqueue(2);
				q.enqueue(3);

				expect(q.removeAt(-1)).toBe(3);
				expect([...q]).toEqual([1, 2]);

				expect(q.removeAt(-2)).toBe(1);
				expect([...q]).toEqual([2]);

				expect(q.removeAt(-1)).toBe(2);
				expect([...q]).toEqual([]);
				expect(q.isEmpty).toBe(true);
			});

			it('should return null when index is out of bounds and not mutate the queue', () => {
				const q = new FifoQueue<number>();

				q.enqueue(1);
				q.enqueue(2);
				q.enqueue(3);

				expect(q.removeAt(-4)).toBeNull();
				expect(q.removeAt(3)).toBeNull();
				expect(q.removeAt(999)).toBeNull();

				expect(q.size).toBe(3);
				expect(q.peek()).toBe(1);
				expect([...q]).toEqual([1, 2, 3]);
			});

			it('should remove from front (index 0) and keep FIFO order', () => {
				const q = new FifoQueue<number>();

				q.enqueue(1);
				q.enqueue(2);
				q.enqueue(3);

				expect(q.removeAt(0)).toBe(1);
				expect(q.size).toBe(2);
				expect(q.peek()).toBe(2);
				expect([...q]).toEqual([2, 3]);

				expect(q.dequeue()).toBe(2);
				expect(q.dequeue()).toBe(3);
				expect(q.dequeue()).toBeNull();
			});

			it('should remove from middle and keep FIFO order', () => {
				const q = new FifoQueue<number>();

				q.enqueue(1);
				q.enqueue(2);
				q.enqueue(3);
				q.enqueue(4);

				expect(q.removeAt(2)).toBe(3);
				expect(q.size).toBe(3);
				expect([...q]).toEqual([1, 2, 4]);

				expect(q.dequeue()).toBe(1);
				expect(q.dequeue()).toBe(2);
				expect(q.dequeue()).toBe(4);
				expect(q.dequeue()).toBeNull();
			});

			it('should remove from back via positive and negative last index and keep FIFO order', () => {
				const q1 = new FifoQueue<number>();

				q1.enqueue(1);
				q1.enqueue(2);
				q1.enqueue(3);

				expect(q1.removeAt(2)).toBe(3);
				expect(q1.size).toBe(2);
				expect([...q1]).toEqual([1, 2]);

				const q2 = new FifoQueue<number>();

				q2.enqueue(1);
				q2.enqueue(2);
				q2.enqueue(3);

				expect(q2.removeAt(-1)).toBe(3);
				expect(q2.size).toBe(2);
				expect([...q2]).toEqual([1, 2]);
			});

			it('should remove by position even when duplicates exist (including negative index)', () => {
				const q = new FifoQueue<number>();

				q.enqueue(1);
				q.enqueue(2);
				q.enqueue(2);
				q.enqueue(3);

				expect(q.removeAt(1)).toBe(2);
				expect([...q]).toEqual([1, 2, 3]);

				expect(q.removeAt(-2)).toBe(2);
				expect([...q]).toEqual([1, 3]);
			});

			it('should update isFull correctly after removeAt with limited capacity (including forced overflow)', () => {
				const q = new FifoQueue<number>({ capacity: 2 });

				expect(q.enqueue(1)).toBe(true);
				expect(q.enqueue(2)).toBe(true);
				expect(q.isFull).toBe(true);

				expect(q.enqueue(3, true)).toBe(true);
				expect(q.size).toBe(3);
				expect(q.isFull).toBe(true);

				expect(q.removeAt(0)).toBe(1);
				expect(q.size).toBe(2);
				expect(q.isFull).toBe(true);

				expect(q.removeAt(-1)).toBe(3);
				expect(q.size).toBe(1);
				expect(q.isFull).toBe(false);

				expect([...q]).toEqual([2]);
			});
		});
	});

	describe('Clear', () => {
		it('should clear the queue', () => {
			const q = new FifoQueue<number>();

			q.enqueue(1);
			q.enqueue(2);

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
				const q = new FifoQueue<number>();

				expect(q.toArray()).toEqual([]);
				expect(q.size).toBe(0);
				expect(q.isEmpty).toBe(true);
			});

			it('should return entries in FIFO order and not mutate the queue', () => {
				const q = new FifoQueue<number>();

				q.enqueue(1);
				q.enqueue(2);
				q.enqueue(3);

				expect(q.toArray()).toEqual([1, 2, 3]);
				expect(q.size).toBe(3);
				expect(q.peek()).toBe(1);
				expect([...q]).toEqual([1, 2, 3]);
			});

			it('should return a snapshot not affected by later queue mutations', () => {
				const q = new FifoQueue<number>();

				q.enqueue(1);
				q.enqueue(2);

				const arr = q.toArray();

				q.dequeue();
				q.enqueue(3);

				expect(arr).toEqual([1, 2]);
				expect(q.toArray()).toEqual([2, 3]);
			});

			it('should not be affected by mutations of the returned array', () => {
				const q = new FifoQueue<number>();

				q.enqueue(1);
				q.enqueue(2);

				const arr = q.toArray();
				arr.push(3);
				arr[0] = 999;

				expect(q.toArray()).toEqual([1, 2]);
				expect([...q]).toEqual([1, 2]);
			});
		});

		describe('Iterator', () => {
			it('should iterate in FIFO order', () => {
				const q = new FifoQueue<number>();

				q.enqueue(1);
				q.enqueue(2);
				q.enqueue(3);

				expect([...q]).toEqual([1, 2, 3]);
			});
		});
	});
});
