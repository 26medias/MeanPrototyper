window.meanEngine.get('app').directive('test2', function($compile) {
	var component = function(scope, element, attrs) {
		
		scope.settings = {
			hello:	"#2"
		};
		$compile(element.contents())(scope);
	}

	return {
		link: 			component,
		scope:			true,
		templateUrl:	'components/test/test2.html'
	};
});