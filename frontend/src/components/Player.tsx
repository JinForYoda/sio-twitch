import React, { useState } from 'react';
import { useLanguage } from '@/components/ui/language/language-provider';
import { cn } from '@/lib/utils';
import ReactPlayer from 'react-player';

interface PlayerProps {
  url: string;
  autoPlay?: boolean;
  className?: string;
}

const Player: React.FC<PlayerProps> = ({ url, autoPlay = true, className = '' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleReady = () => {
    setIsLoading(false);
  };

  const handleError = (e: any) => {
    console.error('Player error:', e);
    setError(t('playerError') || 'Failed to initialize player');
    setIsLoading(false);
  };

  return (
    <div
      className={cn(
        'rounded-md overflow-hidden bg-black relative',
        'border border-border',
        'min-h-[240px] w-full',
        className,
      )}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-primary-foreground z-10">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2">{t('loading') || 'Loading...'}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-destructive z-10">
          <p>{error}</p>
        </div>
      )}

      <ReactPlayer
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
