window.meanEngine.get('app').directive('accountEditForm', function($compile) {
	var component = function(scope, element, attrs) {
		window.Arbiter.subscribe("onLogin", function(data) {
			console.log(">>data",data, window.meanEngine.get('user').email, element.find('[data-id="update"]'));
			
			scope.settings = {
				form:			[{
					name:			"firstname",
					type:			"varchar",
					label:			"Firstname",
					placeholder:	"Firstname",
					value:			window.meanEngine.get('user').firstname,
					required:		false
				},{
					name:			"lastname",
					type:			"varchar",
					label:			"Lastname",
					placeholder:	"Lastname",
					value:			window.meanEngine.get('user').lastname,
					required:		false
				},{
					name:			"email",
					type:			"varchar",
					label:			"Email",
					placeholder:	"Your email",
					value:			window.meanEngine.get('user').email,
					required:		true
				}],
				container:		element,
				submitButton:	element.find('[data-id="update"]'),
				onSubmit:		function(data, jform) {	// Executed when the entire form validates.
					// We use the Bootstrap plugin, telling it to reset the previous error display
					jform.bootstrap.resetErrors();
					console.log("data",data);
					
					
					window.meanEngine.service("api").apicall({
						method:	'user.update',
						params:	$.extend(data,{authtoken:window.meanEngine.get('authtoken')}),
						callback:	function(response) {
							
							// Now we reload the user info
							window.meanEngine.service("api").apicall({
								method:	'user.validateAuthToken',
								params:	{
									authtoken:	window.meanEngine.get('authtoken')
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
		});
	}

	return {
		link: 			component,
		transclude:		false,
		scope:			true,
		templateUrl:	'components/account/client/forms/edit.html'
	};
});