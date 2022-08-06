import express from 'express'
import cors from 'cors'
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_TLS_URL || process.env.REDIS_URL)
const app = express()
const welcomeMessage = { log: 'Welcome! Api is running and connected' }
const log = [ welcomeMessage ]
const defaultDatabase = {
  "cueList": [
    {
      "id": "default-unique-cue-list-item-1",
      "description": "Countdown",
      "duration": 600,
      "type": "continue",
    },
    {
      "id": "default-unique-cue-list-item-2",
      "description": "Item",
      "duration": 300,
      "type": "negative",
    },
    {
      "id": "default-unique-cue-list-item-3",
      "description": "Aftermovie",
      "duration": 180,
      "type": "stop",
    }
  ],
}

const readDatabase = ({
  onSuccess = data => data,
  onError = console.error,
}) => {
  redis.get('database', (err, result) => {
    if (err || !result) {
      onError(err)
      console.log('reading DB Error: ', { err, result })
    } else {
      const resultObj = JSON.parse(result)
      onSuccess(resultObj)
      console.log('reading DB: ', resultObj)
    }
  })
}

const writeDatabase = async (data) => {
  const response = await redis.set("database",  JSON.stringify(data))
  console.log('writing DB: ', response)
}

// Write default database when there is no database present.
readDatabase({
  onError: () => writeDatabase(defaultDatabase),
})

let clients = []

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/status', (req, res) => res.json({ 'clients connected': clients.length }))
app.get('/logs', (req, res) => res.json(log))

app.get('/sync', (req, res) => {
  const clientId = Date.now()
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  }

  res.writeHead(200, headers)
  res.write(`data: ${JSON.stringify(welcomeMessage)}\n\n`)
  
  readDatabase({
    onSuccess: data => res.write(`data: ${JSON.stringify(data)}\n\n`)
  })

  clients.push({
    id: clientId,
    response: res
  })

  req.on('close', () => {
    console.log(`${clientId} Connection closed`);
    clients = clients.filter(client => client.id !== clientId);
  })
})

app.post('/cue-list', async (req, res, next) => {
  const newInfo = req.body

  log.push(newInfo)

  res.json(newInfo)
  
  clients.forEach(client => client.response.write(`data: ${JSON.stringify(newInfo)}\n\n`))
  
  writeDatabase(newInfo)

  return next()
})

export default app
