import { onBeforeUnmount } from 'vue'
import { reactive, ref } from 'vue'
import { currentRoom } from 'store@room'
import { computed } from 'vue'

export const linkFrom = ref({})

export function link(node, cb) {
  let lnk = linkFrom.value
  if (lnk && lnk.hash && node && node.hash && lnk.tag != node.tag) {
    linkHashes(lnk.hash, node.hash)
  } else {
    linkFrom.value = node
    if (cb) cb()
  }
}

export async function linkHashes(from, to, del = false) {
  let certificate = await gun
    .get(`~${currentRoom.pub}`)
    .get('cert')
    .get('link')
    .then()
  gun
    .get(`~${currentRoom.pub}`)
    .get('link')
    .get(`${from}.${to}@${gun.user().is.pub}`)
    .put(!del ? true : false, null, {
      opt: {
        cert: certificate,
      },
    })
    .back()
    .get(`${to}.${from}@${gun.user().is.pub}`)
    .put(!del ? true : false, null, {
      opt: {
        cert: certificate,
      },
    })
}

export function useLinks(fromHash) {
  const obj = reactive({})
  const request = gun
    .get(`~${currentRoom.pub}`)
    .get('link')
    .map()
    .on(function (data, key) {
      let index = key.indexOf(fromHash)
      if (index == -1) return
      let toHash
      if (index == 0) {
        toHash = key.slice(45, 89)
      } else {
        toHash = key.slice(0, 44)
      }
      let author = key.slice(-87)

      obj[toHash] = obj[toHash] || {}
      obj[toHash][author] = data
    })
  const links = computed(() => {
    let list = {}
    for (let link in obj) {
      if (Object.values(obj[link]).filter(Boolean).length !== 0) {
        for (let by in obj[link]) {
          if (obj[link][by]) {
            list[link] = list[link] || {}
            list[link][by] = true
          }
        }
      }
    }
    return list
  })

  onBeforeUnmount(() => {
    request.off()
  })
  return { links }
}

export function useCountLinks(author, room = currentRoom.pub) {
  const counter = reactive({})
  gun
    .get(`~${room}`)
    .get('link')
    .map()
    .once((d, k) => {
      if (author && !k.includes(author)) return
      counter[k] = true
    })
  const count = computed(() => {
    return Object.keys(counter).length
  })
  return count
}
