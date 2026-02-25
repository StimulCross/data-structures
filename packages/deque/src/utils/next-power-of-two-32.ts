/** @internal */
export function nextPowerOfTwo32(n: number): number {
	if (!Number.isFinite(n) || !Number.isInteger(n)) {
		throw new RangeError('n must be a finite integer');
	}

	if (n < 0 || n > 0x80_00_00_00) {
		throw new RangeError('n is out of range for 32-bit next power of two');
	}

	if (n <= 1) {
		return 1;
	}

	return (1 << (32 - Math.clz32(n - 1))) >>> 0;
}
