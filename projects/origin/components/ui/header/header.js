window.meanEngine.get('app').directive('uiHeader', function($compile) {
	var component = function(scope, element, attrs) {
		$('.dropdown-toggle').dropdown();
	}

	return {
		link: 			component,
		templateUrl:	'components/ui/header/header.html'
	};
});