module.exports = {
	apps: [
		{
			name: 'Relay',
			script: './app.js',
			env: {
				NODE_ENV: 'development'
			},
			env_production: {
				NODE_ENV: 'production'
			}
		}
	]
};
