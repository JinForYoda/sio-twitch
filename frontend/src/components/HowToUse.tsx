import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/components/ui/language/language-provider'

const HowToUse: React.FC = () => {
  const { t } = useLanguage()
  return (
    <Card>
      <CardHeader className="bg-blue-500 text-white">
        <CardTitle>{t('howToUse')}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">{t('step1Title')}</h3>
          <p className="text-muted-foreground">
            {t('step1Description')}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">{t('step2Title')}</h3>
          <p className="text-muted-foreground">
            {t('step2Description')}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">{t('step3Title')}</h3>
          <p className="text-muted-foreground">
            {t('step3Description')}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">{t('vlcExample')}</h3>
          <div className="bg-muted p-3 rounded font-mono text-sm">
            vlc rtsp://localhost:8554/live/your-stream-key
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">{t('ffplayExample')}</h3>
          <div className="bg-muted p-3 rounded font-mono text-sm">
            ffplay rtsp://localhost:8554/live/your-stream-key
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default HowToUse
