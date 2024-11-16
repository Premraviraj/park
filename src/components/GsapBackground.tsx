import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface GsapBackgroundProps {
  color: string;
  gradient: string;
}

const GsapBackground = ({ color, gradient }: GsapBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear existing particles
    particlesRef.current = [];
    containerRef.current.innerHTML = '';

    // Create particles
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        position: absolute;
        width: 6px;
        height: 6px;
        background: ${color};
        border-radius: 50%;
        filter: blur(1px);
        pointer-events: none;
        opacity: 0.8;
      `;

      containerRef.current.appendChild(particle);
      particlesRef.current.push(particle);

      // Random initial position
      gsap.set(particle, {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      });

      // Create floating animation
      gsap.to(particle, {
        duration: 'random(3, 5)',
        x: `+=${Math.random() * 100 - 50}`,
        y: `+=${Math.random() * 100 - 50}`,
        opacity: 'random(0.4, 0.8)',
        scale: 'random(0.8, 1.2)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: Math.random() * 2,
      });
    }

    // Create connection lines
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `;
    containerRef.current.appendChild(canvas);

    const ctx = canvas.getContext('2d')!;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    // Handle mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Animation loop for connections
    const drawConnections = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;

      particlesRef.current.forEach((particle, i) => {
        const rect1 = particle.getBoundingClientRect();
        const x1 = rect1.left + rect1.width / 2;
        const y1 = rect1.top + rect1.height / 2;

        // Mouse connection
        const mouseDist = Math.hypot(mouseX - x1, mouseY - y1);
        if (mouseDist < 150) {
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(mouseX, mouseY);
          ctx.globalAlpha = (1 - mouseDist / 150) * 0.5;
          ctx.stroke();

          // Attract particle to mouse
          gsap.to(particle, {
            duration: 0.3,
            x: `+=${(mouseX - x1) * 0.05}`,
            y: `+=${(mouseY - y1) * 0.05}`,
            overwrite: true,
          });
        }

        // Particle connections
        particlesRef.current.slice(i + 1).forEach(particle2 => {
          const rect2 = particle2.getBoundingClientRect();
          const x2 = rect2.left + rect2.width / 2;
          const y2 = rect2.top + rect2.height / 2;

          const dist = Math.hypot(x2 - x1, y2 - y1);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.globalAlpha = (1 - dist / 100) * 0.3;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(drawConnections);
    };

    const animationFrame = requestAnimationFrame(drawConnections);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrame);
      gsap.killTweensOf(particlesRef.current);
    };
  }, [color]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        background: gradient,
        overflow: 'hidden'
      }}
    />
  );
};

export default GsapBackground; 