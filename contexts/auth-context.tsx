"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { gql, useQuery } from "@apollo/client"

const GET_USER = gql`
  query GetUser {
    user {
      id
      firstName
      lastName
      email
    }
  }
`

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const { data, loading: queryLoading } = useQuery(GET_USER, {
    skip: !token,
    onCompleted: (data) => {
      if (data?.user) {
        setUser(data.user)
      }
    },
    onError: () => {
      logout()
    },
  })

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
    }
    setLoading(false)
  }, [])

  const login = (newToken: string, userData: User) => {
    localStorage.setItem("token", newToken)
    setToken(newToken)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        loading: loading || queryLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
