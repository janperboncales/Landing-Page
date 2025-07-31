import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypingEffectProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetweenTexts?: number;
}

const TypingEffect: React.FC<TypingEffectProps> = ({
  texts,
  typingSpeed = 100,
  deletingSpeed = 50,
  delayBetweenTexts = 1200,
}) => {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (textIndex >= texts.length) {
      return; // Stop the effect when all texts are processed
    }

    const handleTyping = () => {
      const fullText = texts[textIndex];
      if (isDeleting) {
        // Handle deleting
        if (charIndex > 0) {
          setCurrentText(fullText.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setTextIndex(textIndex + 1); // Move to the next text
        }
      } else {
        // Handle typing
        if (charIndex < fullText.length) {
          setCurrentText(fullText.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          // If it's the last text, don't delete it.
          if (textIndex === texts.length - 1) {
            return;
          }
          // Wait before starting to delete the current text
          setTimeout(() => setIsDeleting(true), delayBetweenTexts);
        }
      }
    };

    const speed = isDeleting ? deletingSpeed : typingSpeed;
    const timeout = setTimeout(handleTyping, speed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex, texts, typingSpeed, deletingSpeed, delayBetweenTexts]);

  // Only show blinking cursor if it's not the final, completed text
  const showCursor = !(textIndex === texts.length - 1 && charIndex === texts[texts.length - 1].length);

  return (
    <span className="text-lg text-cyan-300">
      {currentText}
      {showCursor && (
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block"
        >
          |
        </motion.span>
      )}
    </span>
  );
};

export default TypingEffect;
