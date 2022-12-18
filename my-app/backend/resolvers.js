const { UserInputError, AuthenticationError } = require('apollo-server')
const { PubSub } = require('graphql-subscriptions')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('./utils/config')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')

const pubsub = new PubSub()

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const filters = {}

      if (args.author) {
        const author = await Author.findOne({ name: args.author })

        if (!author) {
          return []
        }

        filters.author = author._id
      }

      if (args.genre) {
        filters.genres = { $in: [args.genre] }
      }

      return Book.find(filters)
    },
    allAuthors: async () => Author.find({}),
    me: async (root, args, context) => {
      return context.currentUser
    },
  },
  Author: {
    bookCount: async (root) => {
      return root.books.length
    },
  },
  Book: {
    author: async ({ author }) => {
      return Author.findById(author)
    },
  },
  Mutation: {
    createUser: async (root, args) => {
      if (await User.findOne({ username: args.username })) {
        throw new UserInputError(`Username ${args.username} is in use`)
      }

      const user = new User({ ...args })

      try {
        await user.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      return user
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'salami') {
        throw new UserInputError('incorrect username/password')
      }

      return {
        value: jwt.sign({ username: user.username, id: user._id }, JWT_SECRET),
      }
    },
    addBook: async (root, args, context) => {
      if (!context.currentUser) {
        throw new AuthenticationError('No valid authentication token')
      }

      const book = new Book({ ...args })
      let author = await Author.findOne({ name: args.author })

      try {
        if (!author) {
          author = new Author({ name: args.author })
          await author.save()
        }

        book.author = author._id
        await book.save()

        author.books = [...author.books, book._id]
        await author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      pubsub.publish('BOOK_ADDED', { bookAdded: book })

      return book
    },
    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new AuthenticationError('No valid authentication token')
      }

      const author = await Author.findOne({ name: args.name })

      if (!author) {
        return null
      }

      try {
        author.born = args.setBornTo
        await author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      return author
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED']),
    },
  },
}

module.exports = resolvers
