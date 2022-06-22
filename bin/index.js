#!/usr/bin/env node

const script = process.argv[2]
const init = require('../script/init.js')

if (script === 'init') {
    init()
    return 
} else {
    return console.error(`无该此项script命令`)
}