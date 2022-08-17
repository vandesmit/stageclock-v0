export const useTransform = () => {
  const doubleDigit = (digit: number): string => ('0' + digit).slice(-2)

  const positiveDoubleDigit = (digit: number): string => ('0' + Math.abs(digit)).slice(-2)

  const readableTime = (value: number): string => {
    if (typeof value !== 'number') { return '00:00' }
    const hours = Math.floor(value / 3600)
    const minutes = Math.floor(value / 60) - hours * 60
    const seconds = value - minutes * 60 - hours * 3600
    const text = hours ? `${positiveDoubleDigit(hours)}:` : ''
    return `${text}${positiveDoubleDigit(minutes)}:${positiveDoubleDigit(seconds)}`
  }

  return {
    doubleDigit,
    positiveDoubleDigit,
    readableTime
  }
}
