# Stage Clock

Built with Nuxt, TailwindCSS and Node

## Setup

Make sure to install the dependencies:

```bash
yarn install
```

## Development Server

Start the development server on http://localhost:3000

```bash
yarn dev
```

## Build production Server

Build production folder

```bash
yarn build
```

Run production folder

```bash
yarn Start
```

Listen on http://localhost:3002 OR http://localhost:3000

## Features

### JSON-file database (default)

Data will be stored in a local JSON-file (`./database.json`) when no Redis server is configured.

### Redis database (optional)

Data will be stored on a redis server when using the environments variables `REDIS_URL` or `REDIS_ACTIVE`.

### Other Features

* sync cues and clock over different windows/computers with a PubSub mechanism
* back-up database for when user reloads a page
* Create a list of cues
* Auto-continue, count negative or stop when finishing the cues
* Install website on home screen (A2HS) for full screen, app-like experience

### Features wishlist

* re-order list of cues
* password protect website for access with input or query string in uri
