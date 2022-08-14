import Client from './structures/Client'
import Embed from './structures/Embed'
import Group from './structures/Group'
import Interaction from './structures/Interaction'
import Member from './structures/Member'
import User from './structures/User'
import ActionRow from './structures/ActionRow'
import Button, { ButtonStyle } from './structures/Button'
import axios from 'axios'

const DiscordAPI = axios.create({
  baseURL: 'https://discord.com/api/v10',
  headers: {
    'Content-Type': 'application/json'
  }
})

export {
  Client,
  Embed,
  Group,
  Interaction,
  Member,
  User,
  ActionRow,
  Button,
  ButtonStyle,
  DiscordAPI
}
