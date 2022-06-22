const fs = require('fs-extra');
const path = require('path');
const inquirer = import('inquirer');
const ora = import('ora');
const chalk = import('chalk');
const spawn = require('cross-spawn');

const typeName = {
    spa: '单页应用',
    mpa: '多页应用' 
}

async function createProject(type, name, appPath) {
    const { default: chalkDefault } = await chalk
    const { default: oraDefault } = await ora
    const spinner = oraDefault(`${chalkDefault.yellow(typeName[type])} 开始构建中`).start()
    
    fs.ensureDirSync(appPath)
    fs.copySync(path.resolve(__dirname, `../template/${type}`), appPath)

    spawn.sync('yarn',  {
        cwd: appPath,
        stdio: 'inherit',
    })

    spinner.succeed(`生成项目 ${chalkDefault.yellow(name)} 成功\n`)
    console.log('请执行以下命令继续：')
    console.log(`${chalkDefault.green(`cd ${name}`)}`)
}

module.exports = async () => {
    const { default: inquirerDefault } = await inquirer
    const { default: chalkDefault } = await chalk
    const { default: oraDefault } = await ora

    const cwd = process.cwd()

    inquirerDefault.prompt([
        {
            type: 'list',
            name: 'type',
            message: '请选择需要的项目模板',
            choices: ['spa', 'mpa']
        }, {
            type: 'input',
            name: 'name',
            message: '请输入项目名称'
        }
    ]).then(answer => {
        const {type, name} = answer
        const appPath = path.resolve(cwd, name)

        if (!fs.existsSync(appPath)) {
            createProject(type, name, appPath)
        } else {
            inquirerDefault.prompt([
                {
                    type: 'list',
                    name: 'next',
                    message: '请选择继续操作的类型',
                    choices: [
                        {name: '覆盖', value: 'overwrite'},
                        {name: '放弃', value: false}
                    ]
                }
            ]).then(answer => {
                const { next } = answer
                if (!next) {
                    return false
                }

                const spinner = oraDefault(`${chalkDefault.yellow(name)} 开始删除中，请稍后`).start()
                fs.removeSync(appPath)
                spinner.succeed(`删除项目 ${chalkDefault.yellow(name)} 成功\n`)
                createProject(type, name, appPath)
            })
        }
    })
}