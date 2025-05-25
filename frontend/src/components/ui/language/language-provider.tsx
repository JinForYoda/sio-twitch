import React, { createContext, useContext, useEffect, useState } from 'react'
import { Language, translations } from './translations'

type LanguageProviderProps = {
  children: React.ReactNode
  defaultLanguage?: Language
  storageKey?: string
}

type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, params?: Record<string, string>) => string
}

const initialState: LanguageContextType = {
  language: 'ru',
  setLanguage: () => null,
  t: (key) => key,
}

const LanguageContext = createContext<LanguageContextType>(initialState)

export function LanguageProvider({
  children,
  defaultLanguage = 'ru',
  storageKey = 'app-language',
  ...props
}: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem(storageKey) as Language) || defaultLanguage
  )

  useEffect(() => {
    document.documentElement.setAttribute('lang', language)
  }, [language])

  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split('.')
    let value: any = translations[language]

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k as keyof typeof value]
      } else {
        return key // Return the key if translation not found
      }
    }

    if (typeof value !== 'string') {
      return key
    }

    // Replace parameters in the string if provided
    if (params) {
      return Object.entries(params).reduce<string>((acc, [paramKey, paramValue]) => {
        return acc.replace(`{${paramKey}}`, paramValue)
      }, value as string)
    }

    return value
  }

  const value = {
    language,
    setLanguage: (language: Language) => {
      localStorage.setItem(storageKey, language)
      setLanguage(language)
    },
    t,
  }

  return (
    <LanguageContext.Provider {...props} value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)

  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }

  return context
}
