import { type Queue } from '@stimulcross/ds-queue';
import { beforeEach, describe, expect, it } from 'vitest';
import { type Priority, type SelectionPolicyCandidate, StrictSelectionPolicy } from '../src/index.js';

const createCandidate = (priority: Priority | number, id: string): SelectionPolicyCandidate => ({
	priority: priority as Priority,
	queue: { id } as unknown as Queue<any>,
});

describe('StrictSelectionPolicy', () => {
	let policy: StrictSelectionPolicy;

	beforeEach(() => {
		policy = new StrictSelectionPolicy();
	});

	describe('Core strict selection', () => {
		it('should select the candidate with the highest priority', () => {
			const lowest = createCandidate(1, 'lowest');
			const normal = createCandidate(3, 'normal');
			const highest = createCandidate(5, 'highest');

			const queue = policy.select([lowest, highest, normal]) as unknown as { id: string };

			expect(queue.id).toBe('highest');
		});

		it('should consistently select the highest priority regardless of candidates order', () => {
			const low = createCandidate(2, 'low');
			const high = createCandidate(4, 'high');

			const queue1 = policy.select([low, high]) as unknown as { id: string };
			const queue2 = policy.select([high, low]) as unknown as { id: string };

			expect(queue1.id).toBe('high');
			expect(queue2.id).toBe('high');
		});
	});

	describe('Tie-breaking and Edge cases', () => {
		it('should return null when candidates list is empty', () => {
			expect(policy.select([])).toBeNull();
		});

		it('should select the single candidate when only one is provided', () => {
			const normal = createCandidate(3, 'normal');

			const queue = policy.select([normal]) as unknown as { id: string };

			expect(queue.id).toBe('normal');
		});

		it('should select the first encountered candidate when priorities are equal', () => {
			const firstHigh = createCandidate(4, 'first-high');
			const secondHigh = createCandidate(4, 'second-high');
			const low = createCandidate(1, 'low');

			const queue = policy.select([firstHigh, secondHigh, low]) as unknown as { id: string };

			expect(queue.id).toBe('first-high');
		});

		it('should handle iterables that are not arrays', () => {
			const low = createCandidate(1, 'low');
			const high = createCandidate(4, 'high');

			const candidatesSet = new Set([low, high]);

			const queue = policy.select(candidatesSet) as unknown as { id: string };

			expect(queue.id).toBe('high');
		});
	});
});
