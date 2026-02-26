import { Deque } from '@stimulcross/ds-deque';
import { type QueueOptions } from './queue-options.js';
import { type Queue } from './queue.js';

/**
 * First-in-first-out (FIFO) queue implementation.
 */
export class FifoQueue<T = unknown> implements Queue<T> {
	private readonly _deque = new Deque<T>();
	private readonly _capacity: number;

	/**
	 * Creates a new priority queue instance.
	 *
	 * @param options Optional configuration options.
	 */
	constructor(options?: QueueOptions) {
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
	 * The number of entries in the queue.
	 *
	 * Complexity: **O(1)**.
	 */
	public get size(): number {
		return this._deque.size;
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
		return this._deque.size === 0;
	}

	/**
	 * Checks if the queue is full.
	 *
	 * Complexity: **O(1)**.
	 */
	public get isFull(): boolean {
		return this._deque.size >= this._capacity;
	}

	/**
	 * Adds an entry to the queue.
	 *
	 * Complexity: **O(1)**.
	 *
	 * @param entry The entry to add.
	 * @param force Force adding the entry even if the queue is full. Defaults to `false`.
	 */
	public enqueue(entry: T, force?: boolean): boolean {
		if (this.size >= this._capacity && !force) {
			return false;
		}

		this._deque.push(entry);

		return true;
	}

	/**
	 * Removes and returns the first entry from the queue.
	 *
	 * Returns `null` if the queue is empty.
	 *
	 * Complexity: **O(1)**.
	 */
	public dequeue(): T | null {
		return this._deque.shift() ?? null;
	}

	/**
	 * Returns the first entry in the queue without removing it.
	 *
	 * Returns `null` if the queue is empty.
	 *
	 * Complexity: **O(1)**.
	 */
	public peek(): T | null {
		return this._deque.peekHead() ?? null;
	}

	/**
	 * Removes an entry from the queue.
	 *
	 * Complexity: **O(n)**.
	 *
	 * @param entry The entry to remove.
	 *
	 * @returns `true` if the entry was removed, `false` otherwise.
	 */
	public remove(entry: T): boolean {
		return this._deque.remove(entry);
	}

	/**
	 * Removes an entry from the queue at the specified index.
	 *
	 * If the index is negative, it counts from the end of the queue.
	 *
	 * Complexity: **O(n)**.
	 *
	 * @param index The index of the entry to remove.
	 *
	 * @returns The removed entry, or `null` if the index is out of bounds.
	 */
	public removeAt(index: number): T | null {
		return this._deque.removeAt(index) ?? null;
	}

	/**
	 * Clears the queue.
	 *
	 * Complexity: **O(n)**.
	 */
	public clear(): void {
		this._deque.clear();
	}

	/**
	 * Converts the queue to an array.
	 *
	 * Complexity: **O(n)**.
	 */
	public toArray(): T[] {
		return this._deque.toArray();
	}

	/**
	 * Returns an iterator over the queue entries.
	 *
	 * Complexity: **O(n)**.
	 */
	public [Symbol.iterator](): Iterator<T> {
		return this._deque[Symbol.iterator]();
	}
}
