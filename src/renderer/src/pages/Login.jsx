import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState } from 'react'

const Login = () => {
  // PRE-FILL FOR DEV PURPOSES
  const [email, setEmail] = useState('jack@example.com')
  const [password, setPassword] = useState('qwerty')

  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()

    if (email && password) login(email, password)
  }

  useEffect(() => {
    if (isAuthenticated) navigate('/app', { replace: true })
  }, [isAuthenticated, navigate])

  return (
    <main>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email address</label>
          <input type="email" id="email" onChange={(e) => setEmail(e.target.value)} value={email} />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </div>

        <div>
          <button type="primary">Login</button>
        </div>
      </form>
    </main>
  )
}

export default Login
