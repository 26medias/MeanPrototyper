var _ 					= require('underscore');
var twig				= require('twig').twig;
var dependency			= require('./dependency').main;
var toolset				= require('toolset');
var ncp 				= require('ncp').ncp;
var path 				= require('path');
var wrench 				= require('wrench');
var fs 					= require('fs');

var builder = function(options) {
	var scope = this;
	
	// Get the settings
	if (!options.settingsFile) {
		console.log("Missing settings file.");
		return false;
	}
	
	this.options = options;
	this.root = options.root;
	
	this.transformMethods = {
		autoload:	function(componentData) {
			if (componentData.data && componentData.data.client && componentData.data.client.autoload) {
				return scope.dependency.fixPath(componentData.path, componentData.data.client.autoload);
			}
			return false;
		},
		components:	function(componentData) {
			if (componentData.data && componentData.data.client && componentData.data.client.components) {
				return scope.dependency.fixPath(componentData.path, componentData.data.client.components);
			}
			return false;
		},
		endpoints:	function(componentData) {
			if (componentData.data && componentData.data.server && componentData.data.server.endpoints) {
				return scope.dependency.fixPath(componentData.path, componentData.data.server.endpoints);
			}
			return false;
		},
		bower:	function(componentData) {
			if (componentData.data && componentData.data.client && componentData.data.client.bower) {
				var i;
				var buffer = [];
				for (i in componentData.data.client.bower) {
					buffer.push([i, componentData.data.client.bower[i]]);
				}
				return buffer;
			}
			return false;
		}
	};
}
builder.prototype.transform = function(components) {
	// Group the bower dependencies by name, version
	var grouped = _.groupBy(components.bower, function(item) {
		return item[0];
	});
	components.bowerGroup = [];
	for (var i in grouped) {
		components.bowerGroup.push(i);
	}
	/*
	for (var i in components.bowerGroup) {
		var buffer = [];
		_.each(components.bowerGroup[i], function(item) {
			buffer.push(item[1]);
		});
		components.bowerGroup[i] = "latest";//_.uniq(buffer)[0];
	}
	*/
	return components;
}
builder.prototype.init = function() {
	var scope 	= this;
	
	toolset.file.toObject(this.root+this.options.settingsFile, function(settings) {
		scope.settings = settings;
		
		scope.dependency = new dependency({
			root:		scope.root,
			directory:	scope.settings.components
		});
		
		
		scope.bower_dependency = new dependency({
			root:		scope.root,
			directory:	scope.settings.src+"/bower_components",
			filenames:	['bower.json','.bower.json']
		});
		
		scope.dependency.map(function(packages) {
			//toolset.log("packages", packages);
			
			// Verify we have no missing components
			scope.dependency.verify(function(name) {
				toolset.error("/!\\ Missing components", name);
			});
			/*
			var resolved = scope.dependency.resolveList(["account"]);
			toolset.log("resolved", resolved);
			
			var components = scope.transform(scope.dependency.getComponentsFor(["api"], scope.transformMethods));
			toolset.log("components[api]", components);
			*/
			scope.allComponents = scope.transform(scope.dependency.getComponentsFor(true, scope.transformMethods));
			
			
			// Map the bower dependencies
			scope.bower_dependency.map(function(packages) {
				//toolset.log("packages", packages);
				
				// Verify we have no missing components
				scope.bower_dependency.verify(function(name) {
					toolset.error("/!\\ Missing bower packages", name);
				});
				
				scope.build();
			});
		});
	});
}
builder.prototype.build = function() {
	var scope 	= this;
	
	// Delete the output directory
	toolset.file.removeDir(scope.root+scope.settings.output, function() {
		
		// Create the output directory
		toolset.file.createPath(scope.root+scope.settings.output, function() {
			scope.loadTemplates(function() {
				// List the pages
				toolset.file.listDirectories(scope.root+scope.settings.src+"/pages", function(directories) {
					console.log("directories",directories);
					
					var buildStack = new toolset.stack();
					
					_.each(directories, function(dir) {
						buildStack.add(function(p, cb) {
							scope.buildPage(p.dir, cb);
						}, {dir:dir});
					});
					
					buildStack.process(function() {
						console.log("Pages built.");
						
						// Copy the libs
						ncp(scope.root+scope.settings.src+"/bower_components", scope.root+scope.settings.output+"/public", function() {
							console.log("Libs copied from ", scope.root+scope.settings.src+"/bower_components", " to ", scope.root+scope.settings.output+"/public");
						});
						// Copy the components
						ncp(scope.root+scope.settings.components, scope.root+scope.settings.output+"/components", function() {
							console.log("Components copied from ", scope.root+scope.settings.components, " to ", scope.root+scope.settings.output+"/components");
						});
						// Copy the Engine
						ncp(scope.root+scope.settings.src+'/engine', scope.root+scope.settings.output+"/engine", function() {
							console.log("Engine copied from ", scope.root+scope.settings.src+'/engine', " to ", scope.root+scope.settings.output+"/engine");
						});
						// Copy the JS project file
						fs.createReadStream(scope.root+scope.settings.src+'/project.js').pipe(fs.createWriteStream(scope.root+scope.settings.output+"/project.js"));
					});
				});
			});
		});
	});
}
builder.prototype.loadTemplates = function(callback) {
	var scope		= this;
	console.log("Loading templates...");
	
	this.templates	= {};
	
	toolset.file.listFiles(this.root+this.settings.src+"/templates", "html", function(files) {
		
		var readStack = new toolset.stack();
		
		_.each(files, function(file) {
			
			readStack.add(function(p, cb) {
				console.log("Pre-compiling "+p.file+" ...");
				toolset.file.read(p.file, function(content) {
					scope.templates[path.basename(p.file)] = twig({
						data: 	content
					});
					cb();
				});
			}, {file:file});
		});
		
		readStack.process(function() {
			console.log("Templates loaded.");
			callback();
		});
	});
}
builder.prototype.buildPage = function(page, callback) {
	var scope 	= this;
	console.log("Building '"+page+"'...");
	
	toolset.file.toObject(this.root+this.settings.src+"/pages/"+page+"/page.json", function(pageConf) {
		
		var fileStack = new toolset.stack();
		var file;
		for (file in pageConf.files) {
			fileStack.add(function(p, cb) {
				console.log("Reading ",scope.root+scope.settings.src+"/pages/"+page+"/"+p.file);
				toolset.file.read(scope.root+scope.settings.src+"/pages/"+page+"/"+p.file, function(content) {
					
					// Get the subdocument's source (parsed with Twig)
					/*var pageData = twig({
						data: 	content
					}).render({});*/
					var pageData = content;
					
					// Add the dependencies for that specific page
					if (p.fileData.dependencies) {
						pageConf.dependencies = _.union(pageConf.dependencies, p.fileData.dependencies);
					}
					
					if (!pageConf.components) {
						pageConf.components = [];
					}
					if (p.fileData.components) {
						pageConf.components = _.union(pageConf.components, p.fileData.components);
					}
					if (pageConf.components.length > 0) {
						// Check the bower libs we require for that components
						var components = scope.transform(scope.dependency.getComponentsFor(pageConf.components, scope.transformMethods));
						
						// Push the components' bower dependencies with the other page-specific dependencies
						pageConf.dependencies = _.union(pageConf.dependencies, components.bowerGroup);
					}
					//
					
					// Get the libraries
					var libs = {};
					
					var _libs = scope.bower_dependency.getFor(pageConf.dependencies);
					
					for (var i in _libs) {
						if (libs[i]) {
							_.each(_libs[i], function(file) {
								libs[i].push(file);
							});
						} else {
							libs[i] = _libs[i];
						}
					}
					
					// Inject the engine and the project file
					scope.pushToLibs('engine/engine.js', libs);
					scope.pushToLibs('project.js', libs);
					
					
					toolset.log("libs", libs);
					
					// Inject the files required by the components, and the autoloads
					if (scope.allComponents.autoload) {
						_.each(scope.allComponents.autoload, function(file) {
							scope.pushToLibs(file, libs);
						});
					}
					if (scope.allComponents.components) {
						_.each(scope.allComponents.components, function(file) {
							scope.pushToLibs(file, libs);
						});
					}
					
					// Inject into the main template and write
					var filename 	= scope.root+scope.settings.output+"/"+p.fileData.filename;
					var filepath	= path.dirname(filename);
					wrench.mkdirSyncRecursive(filepath, 0777);
					var relativepath	= path.relative(path.dirname(p.fileData.filename), "./");
					if (relativepath != "") {
						relativepath += "/";
					}
					
					if (p.fileData.template) {
						var twigTemplate = scope.templates[p.fileData.template];
					} else {
						var twigTemplate = scope.templates[pageConf.template];
					}
					
					
					toolset.file.write(filename, twigTemplate.render(_.extend(p.fileData,{
						page:			pageConf,
						file:			p.fileData.filename,
						relativepath:	relativepath,
						content:		pageData,
						include_js:		scope.getIncludes(libs, ".js",	relativepath),
						include_css:	scope.getIncludes(libs, ".css", relativepath),
						include_less:	scope.getIncludes(libs, ".less", relativepath)
					})), function() {
						console.log("file "+p.fileData.filename+" written.");
						cb();
					});
				});
			},{file:file, fileData:pageConf.files[file], pageConf:pageConf});
		}
		
		fileStack.process(function() {
			console.log("Page "+page+" built.");
			callback();
		});
		
	});
}
builder.prototype.pushToLibs = function(file, libs) {
	var ext = path.extname(file);
	if (!libs[ext]) {
		libs[ext] = [];
	}
	libs[ext].push(file);
	libs[ext] = _.uniq(libs[ext]);
	return libs;
}
builder.prototype.getIncludes = function(files, type, relativepath) {
	var list 		= files[type];
	
	var output 		= [];
	var scope		= this;
	switch (type) {
		case ".js":
			_.each(list, function(file) {
				file = file.replace(scope.root+scope.settings.src+"/bower_components", "public");
				if (file.substr(0,4) == "http") {
					output.push('<script src="'+file+'"></script>');
				} else {
					output.push('<script src="'+file+'"></script>');
				}
			});
		break;
		case ".css":
			_.each(list, function(file) {
				file = file.replace(scope.root+scope.settings.src+"/bower_components", "public");
				if (file.substr(0,4) == "http") {
					output.push('<link href="'+file+'" rel="stylesheet">');
				} else {
					output.push('<link href="'+file+'" rel="stylesheet">');
				}
				
			});
		break;
		case ".less":
			_.each(list, function(file) {
				file = file.replace(scope.root+scope.settings.src+"/bower_components", "public");
				if (file.substr(0,4) == "http") {
					output.push('<link rel="stylesheet/less" type="text/css" href="'+file+'" />');
				} else {
					output.push('<link rel="stylesheet/less" type="text/css" href="'+file+'" />');
				}
				
			});
		break;
	}
	return output.join('\n');
}

var main = new builder({
	root:			"../../",
	settingsFile:	"build.json"
});
main.init();