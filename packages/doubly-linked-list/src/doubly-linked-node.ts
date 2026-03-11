/** @internal */
export class DoublyLinkedNode<T = unknown> {
	public prev: DoublyLinkedNode<T> | null = null;
	public next: DoublyLinkedNode<T> | null = null;

	constructor(public value: T) {}
}
