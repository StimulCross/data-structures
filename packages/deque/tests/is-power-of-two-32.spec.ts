import { describe, it, expect } from 'vitest';
import { isPowerOfTwo32 } from '../src/utils/is-power-of-two-32.js';

describe('isPowerOfTwo32', () => {
	it('should return true for powers of two', () => {
		expect(isPowerOfTwo32(1)).toBe(true);
		expect(isPowerOfTwo32(2)).toBe(true);
		expect(isPowerOfTwo32(4)).toBe(true);
		expect(isPowerOfTwo32(8)).toBe(true);
		expect(isPowerOfTwo32(1024)).toBe(true);
	});

	it('should return false for non-powers of two (positive integers)', () => {
		expect(isPowerOfTwo32(3)).toBe(false);
		expect(isPowerOfTwo32(5)).toBe(false);
		expect(isPowerOfTwo32(6)).toBe(false);
		expect(isPowerOfTwo32(12)).toBe(false);
		expect(isPowerOfTwo32(1023)).toBe(false);
	});

	it('should return false for zero', () => {
		expect(isPowerOfTwo32(0)).toBe(false);
	});

	it('should return false for negative integers', () => {
		expect(isPowerOfTwo32(-1)).toBe(false);
		expect(isPowerOfTwo32(-2)).toBe(false);
		expect(isPowerOfTwo32(-8)).toBe(false);
	});

	it('should return false for non-integers', () => {
		expect(isPowerOfTwo32(2.5)).toBe(false);
		expect(isPowerOfTwo32(0.5)).toBe(false);
		expect(isPowerOfTwo32(-4.2)).toBe(false);
	});

	it('should return false for non-finite numbers', () => {
		expect(isPowerOfTwo32(Number.NaN)).toBe(false);
		expect(isPowerOfTwo32(Number.POSITIVE_INFINITY)).toBe(false);
		expect(isPowerOfTwo32(Number.NEGATIVE_INFINITY)).toBe(false);
	});
});
