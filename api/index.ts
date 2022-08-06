import express from 'express'
import cors from 'cors'
import Redis from 'ioredis'
import fs from 'fs'

const isLogging = process.env.SERVER_LOG
const redisConfig = process.env.REDIS_TLS_URL || process.env.REDIS_URL
const isRedisActive = !!redisConfig || !!process.env.REDIS_ACTIVE
const redis = isRedisActive && new Redis(process.env.REDIS_TLS_URL || process.env.REDIS_URL)
const jsonPath = './database.json'
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
  onSuccess = data => isLogging && console.log(data),
  onError = console.error,
}) => {
  if (isRedisActive) {
    redis.get('database', (err, result) => {
      if (err || !result) {
        onError(err)
        if (isLogging) console.log('reading DB Error: ', { err, result })
      } else {
        onSuccess(JSON.parse(result))
        if (isLogging) console.log('reading DB: ', JSON.parse(result))
      }
    })
  } else {

    fs.access(jsonPath, fs.constants.F_OK, (err) => {
      if (err) {
        onError(err)
        return
      }
  
      fs.readFile(jsonPath, 'utf8', (err, data) => {
        if (err) {
          if (isLogging) console.error(err)
          onError(err)
          return
        }
        onSuccess(JSON.parse(data))
      })
    })
  }
}

const writeDatabase = (data) => {
  if (isRedisActive) {
    redis.set("database",  JSON.stringify(data)/*, console.log*/)
  } else {
    fs.writeFile(jsonPath, JSON.stringify(data, null, 2), { flag: 'w+' }, console.error)
  }
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
