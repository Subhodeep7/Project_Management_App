import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as SecureStore from 'expo-secure-store'
import { authApi } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tokenExpired, setTokenExpired] = useState(false)

  useEffect(() => {
    const restore = async () => {
      try {
        const token = await SecureStore.getItemAsync('auth_token')
        const userStr = await SecureStore.getItemAsync('auth_user')
        if (token && userStr) {
          setUser(JSON.parse(userStr))
        }
      } catch {
        // corrupt storage, clear it
        await SecureStore.deleteItemAsync('auth_token')
        await SecureStore.deleteItemAsync('auth_user')
      } finally {
        setLoading(false)
      }
    }
    restore()
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password })
    const { token, ...userData } = res.data.data
    await SecureStore.setItemAsync('auth_token', token)
    await SecureStore.setItemAsync('auth_user', JSON.stringify(userData))
    setTokenExpired(false)
    setUser(userData)
    return userData
  }, [])

  const register = useCallback(async (fullName, email, password) => {
    const res = await authApi.register({ fullName, email, password })
    const { token, ...userData } = res.data.data
    await SecureStore.setItemAsync('auth_token', token)
    await SecureStore.setItemAsync('auth_user', JSON.stringify(userData))
    setTokenExpired(false)
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(async () => {
    try { await authApi.logout() } catch {}
    await SecureStore.deleteItemAsync('auth_token')
    await SecureStore.deleteItemAsync('auth_user')
    setUser(null)
    setTokenExpired(false)
  }, [])

  const handleTokenExpired = useCallback(async () => {
    await SecureStore.deleteItemAsync('auth_token')
    await SecureStore.deleteItemAsync('auth_user')
    setUser(null)
    setTokenExpired(true)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, tokenExpired, login, register, logout, handleTokenExpired }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
