import { useState, useEffect } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/components/ui/use-toast'
import { ThemeProvider } from '@/components/ui/theme/theme-provider'
import { LanguageProvider } from '@/components/ui/language/language-provider'
import { useLanguage } from '@/components/ui/language/language-provider'
import Header from '@/components/Header'
import StreamForm from '@/components/StreamForm'
import StreamList from '@/components/StreamList'
import HowToUse from '@/components/HowToUse'
import { Stream } from '@shared/types/stream'

function AppContent() {
  const { t } = useLanguage()
  const [streams, setStreams] = useState<Stream[]>([])
  const { toast } = useToast()

  const fetchStreams = async () => {
    try {
      const response = await fetch('/api/streams')
      if (!response.ok) {
        throw new Error('Failed to fetch streams')
      }
      const data = await response.json()
      setStreams(data)
    } catch (error) {
      console.error('Error fetching streams:', error)
      toast({
        title: t('error'),
        description: t('failedToLoadStreams'),
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    fetchStreams()

    const interval = setInterval(fetchStreams, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleCreateStream = async (name: string, rtmpUrl: string) => {
    try {
      const response = await fetch('/api/streams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          rtmpUrl: rtmpUrl || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create stream')
      }

      const newStream = await response.json()
      setStreams([...streams, newStream])

      toast({
        title: t('success'),
        description: t('streamCreatedSuccess', { name }),
      })

      return true
    } catch (error) {
      console.error('Error creating stream:', error)
      toast({
        title: t('error'),
        description: t('failedToCreateStream'),
        variant: 'destructive',
      })
      return false
    }
  }

  const handleStartStream = async (id: string) => {
    try {
      const response = await fetch(`/api/streams/${id}/start`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to start stream')
      }

      await fetchStreams()
      toast({
        title: t('success'),
        description: t('streamStartedSuccess'),
      })
    } catch (error) {
      console.error('Error starting stream:', error)
      toast({
        title: t('error'),
        description: t('failedToStartStream'),
        variant: 'destructive',
      })
    }
  }

  const handleStopStream = async (id: string) => {
    try {
      const response = await fetch(`/api/streams/${id}/stop`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to stop stream')
      }

      await fetchStreams()
      toast({
        title: t('success'),
        description: t('streamStoppedSuccess'),
      })
    } catch (error) {
      console.error('Error stopping stream:', error)
      toast({
        title: t('error'),
        description: t('failedToStopStream'),
        variant: 'destructive',
      })
    }
  }

  const handleDeleteStream = async (id: string) => {
    try {
      const response = await fetch(`/api/streams/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete stream')
      }

      setStreams(streams.filter(stream => stream.id !== id))
      toast({
        title: t('success'),
        description: t('streamDeletedSuccess'),
      })
    } catch (error) {
      console.error('Error deleting stream:', error)
      toast({
        title: t('error'),
        description: t('failedToDeleteStream'),
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-8">
        <StreamForm onCreateStream={handleCreateStream} />
        <StreamList 
          streams={streams} 
          onStartStream={handleStartStream}
          onStopStream={handleStopStream}
          onDeleteStream={handleDeleteStream}
        />
        <HowToUse />
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>{t('copyright')}</p>
      </footer>
      <Toaster />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <LanguageProvider defaultLanguage="ru">
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
