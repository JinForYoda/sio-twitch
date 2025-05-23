import React from 'react'
import { Button } from '@/components/ui/button'
import { useLanguage } from './language-provider'

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage('ru')}
        className={language === 'ru' ? 'font-bold' : ''}
        title={t('russian')}
      >
        RU
      </Button>
      <span className="text-muted-foreground">/</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage('kk')}
        className={language === 'kk' ? 'font-bold' : ''}
        title={t('kazakh')}
      >
        KK
      </Button>
    </div>
  )
}