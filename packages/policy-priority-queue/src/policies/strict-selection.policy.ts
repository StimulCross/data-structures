import { type Queue } from '@stimulcross/ds-queue';
import { type SelectionPolicy, type SelectionPolicyCandidate } from './selection-policy.js';

export class StrictSelectionPolicy<T = unknown> implements SelectionPolicy<T> {
	public select(candidates: Iterable<SelectionPolicyCandidate<T>>): Queue<T> | null {
		let maxPriorityCandidate: SelectionPolicyCandidate<T> | undefined;

		for (const candidate of candidates) {
			if (!maxPriorityCandidate) {
				maxPriorityCandidate = candidate;
				continue;
			}

			if (candidate.priority > maxPriorityCandidate.priority) {
				maxPriorityCandidate = candidate;
			}
		}

		if (maxPriorityCandidate === undefined) {
			return null;
		}

		return maxPriorityCandidate.queue;
	}
}
