import { baseConfig, globs } from 'eslint-config';

/** @type import('eslint').Linter.Config[] */
export const config = [
	...baseConfig,
	{
		files: [...globs.ts],
		rules: {
			'unicorn/prefer-math-trunc': 'off',
		},
	},
];

export default config;
