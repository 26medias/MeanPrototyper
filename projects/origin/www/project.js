
window.meanEngine.set('api', {
	protocol:	"http",
	hostname:	"127.0.0.1",
	port:		8070
});

window.meanEngine.set('app', angular.module('main', []));

window.meanEngine.get('app').controller('headerCtrl', function ($scope) {
	
	// Default header and menu
	$scope.header = {
		title:	'MeanHeader',
		menu:	[{
			label:	'Test',
			url:	'test/test.html'
		}],
		menuRight:	[{
			label:	'Login',
			url:	'account/login.html'
		}]
	}
	
	// On login (provided by the 'account' component. Event using Arbiter.
	window.Arbiter.subscribe("onLogin", function(data) {
		// User is logged in, we update the menu
		$scope.header.menuRight = [{
			label:	'Logout',
			url:	'account/logout.html'
		},{
			label:	'Account',
			items:	[{
				label:	'Profile',
				url:	'account/profile.html'
			},{
				label:	'Edit',
				url:	'account/edit.html'
			}]
		}];
	});
});