import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/components/ui/language/language-provider';
import { cn } from '@/lib/utils';
import ReactPlayer from 'react-player';

/**
 * RTSP Player component using react-player library
 * This component provides a video player for RTSP streams
 * Note: Web browsers have limited support for RTSP streams
 */
interface RtspPlayerProps {
  rtspUrl: string;
  autoPlay?: boolean;
  className?: string;
}

const RtspPlayer: React.FC<RtspPlayerProps> = ({ rtspUrl, autoPlay = true, className = '' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fallbackMode, setFallbackMode] = useState(false);
  const { t } = useLanguage();

  // We're disabling the fallback mode to force the player to attempt to play the RTSP stream directly
  useEffect(() => {
    // Set a longer timeout for RTSP initialization
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn('RTSP player initialization is taking longer than expected');
        // We're not switching to fallback mode anymore
        // setFallbackMode(true);
        // setIsLoading(false);
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timeoutId);
  }, [rtspUrl, isLoading]);

  // Handler for when the player is ready
  const handleReady = () => {
    setIsLoading(false);
    setFallbackMode(false);
  };

  // Handler for player errors
  const handleError = (e: any) => {
    console.error('Player error:', e);

    // We're not switching to fallback mode anymore, even for RTSP errors
    // Instead, we'll show a generic error message
    setError(t('playerError') || 'Failed to initialize player');

    // Still set loading to false to remove the loading indicator
    setIsLoading(false);

    // Try to reinitialize the player after a short delay
    setTimeout(() => {
      setError(null);
      setIsLoading(true);
    }, 3000);
  };

  // Function to copy RTSP URL to clipboard
  const copyRtspUrl = () => {
    navigator.clipboard.writeText(rtspUrl)
      .then(() => {
        alert(t('copied') || 'RTSP URL copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        alert(t('failedToCopy') || 'Failed to copy URL');
      });
  };

  // Function to open RTSP URL in external player
  const openInExternalPlayer = () => {
    // Try multiple player protocols to increase compatibility
    // First try the direct RTSP URL (some systems may have a default handler)
    let opened = false;

    try {
      // Try direct RTSP URL first
      const directWindow = window.open(rtspUrl, '_blank');

      // If window was blocked or couldn't be opened
      if (!directWindow || directWindow.closed || typeof directWindow.closed === 'undefined') {
        // Try VLC protocol
        const vlcUrl = `vlc://${rtspUrl}`;
        const vlcWindow = window.open(vlcUrl, '_blank');

        if (!vlcWindow || vlcWindow.closed || typeof vlcWindow.closed === 'undefined') {
          // Try MPlayer protocol
          const mplayerUrl = `mplayer://${rtspUrl}`;
          const mplayerWindow = window.open(mplayerUrl, '_blank');

          if (!mplayerWindow || mplayerWindow.closed || typeof mplayerWindow.closed === 'undefined') {
            // If all attempts fail, show a message
            opened = false;
          } else {
            opened = true;
          }
        } else {
          opened = true;
        }
      } else {
        opened = true;
      }
    } catch (e) {
      console.error('Error opening external player:', e);
      opened = false;
    }

    // If none of the attempts worked, show a message with instructions
    if (!opened) {
      alert(t('externalPlayerNotFound') || 'Failed to open external player. Please install VLC or another player that supports RTSP.');
    }
  };

  return (
    <div className={cn(
      "rounded-md overflow-hidden bg-black relative", 
      "border border-border",
      "min-h-[240px] w-full",
      className
    )}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-primary-foreground z-10">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2">{t('loading') || 'Loading...'}</p>
          </div>
        </div>
      )}

      {error && !fallbackMode && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-destructive z-10">
          <p>{error}</p>
        </div>
      )}

      {fallbackMode ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-primary-foreground p-4 z-10">
          <p className="text-center mb-2">{t('rtspNotSupported') || 'RTSP streams are not directly supported in browsers.'}</p>
          <p className="text-center text-sm mb-4">{t('useExternalPlayer') || 'Please use an external player like VLC to view this stream.'}</p>
          <div className="bg-muted p-2 text-xs rounded mb-3 max-w-full overflow-x-auto">
            {rtspUrl}
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyRtspUrl}
              className="px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-sm"
              title={t('urlCopied', { label: 'RTSP URL' }) || 'Copy RTSP URL to clipboard'}
            >
              {t('copy') || 'Copy URL'}
            </button>
            <button
              onClick={openInExternalPlayer}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              title={t('useExternalPlayer') || 'Please use an external player like VLC to view this stream.'}
            >
              {t('openInExternalPlayer') || 'Open in external player'}
            </button>
          </div>
        </div>
      ) : (
        <ReactPlayer
          url={rtspUrl}
          playing={autoPlay}
          controls
          width="100%"
          height="100%"
          style={{ minHeight: '240px' }}
          onReady={handleReady}
          onError={handleError}
          config={{
            file: {
              forceVideo: true,
              forceHLS: false,
              forceAudio: false,
              attributes: {
                style: {
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }
              },
              hlsOptions: {}
            }
          }}
        />
      )}
    </div>
  );
};

export default RtspPlayer;
