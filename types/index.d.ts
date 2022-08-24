type Icon = 'continue'|'negative'|'next'|'pause'|'play'|'prev'|'reset'|'stop'|'stop2'
type CueType = 'continue'|'negative'|'stop'

interface CueObjectType {
  key: CueType,
  label: string,
  icon: Icon,
}
cueTypeOptions = {
  continue: {
    label: 'Auto continue',
    icon: 'continue'
  },
  negative: {
    label: 'Go negative',
    icon: 'negative'
  },
  stop: {
    label: 'Stop',
    icon: 'stop2'
  }
}

interface Cue {
  description?: string,
  duration: number,
  durationRemaining: number,
  id: string,
  startedAt?: number,
  type: CueType
  // type: 'continue'|'negative'|'stop',
}
