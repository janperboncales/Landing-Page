import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring, type Variants } from 'framer-motion';
import { FacebookIcon, YouTubeIcon, DiscordIcon, SpotifyIcon, PlayIcon, PauseIcon, HeartIcon } from './icons';
import { useLanyard } from './useLanyard';
import TypingEffect from './TypingEffect';
import SoundWave from './SoundWave';

const cardVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      duration: 0.5, 
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100 }
  },
};

const statusColorMap: { [key: string]: string } = {
  online: 'bg-green-500',
  idle: 'bg-yellow-400',
  dnd: 'bg-red-500',
  offline: 'bg-gray-500',
};

const ProfileCard: React.FC = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const lanyardUserId = '1374742430183718914';
  const { data: lanyardData, loading } = useLanyard(lanyardUserId);

  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 20, mass: 1 };
  const rotateX = useSpring(useTransform(y, [-100, 100], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(x, [-100, 100], [-10, 10]), springConfig);

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);

  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);

      // Setup Web Audio API on first flip
      if (audioRef.current && !audioContextRef.current) {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = context.createMediaElementSource(audioRef.current);
        const newAnalyser = context.createAnalyser();
        
        source.connect(newAnalyser);
        newAnalyser.connect(context.destination);
        
        audioContextRef.current = context;
        setAnalyser(newAnalyser);
      }

      // Autoplay music after a short delay to sync with animation
      setTimeout(() => {
        if (audioRef.current) {
          audioContextRef.current?.resume(); 
          audioRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch(e => console.error("Audio autoplay failed:", e));
        }
      }, 300);
    }
  };

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioContextRef.current?.resume();
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current || !isFlipped) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;

    x.set(xPct * 100);
    y.set(yPct * 100);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const mainActivity = lanyardData?.activities.find(act => act.type === 0);

  return (
    <div
      className="w-full max-w-sm"
      style={{ perspective: '1000px' }}
    >
      <motion.div
        style={{ transformStyle: 'preserve-3d' }}
        initial={false}
        animate={{
          rotateY: isFlipped ? 0 : 180,
          boxShadow: isFlipped
            ? "0 0 0px rgba(103, 232, 249, 0)"
            : [
                "0 0 2px rgba(103, 232, 249, 0.5)",
                "0 0 60px rgba(103, 232, 249, 0.9)",
                "0 0 2px rgba(103, 232, 249, 0.5)",
              ],
        }}
        transition={{
          rotateY: { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] },
          boxShadow: { duration: 0.8, ease: "easeInOut", times: [0, 0.5, 1] },
        }}
        className="relative w-full cursor-pointer rounded-2xl"
      >
        {/* BACK FACE */}
        <div
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          className="absolute inset-0 p-8 flex items-center justify-center text-center text-white rounded-2xl shadow-2xl bg-white/10 backdrop-blur-md border border-white/20"
          onClick={handleFlip}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isFlipped ? 0 : 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileTap={{ scale: 0.85 }}
            className="cursor-pointer"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                filter: [
                  "drop-shadow(0 0 4px #67e8f9)",
                  "drop-shadow(0 0 15px #67e8f9)",
                  "drop-shadow(0 0 4px #67e8f9)",
                ],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <HeartIcon className="w-24 h-24 text-cyan-300" />
            </motion.div>
          </motion.div>
        </div>


        {/* FRONT FACE */}
        <motion.div
          ref={ref}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            backfaceVisibility: 'hidden',
            transformStyle: 'preserve-3d',
            rotateX: isFlipped ? rotateX : 0,
            rotateY: isFlipped ? rotateY : 0,
          }}
          variants={cardVariants}
          initial="hidden"
          animate={isFlipped ? "visible" : "hidden"}
          className="w-full p-8 space-y-2 text-center text-white rounded-2xl shadow-2xl bg-white/10 backdrop-blur-md border border-white/20"
        >
          <audio ref={audioRef} src="https://cdn.pixabay.com/audio/2022/08/04/audio_2dde668d05.mp3" loop crossOrigin="anonymous" />
          <div style={{ transform: 'translateZ(20px)' }} className="flex flex-col">
            <motion.div variants={itemVariants} className="relative w-32 h-32 mx-auto">
              <motion.img
                src={lanyardData ? `https://cdn.discordapp.com/avatars/${lanyardData.discord_user.id}/${lanyardData.discord_user.avatar}.png?size=128` : "https://picsum.photos/128"}
                alt="Profile Picture"
                className="w-32 h-32 rounded-full border-4 border-cyan-400 object-cover shadow-lg shadow-cyan-500/20"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              {!loading && lanyardData && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.5 }}
                  className={`absolute bottom-1 right-1 block h-7 w-7 rounded-full border-4 border-slate-800 ${statusColorMap[lanyardData.discord_status] || 'bg-gray-500'}`}
                  title={lanyardData.discord_status}
                />
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2 mt-6">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 animate-gradient-text">
                {loading ? '...' : (lanyardData?.discord_user.global_name || lanyardData?.discord_user.username || 'Alex Doe')}
              </h1>
              <div className="flex items-center justify-center min-h-[28px]">
                {isFlipped && (
                  <TypingEffect
                    texts={["Just woke up...", "Welcome to my Profile <3"]}
                  />
                )}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-6 pb-2">
              <div className="flex items-center justify-center space-x-4">
                <motion.button
                  onClick={togglePlayPause}
                  className="p-2 text-gray-300 rounded-full hover:bg-white/20 hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={isPlaying ? "Pause music" : "Play music"}
                >
                  {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                </motion.button>
                <div className="flex items-center w-40">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full h-1.5 bg-gray-500/50 rounded-lg appearance-none cursor-pointer range-sm accent-cyan-400"
                    aria-label="Volume slider"
                  />
                </div>
              </div>
            </motion.div>

            <div className="pt-4 mt-2 min-h-[4rem] flex flex-col justify-center items-center">
              {lanyardData && lanyardData.spotify ? (
                <motion.div variants={itemVariants} className="flex items-center w-full space-x-3 text-gray-300">
                  <SpotifyIcon className="w-10 h-10 text-green-500 flex-shrink-0" />
                  <div className="text-left text-sm overflow-hidden">
                    <p className="font-bold truncate text-white">Listening to Spotify</p>
                    <p className="truncate">{lanyardData.spotify.song}</p>
                    <p className="truncate text-gray-400">by {lanyardData.spotify.artist}</p>
                  </div>
                </motion.div>
              ) : mainActivity ? (
                <motion.div variants={itemVariants} className="text-center text-sm">
                  <p className="font-bold truncate text-white">Playing {mainActivity.name}</p>
                  {mainActivity.details && <p className="truncate text-gray-400">{mainActivity.details}</p>}
                </motion.div>
              ) : (
                <motion.div variants={itemVariants} className="flex justify-center items-center w-full h-12">
                   <SoundWave analyser={analyser} isPlaying={isPlaying} />
                </motion.div>
              )}
            </div>

            <motion.div variants={itemVariants} className="flex justify-center space-x-6 mt-8 pb-2">
              <motion.a href="#" aria-label="Facebook Profile" whileHover={{ scale: 1.2, y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                <FacebookIcon className="w-8 h-8 text-gray-300 hover:text-cyan-400 transition-colors" />
              </motion.a>
              <motion.a href="#" aria-label="YouTube Channel" whileHover={{ scale: 1.2, y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                <YouTubeIcon className="w-8 h-8 text-gray-300 hover:text-cyan-400 transition-colors" />
              </motion.a>
              <motion.a href="#" aria-label="Discord Server" whileHover={{ scale: 1.2, y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                <DiscordIcon className="w-8 h-8 text-gray-300 hover:text-cyan-400 transition-colors" />
              </motion.a>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProfileCard;