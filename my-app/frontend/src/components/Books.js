import { useLazyQuery, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { ALL_GENRES, ALL_GENRE_BOOKS } from '../queries'
import BooksTable from './BooksTable'

const Books = (props) => {
  const [genre, setGenre] = useState('')
  const allGenres = useQuery(ALL_GENRES, { skip: !props.show })
  const [getGenreBooks, result] = useLazyQuery(ALL_GENRE_BOOKS)

  useEffect(() => {
    getGenreBooks({ variables: { genre } })
  }, [genre, getGenreBooks])

  if (!props.show || result.loading || allGenres.loading) {
    return null
  }

  const allBookGenres = new Set(
    allGenres.data.allBooks.map((b) => b.genres).flat()
  )

  return (
    <div>
      <h2>books</h2>
      {genre && (
        <div>
          in genre <b>{genre}</b>
        </div>
      )}
      <BooksTable books={result.data.allBooks}/>
      <div>
        {[...allBookGenres.values()].map((genre) => (
          <button key={genre} onClick={() => setGenre(genre)}>
            {genre}
          </button>
        ))}
        <button onClick={() => setGenre('')}>all genres</button>
      </div>
    </div>
  )
}

export default Books
