/**
 * A queue data structure.
 *
 * @template T The type of entries in the queue.
 */
export interface Queue<T = unknown> extends Iterable<T> {
	/**
	 * The number of entries in the queue.
	 */
	get size(): number;

	/**
	 * The maximum capacity of the queue.
	 */
	get capacity(): number;

	/**
	 * Checks if the queue is empty.
	 */
	get isEmpty(): boolean;

	/**
	 * Checks if the queue is full.
	 */
	get isFull(): boolean;

	/**
	 * Adds an entry to the queue.
	 *
	 * @param item The entry to add.
	 * @param force Force adding the entry even if the queue is full. Defaults to `false`.
	 *
	 * @returns `true` if the entry was added, `false` otherwise.
	 */
	enqueue(item: T, force?: boolean): boolean;

	/**
	 * Removes and returns the first entry from the queue.
	 *
	 * Returns `null` if the queue is empty.
	 */
	dequeue(): T | null;

	/**
	 * Returns the first entry in the queue without removing it.
	 *
	 * Returns `null` if the queue is empty.
	 */
	peek(): T | null;

	/**
	 * Removes an entry from the queue.
	 *
	 * @param entry The entry to remove.
	 *
	 * @returns `true` if the entry was removed, `false` otherwise.
	 */
	remove(entry: T): boolean;

	/**
	 * Clears the queue.
	 */
	clear(): void;

	/**
	 * Return an array containing all the items in the queue.
	 */
	toArray(): T[];
}
