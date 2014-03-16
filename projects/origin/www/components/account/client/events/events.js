(function() {
	if (window.meanEngine.get('authtoken')) {
		window.meanEngine.service("api").apicall({
			method:	'user.validateAuthToken',
			params:	{
				authtoken:	window.meanEngine.get('authtoken')
			},
			callback:	function(response) {
				if (response.valid) {
					
					// Save the user info (persist using a cookie)
					window.meanEngine.set('user', 		response.user, true);
					window.meanEngine.set('authtoken', 	response.authtoken, true);
					
					window.Arbiter.inform("onLogin", response, true);	// Retroactive!
				}
			}
		});
	}
})();