export const useTransform = () => {
  // TODO: check if _positiveDoubleDigit can replace doubleDigit
  const doubleDigit = (digit: number): string => ('0' + digit).slice(-2)

  const _positiveDoubleDigit = (digit: number): string => ('0' + Math.abs(digit)).slice(-2)

  const readableTime = (value: number): string => {
    if (typeof value !== 'number') { return '00:00' }
    const hours = Math.floor(value / 3600)
    const minutes = Math.floor(value / 60) - hours * 60
    const seconds = value - minutes * 60 - hours * 3600
    const text = hours ? `${_positiveDoubleDigit(hours)}:` : ''
    return `${text}${_positiveDoubleDigit(minutes)}:${_positiveDoubleDigit(seconds)}`
  }

  return {
    doubleDigit,
    readableTime
  }
}
