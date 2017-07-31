// Rollup plugins
const buble = require('rollup-plugin-buble')
const eslint = require('rollup-plugin-eslint')
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const replace = require('rollup-plugin-replace')
const uglify = require('rollup-plugin-uglify')
const progress = require('rollup-plugin-progress')
const postcss = require('rollup-plugin-postcss')
const eft = require('rollup-plugin-eft')
const json = require('rollup-plugin-json')
const git = require('git-rev-sync')
const { version } = require('../package.json')

module.exports = {
	moduleName: 'bPlayer',
	entry: 'src/main.js',
	devDest: 'test/bplayer.dev.js',
	proDest: 'dist/bplayer.min.js',
	format: 'umd',
	sourceMap: true,
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
			exclude: ['**/*.html', '**/*.css', '**/*.eft']
		}),
		buble({
			transforms: {
				modules: false,
				dangerousForOf: true
			},
			objedtAssign: 'Object.assign'
		}),
		replace({
			ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
			VERSION: JSON.stringify(`${version}-${git.short()}`)
		}),
		(process.env.NODE_ENV === 'production' && uglify())
	]
}
