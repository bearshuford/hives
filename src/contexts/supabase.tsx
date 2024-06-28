import type { SupabaseClient, User } from '@supabase/supabase-js'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Database } from '../db'
import { useLocalStorage } from 'usehooks-ts'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_KEY as string

export type DbRow<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type DbView<T extends keyof Database['public']['Views']> = Database['public']['Views'][T]['Row']

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 3,
    }
  }
})

interface AuthContext {
  isLoading: boolean
  user: User | null
  client: SupabaseClient<Database>
  username: string,
  setUsername: (username: string) => void
}

const authContext = createContext<AuthContext>({
  isLoading: true,
  user: null,
  client: supabase,
  username: '',
  setUsername: () => { }
})

export const SupabaseProvider = ({ children }: {
  children: React.ReactNode
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useLocalStorage('username', `Some Bee ${Math.ceil(Math.random() * 9)}`)

  async function createAnonymousUser() {
    setIsLoading(true)
    const email = Math.random().toString(36).substring(2, 8) + '.supabase@bear.direct'
    console.log(createAnonymousUser)
    const { data, error } = await supabase.auth.signUp({
      email,
      password: email
    })
    if (error) {
      console.error('Error creating anonymous user:', error)
      throw error
    }
    if (data.session?.user) setUser(data.session?.user)
    setIsLoading(false)
  }

  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') {
        if (!session?.user) {
          createAnonymousUser()
        }
        else {
          setUser(session?.user)
        }
      }
      if (event === 'SIGNED_OUT') setUser(null)
    })
    return () => { sub.data.subscription.unsubscribe() }
  }, [])

  return (
    <authContext.Provider
      value={{
        user,
        isLoading,
        client: supabase,
        username,
        setUsername
      }}
    >
      {children}
    </authContext.Provider>
  )
}

export const useSupabase = () => useContext(authContext)