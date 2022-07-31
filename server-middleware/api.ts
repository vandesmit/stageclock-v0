import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/status', (req, res) => res.json({
  clients: clients.length
}))
app.get('/logs', (req, res) => res.json(log))

let clients = []
const welcomeMessage = { log: 'Welcome! Api is running and connected' }
let log = [
  welcomeMessage
]

function eventsHandler(req, res, next) {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };
  res.writeHead(200, headers);

  const data = `data: ${JSON.stringify(welcomeMessage)}\n\n`;

  res.write(data);

  const clientId = Date.now();

  const newClient = {
    id: clientId,
    response: res
  };

  clients.push(newClient);

  req.on('close', () => {
    console.log(`${clientId} Connection closed`);
    clients = clients.filter(client => client.id !== clientId);
  });
}

app.get('/sync', eventsHandler);

function sendEventsToAll(newInfo) {
  clients.forEach(client => client.response.write(`data: ${JSON.stringify(newInfo)}\n\n`))
}

async function handleCueList(req, res, next) {
  const newInfo = req.body
  log.push(newInfo)
  res.json(newInfo)
  return sendEventsToAll(newInfo)
  // TODO: save to local json
}

app.post('/cue-list', handleCueList)

export default app
