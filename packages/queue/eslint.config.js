import { baseConfig, globs } from 'eslint-config';

/** @type import('eslint').Linter.Config[] */
export const config = [
	...baseConfig,
	{
		files: [...globs.ts],
		rules: {
			'id-length': 'off',
			'unicorn/no-array-push-push': 'off',
			'unicorn/no-new-array': 'off',
			'unicorn/no-useless-undefined': 'off',
			'@typescript-eslint/no-unnecessary-condition': ['warn', { allowConstantLoopConditions: true }],
		},
	},
];

export default config;
