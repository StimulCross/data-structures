import { BinaryHeap, type Comparator } from '@stimulcross/ds-binary-heap';
import { type QueueOptions } from './queue-options.js';
import { type Queue } from './queue.js';

/**
 * Comparator function for sorting items in a priority queue.
 *
 * @template T The type of items in the priority queue.
 */
export class PriorityQueue<T = unknown> implements Queue<T> {
	private readonly _heap: BinaryHeap<T>;
	private readonly _capacity: number;

	constructor(comparator: Comparator<T>, options?: QueueOptions) {
		this._heap = new BinaryHeap<T>(comparator);

		if (options?.capacity === undefined) {
			this._capacity = Number.POSITIVE_INFINITY;
		} else {
			if (
				options.capacity <= 0 ||
				(!Number.isSafeInteger(options.capacity) && options.capacity !== Number.POSITIVE_INFINITY)
			) {
				throw new RangeError('Maximum queue capacity must be an integer greater than zero or Infinity');
			}

			this._capacity = options.capacity;
		}
	}

	/**
	 * The number of items in the queue.
	 *
	 * Complexity: **O(1)**.
	 */
	public get size(): number {
		return this._heap.size;
	}

	/**
	 * The maximum capacity of the queue.
	 *
	 * Complexity: **O(1)**.
	 */
	public get capacity(): number {
		return this._capacity;
	}

	/**
	 * Checks if the queue is empty.
	 *
	 * Complexity: **O(1)**.
	 */
	public get isEmpty(): boolean {
		return this._heap.size === 0;
	}

	/**
	 * Checks if the queue is full.
	 *
	 * Complexity: **O(1)**.
	 */
	public get isFull(): boolean {
		return this._heap.size >= this._capacity;
	}

	/**
	 * Adds an item to the queue.
	 *
	 * Complexity: **O(log n)**.
	 *
	 * @param entry The item to add.
	 * @param force Force adding the item even if the queue is full. Defaults to `false`.
	 *
	 * @returns `true` if the item was added, `false` otherwise.
	 */
	public enqueue(entry: T, force?: boolean): boolean {
		if (this.size >= this._capacity && !force) {
			return false;
		}

		this._heap.push(entry);

		return true;
	}

	/**
	 * Removes and returns the first item from the queue.
	 *
	 * Complexity: **O(log n)**.
	 */
	public dequeue(): T | null {
		return this._heap.pop() ?? null;
	}

	/**
	 * Returns the first item in the queue without removing it.
	 *
	 * Complexity: **O(1)**.
	 */
	public peek(): T | null {
		return this._heap.peek() ?? null;
	}

	/**
	 * Removes an item from the queue.
	 *
	 * Complexity: **O(n)**.
	 *
	 * @param entry The item to remove.
	 */
	public remove(entry: T): boolean {
		return this._heap.remove(entry);
	}

	/**
	 * Clears the queue.
	 *
	 * Complexity: **O(1)**.
	 */
	public clear(): void {
		this._heap.clear();
	}

	/**
	 * Return an array containing all the items in the queue.
	 *
	 * The items are returned in **unsorted** order.
	 *
	 * Complexity: **O(n)**.
	 */
	public toArray(): T[] {
		return this._heap.toArray();
	}

	/**
	 * Returns an iterator over the queue items.
	 *
	 * Complexity: **O(n)**.
	 */
	public [Symbol.iterator](): Iterator<T> {
		return this._heap[Symbol.iterator]();
	}
}
