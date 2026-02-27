import { FifoQueue, type Queue, type QueueOptions } from '@stimulcross/ds-queue';
import { type SelectionPolicy, type SelectionPolicyCandidate } from './policies/selection-policy.js';
import { WeightedRoundRobinSelectionPolicy } from './policies/weighted-round-robin-selection.policy.js';
import { type PolicyPriorityQueueOptions } from './policy-priority-queue-options.js';
import { Priority } from './priority.js';

/**
 * A policy-driven priority queue.
 *
 * @template T The type of entries in the queue.
 */
export class PolicyPriorityQueue<T = unknown> {
	private _size: number = 0;
	private readonly _queues: Map<Priority, Queue<T>>;
	private readonly _policy: SelectionPolicy<T>;
	private readonly _capacity: number;

	/**
	 * Creates a new policy-driven priority queue.
	 *
	 * @param options Optional configuration options.
	 */
	constructor(options?: PolicyPriorityQueueOptions<T>) {
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

		const queueOptions: QueueOptions = { capacity: this._capacity };

		this._queues = new Map([
			[Priority.Lowest, new FifoQueue(queueOptions)],
			[Priority.Low, new FifoQueue(queueOptions)],
			[Priority.Normal, new FifoQueue(queueOptions)],
			[Priority.High, new FifoQueue(queueOptions)],
			[Priority.Highest, new FifoQueue(queueOptions)],
		]);

		this._policy = options?.selectionPolicy ?? new WeightedRoundRobinSelectionPolicy<T>();
	}

	/**
	 * The number of entries in the queue.
	 *
	 * Complexity: **O(1)**.
	 */
	public get size(): number {
		return this._size;
	}

	/**
	 * Checks if the queue is empty.
	 *
	 * Complexity: **O(1)**.
	 */
	public get isEmpty(): boolean {
		return this._size === 0;
	}

	/**
	 * Checks if the queue is full.
	 *
	 * Complexity: **O(1)**.
	 */
	public get isFull(): boolean {
		return this._size >= this._capacity;
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
	 * Returns the queue associated with the specified priority.
	 *
	 * Complexity: **O(1)**.
	 *
	 * @param priority The priority of the queue.
	 */
	public getQueue(priority: Priority): Queue<T> {
		return this._queues.get(priority)!;
	}

	/**
	 * Returns an entry from the queue without removing it.
	 *
	 * This method uses a selection policy to determine which queue to use.
	 *
	 * Complexity: **O(1)** for built-in selection policies.
	 */
	public peek(): T | null {
		const selectedQueue = this._selectQueue();
		return selectedQueue?.peek() ?? null;
	}

	/**
	 * Adds an entry to the queue.
	 *
	 * @param entry The entry to add.
	 * @param priority The priority of the entry. Defaults to `Priority.Normal`.
	 * @param force Force adding the entry even if the queue is full. Defaults to `false`.
	 */
	public enqueue(entry: T, priority: Priority = Priority.Normal, force?: boolean): boolean {
		if (this.size >= this._capacity && !force) {
			return false;
		}

		const queue = this._queues.get(priority);

		if (!queue) {
			throw new TypeError(`Invalid priority: ${priority}`);
		}

		const isEnqueued = queue.enqueue(entry, true);
		this._size += 1;

		return isEnqueued;
	}

	/**
	 * Removes an entry from the queue and returns it.
	 *
	 * Returns `null` if the queue is empty.
	 *
	 * This method uses a selection policy to determine which queue to use.
	 *
	 * Complexity: **O(1)** for built-in selection policies.
	 */
	public dequeue(): T | null {
		const selectedQueue = this._selectQueue();
		const entry = selectedQueue?.dequeue();

		if (entry) {
			this._size -= 1;
			return entry;
		}

		return null;
	}

	/**
	 * Clears the queue.
	 *
	 * Complexity: **O(n)**.
	 */
	public clear(): void {
		this._policy.clear?.();

		for (const queue of this._queues.values()) {
			queue.clear();
		}

		this._size = 0;
	}

	/**
	 * Returns an iterator over the queues.
	 *
	 * Complexity: **O(n)** to iterate over the queues.
	 */
	public *queues(): Generator<Queue<T>, void, unknown> {
		for (const queue of this._queues.values()) {
			yield queue;
		}
	}

	/**
	 * Returns an iterator over the entries (priority and queue).
	 *
	 * Complexity: **O(n)** to iterate over the queues.
	 */
	public *entries(): Generator<[Priority, Queue<T>], void, unknown> {
		for (const entry of this._queues) {
			yield entry;
		}
	}

	private _selectQueue(): Queue<T> | null {
		const candidates: Array<SelectionPolicyCandidate<T>> = [];

		for (const [priority, queue] of this._queues.entries()) {
			if (queue.isEmpty) {
				continue;
			}

			candidates.push({ priority, queue });
		}

		if (candidates.length === 0) {
			return null;
		}

		return candidates.length === 1 ? candidates[0].queue : this._policy.select(candidates);
	}
}
