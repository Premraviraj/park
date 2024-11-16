import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import gsap from 'gsap';

const SpinnerLoader = () => {
  const cameraRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!cameraRef.current) return;

    const camera = cameraRef.current;
    const lens = camera.querySelector('.camera-lens');
    const flash = camera.querySelector('.camera-flash');
    const text = camera.querySelector('.loading-text');

    // Create timeline
    const tl = gsap.timeline({
      repeat: -1,
      defaults: { ease: 'power2.inOut' }
    });

    // Initial state
    gsap.set([camera, lens, flash, text], { opacity: 0 });

    // Animation sequence
    tl.to(camera, {
      opacity: 1,
      duration: 0.5
    })
    .to(lens, {
      opacity: 1,
      scale: 1.1,
      duration: 0.5
    })
    .to(flash, {
      opacity: 1,
      duration: 0.3
    })
    .to(text, {
      opacity: 1,
      y: 0,
      duration: 0.5
    })
    .to(lens, {
      rotate: 360,
      duration: 2,
      ease: 'none',
      repeat: -1
    }, '<')
    .to(flash, {
      opacity: 0.5,
      duration: 0.5,
      yoyo: true,
      repeat: -1
    }, '<');

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999
      }}
    >
      <svg
        ref={cameraRef}
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Camera body */}
        <path
          className="camera-body"
          d="M30 40H90C95.5228 40 100 44.4772 100 50V80C100 85.5228 95.5228 90 90 90H30C24.4772 90 20 85.5228 20 80V50C20 44.4772 24.4772 40 30 40Z"
          stroke="#82ca9d"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Camera lens */}
        <circle
          className="camera-lens"
          cx="60"
          cy="65"
          r="15"
          stroke="#82ca9d"
          strokeWidth="3"
          strokeDasharray="6 3"
        />
        
        {/* Camera flash */}
        <path
          className="camera-flash"
          d="M75 35L85 25M45 35L35 25"
          stroke="#82ca9d"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Loading text */}
        <text
          className="loading-text"
          x="60"
          y="110"
          textAnchor="middle"
          fill="#82ca9d"
          fontSize="14"
          fontFamily="Arial"
        >
          Loading...
        </text>
      </svg>
    </Box>
  );
};

export default SpinnerLoader; 