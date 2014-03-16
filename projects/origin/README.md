# Origin: The prototype/demo project #

This is the project I use to build the structure of the framework.

`/bin/builder` contains the builder/linker script.

`/bin/server` contains you project's API server.

`/components` contains the available components.

`/src` contains the sources of your project.

`/www` is the directory where your site is built and exported.



## How to test/run: ##

Build the site:
```
cd bin/builder
node build.js
```

Run the API server:
```
cd ../server
node main.js -port 8070 -online false -timeout 120000 -threads 1 -debug_mode true -db mpr-origin -mongo_remote false
```

Open `www/index.html` in your browser.

**important** The demo site uses ajax requests to communicate with the API server. Your browser will block those requests if you just execute the `index.html` file from any directory.
You need to access the demo site using the http protocol, meaning at least your `www` folder needs to be in a web directory (to access using http://127.0.0.1/ for example)
