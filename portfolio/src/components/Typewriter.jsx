import React, { useState, useEffect } from 'react';

export default function Typewriter({ words = [], speed = 100, delay = 2000 }) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!words || words.length === 0) return;
    
    let timer;
    const fullWord = words[currentWordIndex];

    if (isDeleting) {
      // Deleting character
      timer = setTimeout(() => {
        setCurrentText(fullWord.substring(0, currentText.length - 1));
      }, speed / 2);
    } else {
      // Typing character
      timer = setTimeout(() => {
        setCurrentText(fullWord.substring(0, currentText.length + 1));
      }, speed);
    }

    // Word completed, wait and start deleting
    if (!isDeleting && currentText === fullWord) {
      timer = setTimeout(() => setIsDeleting(true), delay);
    }

    // Word deleted, move to next
    if (isDeleting && currentText === '') {
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, words, speed, delay]);

  return (
    <span className="relative inline-block font-bold">
      <span className="text-gradient">
        {currentText || "\u00A0"}
      </span>
      <span className="w-[3px] h-[0.9em] ml-1 bg-primary dark:bg-violet-400 inline-block align-middle animate-pulse"></span>
    </span>
  );
}
