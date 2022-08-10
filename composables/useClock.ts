export const useClock = () => {
  const { transformToDoubleDigit } = useTransformers()

  const update = (): void => {
    const date = new Date()
    clock.hours = transformToDoubleDigit(date.getHours())
    clock.minutes = transformToDoubleDigit(date.getMinutes())
    clock.seconds = transformToDoubleDigit(date.getSeconds())
  }

  const clock = reactive({
    hours: '00',
    isHidden: false,
    minutes: '00',
    seconds: '00',
    update
  })

  return clock
}
