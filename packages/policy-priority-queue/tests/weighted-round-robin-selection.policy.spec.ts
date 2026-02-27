import { type Queue } from '@stimulcross/ds-queue';
import { beforeEach, describe, expect, it } from 'vitest';
import { Priority, type SelectionPolicyCandidate, WeightedRoundRobinSelectionPolicy } from '../src/index.js';
import { DEFAULT_WEIGHTS } from '../src/policies/weighted-round-robin-selection.policy.js';

const createCandidate = (priority: Priority, id: string): SelectionPolicyCandidate => ({
	priority,
	queue: { id } as unknown as Queue<any>,
});

describe('WeightedRoundRobinSelectionPolicy', () => {
	let policy: WeightedRoundRobinSelectionPolicy;

	beforeEach(() => {
		policy = new WeightedRoundRobinSelectionPolicy();
	});

	describe('Core WRR distribution with default weights', () => {
		it('should distribute executions proportionally according to default weights', () => {
			const high = createCandidate(Priority.High, 'high');
			const normal = createCandidate(Priority.Normal, 'normal');

			const stats = { high: 0, normal: 0 };
			const weightHigh = DEFAULT_WEIGHTS[Priority.High];
			const weightNormal = DEFAULT_WEIGHTS[Priority.Normal];
			const totalTicks = weightHigh + weightNormal;

			for (let i = 0; i < totalTicks; i++) {
				const queue = policy.select([high, normal]) as unknown as { id: string };
				stats[queue.id as keyof typeof stats]++;
			}

			expect(stats.high).toBe(weightHigh);
			expect(stats.normal).toBe(weightNormal);
		});

		it('should handle all priority levels accurately over multiple cycles', () => {
			const candidates = [
				createCandidate(Priority.Highest, 'highest'),
				createCandidate(Priority.High, 'high'),
				createCandidate(Priority.Normal, 'normal'),
				createCandidate(Priority.Low, 'low'),
				createCandidate(Priority.Lowest, 'lowest'),
			];

			const stats: Record<string, number> = {
				highest: 0,
				high: 0,
				normal: 0,
				low: 0,
				lowest: 0,
			};

			const totalWeight = Object.values(DEFAULT_WEIGHTS).reduce((sum, w) => sum + w, 0);
			const cycles = 3;

			for (let i = 0; i < totalWeight * cycles; i++) {
				const queue = policy.select(candidates) as unknown as { id: string };
				stats[queue.id]++;
			}

			expect(stats.highest).toBe(DEFAULT_WEIGHTS[Priority.Highest] * cycles);
			expect(stats.high).toBe(DEFAULT_WEIGHTS[Priority.High] * cycles);
			expect(stats.normal).toBe(DEFAULT_WEIGHTS[Priority.Normal] * cycles);
			expect(stats.low).toBe(DEFAULT_WEIGHTS[Priority.Low] * cycles);
			expect(stats.lowest).toBe(DEFAULT_WEIGHTS[Priority.Lowest] * cycles);
		});
	});

	describe('Custom weights and specific algorithms', () => {
		it('should respect custom weights provided in the constructor', () => {
			const customPolicy = new WeightedRoundRobinSelectionPolicy({
				[Priority.High]: 10,
				[Priority.Low]: 2,
			} as Record<Priority, number>);

			const high = createCandidate(Priority.High, 'high');
			const low = createCandidate(Priority.Low, 'low');
			const stats = { high: 0, low: 0 };

			for (let i = 0; i < 12; i++) {
				const queue = customPolicy.select([high, low]) as unknown as { id: string };
				stats[queue.id as keyof typeof stats]++;
			}

			expect(stats.high).toBe(10);
			expect(stats.low).toBe(2);
		});

		it('should interleave selections smoothly', () => {
			const customPolicy = new WeightedRoundRobinSelectionPolicy({
				[Priority.High]: 5,
				[Priority.Normal]: 3,
			} as Record<Priority, number>);

			const high = createCandidate(Priority.High, 'high');
			const normal = createCandidate(Priority.Normal, 'normal');
			const sequence: string[] = [];

			for (let i = 0; i < 8; i++) {
				const queue = customPolicy.select([high, normal]) as unknown as { id: string };
				sequence.push(queue.id);
			}

			expect(sequence).toEqual(['high', 'normal', 'high', 'high', 'normal', 'high', 'normal', 'high']);
		});

		it('should fallback to weight 1 for unknown priorities when using custom weights', () => {
			const customPolicy = new WeightedRoundRobinSelectionPolicy({
				[Priority.Normal]: 4,
			} as Record<Priority, number>);

			const known = createCandidate(Priority.Normal, 'known');
			const unknown = createCandidate(Priority.Highest, 'unknown');
			const stats = { known: 0, unknown: 0 };

			for (let i = 0; i < 5; i++) {
				const queue = customPolicy.select([known, unknown]) as unknown as { id: string };
				stats[queue.id as keyof typeof stats]++;
			}

			expect(stats.known).toBe(4);
			expect(stats.unknown).toBe(1);
		});
	});

	describe('Dynamic behavior and Edge cases', () => {
		it('should return null when candidates list is empty', () => {
			expect(policy.select([])).toBeNull();
		});

		it('should select the single candidate and keep state bounded', () => {
			const normal = createCandidate(Priority.Normal, 'normal');

			for (let i = 0; i < 50; i++) {
				policy.select([normal]);
			}

			expect(policy.select([normal])).toBe(normal.queue);
		});
	});

	describe('State management', () => {
		it('should start a fresh distribution cycle after clear is called', () => {
			const high = createCandidate(Priority.High, 'high');
			const low = createCandidate(Priority.Low, 'low');

			policy.select([high, low]);
			policy.select([high, low]);
			policy.select([high, low]);
			policy.select([high, low]);
			policy.select([high, low]);
			// low is expected next

			policy.clear();

			const firstQueue = policy.select([high, low]);
			expect(firstQueue).toBe(high.queue);
		});
	});
});
