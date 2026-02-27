import { type Queue } from '@stimulcross/ds-queue';
import { beforeEach, describe, expect, it } from 'vitest';
import { Priority, type SelectionPolicyCandidate, VirtualTimeSelectionPolicy } from '../src/index.js';

const createCandidate = (priority: Priority, id: string): SelectionPolicyCandidate => ({
	priority,
	queue: { id } as unknown as Queue<any> & { id: string },
});

describe('VirtualTimeSelectionPolicy', () => {
	let policy: VirtualTimeSelectionPolicy;

	beforeEach(() => {
		policy = new VirtualTimeSelectionPolicy();
	});

	describe('selection semantics', () => {
		it('should return null when candidates list is empty', () => {
			expect(policy.select([])).toBeNull();
		});

		it('should select the single available candidate', () => {
			const candidate = createCandidate(Priority.Normal, 'normal');

			expect(policy.select([candidate])).toBe(candidate.queue);
		});

		it('should distribute selections proportionally to priority weights', () => {
			const high = createCandidate(Priority.High, 'high');
			const normal = createCandidate(Priority.Normal, 'normal');

			const counts = { high: 0, normal: 0 };
			const candidates = [high, normal];

			for (let i = 0; i < 12; i++) {
				const selected = policy.select(candidates);

				if (selected === high.queue) {
					counts.high++;
				}

				if (selected === normal.queue) {
					counts.normal++;
				}
			}

			expect(counts.high).toBe(8);
			expect(counts.normal).toBe(4);
		});
	});

	describe('fast-forwarding and global vruntime', () => {
		it('should fast-forward dormant candidates to prevent execution spikes', () => {
			const high = createCandidate(Priority.High, 'high');
			const low = createCandidate(Priority.Low, 'low');

			for (let i = 0; i < 100; i++) {
				policy.select([high]);
			}

			let lowSelectedCount = 0;

			for (let i = 0; i < 5; i++) {
				const selected = policy.select([high, low]);

				if (selected === low.queue) {
					lowSelectedCount++;
				}
			}

			expect(lowSelectedCount).toBeLessThan(5);
			expect(lowSelectedCount).toBeGreaterThan(0);
		});

		it('should maintain global vruntime monotonicity when a candidate is removed and added back', () => {
			const high = createCandidate(Priority.High, 'high');
			const normal = createCandidate(Priority.Normal, 'normal');

			for (let i = 0; i < 50; i++) {
				policy.select([high, normal]);
			}

			const selectedWithoutNormal = policy.select([high]);
			expect(selectedWithoutNormal).toBe(high.queue);

			const firstTickWithNormal = policy.select([high, normal]);
			expect(firstTickWithNormal).toBe(high.queue);

			const secondTickWithNormal = policy.select([high, normal]);
			expect(secondTickWithNormal).toBe(normal.queue);
		});
	});

	describe('edge cases', () => {
		it('should select the first candidate in the iterable when vruntimes are strictly equal', () => {
			const c1 = createCandidate(Priority.Normal, 'c1');
			const c2 = createCandidate(Priority.Low, 'c2');

			expect(policy.select([c1, c2])).toBe(c1.queue);

			policy.clear();

			expect(policy.select([c2, c1])).toBe(c2.queue);
		});

		it('should use fallback weight of 1 for unknown priorities', () => {
			const customPolicy = new VirtualTimeSelectionPolicy({
				[Priority.High]: 8,
			} as Record<Priority, number>);

			const known = createCandidate(Priority.High, 'known');
			const unknown = createCandidate(Priority.Low, 'unknown');

			const counts = { known: 0, unknown: 0 };

			for (let i = 0; i < 9; i++) {
				const selected = customPolicy.select([known, unknown]);

				if (selected === known.queue) {
					counts.known++;
				}

				if (selected === unknown.queue) {
					counts.unknown++;
				}
			}

			expect(counts.known).toBe(8);
			expect(counts.unknown).toBe(1);
		});
	});

	describe('execution stats and proportional distribution', () => {
		it('should distribute executions proportionally among all 5 priority levels over time', () => {
			const candidates = [
				createCandidate(Priority.Lowest, 'lowest'),
				createCandidate(Priority.Low, 'low'),
				createCandidate(Priority.Normal, 'normal'),
				createCandidate(Priority.High, 'high'),
				createCandidate(Priority.Highest, 'highest'),
			];

			const stats: Record<string, number> = {
				lowest: 0,
				low: 0,
				normal: 0,
				high: 0,
				highest: 0,
			};

			const cycles = 10;
			const totalTicks = 31 * cycles;

			for (let i = 0; i < totalTicks; i++) {
				const queue = policy.select(candidates) as unknown as { id: string };
				stats[queue.id]++;
			}

			expect(stats.lowest).toBe(cycles);
			expect(stats.low).toBe(2 * cycles);
			expect(stats.normal).toBe(4 * cycles);
			expect(stats.high).toBe(8 * cycles);
			expect(stats.highest).toBe(16 * cycles);
		});

		it('should distribute executions proportionally for a subset of priorities', () => {
			const high = createCandidate(Priority.High, 'high');
			const low = createCandidate(Priority.Low, 'low');

			const stats = { high: 0, low: 0 };

			for (let i = 0; i < 50; i++) {
				const queue = policy.select([high, low]) as unknown as { id: string };
				stats[queue.id as keyof typeof stats]++;
			}

			expect(stats.high).toBe(40);
			expect(stats.low).toBe(10);
		});
	});

	describe('dormancy and wake-up behavior', () => {
		it('should prevent execution spikes when a dormant candidate wakes up', () => {
			const normal = createCandidate(Priority.Normal, 'normal');
			const lowest = createCandidate(Priority.Lowest, 'lowest');

			for (let i = 0; i < 20; i++) {
				policy.select([normal, lowest]);
			}

			for (let i = 0; i < 100; i++) {
				policy.select([normal]);
			}

			const stats = { normal: 0, lowest: 0 };

			for (let i = 0; i < 10; i++) {
				const queue = policy.select([normal, lowest]) as unknown as { id: string };
				stats[queue.id as keyof typeof stats]++;
			}

			expect(stats.lowest).toBe(2);
			expect(stats.normal).toBe(8);
		});

		it('should fast-forward completely new candidates to the current global vruntime', () => {
			const highest = createCandidate(Priority.Highest, 'highest');
			const normal = createCandidate(Priority.Normal, 'normal');

			for (let i = 0; i < 200; i++) {
				policy.select([highest]);
			}

			const stats = { highest: 0, normal: 0 };

			for (let i = 0; i < 20; i++) {
				const queue = policy.select([highest, normal]) as unknown as { id: string };
				stats[queue.id as keyof typeof stats]++;
			}

			expect(stats.highest).toBe(16);
			expect(stats.normal).toBe(4);
		});
	});

	describe('clearing state', () => {
		it('should start distribution from scratch after clear is called', () => {
			const high = createCandidate(Priority.High, 'high');
			const low = createCandidate(Priority.Low, 'low');

			for (let i = 0; i < 100; i++) {
				policy.select([high]);
			}

			policy.clear();

			const firstQueue = policy.select([low, high]);
			expect(firstQueue).toBe(low.queue);

			const secondQueue = policy.select([low, high]);
			expect(secondQueue).toBe(high.queue);
		});

		it('should reset global vruntime and not fast-forward after clear', () => {
			const highest = createCandidate(Priority.Highest, 'highest');
			const normal = createCandidate(Priority.Normal, 'normal');

			for (let i = 0; i < 100; i++) {
				policy.select([highest]);
			}

			policy.clear();

			policy.select([normal]);
			const queueAfterClear = policy.select([highest, normal]);

			expect(queueAfterClear).toBe(highest.queue);
		});
	});
});
