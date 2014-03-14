window.meanEngine.get('app').directive('accountLoginForm', function($compile) {
	var component = function(scope, element, attrs) {
		scope.settings = {
			container:		element,
			submitButton:	element.find('[data-id="submit"]')
		};
		$compile(element.contents())(scope);
	}

	return {
		link: 			component,
		templateUrl:	'components/account/client/registration/form.html'
	};
});