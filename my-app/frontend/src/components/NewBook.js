import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { ADD_NEW_BOOK, ALL_AUTHORS, ALL_GENRES } from '../queries'
import { updateGenreQueries } from '../App'

const NewBook = (props) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const [addNewBook] = useMutation(ADD_NEW_BOOK, {
    update: (cache, response) => {
      updateGenreQueries(cache, response.data.addBook)
    },
    refetchQueries: [{ query: ALL_AUTHORS }, { query: ALL_GENRES }],
    onError: (error) => {
      if (error.networkError) {
        window.alert(error.networkError.result.errors[0].message)
      } else if (error.graphQLErrors.length) {
        window.alert(error.graphQLErrors[0].message)
      }
    },
  })

  if (!props.show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    addNewBook({ variables: { title, published, author, genres } })

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(Number(target.value))}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook
