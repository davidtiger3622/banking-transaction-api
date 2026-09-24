import { useState } from 'react'
import { loginUser, registerUser } from '../api/client'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))

  async function login(email, password) {
    const data = await loginUser(email, password)
    localStorage.setItem('token', data.access_token)
    setToken(data.access_token)
  }

  async function register(email, password) {
    await registerUser(email, password)
    await login(email, password)
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
  }

  const value = { token, isAuthenticated: Boolean(token), login, register, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
