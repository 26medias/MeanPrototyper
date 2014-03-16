window.meanEngine.get('app').directive('test1', function($compile) {
	var component = function(scope, element, attrs) {
		
		scope.settings = {
			hello:	"#1"
		};
		$compile(element.contents())(scope);
	}

	return {
		link: 			component,
		scope:			true,
		templateUrl:	'components/test/test1.html'
	};
});