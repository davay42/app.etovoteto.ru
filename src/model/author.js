import { gun, sea } from 'store@db'
import { joinRoom } from 'model@room'
import { reactive, ref } from 'vue'
import { capitalFirst } from './word'
import { generateWords } from '../use/randomWords'
import { downloadText } from '../use/loader'

export const account = reactive({
  is: null,
  profile: {
    name: '',
  },
  room: {
    current: '',
    host: {},
    fav: {},
  },
})

gun.user().recall({ sessionStorage: true }, () => {
  logIn()
})

gun.on('auth', () => {
  logIn()
})

function logIn() {
  account.is = gun.user().is
  console.info('Logged in as ', account.is.pub)
  loadProfile(account.is.pub)
}

export async function generate() {
  let pair = await sea.pair()
  participate(pair)
}

export async function participate(pair) {
  gun.user().auth(pair, async () => {
    // --
    let enc = await sea.encrypt(pair, 'test')
    // SAVING THE PAIR FOR TESTING PURPOSES
    gun.user().get('test').put(enc)
    // --

    let name = await gun.user().get('profile').get('name').then()
    if (!name) {
      gun.user().get('profile').get('name').put(capitalFirst(generateWords()))
    }
    joinRoom()
  })
}

export function loadProfile(pub) {
  gun
    .user()
    .get('profile')
    .map()
    .on((data, key) => {
      account.profile[key] = data
    })
  gun
    .user()
    .get('room')
    .get('host')
    .map()
    .once((d, k) => {
      account.room.host[k] = d
    })
}

export function updateProfile(field, data) {
  if (data) {
    gun.user().get('profile').get(field).put(data)
  }
}

export function downloadPair() {
  let pair = gun.user()._.sea
  pair = JSON.stringify(pair)

  downloadText(
    pair,
    'application/json',
    account.profile.name + '@etovoteto.json',
  )
}

// TEST AUTHORS
export async function testAuthor(enc) {
  let dec = await sea.decrypt(enc, 'test')
  participate(dec)
}

export function logOut() {
  let is = !!account.is?.pub
  gun.user().leave()
  setTimeout(() => {
    if (is && !gun.user()._?.sea) {
      account.is = null
      account.profile = {}
      account.room = { current: '', host: {}, fav: {} }
      console.info('User logged out')
    }
  }, 300)
}
