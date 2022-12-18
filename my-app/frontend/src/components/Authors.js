import { useQuery } from '@apollo/client'
import { ALL_AUTHORS } from '../queries'
import BornForm from './BornForm'

const Authors = (props) => {
  const allAuthorsData = useQuery(ALL_AUTHORS, { skip: !props.show })

  if (!props.show || allAuthorsData.loading) {
    return null
  }

  const authors = allAuthorsData.data.allAuthors

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {props.token && <BornForm authors={authors} />}
    </div>
  )
}

export default Authors
