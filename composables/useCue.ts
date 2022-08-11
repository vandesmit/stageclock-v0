import { nanoid } from 'nanoid'

export const useCue = () => {
  type cue = {
    description?: string,
    duration: number,
    durationRemaining: number,
    id: string,
    startedAt?: number,
    type: 'continue'|'negative'|'stop',
  }

  const listening = ref(false)
  const logger = console.log // eslint-disable-line no-console

  if (!listening.value && typeof EventSource !== 'undefined') {
    const events = new EventSource('/api/sync')

    // watch for event streams
    events.onmessage = ({ data }): void => {
      const messageBag = JSON.parse(data)

      // set new cue list
      if (messageBag.cueList && list) {
        list.value = messageBag.cueList
      }

      // log event-stream message
      if (messageBag.log) {
        logger(messageBag.log)
      }
    }

    listening.value = true
  }

  const time = useTime()

  const _defaults = <cue>{
    description: 'cue item',
    type: 'negative'
  }

  const create = (cue: cue): void => {
    list.value.push({
      id: nanoid(48),
      ..._defaults,
      ...cue
    })
    sync()
  }

  const deleteCue = (id: cue['id']) => {
    if (confirm('Are you sure you want to delete a cue?')) {
      list.value = list.value.filter(cue => cue.id !== id)
    }
  }

  const list = ref(<cue[]>[])
  const sync = () => {
    $fetch('/api/cue-list', {
      method: 'POST',
      body: {
        cueList: list.value
      }
    })
  }

  const lastActiveId = ref(<cue['id']>null)
  const _active = computed(() => list.value.find(({ startedAt }) => startedAt))
  const _lastActive = computed(() => list.value.find(({ id }) => id === lastActiveId.value))
  const current = computed(() => _active.value || _lastActive.value)

  const update = (newCueValues): void => {
    const cueKey = newCueValues.id && list.value.findIndex(({ id }: cue): boolean => {
      return id === newCueValues.id
    })
    if (typeof cueKey === 'undefined' || cueKey < 0) {
      return
    }
    list.value[cueKey] = <cue>{
      ...list.value[cueKey],
      ...newCueValues
    }

    sync()
  }

  const start = (id, remaining) => {
    const startedAt = time.now()

    // Pause all cues (fallback mechanism)
    list.value.forEach((value, key) => {
      if (value.startedAt) {
        list.value[key].startedAt = null
        list.value[key].durationRemaining = remaining
      }
    })

    update({
      id,
      startedAt
    })
  }

  const pause = (id, remaining) => update({
    id,
    startedAt: 0,
    durationRemaining: remaining
  })

  const stop = id => update({
    id,
    startedAt: 0,
    durationRemaining: null
  })

  const startNext = ({ timer }): void => {
    timer.remaining = 0
    timer.overTime = false
    const currentKey = list.value.findIndex(({ id }: cue) => id === current.value.id)
    if (currentKey < 0) {
      console.error('current cue not found when trying to start next cue') // eslint-disable-line no-console
      return
    }
    const nextKey = currentKey + 1

    const nextCue = list.value[nextKey]

    if (nextCue) {
      list.value[nextKey].startedAt = time.now()
      list.value[currentKey].startedAt = null
    } else {
      list.value[currentKey].type = 'stop'
    }

    sync()
  }

  return {
    create,
    delete: deleteCue,
    list,
    current,
    lastActiveId,
    hasLongCues: computed(() => !!list.value.find(({ duration }: cue) => duration >= 3600)),
    pause,
    start,
    startNext,
    stop,
    sync,
    update
  }
}
