const chalk = require('chalk')
const { promisify }  = require('util')
const handlebars = require('handlebars')
const download = promisify(require('download-git-repo'))
const ora = require('ora')
const fs = require('fs')
const path = require('path')
const clone = async (repo, desc) => {
    return new Promise( async resolve => {
        const process = ora(`正在下载....${repo}`)
        process.start()
        await download(repo, desc)
        process.succeed()
        resolve()
    })
}
// 开启子进程 
const spawn = (...args) => {
    const { spawn } = require('child_process')
    return new Promise(resolve => {
        const proc = spawn(...args)
        // 正常开启子进程需要在主进程打印出信息的话 需要通过管道连接 将子进程注入到主进程
        proc.stdout.pipe(process.stdout)
        proc.stderr.pipe(process.stderr)
        proc.on('close', () => {
            resolve()
        })
    })
}
const install = async cwd => spawn(process.platform === "win32" ? "npm.cmd" : "npm", ['install'], { cwd: cwd, shell: true })
module.exports.init = async (name) => {
    console.log(process.execPath)
    console.log(`创建项目：${name}`)
    // 从github克隆项目到指定文件夹
    await clone('github:penggangg/vue-template', name)
    // 下载好之后自动安装依赖
    console.log(`安装依赖：${name}`)
    await install(`./${name}`)
    console.log(`
👌安装完成：
To get Start:
===========================
cd ${name}
yarn serve
===========================
    `)
}
var pageList = []
module.exports.refresh = () => {
    finder('./src/views', pageList)
    // 获取views 里面的页面 这里面的页面都是路由页面
    // const pageList = 
    //     // console.log(fs.readdirSync('./src/views'))
    //     fs.readdirSync('./src/views')
    //         .filter(item => item !== 'Home.vue')
    //         .map(item => {
    //             return {
    //                 name: item.replace('.vue', '').toLowerCase(),
    //                 file: item
    //             }
    //         })
    console.log(pageList)
    // // 生成路由文件
    compile({ pageList }, './src/router.js', './template/router.js.hbs')
}
/**
 * 编译模板文件
 * @param {*} meta 数据定义
 * @param {*} filePath 目标文件路径
 * @param {*} templatePath  模板文件路径
 */
function compile(meta, filePath, templatePath) {
    console.log(fs.existsSync(templatePath))
    if (fs.existsSync(templatePath)) {
        const content = fs.readFileSync(templatePath).toString()
        // handlebars.compile 是个柯里化函数 先传入模板内容 然后传入数据
        const result = handlebars.compile(content)(meta)
        fs.writeFileSync(filePath, result)
    }
}
/**
 * 同步读取文件
 * @param {*} path 目录路径
 */
const join = path.join
function finder(path, result){
    let files =  fs.readdirSync(path)
        .filter(v => v !== 'Home.vue' && v !== 'index.vue')
        console.log('files', files)
    for (let i = 0; i < files.length; i++) {
        const fpath = join(path, files[i]);
        console.log('fpath', fpath)
        const stats = fs.statSync(fpath);
        if (stats.isDirectory()) { 
            result.push({
                name: files[i].replace('.vue', '').toLowerCase(),
                file: fpath.replace(/\\/g,"/").replace('src/', './'),
                children: []
            })
            finder(fpath, result[i].children); 
        } else {
            result.push({
                name: files[i].replace('.vue', '').toLowerCase(),
                file: fpath.replace(/\\/g,"/").replace('src/', './'),
                children: ''
            })
        }
    }
}
