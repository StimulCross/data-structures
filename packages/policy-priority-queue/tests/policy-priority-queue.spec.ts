import { describe, it, expect, vi } from 'vitest';
import { type SelectionPolicy, PolicyPriorityQueue, Priority } from '../src/index.js';

describe('PolicyPriorityQueue', () => {
	describe('Initialization and Configuration', () => {
		it('should initialize with default options', () => {
			const queue = new PolicyPriorityQueue();

			expect(queue.capacity).toBe(Number.POSITIVE_INFINITY);
			expect(queue.size).toBe(0);
			expect(queue.isEmpty).toBe(true);
			expect(queue.isFull).toBe(false);
		});

		it('should initialize with custom capacity', () => {
			const queue = new PolicyPriorityQueue({ capacity: 10 });

			expect(queue.capacity).toBe(10);
			expect(queue.isFull).toBe(false);
		});

		it('should throw RangeError for invalid capacities', () => {
			expect(() => new PolicyPriorityQueue({ capacity: 0 })).toThrow(RangeError);
			expect(() => new PolicyPriorityQueue({ capacity: -5 })).toThrow(RangeError);
			expect(() => new PolicyPriorityQueue({ capacity: 5.5 })).toThrow(RangeError);
		});
	});

	describe('Enqueue Operations', () => {
		it('should enqueue items and update size appropriately', () => {
			const queue = new PolicyPriorityQueue<string>();

			const isEnqueued = queue.enqueue('task1', Priority.Normal);

			expect(isEnqueued).toBe(true);
			expect(queue.size).toBe(1);
			expect(queue.isEmpty).toBe(false);
		});

		it('should use Normal priority as default when enqueuing', () => {
			const queue = new PolicyPriorityQueue<string>();

			queue.enqueue('task1');

			const entries = [...queue.entries()];
			const normalQueue = entries.find(([priority]) => priority === Priority.Normal)?.[1];

			expect(normalQueue?.size).toBe(1);
		});

		it('should throw TypeError when enqueuing with an invalid priority', () => {
			const queue = new PolicyPriorityQueue<string>();

			expect(() => queue.enqueue('task', 99 as Priority)).toThrow(TypeError);
		});

		it('should reject enqueuing when full unless forced', () => {
			const queue = new PolicyPriorityQueue<string>({ capacity: 1 });
			queue.enqueue('task1');

			expect(queue.isFull).toBe(true);
			expect(queue.enqueue('task2')).toBe(false);
			expect(queue.size).toBe(1);

			expect(queue.enqueue('task3', Priority.High, true)).toBe(true);
			expect(queue.size).toBe(2);
		});
	});

	describe('Dequeue and Peek Operations', () => {
		it('should return null when peeking or dequeuing from an empty queue', () => {
			const queue = new PolicyPriorityQueue<string>();

			expect(queue.peek()).toBeNull();
			expect(queue.dequeue()).toBeNull();
		});

		it('should peek at the next item without removing it', () => {
			const queue = new PolicyPriorityQueue<string>();
			queue.enqueue('task1', Priority.High);

			expect(queue.peek()).toBe('task1');
			expect(queue.size).toBe(1);
		});

		it('should dequeue the next item and decrement size', () => {
			const queue = new PolicyPriorityQueue<string>();
			queue.enqueue('task1', Priority.High);

			expect(queue.dequeue()).toBe('task1');
			expect(queue.size).toBe(0);
			expect(queue.isEmpty).toBe(true);
		});
	});

	describe('Selection Policy Integration', () => {
		it('should bypass the selection policy when only one priority level has items', () => {
			const mockPolicy: SelectionPolicy<string> = {
				select: vi.fn(),
			};
			const queue = new PolicyPriorityQueue<string>({ selectionPolicy: mockPolicy });

			queue.enqueue('task1', Priority.Normal);
			queue.enqueue('task2', Priority.Normal);

			queue.dequeue();

			// eslint-disable-next-line @typescript-eslint/unbound-method
			expect(mockPolicy.select).not.toHaveBeenCalled();
		});

		it('should delegate to the selection policy when multiple priority levels have items', () => {
			const mockPolicy: SelectionPolicy<string> = {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-return
				select: vi.fn(candidates => candidates[0].queue),
			};
			const queue = new PolicyPriorityQueue<string>({ selectionPolicy: mockPolicy });

			queue.enqueue('task-low', Priority.Low);
			queue.enqueue('task-high', Priority.High);

			const dequeued = queue.dequeue();

			// eslint-disable-next-line @typescript-eslint/unbound-method
			expect(mockPolicy.select).toHaveBeenCalledOnce();
			expect(dequeued).toBeDefined();
		});
	});

	describe('Clear', () => {
		it('should clear all items from the queue', () => {
			const queue = new PolicyPriorityQueue<string>();

			queue.enqueue('task1', Priority.Normal);
			queue.enqueue('task2', Priority.High);

			queue.clear();

			expect(queue.size).toBe(0);
			expect(queue.isEmpty).toBe(true);
			expect([...queue.queues()].every(q => q.isEmpty)).toBe(true);
		});
	});

	describe('Iterators', () => {
		it('should yield all internal queues', () => {
			const queue = new PolicyPriorityQueue<string>();

			const queues = [...queue.queues()];

			expect(queues).toHaveLength(5);
			expect(queues.every(q => typeof q.enqueue === 'function')).toBe(true);
		});

		it('should yield all priority and queue entries', () => {
			const queue = new PolicyPriorityQueue<string>();

			const entries = [...queue.entries()];

			expect(entries).toHaveLength(5);
			expect(entries.map(([priority]) => priority)).toEqual([
				Priority.Lowest,
				Priority.Low,
				Priority.Normal,
				Priority.High,
				Priority.Highest,
			]);
		});
	});
});
