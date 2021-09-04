'use strict'

const { filesystem, path } = require('@codedungeon/gunner')
const github = require('./github')

module.exports = {
  checkVersion: async function (pluginName) {
    const pluginPath = path.resolve(pluginName)
    const configData = this.getPluginConfig(pluginPath)
    const pluginVersion = configData['plugin.version']

    const releaseList = await github.releaseList(pluginName, pluginVersion)
    dd(releaseList)

    const matching = releaseList.filter((release) => {
      return release.tag.includes(`${pluginName}-v${pluginVersion}`)
    })

    return matching.length === 0
  },

  checkChangelogNotes: async function (pluginName = null, version = null) {
    const changelogFilename = path.resolve(path.join(pluginName, 'CHANGELOG.md'))
    if (filesystem.existsSync(changelogFilename)) {
      const data = filesystem.readFileSync(changelogFilename)
      return data.includes(`## ${version}`) || data.includes(`## [${version}]`)
    }

    return true
  },

  getFileList: function (pluginName = null) {
    if (!pluginName) {
      throw new Error('getFileList Missing pluginName')
    }
    const fileList = []
    const pluginPath = path.join(pluginName)

    const changeLogFilename = path.join(pluginPath, 'CHANGELOG.md')

    const pluginJsonFilename = path.join(pluginPath, 'plugin.json')
    filesystem.existsSync(pluginJsonFilename) ? fileList.push(pluginJsonFilename) : null

    const scriptFilename = path.join(pluginPath, 'script.js')
    filesystem.existsSync(scriptFilename) ? fileList.push(scriptFilename) : null

    const readmeFilename = path.join(pluginPath, 'README.md')
    filesystem.existsSync(readmeFilename) ? fileList.push(readmeFilename) : null

    const licenseFilename = path.join(pluginPath, 'LICENSE')
    filesystem.existsSync(licenseFilename) ? fileList.push(licenseFilename) : null

    const response = { files: fileList }
    if (filesystem.existsSync(changeLogFilename)) {
      response.changelog = changeLogFilename
    }

    return response
  },

  getPluginConfig(pluginName = null) {
    const pluginJsonFilename = path.join(pluginName, 'plugin.json')
    if (filesystem.existsSync(pluginJsonFilename)) {
      const configData = filesystem.readFileSync(pluginJsonFilename)
      if (configData.length > 0) {
        return JSON.parse(configData)
      }
      return {}
    }
  },

  verifyPluginData: async function (pluginName = '') {
    const requiredKeys = [
      'macOS.minVersion',
      'noteplan.minAppVersion',
      'plugin.id',
      'plugin.name',
      'plugin.description',
      'plugin.author',
      'plugin.version',
      'plugin.script',
      'plugin.url',
      'plugin.commands',
    ]
    const missingItems = []
    const configData = this.getPluginConfig(pluginName)
    requiredKeys.forEach((key) => {
      !configData.hasOwnProperty(key) ? missingItems.push(key) : null
    })

    return missingItems
  },

  getPluginList() {
    const commands = this.getPluginCommands()
      .map((command) => command.pluginId)
      .filter((value, index, self) => {
        return self.indexOf(value) === index
      })

    return commands
  },

  isValidPlugin(pluginName = null) {
    const plugins = this.getPluginList()
    return plugins.includes(pluginName)
  },

  getPluginCommands(directory = '') {
    const pluginCommands = []
    const directories = filesystem.directoryList(directory, {
      directoriesOnly: true,
    })

    directories.forEach((directoryName) => {
      const jsonFilename = path.join(directoryName, 'plugin.json')
      if (filesystem.existsSync(jsonFilename)) {
        // load json object, sweet and simple using require, no transforming required
        const pluginObj = require(jsonFilename)
        if (pluginObj && pluginObj.hasOwnProperty('plugin.commands')) {
          pluginObj['plugin.commands'].forEach((command) => {
            if (pluginObj.hasOwnProperty('plugin.id') && pluginObj['plugin.id'] !== '{{pluginId}}') {
              pluginCommands.push({
                pluginId: pluginObj.hasOwnProperty('plugin.id') ? pluginObj['plugin.id'] : 'missing plugin-id',
                pluginName: pluginObj.hasOwnProperty('plugin.name') ? pluginObj['plugin.name'] : 'missing plugin-name',
                name: command.name,
                description: command.description,
                jsFunction: command.jsFunction,
                author: pluginObj['plugin.author'],
              })
              const pluginAliases = command.hasOwnProperty('alias') ? command.alias : []
              pluginAliases.forEach((alias) => {
                pluginCommands.push({
                  pluginId: pluginObj.hasOwnProperty('plugin.id') ? pluginObj['plugin.id'] : 'missing plugin-id',
                  pluginName: pluginObj.hasOwnProperty('plugin.name')
                    ? pluginObj['plugin.name']
                    : 'missing plugin-name',
                  name: alias,
                  description: command.description,
                  jsFunction: command.jsFunction,
                  author: pluginObj['plugin.author'],
                })
              })
            }
          })
        }
      }
    })
    return pluginCommands
  },
}
