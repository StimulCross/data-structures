import { type Queue } from '@stimulcross/ds-queue';
import { type Priority } from '../priority.js';

/**
 * A candidate for a selection policy.
 *
 * Contains the priority and the queue of tasks with that priority.
 */
export interface SelectionPolicyCandidate<T = unknown> {
	/**
	 * The priority of the candidate.
	 */
	priority: Priority;

	/**
	 * The queue of tasks with that priority.
	 */
	queue: Queue<T>;
}

/**
 * A selection policy to select a queue from a given set of candidates.
 */
export interface SelectionPolicy<T = unknown> {
	/**
	 * Selects a queue for the given candidates.
	 *
	 * @param candidates A set of candidates to select from.
	 *
	 * @returns The selected queue or `null` if no queue was selected.
	 */
	select(candidates: Iterable<SelectionPolicyCandidate<T>>): Queue<T> | null;

	/**
	 * Clears the priority policy.
	 */
	clear?(): void;
}
