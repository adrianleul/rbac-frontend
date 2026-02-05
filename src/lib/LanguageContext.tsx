import { createContext, useContext, useState, ReactNode } from 'react'

const languages = {
  en: 'English',
  am: 'Amharic',
}

type LanguageContextProps = {
  language: keyof typeof languages
  setLanguage: (lang: keyof typeof languages) => void
}

const LanguageContext = createContext<LanguageContextProps>({
  language: 'en',
  setLanguage: () => {},
})

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<keyof typeof languages>('en')
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
export const availableLanguages = languages