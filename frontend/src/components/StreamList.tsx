import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Stream } from '@shared/types/stream'
import StreamCard from './StreamCard'
import { useLanguage } from '@/components/ui/language/language-provider'

interface StreamListProps {
  streams: Stream[]
  onStartStream: (id: string) => Promise<void>
  onStopStream: (id: string) => Promise<void>
  onDeleteStream: (id: string) => Promise<void>
}

const StreamList: React.FC<StreamListProps> = ({
  streams,
  onStartStream,
  onStopStream,
  onDeleteStream
}) => {
  const { t } = useLanguage()
  return (
    <Card>
      <CardHeader className="bg-secondary">
        <div className="flex justify-between items-center">
          <CardTitle>{t('activeStreams')}</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
          >
            {t('refresh')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {streams.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{t('noActiveStreams')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {streams.map(stream => (
              <StreamCard
                key={stream.id}
                stream={stream}
                onStart={onStartStream}
                onStop={onStopStream}
                onDelete={onDeleteStream}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default StreamList
