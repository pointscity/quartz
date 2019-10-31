![](https://file.coffee/g5x8wAFT4.png)

<h1 align="center"><strong>Quartz</strong></h1>

The heart of [Points](https://points.city)

## Setup

 1. Run `npm i https://github.com/pointscity/quartz.git` or `yarn add https://github.com/pointscity/quartz.git`
 2. Install chalk, eris, and eventemitter3
 4. Setup client and command handler

## Examples

Client Example:

```
const { QuartzClient } = require('quartz')
const { Client } = require('eris')
const path = require('path')

const eris = new Client(process.env.TOKEN)
const client = new QuartzClient({
  owner: 'ownerID',
  eventHandler: {
    directory: path.resolve('./events')
  },
  commandHandler: {
    directory: path.resolve('./commands'),
    prefix: '!'
  }
})

client.start()
```

Command Example:

```
const { Command } = require('quartz')

class Ping extends Command {
  constructor (client) {
    super(client, {
      name: 'ping',
      aliases: ['pong'],
      description: {
        content: 'Returns ping'
      }
    })
  }

  run (msg, args) {
    return await msg.channel.createMessage('Pong!')
  }
}
module.exports = Ping
```

Event Example:

```
const { Event } = require('quartz')

class Ready extends Event {
  constructor (client) {
    super(client, {
      name: 'ready'
    })
  }

  run () {
    return console.log('Bot Ready!')
  }
}
module.exports = Ping
```
