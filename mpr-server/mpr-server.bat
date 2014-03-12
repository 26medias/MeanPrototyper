@echo off
node main.js -port 2014 -online false -timeout 120000 -threads 1 -debug_mode false -db mpr-server -mongo_remote false
pause