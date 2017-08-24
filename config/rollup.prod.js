// Import base config
import base from './rollup.base'

const {input, output, plugins, proDest} = base

output.file = proDest
output.sourcemap = process.env.BUILD_ENV === 'DEMO' || process.env.BUILD_ENV === 'CI' ? output.sourcemap : false

const config = {
	input,
	output,
	plugins,
	external: ['ef-core'],
	globals: {
		'ef-core': 'efCore'
	}
}

export default config
