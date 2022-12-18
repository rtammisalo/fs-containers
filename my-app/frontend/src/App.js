import { useEffect, useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'
import { useApolloClient, useSubscription } from '@apollo/client'
import Recommend from './components/Recommend'
import { BOOK_ADDED, ALL_GENRE_BOOKS, ALL_AUTHORS } from './queries'

const updateQuery = (cache, query, variables, update) => {
  cache.updateQuery(
    {
      query,
      variables: { ...variables },
    },
    (data) => {
      if (!data) {
        // Does not exist in cache yet
        return
      }

      return update(data)
    }
  )
}

const uniqueById = (items) => {
  const unique = new Map(
    items.map((item) => item.id).map((id, i) => [id, items[i]])
  )
  return [...unique.values()]
}

export const updateGenreQueries = (cache, book) => {
  const update = (data) => {
    return {
      allBooks: uniqueById([...data.allBooks, book]),
    }
  }

  updateQuery(cache, ALL_GENRE_BOOKS, { genre: '' }, update)

  const bookGenres = new Set(book.genres)

  for (let bookGenre of bookGenres.values()) {
    updateQuery(cache, ALL_GENRE_BOOKS, { genre: bookGenre }, update)
  }
}

const updateAuthorQuery = (cache, author) => {
  const update = (data) => {
    return {
      allAuthors: uniqueById([...data.allAuthors, author]),
    }
  }

  updateQuery(cache, ALL_AUTHORS, {}, update)
}

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  const updateToken = (token) => {
    setToken(token)
    localStorage.setItem('userToken', token)
    setPage('authors')
  }

  const logout = () => {
    updateToken(null)
    localStorage.clear()
    client.resetStore()
  }

  useEffect(() => {
    const token = localStorage.getItem('userToken')

    if (token) {
      setToken(token)
    }
  }, [])

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData, client }) => {
      const addedBook = subscriptionData.data.bookAdded

      updateAuthorQuery(client.cache, addedBook.author)
      updateGenreQueries(client.cache, addedBook)

      window.alert(`Added book ${addedBook.title} by ${addedBook.author.name}`)
    },
  })

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token && <button onClick={() => setPage('add')}>add book</button>}
        {token && (
          <button onClick={() => setPage('recommend')}>recommend</button>
        )}
        {token && <button onClick={logout}>logout</button>}
        {!token && <button onClick={() => setPage('login')}>login</button>}
      </div>

      <Authors show={page === 'authors'} token={token} />

      <Books show={page === 'books'} />

      <NewBook show={page === 'add'} />

      <Login show={page === 'login'} updateToken={updateToken} />

      <Recommend show={page === 'recommend'} />
    </div>
  )
}

export default App
