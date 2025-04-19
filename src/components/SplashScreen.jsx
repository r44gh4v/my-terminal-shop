import { useState, useEffect } from 'react';

const SplashScreen = ({ onComplete }) => {
  const [text, setText] = useState('');
  const [isClosing, setIsClosing] = useState(false); // New state for closing animation
  const fullText = "ssh terminal.shop";

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        // Start closing animation after typing completes
        setTimeout(() => {
          setIsClosing(true);
        }, 500); // Brief pause before closing
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, []);

  // Trigger onComplete when closing animation finishes
  useEffect(() => {
    if (isClosing) {
      const closeTimeout = setTimeout(() => {
        onComplete();
      }, 500); // Match this with the animation duration
      return () => clearTimeout(closeTimeout);
    }
  }, [isClosing, onComplete]);

  return (
    <div
      className={
        `flex absolute bg-[#190900] h-svh m-0 w-full z-50 font-mono transition-opacity duration-500 ${isClosing ? 'opacity-0' : 'opacity-100'}`
      }
    >

      <img
        src="https://i.postimg.cc/tJhBVh4d/scanlines.png"
        alt='scanlines'
        className='opacity-90 absolute w-[100%] h-svh top-0 left-0 pointer-events-none'
      />
      <img
        src="https://i.postimg.cc/SR8v7BDM/bezel.png"
        alt='bezel'
        className='absolute w-[100%] h-svh top-0 left-0 pointer-events-none'
      />

      <div className='w-[80%] text-[#FF5C00] text-2xl text-shadow-lg/70 text-shadow-[#FF5C00]'>
        <div className='text-xl'>*************************</div>
        <div className='text-7xl'>WELCOME</div>
        <div className='text-xl'>*************************</div>
        <br />
        <div>$ {text}|</div>
      </div>


    </div>
  );
};

export default SplashScreen;