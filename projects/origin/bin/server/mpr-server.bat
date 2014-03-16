@echo off
node main.js -port 8070 -online false -timeout 120000 -threads 1 -debug_mode true -db mpr-origin -mongo_remote false
pause