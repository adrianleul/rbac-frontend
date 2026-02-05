import React, { createContext, useContext, useState } from "react";

interface LanguageContextType {
  language: string;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const translations: Record<"en" | "am", Record<string, string>> = {
  en: {
    // Navbar
    home: "Home",
    about: "About",
    contact: "Contact",
  },
  am: {
    // Navbar
    home: "መግቢያ",
    about: "ስለ እኛ",
    contact: "አግኙን",
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<"en" | "am">("en");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "am" : "en"));
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
