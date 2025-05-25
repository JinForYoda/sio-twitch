import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const HowToUse: React.FC = () => {
  return (
    <Card>
      <CardHeader className="bg-blue-500 text-white">
        <CardTitle>Как использовать</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">1. Создайте новый поток</h3>
          <p className="text-muted-foreground">
            Заполните форму выше, указав название потока и опционально RTMP URL источника.
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">2. Отправьте RTMP-поток</h3>
          <p className="text-muted-foreground">
            Используйте OBS Studio или другое программное обеспечение для отправки RTMP-потока на указанный URL.
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">3. Получите доступ к RTSP-потоку</h3>
          <p className="text-muted-foreground">
            Используйте VLC или другой RTSP-совместимый плеер для просмотра конвертированного потока.
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Пример команды для просмотра через VLC:</h3>
          <div className="bg-muted p-3 rounded font-mono text-sm">
            vlc rtsp://localhost:8554/live/your-stream-key
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Пример команды для просмотра через FFplay:</h3>
          <div className="bg-muted p-3 rounded font-mono text-sm">
            ffplay rtsp://localhost:8554/live/your-stream-key
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default HowToUse