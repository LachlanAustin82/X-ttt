var path = require('path')
var webpack = require('webpack')
var MiniCssExtractPlugin = require('mini-css-extract-plugin')
var TerserPlugin = require('terser-webpack-plugin')

module.exports = {
	devtool: 'source-map',
	entry: [
		'../src/app'
	],
	context: path.join(__dirname, 'static'),
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'bundle.js',
		publicPath: './'
	},
	mode: 'production',
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					compress: {
						warnings: false // equivalent to your old compressor: { warnings: false }
					}
				}
			})
		],
		splitChunks: {
			chunks: 'all'
		}
	},
	plugins: [
		new MiniCssExtractPlugin({ filename: 'style.css'}),
		new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify('production')
			}
		})
	],
	module: {
		rules: [
			{
				test: /\.(ico|gif|png|html|jpg|swf|xml|svg)$/,
				use: [{
					loader: 'file-loader',
					options: {
						name: '[path][name].[ext]',
						context: path.resolve(__dirname, 'static'),
						esModule: false
					}
				}]
			},
			{
				test: /\.scss$/,
				use: [
					MiniCssExtractPlugin.loader, // extracts CSS into separate file
					'css-loader',                // translates CSS into CommonJS
					'sass-loader'                // compiles Sass to CSS
				]
			},
			{
				test: /\.jsx?$/,
				include: path.resolve(__dirname, 'src'),
				use: {
					loader: 'babel-loader'
				}
			},
			{
				test: /(flickity|fizzy-ui-utils|get-size|unipointer|imagesloaded)/,
				use: {
					loader: 'imports-loader',
					options: {
						additionalCode: 'var define = false;',
						wrapper: 'window'
					}
				}
			}
		]
	},
}
