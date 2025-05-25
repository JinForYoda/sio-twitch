import React, { useState, useCallback } from 'react';
import { useLanguage } from '@/components/ui/language/language-provider';
import { cn } from '@/lib/utils';
import ReactPlayer from 'react-player';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Media Player component using react-player library
 * This component provides a video player for streaming media (HLS, WebRTC, RTSP)
 */
interface PlayerProps {
  url: string;
  autoPlay?: boolean;
  className?: string;
}

const Player: React.FC<PlayerProps> = ({ url, className = '', autoPlay = true }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [key, setKey] = useState(0);
  const { t } = useLanguage();

  const handleReady = useCallback(() => {
    setLoading(false);
  }, []);

  const handleError = useCallback((e: Error) => {
    console.error('Player error:', e);
    setLoading(false);
    setError(e);
  }, []);

  const handleReload = useCallback(() => {
    setLoading(true);
    setError(null);
    setKey((prevKey) => prevKey + 1);
  }, []);

  return (
    <div
      className={cn(
        'rounded-md overflow-hidden bg-black relative',
        'border border-border',
        'min-h-[240px] w-full',
        className,
      )}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-primary-foreground z-10">
          <div className="flex flex-col items-center">
            <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <p className="mt-2">{t('loading') || 'Loading...'}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-10">
          <div className="text-red-500 mb-4">
            {t('playerError') || 'Failed to initialize player'}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReload}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {t('reload')}
          </Button>
        </div>
      )}

      <ReactPlayer
        key={key}
        url={url}
        playing={autoPlay}
        controls
        width="100%"
        height="100%"
        style={{ minHeight: '240px' }}
        onReady={handleReady}
        onError={handleError}
        config={{
          file: {
            forceHLS: true,
            attributes: {
              style: {
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              },
            },
          },
        }}
      />
    </div>
  );
};

export default Player;
