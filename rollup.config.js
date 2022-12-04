import postcss from 'rollup-plugin-postcss';
import {nodeResolve} from '@rollup/plugin-node-resolve';

export default [
	{
		input: './src/index.js',
		output: {
			file: './dist/mindalka-browser-utils.js',
			format: 'esm'
		},
		plugins: [
			postcss({
			}),
			nodeResolve(),
		],
	},
];
