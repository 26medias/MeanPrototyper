window.meanEngine.get('app').directive('accountLoginForm', function() {
	var component = function(scope, element, attrs) {
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
		
		$(function() {	// We make sure jQuery is loaded before we generate the form.
			var jform = new formjs($(element), ['bootstrap']).build({	// We are generating the form in the #form container
				form:		form,			// The form data
				submit:		$("#submit"),	// The submit button
				onSubmit:	function(data, jform) {	// Executed when the entire form validates.
					// We use the Bootstrap plugin, telling it to reset the previous error display
					jform.bootstrap.resetErrors();
					// Output
					alert(JSON.stringify(data,null,4));
				},
				onError:	function(data, jform) {	// Executed when at least one question didn't validate.
					// We use the Bootstrap plugin, telling it to visually show us the errors using the bootstrap theme.
					jform.bootstrap.showErrors();
					// You can manage your own error display. "data" is an array containing the list of fields that did not validate.
					// We won't do that in that example.
					alert("You have errors on the form.");
				}
			});
		});
	}

	return {
		link: component
	};
});