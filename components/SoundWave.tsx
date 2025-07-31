import React, { useRef, useEffect } from 'react';

interface SoundWaveProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
}

const SoundWave: React.FC<SoundWaveProps> = ({ analyser, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Stop any previous animation frame
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    
    const barWidth = 4;
    const spacing = 2;
    const numBars = Math.floor(canvas.width / (barWidth + spacing));
    const halfNumBars = Math.floor(numBars / 2);
    const centerX = canvas.width / 2;

    if (!analyser || !isPlaying) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Draw a centered, flat line when paused
      ctx.fillStyle = 'rgba(103, 232, 249, 0.5)';
      const barHeight = 2;
      const y = (canvas.height - barHeight) / 2;

      for (let i = 0; i < halfNumBars; i++) {
        const xRight = centerX + i * (barWidth + spacing);
        const xLeft = centerX - (i + 1) * (barWidth + spacing);
        ctx.fillRect(xRight, y, barWidth, barHeight);
        ctx.fillRect(xLeft, y, barWidth, barHeight);
      }
      return;
    }

    analyser.fftSize = 128;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameId.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(103, 232, 249, 0.9)';

      // Draw mirrored bars from the center outwards
      for (let i = 0; i < halfNumBars; i++) {
        // Sample from low frequencies for the center bars, moving to higher frequencies for the outer bars
        const dataIndex = Math.floor(i * (bufferLength / halfNumBars));
        const barValue = dataArray[dataIndex];
        const barHeight = Math.max(2, Math.pow(barValue / 255, 2.2) * canvas.height);

        const y = (canvas.height - barHeight) / 2;
        
        // Draw right bar
        const xRight = centerX + i * (barWidth + spacing);
        ctx.fillRect(xRight, y, barWidth, barHeight);

        // Draw left mirrored bar
        const xLeft = centerX - (i + 1) * (barWidth + spacing);
        ctx.fillRect(xLeft, y, barWidth, barHeight);
      }
    };

    draw();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [analyser, isPlaying]);

  return <canvas ref={canvasRef} width="150" height="40" />;
};

export default SoundWave;