import { nanoid } from 'nanoid'

export const useDatabase = (): Database => {
  const listening = ref(false)
  const logger = console.log // eslint-disable-line no-console

  if (!listening.value && typeof EventSource !== 'undefined') {
    const events = new EventSource('/api/sync')

    // watch for event streams
    events.onmessage = ({ data }): void => {
      const messageBag = JSON.parse(data)

      // set last active cue-id
      if (messageBag.lastActiveId && lastActiveId) {
        lastActiveId.value = messageBag.lastActiveId
      }

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

  const _defaults: Cue = {
    description: 'cue item',
    type: 'negative'
  }

  const createCue: Database['createCue'] = (cue) => {
    list.value.push({
      id: nanoid(48),
      ..._defaults,
      ...cue
    })
    sync()
  }

  const deleteCue: Database['deleteCue'] = (id) => {
    if (confirm('Are you sure you want to delete a cue?')) {
      list.value = list.value.filter(cue => cue.id !== id)
    }
  }

  const list = ref<Cue[]>([])
  const sync = () => {
    $fetch('/api/sync', {
      method: 'POST',
      body: {
        cueList: list.value,
        lastActiveId: lastActiveId.value
      }
    })
  }

  const lastActiveId: Database['lastActiveId'] = ref(null)
  const _active = computed(() => list.value.find(c => c.startedAt))
  const _lastActive = computed(() => list.value.find(c => c.id === lastActiveId.value))
  const currentCue = computed(() => _active.value || _lastActive.value)
  const hasLongCues = computed(() => !!list.value.find(c => c.duration >= 3600))

  const updateCue: Database['updateCue'] = (newValues) => {
    if (!newValues) {
      logger('cannot update cue without new values')
      return
    }
    const cueKey = newValues.id && list.value.findIndex(c => c.id === newValues.id)
    if (typeof cueKey === 'undefined' || cueKey < 0) {
      return
    }
    list.value[cueKey] = {
      ...list.value[cueKey],
      ...newValues
    }

    sync()
  }

  const startCue: Database['startCue'] = (id, remaining) => {
    if (typeof remaining === 'undefined') {
      logger('cannot start cue without remaining value of previous cue')
      return
    }
    const startedAt = time.now()

    // Pause all cues (fallback mechanism)
    list.value.forEach((value, key) => {
      if (value.startedAt) {
        list.value[key].startedAt = null
        list.value[key].durationRemaining = remaining
      }
    })

    updateCue({
      id,
      startedAt
    })
  }

  const pauseCue: Database['pauseCue'] = (id, remaining) => updateCue({
    id,
    startedAt: 0,
    durationRemaining: remaining
  })

  const stopCue: Database['stopCue'] = id => updateCue({
    id,
    startedAt: 0,
    durationRemaining: null
  })

  const startNextCue: Database['startNextCue'] = (timer) => {
    if (!timer) {
      logger('cannot start next cue without timer info')
      return
    }
    timer.remaining = 0
    timer.overTime = false
    const currentKey = list.value.findIndex(c => c.id === currentCue.value.id)
    if (currentKey < 0) {
      console.error('current cue not found when trying to start next cue') // eslint-disable-line no-console
      return
    }
    const nextKey = currentKey + 1

    const nextCue = list.value[nextKey]

    if (nextCue) {
      list.value[nextKey].startedAt = time.now()
      list.value[currentKey].startedAt = null
    } else if (list.value[currentKey].type === 'continue') {
      list.value[currentKey].type = 'stop'
    }

    sync()
  }

  const startPreviousCue: Database['startPreviousCue'] = (timer) => {
    if (!timer) {
      logger('cannot start previous cue without timer info')
      return
    }
    timer.remaining = 0
    timer.overTime = false
    const currentKey = list.value.findIndex(c => c.id === currentCue.value.id)
    if (currentKey < 0) {
      console.error('current cue not found when trying to start next cue') // eslint-disable-line no-console
      return
    }
    const nextKey = currentKey - 1

    const nextCue = list.value[nextKey]

    if (nextCue) {
      list.value[nextKey].startedAt = time.now()
      list.value[currentKey].startedAt = null
    }

    sync()
  }

  return {
    createCue,
    deleteCue,
    cueList: list,
    currentCue,
    lastActiveId,
    hasLongCues,
    pauseCue,
    startCue,
    startNextCue,
    startPreviousCue,
    stopCue,
    sync,
    updateCue
  }
}
