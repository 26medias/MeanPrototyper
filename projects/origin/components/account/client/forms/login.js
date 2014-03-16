window.meanEngine.get('app').directive('accountLoginForm', function($compile) {
	var component = function(scope, element, attrs) {
		scope.settings = {
			form:			[{
				name:			"email",
				type:			"varchar",
				label:			"Email",
				required:		true
			},{
				name:			"password",
				type:			"varchar",
				label:			"Password",
				required:		true
			}],
			container:		element,
			submitButton:	element.find('[data-id="submit"]'),
			onSubmit:		function(data, jform) {	// Executed when the entire form validates.
				// We use the Bootstrap plugin, telling it to reset the previous error display
				jform.bootstrap.resetErrors();
				
				window.meanEngine.service("api").apicall({
					method:	'user.getAuthToken',
					params:	{
						user:	data
					},
					callback:	function(response) {
						
						// Now we get the user info
						window.meanEngine.service("api").apicall({
							method:	'user.validateAuthToken',
							params:	{
								authtoken:	response.authtoken
							},
							callback:	function(response) {
								// Save the user info (persist using a cookie)
								window.meanEngine.set('user', 		response.user, true);
								window.meanEngine.set('authtoken', 	response.authtoken, true);
								
								window.Arbiter.inform("onLogin", response);
								
								// Go to the dashboard
								window.meanEngine.service("api").location('index.html');
							}
						});
						
						
					}
				});
			},
			onError:		function(data, jform) {	// Executed when at least one question didn't validate.
				// We use the Bootstrap plugin, telling it to visually show us the errors using the bootstrap theme.
				jform.bootstrap.showErrors();
				// You can manage your own error display. "data" is an array containing the list of fields that did not validate.
				// We won't do that in that example.
				alert("You have errors on the form.");
			}
		};
		$compile(element.contents())(scope);
	}

	return {
		link: 			component,
		transclude:		false,
		scope:			true,
		templateUrl:	'components/account/client/forms/login.html'
	};
});