import chalk from 'chalk'

// Rollup plugins
import buble from 'rollup-plugin-buble'
import eslint from 'rollup-plugin-eslint'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-replace'
import uglify from 'rollup-plugin-uglify'
import progress from 'rollup-plugin-progress'
import postcss from 'rollup-plugin-postcss'
import eft from 'rollup-plugin-eft'
import json from 'rollup-plugin-json'

// Log build environment
console.log('Target:', chalk.bold.green(process.env.NODE_ENV || 'development'))
switch (process.env.BUILD_ENV) {
	case 'DEV': {
		console.log(chalk.cyan`
+---------------+
| DEVELOP BUILD |
+---------------+
`)
		break
	}
	case 'CI': {
		console.log(chalk.green`
+----------+
| CI BUILD |
+----------+
`)
		break
	}
	default: {
		console.log(chalk.yellow`
+--------------+
| NORMAL BUILD |
+--------------+
`)
	}
}

export default {
	input: 'src/main.js',
	output: {
		name: 'bPlayer',
		format: 'iife',
		sourcemap: true
	},
	devDest: 'test/bplayer-ef.dev.js',
	proDest: 'dist/bplayer-ef.min.js',
	plugins: [
		progress({
			clearLine: false
		}),
		resolve({
			jsnext: true,
			main: true,
			browser: true,
		}),
		commonjs(),
		eft(),
		json(),
		postcss(),
		eslint({
			exclude: ['**/*.html', '**/*.css', '**/*.eft', '**/*.json']
		}),
		buble({
			transforms: {
				modules: false,
				dangerousForOf: true
			},
			objectAssign: 'Object.assign'
		}),
		replace({
			'process.env.NODE_ENV': `'${process.env.NODE_ENV || 'development'}'`
		}),
		(process.env.NODE_ENV === 'production' && uglify())
	]
}
