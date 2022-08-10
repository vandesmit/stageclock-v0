// eslint-disable no-console
export const useTimer = ({ currentCue }) => {
  const { transformToPositiveDoubleDigit } = useTransformers()
  const { now } = useTime()

  const _calculatedRemaining = ref(0)

  const {
    startNext: startNextCue,
    update: updateCue
  } = useCue()

  const update = () => {
    if (!currentCue.value) {
      return
    }
    const {
      duration,
      durationRemaining,
      id,
      startedAt,
      type
    } = currentCue.value

    _calculatedRemaining.value = durationRemaining || duration || 0

    // calculate remaining time in seconds
    if (startedAt) {
      _calculatedRemaining.value = startedAt + _calculatedRemaining.value - Math.floor(now())
    }

    // check if remaining time changed
    if (_calculatedRemaining.value === timer.remaining) {
      return
    }

    timer.remaining = _calculatedRemaining.value
    // if over time
    if (duration && startedAt && timer.remaining <= 0) {
      switch (type) {
        case 'negative':
          if (timer.remaining < 0) {
            timer.overTime = true
          }
          break
        case 'stop':
          updateCue({
            id,
            startedAt: 0,
            durationRemaining: 0
          })
          break
        case 'continue':
          updateCue({
            id,
            startedAt: 0,
            durationRemaining: 0
          })
          startNextCue({ timer })
          break
      }
    } else {
      timer.overTime = false
    }

    const hours = Math.floor(timer.remaining / 3600)
    const minutes = Math.floor(timer.remaining / 60) - hours * 60
    const seconds = Math.floor(timer.remaining) - minutes * 60 - hours * 3600

    // set times
    timer.hours = transformToPositiveDoubleDigit(hours)
    timer.minutes = transformToPositiveDoubleDigit(minutes)
    timer.seconds = transformToPositiveDoubleDigit(seconds)
  }

  const timer = reactive({
    hours: '00',
    minutes: '00',
    overTime: false,
    seconds: '00',
    remaining: 0,
    update
  })

  return timer
}
