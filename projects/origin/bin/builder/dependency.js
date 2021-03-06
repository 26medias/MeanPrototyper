var _ 					= require('underscore');
var toolset 			= require('toolset');
var file 				= toolset.file;
var stack 				= toolset.stack;
var crypto 				= toolset.crypto;
var path 				= require('path');

function dependency(options) {
	
	this.file 		= file;
	this.crypto		= crypto;
	this.packages	= {};
	this.resolved	= [];
	this.missing	= [];
	this.cache		= {};
	
	this.options = _.extend({
		filenames:	['component.json'],
		root:		'./',
		directory:	'components',
		interpret:	function(json) {
			return {
				name:			json.name,
				version:		json.version,
				dependencies:	json.dependencies,
				data:			json
			};
		},
		getpackages:	function(scope, directory, filename, callback) {
			
			var packages = {};
			
			scope.file.listByFilename(directory, filename, function(files) {
				var opStack = new stack();
				
				_.each(files, function(file) {
					opStack.add(function(p, cb) {
						var filepath	= path.dirname(p.file);
						
						scope.file.toObject(p.file, function(json) {
							if (json === false) {
								toolset.error(p.file+" is not a valid JSON object.");
								cb();
							} else {
								var packageObject 				= scope.options.interpret(json);
								// Insert the path to that component
								packageObject.path 				= filepath;
								packages[packageObject.name] 	= packageObject;
								cb();
							}
							
						});
					},{file:file});
				});
				
				opStack.process(function() {
					callback(packages);
				});
			});
		}
	},options);
}
dependency.prototype.get = function(componentName) {
	if (this.packages[componentName]) {
		return this.packages[componentName];
	}
	return false;
}
dependency.prototype.map = function(callback) {
	var scope = this;
	
	var packages = {};
	var opStack = new stack();
	_.each(this.options.filenames, function(filename) {
		opStack.add(function(p, cb) {
			scope.options.getpackages(scope, scope.options.root+scope.options.directory, p.filename, function(_packages) {
				packages = _.extend(packages, _packages);
				cb();
			});
		},{filename:filename});
	});
	opStack.process(function() {
		
		scope.packages = packages;
		
		callback(packages);
	});
}
dependency.prototype.fixPath = function(path, filenames) {
	var scope = this;
	return _.map(filenames, function(filename) {
		var absPath;
		if (path.substr(0, scope.options.root.length) == scope.options.root) {
			absPath = path.substr(scope.options.root.length);
		} else {
			absPath = path;
		}
		return absPath+'/'+filename;
	});
	return filenames;
}
dependency.prototype.verify = function(callback) {
	var scope 	= this;
	var lib;
	var i;
	for (lib in this.packages) {
		this.resolve(lib);
	}
	
	if (this.missing.length > 0) {
		this.missing = _.uniq(this.missing);
		callback(this.missing);
	}
	// reset
	this.resolved	= [];
}
dependency.prototype.getFor = function(libs) {
	
	// Sort
	var sorted	= libs.sort(function (a, b) {
		if (a.toLowerCase() > b.toLowerCase()) {
			return 1;
		} else if (a.toLowerCase() < b.toLowerCase()) {
			return -1;
		} else {
			return 0;
		}
	});
	
	// get MD ID (cached index)
	var md5id	= this.crypto.md5(_.map(sorted, function(item){return item.toLowerCase()}).join("|"));
	if (this.cache[md5id]) {
		return this.cache[md5id];
	}
	
	// resolve dependecies
	var resolved = this.resolveList(libs);
	var includes = this.getIncludeData(
		resolved
	);
	
	this.cache[md5id] = includes;
	
	return includes;
}
dependency.prototype.resolveList = function(libs) {
	var i;
	var includes = [];
	for (i=0;i<libs.length;i++) {
		this.resolve(libs[i],includes);
	}
	
	// reset
	this.resolved	= [];
	
	return includes;
}
dependency.prototype.resolve = function(lib, container) {
	//console.log("resolving ",lib);
	var scope 	= this;
	
	if (!this.packages[lib]) {
		this.missing.push(lib);
		console.log("MISSING LIB: ",lib);
		return false;
	}
	var package	= this.packages[lib];
	var i;
	for (i in package.dependencies) {
		if (_.indexOf(this.resolved,i) === -1) {
			this.resolve(i,container);
		}
	}
	if (!_.contains(this.resolved, lib)) {
		this.resolved.push(lib);
		if (container) {
			container.push(lib);
		}
	}
	
}
dependency.prototype.getComponentsFor = function(names, transforms) {
	var scope 	= this;
	
	var components = [];
	
	if (names === true) {
		// Show everything
		for (var i in this.packages) {
			components.push(this.packages[i]);
		}
	} else {
		var names = this.resolveList(names);
		_.each(names, function(name) {
			components.push(scope.packages[name]);
		});
	}
	
	if (!transforms) {
		return components;
	} else {
		var output = {};
		_.each(components, function(component) {
			var transform;
			for (transform in transforms) {
				if (!output[transform]) {
					output[transform] = [];
				}
				var response = transforms[transform](component);
				if (response !== false) {
					_.each(response, function(item) {
						output[transform].push(item);
					});
				}
			}
			
		});
		return output;
	}
}
dependency.prototype.getIncludeData = function(libs) {
	var i;
	var j;
	var output = {};
	for (i=0;i<libs.length;i++) {
		var package	= this.packages[libs[i]];
		var libData = package.data;
		var dir		= package.path;
		if (_.isArray(libData.main)) {
			for (j=0;j<libData.main.length;j++) {
				var ext = path.extname(libData.main[j]);
				if (!output[ext]) {
					output[ext] = [];
				}
				// is it local or remote?
				if (libData.main[j].substr(0,4) == "http") {
					output[ext].push(libData.main[j]);
				} else {
					output[ext].push(dir+"/"+libData.main[j]);
				}
			}
		} else {
			var ext = path.extname(libData.main);
			if (!output[ext]) {
				output[ext] = [];
			}
			// is it local or remote?
			if (libData.main.substr(0,4) == "http") {
				output[ext].push(libData.main);
			} else {
				output[ext].push(dir+"/"+libData.main);
			}
		}
		
	}
	
	return output;
}

exports.main = dependency;