import { useQuery, useLazyQuery } from '@apollo/client'
import { useEffect } from 'react'
import { ME, ALL_GENRE_BOOKS } from '../queries'
import BooksTable from './BooksTable'

const Recommend = (props) => {
  const userData = useQuery(ME, { skip: !props.show })
  const [getGenreBooks, result] = useLazyQuery(ALL_GENRE_BOOKS)
  const favoriteGenre =
    userData.data && userData.data.me ? userData.data.me.favoriteGenre : ''

  useEffect(() => {
    if (userData.called && !userData.loading) {
      getGenreBooks({ variables: { genre: favoriteGenre } })
    }
  }, [userData, getGenreBooks, favoriteGenre])

  if (!props.show || !result.called || result.loading) {
    return null
  }

  return (
    <div>
      <h2>recommendations</h2>
      <div>
        books in your favorite genre <b>{favoriteGenre}</b>
      </div>
      <BooksTable books={result.data.allBooks} />
    </div>
  )
}

export default Recommend
