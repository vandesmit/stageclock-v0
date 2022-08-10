// eslint-disable-next-line no-console
export const useListener = ({ cueList = ref([]), logger = console.log }) => {
  const listening = ref(false)

  if (!listening.value && typeof EventSource !== 'undefined') {
    const events = new EventSource('/api/sync')

    // watch for event streams
    events.onmessage = ({ data }): void => {
      const messageBag = JSON.parse(data)

      // set new cue list
      if (messageBag.cueList) {
        cueList.value = messageBag.cueList
      }

      // log event-stream message
      if (messageBag.log) {
        logger(messageBag.log)
      }
    }

    listening.value = true
  }
}
