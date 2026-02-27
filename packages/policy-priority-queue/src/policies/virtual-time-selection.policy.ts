import { type Queue } from '@stimulcross/ds-queue';
import { Priority } from '../priority.js';
import { type SelectionPolicyCandidate, type SelectionPolicy } from './selection-policy.js';

export const DEFAULT_WEIGHTS: Record<Priority, number> = {
	[Priority.Lowest]: 1 << 0,
	[Priority.Low]: 1 << 1,
	[Priority.Normal]: 1 << 2,
	[Priority.High]: 1 << 3,
	[Priority.Highest]: 1 << 4,
};

export class VirtualTimeSelectionPolicy<T = unknown> implements SelectionPolicy<T> {
	private readonly _vruntime = new Map<Priority, number>();
	private _globalMinVruntime = 0;

	constructor(private readonly _weights: Record<Priority, number> = DEFAULT_WEIGHTS) {}

	public select(candidates: Iterable<SelectionPolicyCandidate<T>>): Queue<T> | null {
		let selected: SelectionPolicyCandidate<T> | null = null;
		let minV = Infinity;
		let secondMinV = Infinity;

		for (const candidate of candidates) {
			let v = this._vruntime.get(candidate.priority);

			if (v === undefined || v < this._globalMinVruntime) {
				v = this._globalMinVruntime;
				this._vruntime.set(candidate.priority, v);
			}

			if (v < minV) {
				secondMinV = minV;
				minV = v;
				selected = candidate;
			} else if (v < secondMinV) {
				secondMinV = v;
			}
		}

		if (!selected) {
			return null;
		}

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		const weight = this._weights[selected.priority] ?? 1;
		const delta = 1 / weight;
		const newV = minV + delta;

		this._vruntime.set(selected.priority, newV);

		const currentActiveMin = Math.min(newV, secondMinV);
		this._globalMinVruntime = Math.max(this._globalMinVruntime, currentActiveMin);

		return selected.queue;
	}

	public clear(): void {
		this._vruntime.clear();
		this._globalMinVruntime = 0;
	}
}
