module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  pluginOptions: {
    electronBuilder: {
      outputDir: 'output',
      removeElectronJunk: false,
      shortcutName: 'Relay Management Console',
      icon: 'build/icon.png',
      productName: 'Relay Management Console',
      name: 'Relay Management Console'
    }
  }
}