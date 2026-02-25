import { describe, expect, it } from 'vitest';
import { isPowerOfTwo32 } from '../src/utils/is-power-of-two-32.js';
import { nextPowerOfTwo32 } from '../src/utils/next-power-of-two-32.js';

describe('nextPowerOfTwo32', () => {
	describe('should reject out-of-range inputs', () => {
		it('should throw RangeError for non-finite or non-integer values', () => {
			expect(() => nextPowerOfTwo32(Number.NaN)).toThrowError(RangeError);
			expect(() => nextPowerOfTwo32(Number.POSITIVE_INFINITY)).toThrowError(RangeError);
			expect(() => nextPowerOfTwo32(1.5)).toThrowError(RangeError);
		});

		it('should throw RangeError for negative values', () => {
			expect(() => nextPowerOfTwo32(-1)).toThrowError(RangeError);
			expect(() => nextPowerOfTwo32(-123_456)).toThrowError(RangeError);
		});

		it('should throw RangeError when next power of two cannot fit in 32-bit semantics', () => {
			expect(() => nextPowerOfTwo32(0x80_00_00_01)).toThrowError(RangeError);
			expect(() => nextPowerOfTwo32(0xff_ff_ff_ff)).toThrowError(RangeError);
		});
	});

	describe('should handle base cases', () => {
		it('should return 1 for n = 0', () => {
			expect(nextPowerOfTwo32(0)).toBe(1);
		});

		it('should return 1 for n = 1', () => {
			expect(nextPowerOfTwo32(1)).toBe(1);
		});
	});

	describe('should keep powers of two unchanged (within range)', () => {
		it('should return the same value for exact powers of two', () => {
			const powers = [1, 2, 4, 8, 16, 32, 256, 1024, 1 << 20, 1 << 30, 0x80_00_00_00];

			for (const n of powers) {
				expect(nextPowerOfTwo32(n)).toBe(n);
			}
		});
	});

	describe('should round up to the next power of two', () => {
		it('should round up for values between powers of two', () => {
			expect(nextPowerOfTwo32(3)).toBe(4);
			expect(nextPowerOfTwo32(5)).toBe(8);
			expect(nextPowerOfTwo32(6)).toBe(8);
			expect(nextPowerOfTwo32(7)).toBe(8);
			expect(nextPowerOfTwo32(9)).toBe(16);
			expect(nextPowerOfTwo32(17)).toBe(32);
		});

		it('should satisfy semantic properties for positive integers (1..2^31)', () => {
			const samples = [
				1,
				2,
				3,
				4,
				5,
				6,
				7,
				8,
				9,
				15,
				16,
				17,
				31,
				32,
				33,
				63,
				64,
				65,
				127,
				128,
				129,
				255,
				256,
				257,
				(1 << 20) - 1,
				1 << 20,
				(1 << 20) + 1,
				(1 << 30) - 1,
				1 << 30,
				0x7f_ff_ff_ff,
				0x80_00_00_00,
			];

			for (const n of samples) {
				const r = nextPowerOfTwo32(n);

				expect(isPowerOfTwo32(r)).toBe(true);
				expect(r).toBeGreaterThanOrEqual(n);

				if (n > 1) {
					expect(r).toBeLessThanOrEqual(2 * n);
				}
			}
		});
	});
});
