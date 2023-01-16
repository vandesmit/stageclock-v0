type Icon = 'continue'|'negative'|'next'|'pause'|'play'|'prev'|'reset'|'stop'|'stop2'
type CueType = 'continue'|'negative'|'stop'

interface Label {
  key: CueType,
  label: string,
  icon: Icon
}

type Cue = {
  description?: string,
  duration?: number,
  durationRemaining?: number,
  id?: string,
  startedAt?: number,
  type?: CueType
}

interface Clock {
  isHidden?: boolean,
  hours: string,
  minutes: string,
  seconds: string,
  update: () => void
}

interface Timer extends Clock {
  overTime?: boolean,
  remaining?: number
}

interface Database {
  createCue?: (cue: Cue) => void,
  deleteCue?: (id: Cue['id']) => void,
  cueList?: Ref<Cue[]>,
  currentCue?: Ref<Cue>,
  lastActiveId?: Ref<Cue['id']>,
  hasLongCues?: Ref<boolean>,
  pauseCue: (id: Cue['id'], remaining: Cue['durationRemaining']) => void,
  startCue: (id: Cue['id'], remaining: Cue['durationRemaining']) => void,
  startNextCue: (timer: Timer) => void,
  stopCue: (id: Cue['id']) => void,
  sync: () => void,
  updateCue: (newValues: Cue) => void,
}
