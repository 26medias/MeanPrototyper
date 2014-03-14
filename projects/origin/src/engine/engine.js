(function() {
	meanEngine = function() {
		this.settings 	= {};
		this.version	= "alpha-1.0";
	};
	meanEngine.prototype.init = function() {
		
	};
	meanEngine.prototype.set = function(variable, data) {
		this.settings[variable] = data;
		console.info(variable, data);
	};
	meanEngine.prototype.get = function(variable) {
		return this.settings[variable];
	};
	
	window.meanEngine = new meanEngine();
})();