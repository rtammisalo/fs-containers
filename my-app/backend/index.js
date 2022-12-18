const { ApolloServer, AuthenticationError } = require('apollo-server-express')
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core')
const { SubscriptionServer } = require('subscriptions-transport-ws')
const { execute, subscribe } = require('graphql')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const express = require('express')
const http = require('http')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const { MONGODB_URI, JWT_SECRET } = require('./utils/config')
const User = require('./models/user')
const typeDefs = require('./schema')
const resolvers = require('./resolvers')

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('connection to DB successful')
  })
  .catch((error) => {
    console.error('error connecting to DB:', error.message)
  })

const startServer = async () => {
  const app = express()
  const httpServer = http.createServer(app)
  const schema = makeExecutableSchema({ typeDefs, resolvers })

  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
    },
    {
      server: httpServer,
      path: '',
    }
  )

  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      const auth = req ? req.headers.authorization : null
      let currentUser = null

      if (auth && auth.toLowerCase().startsWith('bearer ')) {
        const token = auth.substring(7) // 'bearer ' = 7 letters

        try {
          const decodedToken = jwt.verify(token, JWT_SECRET)
          currentUser = await User.findById(decodedToken.id)
        } catch (error) {
          throw new AuthenticationError(
            `Authorization failed with token: ${token}`
          )
        }
      }

      return { currentUser }
    },
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close()
            },
          }
        },
      },
    ],
  })

  await server.start()

  server.applyMiddleware({
    app,
    path: '/',
  })

  httpServer.listen(4000, () =>
    console.log('Server ready at http://localhost:4000')
  )
}

startServer()
