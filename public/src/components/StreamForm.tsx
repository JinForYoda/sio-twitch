import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/components/ui/language/language-provider'

interface StreamFormProps {
  onCreateStream: (name: string, rtmpUrl: string) => Promise<boolean>
}

const StreamForm: React.FC<StreamFormProps> = ({ onCreateStream }) => {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [rtmpUrl, setRtmpUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      return
    }

    setIsSubmitting(true)

    try {
      const success = await onCreateStream(name, rtmpUrl)

      if (success) {
        setName('')
        setRtmpUrl('')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="bg-primary text-primary-foreground">
        <CardTitle>{t('createNewStream')}</CardTitle>
        <CardDescription className="text-primary-foreground/80">
          {t('fillFormToCreate')}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="streamName">{t('streamName')}</Label>
            <Input
              id="streamName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('streamNamePlaceholder')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rtmpUrl">{t('rtmpUrl')}</Label>
            <Input
              id="rtmpUrl"
              value={rtmpUrl}
              onChange={(e) => setRtmpUrl(e.target.value)}
              placeholder={t('rtmpUrlPlaceholder')}
            />
            <p className="text-sm text-muted-foreground">
              {t('rtmpUrlHint')}
            </p>
          </div>

          <Button type="submit" disabled={isSubmitting || !name.trim()}>
            {isSubmitting ? t('creating') : t('createStream')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default StreamForm
