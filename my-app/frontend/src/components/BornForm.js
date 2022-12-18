import { useEffect, useState } from 'react'
import { useMutation } from '@apollo/client'
import { ALL_AUTHORS, SET_BIRTH_YEAR } from '../queries'

const BornForm = (props) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')
  const [setBirthYear] = useMutation(SET_BIRTH_YEAR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    onError: (error) => {
      if (error.networkError) {
        window.alert(error.networkError.result.errors[0].message)
      }
    },
  })

  useEffect(() => {
    if (!name && props.authors.length) {
      setName(props.authors[0].name)
    }
  }, [name, setName, props.authors])

  const submit = async (event) => {
    event.preventDefault()

    setBirthYear({ variables: { name, born } })

    setBorn('')
  }

  return (
    <div>
      <h2>Set birthyear</h2>
      <form onSubmit={submit}>
        <div>
          <select value={name} onChange={({ target }) => setName(target.value)}>
            {props.authors.map((a) => (
              <option key={a.name} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          born
          <input
            type="number"
            value={born}
            onChange={({ target }) => setBorn(Number(target.value))}
          />
        </div>
        <div>
          <button>update author</button>
        </div>
      </form>
    </div>
  )
}

export default BornForm
