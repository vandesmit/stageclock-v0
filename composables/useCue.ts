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

  const { now } = useTime()

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
    _sync()
  }

  const list = ref(<cue[]>[])
  const _sync = () => {
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

  const update = (newCueValues: cue): void => {
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

    _sync()
  }

  const startNext = ({ timer }): void => {
    timer.remaining = 0
    timer.overTime = false
    const currentKey = list.value.findIndex(({ id }: cue) => id === current.value.id)
    const nextKey = currentKey + 1

    const nextCue = list.value[nextKey]

    if (nextCue) {
      list.value[nextKey].startedAt = now()
      list.value[currentKey].startedAt = null
    } else {
      list.value[currentKey].type = 'stop'
    }

    _sync()
  }

  return {
    create,
    list,
    current,
    lastActiveId,
    hasLongCues: computed(() => !!list.value.find(({ duration }: cue) => duration >= 3600)),
    startNext,
    update
  }
}
