export const useTransformers = () => {
  return {
    transformToPositiveDoubleDigit: (digit: number): string => ('0' + Math.abs(digit)).slice(-2),
    transformToDoubleDigit: (digit: number): string => ('0' + digit).slice(-2)
  }
}
