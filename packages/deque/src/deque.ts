import { isPowerOfTwo32 } from './utils/is-power-of-two-32.js';
import { nextPowerOfTwo32 } from './utils/next-power-of-two-32.js';

/**
 * A double-ended queue (Deque) implementation.
 *
 * @template T The type of element stored in the deque.
 */
export class Deque<T> {
	private readonly _initialCapacity: number;

	private _buffer: Array<T | undefined>;
	private _head = 0;
	private _tail = 0;
	private _size = 0;
	private _capacity: number;
	private _mask: number;

	/**
	 * Creates a deque instance.
	 *
	 * @param initialCapacity The initial capacity of the deque. Must be a power of 2. Defaults to 16.
	 */
	constructor(initialCapacity?: number) {
		if (initialCapacity === undefined) {
			this._initialCapacity = 1 << 4;
		} else {
			if (!isPowerOfTwo32(initialCapacity)) {
				throw new TypeError('initialCapacity must be a power of 2');
			}

			this._initialCapacity = initialCapacity;
		}

		this._capacity = this._initialCapacity;
		this._mask = this._capacity - 1;
		this._buffer = new Array<T | undefined>(this._capacity);
	}

	/**
	 * Creates a deque instance from an iterable.
	 *
	 * @param iterable The iterable to create the deque from.
	 */
	public static from<T>(iterable: Iterable<T>): Deque<T> {
		const deque = new Deque<T>();

		for (const item of iterable) {
			deque.push(item);
		}

		return deque;
	}

	/**
	 * The number of items in the deque.
	 */
	public get size(): number {
		return this._size;
	}

	/**
	 * Checks if the deque is empty.
	 */
	public get isEmpty(): boolean {
		return this._size === 0;
	}

	/**
	 * The current capacity of the deque.
	 */
	public get capacity(): number {
		return this._capacity;
	}

	/**
	 * Peeks at the head of the deque without removing it.
	 */
	public peekHead(): T | undefined {
		return this._buffer[this._head];
	}

	/**
	 * Peeks at the tail of the deque without removing it.
	 */
	public peekTail(): T | undefined {
		return this._buffer[(this._tail - 1) & this._mask];
	}

	/**
	 * Gets the item at the specified index.
	 *
	 * Returns `undefined` if the index is out of bounds.
	 *
	 * @param index The index of the item to get.
	 */
	public at(index: number): T | undefined {
		if (this._size === 0) {
			return undefined;
		}

		let i = index;

		if (i < 0) {
			i += this._size;
		}

		if (i < 0 || i >= this._size) {
			return undefined;
		}

		return this._buffer[(this._head + i) & this._mask] as T;
	}

	/**
	 * Adds one or more values to the end of the deque.
	 */
	public push(...values: T[]): void {
		const count = values.length;

		if (count === 0) {
			return;
		}

		if (this._size + count > this._capacity) {
			this._grow(count);
		}

		for (let i = 0; i < count; i++) {
			this._buffer[this._tail] = values[i];
			this._tail = (this._tail + 1) & this._mask;
		}

		this._size += count;
	}

	/**
	 * Removes and returns the tail of the deque.
	 */
	public pop(): T | undefined {
		if (this._size === 0) {
			return undefined;
		}

		this._tail = (this._tail - 1) & this._mask;
		const value = this._buffer[this._tail];
		this._buffer[this._tail] = undefined;
		this._size -= 1;

		return value;
	}

	/**
	 * Removes and returns the head of the deque.
	 */
	public shift(): T | undefined {
		if (this._size === 0) {
			return undefined;
		}

		const value = this._buffer[this._head];
		this._buffer[this._head] = undefined;
		this._head = (this._head + 1) & this._mask;
		this._size -= 1;

		return value;
	}

	/**
	 * Adds one or more values to the beginning of the deque.
	 */
	public unshift(...values: T[]): void {
		const count = values.length;

		if (count === 0) {
			return;
		}

		if (this._size + count > this._capacity) {
			this._grow(count);
		}

		this._head = (this._head - count) & this._mask;

		for (let i = 0; i < count; i++) {
			this._buffer[(this._head + i) & this._mask] = values[i];
		}

		this._size += count;
	}

	/**
	 * Removes the first occurrence of a value from the deque.
	 *
	 * @returns `true` if the value was found and removed, `false` otherwise.
	 */
	public remove(value: T): boolean {
		if (this._size === 0) {
			return false;
		}

		for (let i = 0; i < this._size; i++) {
			const idx = (this._head + i) & this._mask;

			if (this._buffer[idx] === value) {
				this._removeAtInternal(i);
				return true;
			}
		}

		return false;
	}

	/**
	 * Removes the item at the specified index.
	 *
	 * @param index The index of the item to remove.
	 *
	 * @returns The removed item, or `undefined` if the index is out of bounds.
	 */
	public removeAt(index: number): T | undefined {
		if (this._size === 0) {
			return undefined;
		}

		let i = index;

		if (i < 0) {
			i += this._size;
		}

		if (i < 0 || i >= this._size) {
			return undefined;
		}

		return this._removeAtInternal(i);
	}

	/**
	 * Rotates the deque by the specified number of steps.
	 *
	 * If the number of steps is negative, the deque will be rotated in the opposite direction (left).
	 *
	 * @param steps The number of steps to rotate the deque.
	 */
	public rotate(steps: number): void {
		if (this._size <= 1) {
			return;
		}

		let k = steps % this._size;

		if (k === 0) {
			return;
		}

		if (k < 0) {
			k += this._size;
		}

		if (k > this._size / 2) {
			const leftSteps = this._size - k;

			for (let i = 0; i < leftSteps; i++) {
				this.push(this.shift()!);
			}
		} else {
			for (let i = 0; i < k; i++) {
				this.unshift(this.pop()!);
			}
		}
	}

	/**
	 * Clears the deque.
	 *
	 * @param shouldShrink If `true`, the deque will be shrunk to its initial capacity.
	 */
	public clear(shouldShrink?: boolean): void {
		if (shouldShrink && this._capacity > this._initialCapacity) {
			this._capacity = this._initialCapacity;
			this._mask = this._capacity - 1;
			this._buffer = new Array<T | undefined>(this._capacity);
		} else {
			for (let i = 0; i < this._size; i++) {
				this._buffer[(this._head + i) & this._mask] = undefined;
			}
		}

		this._head = 0;
		this._tail = 0;
		this._size = 0;
	}

	/**
	 * Converts the deque to an array.
	 */
	public toArray(): T[] {
		const result = new Array<T>(this._size);

		for (let i = 0; i < this._size; i++) {
			result[i] = this._buffer[(this._head + i) & this._mask]!;
		}

		return result;
	}

	/**
	 * Converts the deque to a reversed array.
	 */
	public toReversedArray(): T[] {
		const result = new Array<T>(this._size);

		for (let i = 0; i < this._size; i++) {
			result[i] = this._buffer[(this._tail - 1 - i) & this._mask]!;
		}

		return result;
	}

	/**
	 * Returns an iterator over the keys (indexes) of the deque.
	 */
	public *keys(): IterableIterator<number> {
		for (let i = 0; i < this._size; i++) {
			yield i;
		}
	}

	/**
	 * Returns an iterator over the values of the deque.
	 */
	public *values(): IterableIterator<T> {
		for (let i = 0; i < this._size; i++) {
			const idx = (this._head + i) & this._mask;
			yield this._buffer[idx] as T;
		}
	}

	/**
	 * Returns an iterator over the entries of the deque.
	 */
	public *entries(): IterableIterator<[number, T]> {
		for (let i = 0; i < this._size; i++) {
			const idx = (this._head + i) & this._mask;
			yield [i, this._buffer[idx] as T];
		}
	}

	/**
	 * Returns an iterator over the keys (indexes) of the deque in reverse order.
	 */
	public *keysReverse(): IterableIterator<number> {
		for (let i = this._size - 1; i >= 0; i--) {
			yield i;
		}
	}

	/**
	 * Returns an iterator over the values of the deque in reverse order.
	 */
	public *valuesReverse(): IterableIterator<T> {
		for (let i = 0; i < this._size; i++) {
			const idx = (this._tail - 1 - i) & this._mask;
			yield this._buffer[idx] as T;
		}
	}

	/**
	 * Returns an iterator over the entries of the deque in reverse order.
	 */
	public *entriesReverse(): IterableIterator<[number, T]> {
		for (let i = this._size - 1; i >= 0; i--) {
			const idx = (this._head + i) & this._mask;
			yield [i, this._buffer[idx] as T];
		}
	}

	/**
	 * Returns an iterator over the deque.
	 */
	public *[Symbol.iterator](): IterableIterator<T> {
		yield* this.values();
	}

	private _removeAtInternal(i: number): T | undefined {
		const idx = (this._head + i) & this._mask;
		const value = this._buffer[idx];

		const leftCount = i;
		const rightCount = this._size - 1 - i;

		if (leftCount <= rightCount) {
			for (let j = i; j > 0; j--) {
				const from = (this._head + j - 1) & this._mask;
				const to = (this._head + j) & this._mask;

				this._buffer[to] = this._buffer[from];
			}

			this._buffer[this._head] = undefined;
			this._head = (this._head + 1) & this._mask;
		} else {
			for (let j = i; j < this._size - 1; j++) {
				const from = (this._head + j + 1) & this._mask;
				const to = (this._head + j) & this._mask;

				this._buffer[to] = this._buffer[from];
			}

			this._tail = (this._tail - 1) & this._mask;
			this._buffer[this._tail] = undefined;
		}

		this._size -= 1;

		return value;
	}

	private _grow(count: number): void {
		const newCapacity = nextPowerOfTwo32(this._size + count);
		const newBuffer = new Array(newCapacity) as Array<T | undefined>;

		for (let i = 0; i < this._size; i++) {
			newBuffer[i] = this._buffer[(this._head + i) & this._mask];
		}

		this._buffer = newBuffer;
		this._capacity = newCapacity;
		this._mask = newCapacity - 1;
		this._head = 0;
		this._tail = this._size;
	}
}
