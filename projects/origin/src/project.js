
window.meanEngine.set('api', {
	protocol:	"http",
	hostname:	"127.0.0.1",
	port:		2014
});

window.meanEngine.set('app', angular.module('main', []));

window.meanEngine.get('app').controller('headerCtrl', function ($scope) {
	$scope.tracked = {};
	$(function() {
		$.apicall({
			method:		"stock.tracked",
			callback:	function(response) {
				$scope.tracked = response;
				$scope.$apply();
			}
		});
	});
});