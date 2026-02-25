import { resolveFlatConfig } from '@leancodepl/resolve-eslint-flat-config';
import node from '@stimulcross/eslint-config-node';
import nodeStyle from '@stimulcross/eslint-config-node/style';
import typescript from '@stimulcross/eslint-config-typescript';
import typescriptStyle from '@stimulcross/eslint-config-typescript/style';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import { globs } from './globs.js';

/** @type {import("eslint").Linter.Config[]} */
export const baseConfig = resolveFlatConfig(
	defineConfig(
		globalIgnores([globs.lib, globs.nodeModules, globs.dts, globs.coverage]),
		{
			files: [...globs.js, ...globs.ts, ...globs.jsSpec, ...globs.tsSpec],
			languageOptions: {
				globals: {
					...globals.node,
					...globals.es2022,
				},
			},
		},
		{
			files: [...globs.js, ...globs.ts],
			extends: [node, nodeStyle, typescript, typescriptStyle],
		},
		{
			files: [...globs.ts, ...globs.tsSpec],
			rules: {
				'func-names': 'off',
				'new-cap': 'off',
				'no-await-in-loop': 'off',
				'unicorn/prefer-event-target': 'off',
				'@typescript-eslint/class-literal-property-style': 'off',
				'@typescript-eslint/no-non-null-assertion': 'off',
			},
		},
		{
			files: [...globs.tsSpec],
			rules: {
				'max-classes-per-file': 'off',
				'id-length': 'off',
				'import/no-extraneous-dependencies': 'off',
				'unicorn/no-useless-undefined': 'off',
				'@typescript-eslint/no-empty-function': 'off',
				'@typescript-eslint/no-explicit-any': 'off',
				'@typescript-eslint/no-unsafe-assignment': 'off',
				'@typescript-eslint/no-unsafe-call': 'off',
				'@typescript-eslint/no-unsafe-member-access': 'off',
			},
		},
	),
);
