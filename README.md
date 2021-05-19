![](https://files.atik.cc/u/g5x8wAFT4.png)

<h1 align="center"><strong>Quartz</strong></h1>

<h4 align="center">The heart of [Points](https://points.city)</h4>

## Setup

1.  Run `npm i @points.city/quartz` or `yarn add @points.city/quartz`
2.  Setup client and command handler

## Examples

Client Example:

```ts
import { Client } from '@points.city/quartz'
import { resolve } from 'path'

const client = new Client({
  publicKey: process.env.DISCORD_PUBLIC_KEY!,
  token: process.env.DISCORD_TOKEN!,
  appID: process.env.DISCORD_APP_ID!,
  debug: false
})

client.loadCommands('path to commands')
client.connect(Number(process.env.PORT!))
```

Command Example:

```ts
import { Command, CommandContext, Client } from 'quartz'

client.command({
  name: 'ping',
  description: 'A command that responds pong',
  onRun: async ({ send }) => {
    return send({
      content: 'Pong!'
    })
  }
})
```
