import { type Queue } from '@stimulcross/ds-queue';
import { type SelectionPolicyCandidate, type SelectionPolicy } from './selection-policy.js';
import { Priority } from '../priority.js';

export const DEFAULT_WEIGHTS: Record<Priority, number> = {
	[Priority.Lowest]: 1 << 0,
	[Priority.Low]: 1 << 1,
	[Priority.Normal]: 1 << 2,
	[Priority.High]: 1 << 3,
	[Priority.Highest]: 1 << 4,
};

/**
 * Weighted round-robin selection policy.
 */
export class WeightedRoundRobinSelectionPolicy<T = unknown> implements SelectionPolicy<T> {
	private readonly _weights: Record<Priority, number>;
	private readonly _credits = new Map<Priority, number>();

	/**
	 * Creates a new instance of the WeightedRoundRobinSelectionPolicy class.
	 *
	 * @param weights The weights for each priority level.
	 */
	constructor(weights?: Record<Priority, number>) {
		this._weights = weights ?? DEFAULT_WEIGHTS;
	}

	/**
	 * Selects a queue for the given candidates.
	 *
	 * Complexity: **O(n)**.
	 *
	 * @param candidates A set of candidates to select from.
	 */
	public select(candidates: Iterable<SelectionPolicyCandidate<T>>): Queue<T> | null {
		let selected: SelectionPolicyCandidate<T> | null = null;
		let maxCredit = -Infinity;
		let totalWeight = 0;

		for (const candidate of candidates) {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			const weight = this._weights[candidate.priority] ?? 1;
			totalWeight += weight;

			const credit = (this._credits.get(candidate.priority) ?? 0) + weight;
			this._credits.set(candidate.priority, credit);

			if (credit > maxCredit) {
				maxCredit = credit;
				selected = candidate;
			}
		}

		if (!selected) {
			return null;
		}

		const { priority, queue } = selected;

		this._credits.set(priority, this._credits.get(priority)! - totalWeight);

		return queue;
	}

	public clear(): void {
		this._credits.clear();
	}
}
