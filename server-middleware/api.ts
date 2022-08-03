import express from 'express'
import cors from 'cors'
import fs from 'fs'

const jsonPath = './database.json'
const welcomeMessage = { log: 'Welcome! Api is running and connected' }
const log = [ welcomeMessage ]
const app = express()

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

  fs.access(jsonPath, fs.constants.F_OK, (err) => {
    if (err) {
      // Don't use json file if not present or other errors
      return
    }

    fs.readFile(jsonPath, 'utf8', (err, dataString) => {
      if (err) {
        console.error(err);
        return;
      }
      res.write(`data: ${dataString}\n\n`)
    })
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
  const newInfoString = JSON.stringify(newInfo)

  log.push(newInfo)

  res.json(newInfo)
  
  clients.forEach(client => client.response.write(`data: ${newInfoString}\n\n`))
  
  fs.writeFile(jsonPath, newInfoString, { flag: 'w+' }, err => {
    if (err) {
      console.error(err)
    }
  })

  return next()
})

export default app
