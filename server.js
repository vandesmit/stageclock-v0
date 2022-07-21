const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
// import express from 'express'
// import bodyParser from 'body-parser'
// import cors from 'cors'

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/api/status', (request, response) => response.json({
  clients: clients.length
}))
app.get('/api/logs', (request, response) => response.json(log))

const PORT = 3005;

let clients = [];
const welcomeMessage = { message: 'Connected' }
let log = [
  welcomeMessage,
]

app.listen(PORT, () => {
  console.log(`Clock Events service listening at http://localhost:${PORT}`)
})

function eventsHandler(request, response, next) {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };
  response.writeHead(200, headers);

  const data = `data: ${JSON.stringify(welcomeMessage)}\n\n`;
  // const data = `data: ${JSON.stringify(facts)}\n\n`;

  response.write(data);

  const clientId = Date.now();

  const newClient = {
    id: clientId,
    response
  };

  clients.push(newClient);

  request.on('close', () => {
    console.log(`${clientId} Connection closed`);
    clients = clients.filter(client => client.id !== clientId);
  });
}

app.get('/api/messages', eventsHandler);

function sendEventsToAll(newInfo) {
  clients.forEach(client => client.response.write(`data: ${JSON.stringify(newInfo)}\n\n`))
}

async function addInfo(request, respsonse, next) {
  const newInfo = request.body;
  log.push(newInfo);
  respsonse.json(newInfo)
  return sendEventsToAll(newInfo);
}

app.post('/api/message', addInfo);

