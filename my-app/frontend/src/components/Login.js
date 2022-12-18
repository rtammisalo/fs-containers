import { useEffect, useState } from 'react'
import { useMutation } from '@apollo/client'
import { SERVER_LOGIN } from '../queries'

const Login = (props) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [login, result] = useMutation(SERVER_LOGIN, {
    onError: (error) => window.alert(error.message),
  })

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value

      props.updateToken(token)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.data])

  if (!props.show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    login({ variables: { username, password } })

    setUsername('')
    setPassword('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          username
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password
          <input
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <div>
          <button>login</button>
        </div>
      </form>
    </div>
  )
}

export default Login
