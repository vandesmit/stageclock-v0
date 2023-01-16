export const useClock = () => {
  const { doubleDigit } = useTransform()

  const update = (): void => {
    const date = new Date()
    clock.hours = doubleDigit(date.getHours())
    clock.minutes = doubleDigit(date.getMinutes())
    clock.seconds = doubleDigit(date.getSeconds())
  }

  const clock: Clock = reactive({
    hours: '00',
    minutes: '00',
    seconds: '00',
    update
  })

  return clock
}
