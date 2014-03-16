window.meanEngine.get('app').directive('formjs', function() {
	var component = function(scope, element, attrs) {
		
		if (scope.settings) {
			var form = [{
				name:			"email",
				type:			"varchar",
				label:			"Email",
				required:		true
			},{
				name:			"password",
				type:			"varchar",
				label:			"Password",
				required:		false
			}];
			
			console.log("FormJS",element, scope.settings, attrs);
			
			$(function() {	// We make sure jQuery is loaded before we generate the form.
				if (scope.settings) {
					var jform = new formjs($(element), ['bootstrap']).build({	// We are generating the form in the #form container
						form:		form,			// The form data
						submit:		scope.settings.submitButton,	// The submit button
						onSubmit:	scope.settings.onSubmit,
						onError:	scope.settings.onError
					});
				}
				
			});
		}
		
	}

	return {
		link: 			component,
		transclude:		false,
		scope:	{
			settings:	'=',
			name:		'@'
		}
	};
});