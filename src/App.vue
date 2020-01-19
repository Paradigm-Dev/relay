<template>
  <v-app>
    <v-system-bar app window style="-webkit-app-region: drag;" class="deep-purple elevation-4">
      <img @click.left="reload()" src="./assets/logo.png" height="18" style="margin-right: 4px;">
      <span style="margin-right: 4px">Relay Management Conosle</span>
      <v-spacer></v-spacer>
      <div style="-webkit-app-region: no-drag;" class="mr-n2">
        <v-icon @click="minimize()" v-ripple class="appbar-icon">mdi-minus</v-icon>
        <v-icon @click="maximized ? unmaximize() : maximize()" v-ripple class="appbar-icon">mdi-crop-square</v-icon>
        <v-icon @click="close()" v-ripple class="appbar-icon">mdi-close</v-icon>
      </div>
    </v-system-bar>

		<v-content>
			<v-container fluid class="py-0">
        <v-row>
          <v-col cols="12" sm="3" class="py-6 pl-6">
            <v-row>
              <v-col class="pt-0" cols="12" sm="12">
                <v-card class="fill-height">
                  <v-card-text>
                    <p>Status:<span :class="{ 'ml-12 title font-weight-bold': true, 'red--text': !$root.data.status, 'green--text': $root.data.status }">{{ $root.data.status ? 'Online' : 'Offline' }}</span></p>
                    <v-text-field :disabled="$root.data.status" @change="$saveData()" label="Host IP Address" v-model="$root.data.ip"></v-text-field>
                    <v-text-field :disabled="$root.data.status" @change="$saveData()" label="Host Port" v-model="$root.data.port"></v-text-field>
                    <v-text-field :disabled="$root.data.status" @change="$saveData()" label="File Path" v-model="$root.data.path"></v-text-field>
                    <v-switch color="blue lighten-2" class="mt-0" @change="$saveData()" label="Auto Start" @click.prevent="toggleAutoLaunch()" v-model="$root.data.auto_start"></v-switch>
                    <p class="mb-1" v-if="$root.data.status">To edit server settings, stop the server.</p>
                    <v-row>
                      <v-col sm="4" style="padding-right: 6px;"><v-btn text block color="blue" @click="openRelayDir()">Open Path</v-btn></v-col>
                      <v-col sm="4" style="padding-right: 6px;"><v-btn text block color="indigo lighten-1" @click="openURL()">Open URL</v-btn></v-col>
                      <v-col sm="4" style="padding-left: 6px;"><v-btn text block color="red" @click="history = []">Clear</v-btn></v-col>
                    </v-row>
                    <v-btn block @click="toggleServer()" :color="$root.data.status ? 'red' : 'green'">{{ $root.data.status ? 'Stop' : 'Start' }}</v-btn>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" sm="12">
                <!-- <v-card class="fill-height">
                  <textarea v-model="$root.script" class="fill-height"></textarea>
                </v-card> -->
              </v-col>
            </v-row>
          </v-col>

          <v-col cols="12" sm="9" class="py-6 pr-6">
            <v-card class="fill-height" style="font-family: 'Roboto Mono'; height: calc( 100vh - 80px )">
              <v-card-text>
                <div v-for="(item, index) in history" :key="index">
                  <p v-html="item"></p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
		</v-content>
  </v-app>
</template>

<script>
import electron from 'electron'
import { shell } from 'electron'
import path from 'path'
import fs from 'fs'
import recursive from 'recursive-readdir'
import axios from 'axios'
import ip from 'ip'
import express from 'express'
import formidable from 'formidable'
import cors from 'cors'
// import AutoLaunch from 'auto-launch'

const remote = require('electron').remote

const app = express()
var server

export default {
	name: 'app',
	data() {
		return {
			win: remote.getCurrentWindow(),
      maximized: remote.getCurrentWindow().isMaximized(),
      history: [],
      files: [],
      // auto_launch: new AutoLaunch({
      //   name: 'Relay Management Console',
      //   path: 'C:/Users/Aidan Liddy/Dev/paradigm/rmc/node_modules/electron/dist/electron.exe'
      // })
		}
	},
  methods: {
    reload() {
      this.win.reload()
    },
    close() {
      this.win.close()
    },
    maximize() {
      this.win.maximize()
      this.maximized = remote.getCurrentWindow().isMaximized()
    },
    unmaximize() {
      this.win.unmaximize()
      this.maximized = remote.getCurrentWindow().isMaximized()
    },
    minimize() {
      this.win.minimize()
    },
    openURL() {
      shell.openItem(`http://${this.$root.data.ip}:${this.$root.data.port}`)
    },
    openRelayDir() {
      shell.openItem(this.$root.data.path)
    },
    toggleServer() {
      if (this.$root.data.status === true) {
        this.$root.data.status = false
        this.stopServer()
      }
      else {
        this.$root.data.status = true
        this.startServer()
      }
    },
    toggleAutoLaunch(input) {
      this.$root.data.auto_launch = input
      // if (input === true) {
      //   this.auto_launch.enable()
      // } else {
      //   this.auto_launch.disable()
      // }
      // console.log(this.auto_launch.isEnabled())
    },
    consolelog(input) {
      this.history.push(input)
    },
    consoleerror(input) {
      this.history.push(`<span class="red--text">${input}</span>`)
    },
    stopServer() {
      server.close()
      this.consolelog('Server stopped!')
    },
    startServer() {
      this.consolelog('Server starting...')

      const port = this.$root.data.port
      const ip = this.$root.data.ip

      app.use(cors())


      // ROVER
      app.use('/rover', express.static(this.$root.data.path + '/rover/dist'))


      // RELAY

      app.use('/', express.static(`${this.$root.data.path}/relay`))

      app.get('/relay/list/:path', (req, res) => {
        var dir = `${this.$root.data.path}/relay/${req.params.path}`

        fs.readdir(dir, (error, files) => {
          if (error) this.consoleerror(error)
          else {
            res.json(files)
            this.consolelog(`RELAY -- List: ${req.params.path}`)
          }
        })
      })


      // DRAWER

      app.get('/files/:username', (req, res) => {
        var dir = path.join(this.$root.data.path + '/drawer/' + req.params.username)
        if (fs.existsSync(dir)) {
          fs.readdir(dir, (error, filenames) => {
            if (error) {
              this.consoleerror(error)
            } else {
              res.json(filenames)
              this.consolelog(`DRAWER -- Sent: ${req.params.username}/file list`)
            }
          })
        } else {
          fs.mkdirSync(dir)
          this.consolelog(`DRAWER -- Created: ${req.params.username}`)
        }
      })

      app.get('/download/:username/:path', (req, res) => {
        res.download(path.join(this.$root.data.path + '/drawer/' + req.params.username + '/' + req.params.path))
        this.consolelog(`DRAWER -- Downloaded: ${req.params.username}/${req.params.path}`)
      })

      app.delete('/file/:username/:path', (req, res) => {
        fs.unlink(path.join(this.$root.data.path + '/drawer/' + req.params.username + '/' + req.params.path), error => {
          if (error) {
            throw error
          }
          this.consolelog(`DRAWER -- Deleted: ${req.params.username}/${req.params.path}`)
        })
      })

      app.post('/upload/:username', (req, res) => {
        var form = new formidable.IncomingForm()

        form.parse(req)

        form.on('fileBegin', (name, file) => {
          file.path = this.$root.data.path + '/drawer/' + req.params.username + '/' + file.name
        })

        form.on('file', (name, file) => {
          this.consolelog(`DRAWER -- Uploaded: ${req.params.username}/${file.name}`)
        })
      })


      // OTHER

      app.get('/terminal', (req, res) => {
        fs.readFile(`${this.$root.data.path}/relay/terminal.html`, (error, data) => {
          res.write(data)
        })
      })

      app.get('/terms', (req, res) => {
        fs.readFile(`${this.$root.data.path}/relay/terms.html`, (error, data) => {
          res.write(data)
        })
      })

      server = app.listen(this.$root.data.port, this.$root.data.ip)

      this.consolelog(`Server started!`)
      this.consolelog(`Ready! Listening on http://${ip}:${port}.`)
    }
  },
  created() {
    const userDataPath = (electron.app || electron.remote.app).getPath('userData')
    var pathway = path.join(userDataPath, 'relay.json')

    this.$root.data = parseDataFile(pathway)
    this.$root.data.status = false

    if (this.$root.data.auto_start === true) {
      // this.auto_launch.enable()
      this.consolelog('The server is automatically starting...')
      this.startServer()
      this.$root.data.status = true
    } else {
      // this.auto_launch.disable()
    }

    // console.log(this.auto_launch.isEnabled())

    function parseDataFile(filePath) {
      try {
        return JSON.parse(fs.readFileSync(filePath))
      } catch(error) {
        this.consolelog('Configuration file not found', error)
        fs.writeFileSync(filePath, JSON.stringify({
          status: false,
          ip: ip.address(),
          port: 80,
          auto_start: true,
          path: ''
        }))
        return {
          status: false,
          ip: ip.address(),
          port: 80,
          auto_start: true,
          path: ''
        }
      }
    }

    // fs.readdir(this.$root.data.path, { withFileTypes: true }, (error, filenames) => {
    //   if (error) {
    //     this.consoleerror(error)
    //   } else {
    //     var file_list = []
    //     filenames.forEach(file => {
    //       this.consolelog(file)
    //       switch (file.isDirectory()) {
    //         case false:
    //           file_list.push({
    //             name: file.name,
    //             folder: false
    //           })
    //           break
    //         case true:
    //           file_list.push({
    //             name: file.name,
    //             folder: true,
    //             children: [
    //               { name: 'this is a folder' }
    //             ]
    //           })
    //       }
    //     })
    //     this.files = file_list
    //   }
    // }).catch(error => this.consolerror(error))

    // recursive(this.$root.data.path, [ 'node_modules', 'rover' ]).then(files => {
    //   files.forEach(file => {
    //     fs.readFile(file, (err, data) => {
    //       this.consolelog(file, data)
    //     })
    //   })
      // var file_list = []
      // files.forEach(file => {
      //   var info = {
      //     full_path: file,
      //     path: file.slice(this.$root.data.path.length),
      //     full_name: file.slice(file.lastIndexOf('\\') + 1),
      //     name: file.slice(file.lastIndexOf('\\') + 1, file.lastIndexOf('.')),
      //     type: file.slice(file.lastIndexOf('.') + 1)
      //   }
      //   file_list.push(info)
      // })
      // this.files = file_list
    // })
  }
}
</script>

<style>
/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track { background: rgb(33, 33, 33); }
::-webkit-scrollbar-thumb { background: rgb(100, 100, 100); }
::-webkit-scrollbar-thumb:hover { background: rgb(60, 60, 60); }
::-webkit-scrollbar-corner { background: rgb(33, 33, 33); }

html {
  overflow-y: auto !important;
	-webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.appbar-icon { border-radius: 100px; }

.centralize {
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
	text-align: center;
}
</style>