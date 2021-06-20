import Group from './Group'
import {
  APIApplicationCommandInteractionDataOption,
  InteractionType,
  ApplicationCommandOptionType,
  APIApplicationCommandInteractionDataOptionWithValues,
  ApplicationCommandInteractionDataOptionSubCommandGroup,
  APIInteraction
} from 'discord-api-types'
import axios from 'axios'
import Interaction from './Interaction'
import fastify from 'fastify'
import { IncomingHttpHeaders } from 'http'
import nacl from 'tweetnacl'
import CatLoggr from 'cat-loggr/ts'
import fastifyRawBody from 'fastify-raw-body'
import { InteractionResponseType } from 'discord-interactions'
import fs from 'fs/promises'
import path from 'path'

const loggr = new CatLoggr()

export const DiscordAPI = axios.create({
  baseURL: 'https://discord.com/api/v9',
  headers: {
    'Content-Type': 'application/json'
  }
})

export interface Command<A> {
  name: string
  onButtonClick?: (interaction: Interaction<A>) => Promise<void> | void
  onRun: (interaction: Interaction<A>) => Promise<void> | void
}

const server = fastify()

class PointsClient {
  #publicKey: string
  #debug?: Boolean
  private groups: Record<string, Group> = {}
  private commands: Record<string, Command<any>> = {}

  private isCommand = (
    option?: APIApplicationCommandInteractionDataOption
  ): option is APIApplicationCommandInteractionDataOptionWithValues => {
    return option?.type === ApplicationCommandOptionType.SUB_COMMAND
  }

  private isSubCommandGroup = (
    command?: APIApplicationCommandInteractionDataOption
  ): command is ApplicationCommandInteractionDataOptionSubCommandGroup => {
    return command?.type === ApplicationCommandOptionType.SUB_COMMAND_GROUP
  }

  private validateRequest = async (
    body: string,
    headers:
      | ({
          'x-signature-ed25519': string
          'x-signature-timestamp': string
        } & Record<string | number, unknown>)
      | IncomingHttpHeaders
  ) => {
    const signature = headers['x-signature-ed25519'] as string
    const timestamp = headers['x-signature-timestamp'] as string
    if (!signature || !timestamp) return false

    const isVerified = nacl.sign.detached.verify(
      Buffer.from(timestamp + body),
      Buffer.from(signature, 'hex'),
      Buffer.from(this.#publicKey, 'hex')
    )
    if (this.#debug) loggr.debug(`VERIFICATION: ${isVerified}`)
    if (!isVerified) return false
    return true
  }

  constructor({ publicKey, debug }: { publicKey: string; debug?: boolean }) {
    this.#publicKey = publicKey
    this.#debug = debug
    server.register(fastifyRawBody, {
      field: 'rawBody',
      global: false,
      encoding: 'utf8',
      runFirst: true
    })
    server.route({
      method: 'POST',
      config: {
        rawBody: true
      },
      url: '/api/interactions',
      preHandler: async (req, res) => {
        if (this.#debug)
          loggr.debug('INCOMING REQUEST', JSON.stringify(req.body), req.headers)
        const body = req.body as APIInteraction
        if (
          !(await this.validateRequest(JSON.stringify(req.body), req.headers))
        )
          return res.status(401).send('invalid request signature')

        if (body.type === InteractionType.Ping)
          return res.send({ type: InteractionResponseType.PONG })
      },
      handler: async (req, res) => {
        const interaction = new Interaction(req, res)
        switch (interaction.type) {
          case InteractionType.Ping: {
            await interaction.ping()
            break
          }
          case InteractionType.ApplicationCommand: {
            if (!interaction.member) return
            if (!!this.groups[interaction.name]) {
              const group = this.groups[interaction.name]
              const commandOptions =
                interaction.subcommands?.find(
                  (cmd) => !!group.commands[cmd.name]
                ) ??
                interaction.subcommandGroups?.find(
                  (g) => !!group.groups[g.name]
                )

              if (
                this.isCommand(commandOptions) &&
                group.commands[commandOptions.name]
              ) {
                await group.runCommand({
                  name: commandOptions.name,
                  interaction
                })
                return
              } else if (
                this.isSubCommandGroup(commandOptions) &&
                group.groups[commandOptions.name]
              ) {
                const subcommandGroup = group.groups[commandOptions.name]
                const subcommandOptions = commandOptions.options.find(
                  (cmd) => !!subcommandGroup.commands[cmd.name]
                )
                if (!subcommandOptions) return
                await subcommandGroup.runCommand({
                  name: subcommandOptions.name,
                  interaction
                })
                return
              } else {
                return
              }
            } else if (!!this.commands[interaction.name]) {
              if (!interaction.member) return
              await this.commands[interaction.name].onRun(interaction)
            } else {
              return
            }
          }
          // @ts-ignore
          case 3: {
            const buttonActions = (
              (interaction._req.body as { data: any }).data.custom_id ?? ''
            ).split(':')
            const command =
              this.commands[buttonActions[0]] ?? this.groups[buttonActions[0]]
            if (command && command.onButtonClick) {
              await command.onButtonClick(interaction)
            } else {
              return res.status(200).send({ type: 6 })
            }
            return
          }
        }
      }
    })
  }

  private async _loadDirectory(dir: string) {
    const directory = path.join(dir)
    if ((await fs.stat(directory)).isDirectory()) {
      const subfiles = await fs.readdir(directory)
      subfiles.map(async (p) => {
        const fp = path.join(directory, p)
        if (!!(await fs.stat(fp)).isDirectory())
          return await this._loadDirectory(fp)
        if (this.#debug) loggr.log(`Loaded File: ${fp}`)
        if (p.endsWith('.ts') || p.endsWith('.js'))
          return await import(path.resolve(fp))
      })
    } else {
      if (this.#debug) loggr.log(`Loaded File: ${directory}`)
      if (directory.endsWith('.ts') || directory.endsWith('.js'))
        await import(path.resolve(directory))
    }
  }

  public async loadCommands(dir: string) {
    const files = await fs.readdir(dir)
    files.map(async (file) => {
      await this._loadDirectory(path.join(dir, file))
    })
    loggr.init('LOADED COMMANDS')
  }

  public command<A>(command: Command<A>) {
    this.commands[command.name] = command
  }

  public group({
    name,
    onButtonClick
  }: {
    name: string
    onButtonClick?: (interaction: Interaction<any>) => Promise<void> | void
  }) {
    const group = new Group(name, onButtonClick)
    this.groups[name] = group
    return group
  }

  public async connect(port: number): Promise<void> {
    console.log('listen')
    await server.listen(port)
  }
}

export default PointsClient
