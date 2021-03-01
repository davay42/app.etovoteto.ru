import { gun, sea } from 'store@db'
import { reactive, ref } from 'vue'

export const search = ref('')

export function useProfile(pub) {
  const profile = reactive({
    name: 'Без имени',
  })
  gun
    .get(`~${pub}`)
    .get('profile')
    .map()
    .on((d, k) => (profile[k] = d))
  return profile
}

export function useRooms(pub) {
  const rooms = reactive({
    fav: {},
    current: '',
    host: {},
  })
  Object.keys(rooms).forEach((key) => {
    gun
      .get(`~${pub}`)
      .get('room')
      .get(key)
      .map()
      .on((d, k) => {
        rooms[key][k] = d
      })
  })
  return rooms
}

export function useAuthor(pub) {
  const author = reactive({
    pub: pub,
  })

  return author
}
