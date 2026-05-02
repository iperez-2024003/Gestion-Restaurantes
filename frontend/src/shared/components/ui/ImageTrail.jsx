import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring } from 'framer-motion';

export const ImageTrail = ({ images }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [activeImage, setActiveImage] = useState(0);
  const trailRef = useRef([]);

  const springX = useSpring(0, { stiffness: 100, damping: 20 });
  const springY = useSpring(0, { stiffness: 100, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      const dist = Math.hypot(e.clientX - lastPos.x, e.clientY - lastPos.y);
      if (dist > 100) {
        setActiveImage((prev) => (prev + 1) % images.length);
        setLastPos({ x: e.clientX, y: e.clientY });
        
        // Add image to trail
        const id = Date.now();
        trailRef.current.push({ id, x: e.clientX, y: e.clientY, index: activeImage });
        if (trailRef.current.length > 5) trailRef.current.shift();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [lastPos, activeImage, images.length]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {trailRef.current.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.5, rotate: Math.random() * 20 - 10 }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.8], y: item.y - 100 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            position: 'absolute',
            left: item.x - 100,
            top: item.y - 100,
            width: 200,
            height: 250,
          }}
          className="rounded-2xl overflow-hidden shadow-2xl border border-white/20 backdrop-blur-sm"
        >
          <img 
            src={images[item.index]} 
            alt="trail" 
            className="w-full h-full object-cover grayscale-[0.5] sepia-[0.2] brightness-75"
          />
        </motion.div>
      ))}
    </div>
  );
};
