import { DoublyLinkedNode } from './doubly-linked-node.js';

/**
 * Doubly linked list implementation.
 *
 * @template T The type of elements stored in the list. Defaults to `unknown`.
 */
export class DoublyLinkedList<T = unknown> {
	private _head: DoublyLinkedNode<T> | null = null;
	private _tail: DoublyLinkedNode<T> | null = null;
	private _size = 0;

	/**
	 * Creates a doubly linked list from an iterable.
	 *
	 * Complexity: **O(n)**, where `n` is the number of elements in `iterable`.
	 *
	 * @param iterable An iterable of values to create a doubly linked list from.
	 *
	 * @returns A new doubly linked list instance.
	 */
	public static from<T>(iterable: Iterable<T>): DoublyLinkedList<T> {
		const list = new DoublyLinkedList<T>();

		for (const value of iterable) {
			list.push(value);
		}

		return list;
	}

	/**
	 * The number of elements in the doubly linked list.
	 *
	 * Complexity: **O(1)**.
	 */
	public get size(): number {
		return this._size;
	}

	/**
	 * Checks if the doubly linked list is empty.
	 *
	 * Complexity: **O(1)**.
	 */
	public get isEmpty(): boolean {
		return this._size === 0;
	}

	/**
	 * The first item in the doubly linked list. `null` if the list is empty.
	 *
	 * Complexity: **O(1)**.
	 */
	public get head(): T | null {
		return this._head?.value ?? null;
	}

	/**
	 * The last item in the doubly linked list. `null` if the list is empty.
	 *
	 * Complexity: **O(1)**.
	 */
	public get tail(): T | null {
		return this._tail?.value ?? null;
	}

	/**
	 * Adds a value to the end of the doubly linked list.
	 *
	 * Complexity: **O(1)**.
	 *
	 * @param value The value to add.
	 */
	public push(value: T): void {
		const node = new DoublyLinkedNode(value);

		if (this._tail) {
			node.prev = this._tail;
			this._tail.next = node;
			this._tail = node;
		} else {
			this._head = node;
			this._tail = node;
		}

		this._size += 1;
	}

	/**
	 * Removes and returns the value from the end of the doubly linked list.
	 *
	 * Complexity: **O(1)**.
	 *
	 * @returns The value removed from the end of the doubly linked list, or `null` if the list is empty.
	 */
	public pop(): T | null {
		if (!this._tail) {
			return null;
		}

		const value = this._tail.value;

		if (this._head === this._tail) {
			this._head = null;
			this._tail = null;
		} else {
			this._tail = this._tail.prev;
			this._tail!.next = null;
		}

		this._size -= 1;

		return value;
	}

	/**
	 * Adds a value to the beginning of the doubly linked list.
	 *
	 * Complexity: **O(1)**.
	 *
	 * @param value The value to add.
	 */
	public unshift(value: T): void {
		const node = new DoublyLinkedNode(value);

		if (this._head) {
			node.next = this._head;
			this._head.prev = node;
			this._head = node;
		} else {
			this._head = node;
			this._tail = node;
		}

		this._size += 1;
	}

	/**
	 * Removes and returns the value from the beginning of the doubly linked list.
	 *
	 * Complexity: **O(1)**.
	 *
	 * @returns The value removed from the beginning of the doubly linked list, or `null` if the list is empty.
	 */
	public shift(): T | null {
		if (!this._head) {
			return null;
		}

		const value = this._head.value;

		if (this._head === this._tail) {
			this._head = null;
			this._tail = null;
		} else {
			this._head = this._head.next;
			this._head!.prev = null;
		}

		this._size -= 1;

		return value;
	}

	/**
	 * Removes all elements from the doubly linked list.
	 *
	 * Complexity: **O(1)**.
	 */
	public clear(): void {
		this._head = null;
		this._tail = null;

		this._size = 0;
	}

	/**
	 * Checks if a value is in the doubly linked list.
	 *
	 * @param value The value to check.
	 *
	 * @returns `true` if the value is in the list, `false` otherwise.
	 */
	public contains(value: T): boolean {
		for (const item of this) {
			if (item === value) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Returns the index of a value in the doubly linked list.
	 *
	 * @param value The value to get the index of.
	 *
	 * @returns The index of the value, or `-1` if the value is not found.
	 */
	public indexOf(value: T): number {
		let index = 0;

		for (const item of this) {
			if (item === value) {
				return index;
			}

			index += 1;
		}

		return -1;
	}

	/**
	 * Inserts a value at the specified index.
	 *
	 * Complexity: **O(n)**.
	 *
	 * @param index The index at which to insert the value.
	 * @param value The value to insert.
	 *
	 * @returns `true` if the value was inserted, `false` otherwise.
	 */
	public insert(index: number, value: T): boolean {
		if (index < 0 || index > this._size) {
			return false;
		}

		if (index === 0) {
			this.unshift(value);
			return true;
		}

		if (index === this._size) {
			this.push(value);
			return true;
		}

		const nextNode = this._getNode(index)!;
		const prevNode = nextNode.prev!;

		const node = new DoublyLinkedNode(value);

		node.next = nextNode;
		node.prev = prevNode;

		nextNode.prev = node;
		prevNode.next = node;

		this._size += 1;

		return true;
	}

	/**
	 * Removes a value from the doubly linked list.
	 *
	 * Complexity: **O(n)**.
	 *
	 * @param value The value to remove.
	 *
	 * @returns `true` if the value was removed, `false` otherwise.
	 */
	public remove(value: T): boolean {
		let current = this._head;

		while (current) {
			if (current.value === value) {
				const prevNode = current.prev;
				const nextNode = current.next;

				if (prevNode) {
					prevNode.next = nextNode;
				} else {
					this._head = nextNode;
				}

				if (nextNode) {
					nextNode.prev = prevNode;
				} else {
					this._tail = prevNode;
				}

				current.prev = null;
				current.next = null;

				this._size -= 1;

				return true;
			}

			current = current.next;
		}

		return false;
	}

	/**
	 * Removes a value from the doubly linked list at the specified index.
	 *
	 * Complexity: **O(n)**.
	 *
	 * @param index The index of the value to remove.
	 *
	 * @returns The value removed from the list, or `null` if the list is empty or index is out of bounds.
	 */
	public removeByIndex(index: number): T | null {
		if (index < 0 || index >= this._size) {
			return null;
		}

		if (index === 0) {
			return this.shift();
		}

		if (index === this._size - 1) {
			return this.pop();
		}

		const node = this._getNode(index)!;
		const prevNode = node.prev!;
		const nextNode = node.next!;

		prevNode.next = nextNode;
		nextNode.prev = prevNode;

		node.prev = null;
		node.next = null;

		this._size -= 1;

		return node.value;
	}

	/**
	 * Finds the value in the doubly linked list.
	 *
	 * Complexity: **O(n)**.
	 *
	 * @param predicate The predicate function to test each value.
	 *
	 * @returns The value found in the list, or `null` if the value is not found.
	 */
	public find(predicate: (value: T) => boolean): T | null {
		let current = this._head;

		while (current) {
			if (predicate(current.value)) {
				return current.value;
			}

			current = current.next;
		}

		return null;
	}

	/**
	 * Converts the doubly linked list to an array.
	 *
	 * Complexity: **O(n)**.
	 */
	public toArray(): T[] {
		return [...this];
	}

	/**
	 * Converts the doubly linked list to an array in reverse order.
	 *
	 * Complexity: **O(n)**.
	 */
	public toReversedArray(): T[] {
		return [...this.reverse()];
	}

	/**
	 * Returns an iterator that iterates over the values in the doubly linked list.
	 */
	public *[Symbol.iterator](): IterableIterator<T> {
		let currentNode = this._head;

		while (currentNode) {
			yield currentNode.value;
			currentNode = currentNode.next;
		}
	}

	/**
	 * Returns an iterator that iterates over the values in the doubly linked list in reverse order.
	 */
	public *reverse(): IterableIterator<T> {
		let currentNode = this._tail;

		while (currentNode) {
			yield currentNode.value;
			currentNode = currentNode.prev;
		}
	}

	private _getNode(index: number): DoublyLinkedNode<T> | null {
		if (index < 0 || index >= this._size) {
			return null;
		}

		let currentNode: DoublyLinkedNode<T>;
		let currentIdx: number;

		if (index < this._size / 2) {
			currentNode = this._head!;
			currentIdx = 0;

			while (currentIdx < index) {
				currentNode = currentNode.next!;
				currentIdx += 1;
			}
		} else {
			currentNode = this._tail!;
			currentIdx = this._size - 1;

			while (currentIdx > index) {
				currentNode = currentNode.prev!;
				currentIdx -= 1;
			}
		}

		return currentNode;
	}
}
