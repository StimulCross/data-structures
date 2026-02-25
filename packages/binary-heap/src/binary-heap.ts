export type CompareFn<T> = (a: T, b: T) => number;

/**
 * Binary heap implementation.
 *
 * @template T The type of elements stored in the heap.
 */
export class BinaryHeap<T = number> {
	private readonly _data: T[] = [];
	private readonly _compare: CompareFn<T>;

	constructor(compare?: CompareFn<T>) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this._compare = compare ?? ((a, b) => (b as any) - (a as any));
	}

	/**
	 * Creates a heap from an iterable.
	 *
	 * Complexity: **O(n)**.
	 *
	 * @param iterable The iterable to create the heap from.
	 * @param compare The comparison function. Defaults to descending order.
	 */
	public static from<T>(iterable: Iterable<T>, compare?: CompareFn<T>): BinaryHeap<T> {
		const heap = new BinaryHeap<T>(compare);

		for (const value of iterable) {
			heap._data.push(value);
		}

		if (heap.size > 1) {
			const lastNonLeafIdx = (heap.size - 2) >> 1;

			for (let i = lastNonLeafIdx; i >= 0; i--) {
				heap._siftDown(i);
			}
		}

		return heap;
	}

	/**
	 * The number of items in the heap.
	 */
	public get size(): number {
		return this._data.length;
	}

	/**
	 * Checks whether the heap is empty.
	 */
	public get isEmpty(): boolean {
		return this._data.length === 0;
	}

	/**
	 * Returns the root element of the heap without removing it.
	 * Returns `undefined` if the heap is empty.
	 *
	 * Complexity: **O(1)**.
	 */
	public peek(): T | undefined {
		return this._data[0];
	}

	/**
	 * Inserts a new element into the heap.
	 *
	 * Complexity: **O(log n)**.
	 *
	 * @param value
	 */
	public push(value: T): void {
		this._data.push(value);
		this._siftUp(this.size - 1);
	}

	/**
	 * Removes the root element from the heap and returns it.
	 * Returns `undefined` if the heap is empty.
	 *
	 * Complexity: **O(log n)**.
	 *
	 */
	public pop(): T | undefined {
		if (this.isEmpty) {
			return undefined;
		}

		const top = this._data[0];
		const last = this._data.pop()!;

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!this.isEmpty) {
			this._data[0] = last;
			this._siftDown(0);
		}

		return top;
	}

	/**
	 * Inserts a new element and extracts the root in a single balancing operation.
	 *
	 * Complexity: **O(log n)**.
	 */
	public pushPop(value: T): T {
		if (this.isEmpty) {
			return value;
		}

		const top = this._data[0];

		if (this._compare(value, top) < 0) {
			return value;
		}

		this._data[0] = value;
		this._siftDown(0);

		return top;
	}

	/**
	 * Replaces the root with a new element and returns the old root.
	 * If the heap is empty, inserts the element and returns undefined.
	 *
	 * Complexity: **O(log n)**.
	 */
	public replaceTop(value: T): T | undefined {
		if (this.isEmpty) {
			this._data.push(value);
			return undefined;
		}

		const top = this._data[0];
		this._data[0] = value;
		this._siftDown(0);

		return top;
	}

	/**
	 * Removes all elements from the heap.
	 *
	 * Complexity: **O(1)**.
	 */
	public clear(): void {
		this._data.length = 0;
	}

	/**
	 * Returns an **unsorted** array of the elements in the heap.
	 *
	 * Complexity: **O(n)**.
	 */
	public toArray(): T[] {
		return [...this._data];
	}

	/**
	 * Returns an **unsorted** iterator of the elements in the heap.
	 *
	 * Complexity: **O(n)** for all items in the heap.
	 */
	public *[Symbol.iterator](): IterableIterator<T> {
		for (const item of this._data) {
			yield item;
		}
	}

	private _siftUp(i: number): void {
		let currentIdx = i;

		while (currentIdx > 0) {
			const parentIdx = this._getParent(currentIdx);

			if (this._compare(this._data[currentIdx], this._data[parentIdx]) >= 0) {
				break;
			}

			this._swap(parentIdx, currentIdx);
			currentIdx = parentIdx;
		}
	}

	private _siftDown(i: number): void {
		const size = this.size;
		let currentIdx = i;

		while (true) {
			const leftIdx = this._getLeft(currentIdx);
			const rightIdx = this._getRight(currentIdx);
			let best = currentIdx;

			if (leftIdx < size && this._compare(this._data[leftIdx], this._data[best]) < 0) {
				best = leftIdx;
			}

			if (rightIdx < size && this._compare(this._data[rightIdx], this._data[best]) < 0) {
				best = rightIdx;
			}

			if (best === currentIdx) {
				break;
			}

			this._swap(currentIdx, best);
			currentIdx = best;
		}
	}

	private _getParent(i: number): number {
		return (i - 1) >> 1;
	}

	private _getLeft(i: number): number {
		return 2 * i + 1;
	}

	private _getRight(i: number): number {
		return 2 * i + 2;
	}

	private _swap(i: number, j: number): void {
		const temp = this._data[i];
		this._data[i] = this._data[j];
		this._data[j] = temp;
	}
}
