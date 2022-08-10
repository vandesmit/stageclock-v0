export const useTime = () => ({
  now: (): number => new Date().getTime() / 1000
})
