window.meanEngine.get('app').directive('logoutLink', function() {
	var component = function(scope, element, attrs) {
		console.log("element",element);
		element.click(function(e) {
			console.log("click",this);
			e.preventDefault();
			window.meanEngine.service("api").cookie('authtoken', '', -1); // remove the cookie
			
			// Go to the dashboard
			window.meanEngine.service("api").location('index.html');
		});
	}
	
	return {
		link: 			component
	};
});