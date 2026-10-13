import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Camera, Loader2, MapPin, RotateCcw } from 'lucide-react';

export interface PhotoCapture {
  dataUrl: string;
  latitude: number;
  longitude: number;
  capturedAt: string;
}

interface Props {
  value: PhotoCapture | null;
  onChange: (capture: PhotoCapture | null) => void;
  variant?: 'light' | 'dark';
}

export const PhotoEvidenceCapture: React.FC<Props> = ({
  value,
  onChange,
  variant = 'light',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const isDark = variant === 'dark';

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.srcObject = cameraStream;
    if (video && cameraStream) {
      void video.play().catch(() => {
        setCameraError('Unable to start the camera preview. Please check camera permissions.');
      });
    }
    return () => {
      if (video) video.srcObject = null;
    };
  }, [cameraStream]);

  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    []
  );

  const startCamera = async () => {
    setCameraError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Live camera capture requires a supported browser on HTTPS or localhost.');
      return;
    }

    setIsStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' } },
      });
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = stream;
      setCameraStream(stream);
      setIsStarting(false);
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError('Camera access was denied or unavailable. Allow camera access and try again.');
      setIsStarting(false);
    }
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setCameraError('The camera is not ready yet. Please wait for the preview and try again.');
      return;
    }

    setCameraError('');
    setIsCapturing(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Location is not supported by this browser.'));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 15000,
        });
      });

      const capturedAt = new Date().toISOString();
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const scale = Math.min(1, 1280 / video.videoWidth);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not prepare the captured photo.');

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const bannerHeight = Math.max(62, Math.round(canvas.width * 0.075));
      context.fillStyle = 'rgba(15, 23, 42, 0.78)';
      context.fillRect(0, canvas.height - bannerHeight, canvas.width, bannerHeight);
      context.fillStyle = '#ffffff';
      context.font = `600 ${Math.max(14, Math.round(canvas.width * 0.022))}px sans-serif`;
      context.textBaseline = 'top';
      context.fillText(
        `GPS ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        16,
        canvas.height - bannerHeight + 8
      );
      context.font = `${Math.max(11, Math.round(canvas.width * 0.016))}px sans-serif`;
      context.fillText(
        `Captured ${new Date(capturedAt).toLocaleString()}`,
        16,
        canvas.height - bannerHeight + Math.max(32, Math.round(canvas.width * 0.04))
      );

      onChange({ dataUrl: canvas.toDataURL('image/jpeg', 0.78), latitude, longitude, capturedAt });
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setCameraStream(null);
    } catch (error) {
      console.error('Photo geotagging error:', error);
      setCameraError(
        error instanceof GeolocationPositionError
          ? 'Location permission is required to geotag this photo. Enable location access and try again.'
          : error instanceof Error
            ? error.message
            : 'Could not capture a photo with its location.'
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const textClass = isDark ? 'text-slate-300' : 'text-gray-700';
  const panelClass = isDark
    ? 'border-slate-700 bg-slate-900/60'
    : 'border-gray-200 bg-gray-50';
  const buttonClass = isDark
    ? 'border-slate-600 bg-slate-800 text-white hover:bg-slate-700'
    : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-100';

  return (
    <div className="space-y-2">
      <div className={`flex items-center gap-1.5 text-xs font-semibold ${textClass}`}>
        <Camera className="h-4 w-4 text-indigo-500" />
        <span>Live complaint photo <span className="text-red-500">*</span></span>
      </div>
      <div className={`rounded-lg border p-3 ${panelClass}`}>
        {value ? (
          <div className="space-y-2">
            <img
              src={value.dataUrl}
              alt="Captured complaint evidence with GPS geotag"
              className="max-h-64 w-full rounded-md border border-gray-300 object-contain"
            />
            <p className={`flex items-center gap-1.5 text-[11px] ${textClass}`}>
              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
              GPS tag: {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
            </p>
            <button
              type="button"
              onClick={() => onChange(null)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-semibold ${buttonClass}`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Retake photo
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`max-h-64 w-full rounded-md bg-black object-contain ${cameraStream ? '' : 'hidden'}`}
            />
            <p className={`text-[11px] ${textClass}`}>
              Capture a new photo with your camera. GPS permission is required; its coordinates and capture time will be stamped on the image.
            </p>
            <div className="flex flex-wrap gap-2">
              {!cameraStream ? (
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={isStarting || isCapturing}
                  className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isStarting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                  Start camera
                </button>
              ) : (
                <button
                  type="button"
                  onClick={capturePhoto}
                  disabled={isCapturing}
                  className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isCapturing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                  {isCapturing ? 'Getting GPS and capturing...' : 'Capture geotagged photo'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      {cameraError && (
        <p role="alert" className="flex items-start gap-1.5 text-[11px] text-red-600">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {cameraError}
        </p>
      )}
    </div>
  );
};
