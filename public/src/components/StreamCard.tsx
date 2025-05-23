import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Stream, StreamStatus } from '@/types/stream'
import { useToast } from '@/components/ui/use-toast'
import { useLanguage } from '@/components/ui/language/language-provider'

interface StreamCardProps {
  stream: Stream
  onStart: (id: string) => Promise<void>
  onStop: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const StreamCard: React.FC<StreamCardProps> = ({
  stream,
  onStart,
  onStop,
  onDelete
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { t } = useLanguage()

  const handleStart = async () => {
    setIsLoading(true)
    try {
      await onStart(stream.id)
    } catch (error) {
      console.error('Error starting stream:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStop = async () => {
    setIsLoading(true)
    try {
      await onStop(stream.id)
    } catch (error) {
      console.error('Error stopping stream:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(t('deleteConfirm'))) {
      return
    }

    setIsLoading(true)
    try {
      await onDelete(stream.id)
    } catch (error) {
      console.error('Error deleting stream:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: 'Скопировано!',
          description: `${label} скопирован в буфер обмена`,
        })
      })
      .catch(err => {
        console.error('Failed to copy:', err)
        toast({
          title: 'Ошибка',
          description: 'Не удалось скопировать URL',
          variant: 'destructive',
        })
      })
  }

  const getStatusBadgeClass = () => {
    switch (stream.status) {
      case StreamStatus.RUNNING:
        return 'bg-green-500 text-white'
      case StreamStatus.ERROR:
        return 'bg-red-500 text-white'
      case StreamStatus.STOPPED:
        return 'bg-yellow-500 text-black'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getStatusText = () => {
    switch (stream.status) {
      case StreamStatus.RUNNING:
        return 'Работает'
      case StreamStatus.ERROR:
        return 'Ошибка'
      case StreamStatus.STOPPED:
        return 'Остановлен'
      default:
        return 'Ожидание'
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{stream.name}</CardTitle>
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass()}`}>
            {getStatusText()}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Создан: {new Date(stream.createdAt).toLocaleString()}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium mb-1">RTMP URL:</p>
          <div className="flex items-center">
            <div className="bg-muted p-2 text-xs rounded flex-1 overflow-x-auto whitespace-nowrap">
              {stream.rtmpUrl}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-2"
              onClick={() => copyToClipboard(stream.rtmpUrl, 'RTMP URL')}
            >
              Копировать
            </Button>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-1">RTSP URL:</p>
          <div className="flex items-center">
            <div className="bg-muted p-2 text-xs rounded flex-1 overflow-x-auto whitespace-nowrap">
              {stream.rtspUrl}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-2"
              onClick={() => copyToClipboard(stream.rtspUrl, 'RTSP URL')}
            >
              Копировать
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="space-x-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleStart}
            disabled={isLoading || stream.status === StreamStatus.RUNNING}
          >
            Запустить
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleStop}
            disabled={isLoading || stream.status !== StreamStatus.RUNNING}
          >
            Остановить
          </Button>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isLoading}
        >
          Удалить
        </Button>
      </CardFooter>
    </Card>
  )
}

export default StreamCard
