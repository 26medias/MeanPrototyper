window.meanEngine.get('app').directive('formjs', function() {
	var component = function(scope, element, attrs) {
		
		if (scope.settings) {
			$(function() {	// We make sure jQuery is loaded before we generate the form.
				if (scope.settings) {
					var jform = new formjs($(element), ['bootstrap']).build({	// We are generating the form in the #form container
						form:		scope.settings.form,			// The form data
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