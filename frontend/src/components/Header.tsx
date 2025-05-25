import React from 'react'
import { ThemeToggle } from '@/components/ui/theme/theme-toggle'
import { LanguageSwitcher } from '@/components/ui/language/language-switcher'
import { useLanguage } from '@/components/ui/language/language-provider'

const Header: React.FC = () => {
  const { t } = useLanguage()

  return (
    <div className="bg-primary text-primary-foreground py-12 relative">
      <div className="absolute top-4 right-4 flex items-center space-x-4">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <div className="container text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">{t('appTitle')}</h1>
        <p className="text-xl opacity-90">{t('appDescription')}</p>
      </div>
    </div>
  )
}

export default Header
