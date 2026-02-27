import { type SelectionPolicy } from './policies/selection-policy.js';

/**
 * Options for creating a queue.
 */
export interface PolicyPriorityQueueOptions<T = unknown> {
	/**
	 * The maximum capacity of the queue.
	 *
	 * @default Infinity
	 */
	capacity?: number;

	/**
	 * The selection policy to use.
	 *
	 * @default {@link WeightedRoundRobinSelectionPolicy}
	 */
	selectionPolicy?: SelectionPolicy<T>;
}
