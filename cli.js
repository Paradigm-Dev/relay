#!/usr/bin/env node

const { Command } = require('commander')
const hound = require('hound')
const shell = require('shelljs')

var program = new Command()

program.version('0.0.1')

program
  .command('start')
  .description('Starts up Relay.')
  .action(() => {
    shell.exec('cd ~/relay && sudo forever start . -l log.txt')
    console.log('Relay started.')
  })

program
  .command('stop')
  .description('Stops Relay')
  .action(() => {
    shell.exec('(sudo nohup killall node &> /dev/null &)', { silent: true })
  })

program
  .command('log')
  .description('Shows a realtime log of Relay.')
  .action(() => {
    shell.exec('cd ~/relay && sudo tail -f log.txt')
  })

program.parse(process.argv)