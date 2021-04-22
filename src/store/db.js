const config = {
  peers: '', // ['https://gun.etovoteto.ru/gun'], //  'https://etogun.glitch.me/gun'    'https://etovoteto.herokuapp.com/gun', , ['https://gun-feeds.glitch.me/gun'], 'http://127.0.0.1:4200/gun',
}

import Gun from 'gun/gun'
import SEA from 'gun/sea.js'
import 'gun/lib/then'
import 'gun/lib/radix'
import 'gun/lib/radisk'
import 'gun/lib/store'
import 'gun/lib/rindexed'
import 'gun/lib/webrtc'
import 'gun/nts'
//import 'zenbase/dist/main.js' - uncomment this to get zenbase working – so SIA Skynet is used to store data

export const gun = Gun({ peers: config.peers, localStorage: false })
export const roomDb = Gun({ peers: config.peers, localStorage: false })
window.gun = gun //for debugging
export const cert = config.cert
export const soul = Gun.node?.soul
export const isNode = Gun.node?.is
export const getState = Gun.state
// export const getState = Gun.state.is //(node,'key') => timestamp
export const sea = SEA
export const genUuid = Gun?.text?.random

export function cutUuid(key) {
  if (!key) return
  return key.substring(key.lastIndexOf('/') + 1)
}

export function isLink(name, field) {
  return name != '_' && field instanceof Object && field.hasOwnProperty('#')
}

export function formatDate(date) {
  if (!date) return
  let theDate = new Date(Number(date))
  return {
    date: theDate.toLocaleDateString('en-CA'),
    time: theDate.toLocaleTimeString('en-CA'),
  }
}

export async function hashObj(obj) {
  let text = JSON.stringify(obj)
  let hash = await sea.work(text, null, null, { name: 'SHA-256' })
  return { text, hash }
}

const encode_regex = /[\+=\/]/g
const decode_regex = /[\._\-]/g

// Buffer -> Base64 String -> Url Safe Base64 String
export function safeHash(unsafe) {
  if (!unsafe) return
  return unsafe.replace(encode_regex, encodeChar)
}

// Url Safe Base64 String -> Base64 String -> Buffer
export function unsafeHash(safe) {
  if (!safe) return
  return safe.replace(decode_regex, decodeChar)
}

function encodeChar(c) {
  switch (c) {
    case '+':
      return '-'
    case '=':
      return '.'
    case '/':
      return '_'
  }
}

function decodeChar(c) {
  switch (c) {
    case '-':
      return '+'
    case '.':
      return '='
    case '_':
      return '/'
  }
}
