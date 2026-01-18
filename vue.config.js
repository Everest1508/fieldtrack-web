module.exports = {
	runtimeCompiler: true,
	
	// Transpile Firebase modules to support modern JavaScript syntax
	transpileDependencies: [
		/@firebase/,
		/firebase/
	],

	css: {
		loaderOptions: {
			sass: {
				sassOptions: {
					silenceDeprecations: ['legacy-js-api', 'import']
				}
			}
		}
	},

	chainWebpack: config => {
		config
			.plugin('html')
			.tap(args => {
				args[0].title = 'Muse Vue Ant Design - by Creative Tim'
				return args
			})
	}
}
