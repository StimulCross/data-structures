/** @internal */
export function isPowerOfTwo32(num: number): boolean {
	if (!Number.isFinite(num)) {
		return false;
	}

	const n = Math.trunc(num);

	if (n !== num) {
		return false;
	}

	return n !== 0 && (n & (n - 1)) === 0;
}
