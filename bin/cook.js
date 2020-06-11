#!/usr/bin/env node

const program = require('commander')
const {
    init,
    refresh
} = require('../lib/api')
program.version(require('../package').version)
// 初始化项目
program
    .command('init <name>')
    .description('init project')
    .action(init)
// 生成路由
program
    .command('refresh')
    .description('refresh routers...')
    .action(refresh)


    
program.parse(process.argv)