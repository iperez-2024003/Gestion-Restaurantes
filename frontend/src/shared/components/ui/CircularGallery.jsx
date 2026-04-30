import React, { useEffect, useRef } from 'react';
import { Renderer, Camera, Transform, Plane, Mesh, Program, Texture } from 'ogl';

export const CircularGallery = ({ images }) => {
  const containerRef = useRef();

  useEffect(() => {
    if (!containerRef.current) return;

    const renderer = new Renderer({ alpha: true, antialias: true });
    const gl = renderer.gl;
    containerRef.current.appendChild(gl.canvas);

    const camera = new Camera(gl, { fov: 45 });
    camera.position.z = 5;

    const scene = new Transform();

    const planeGeometry = new Plane(gl, { width: 1.5, height: 2, widthSegments: 20 });

    const program = new Program(gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 pos = position;
          // Bend effect
          pos.z += sin(pos.x * 0.5) * 0.5;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          gl_FragColor = texture2D(tMap, vUv);
        }
      `,
      uniforms: {
        tMap: { value: null },
        uTime: { value: 0 },
      },
    });

    const meshes = [];
    images.forEach((src, i) => {
      const texture = new Texture(gl);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      img.onload = () => (texture.image = img);

      const mesh = new Mesh(gl, { geometry: planeGeometry, program });
      mesh.position.x = (i - (images.length - 1) / 2) * 2;
      mesh.position.z = -Math.abs(mesh.position.x) * 0.5;
      mesh.rotation.y = -mesh.position.x * 0.2;
      mesh.setParent(scene);
      meshes.push(mesh);
    });

    function resize() {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    }
    window.addEventListener('resize', resize, false);
    resize();

    let request;
    function update(time) {
      request = requestAnimationFrame(update);
      meshes.forEach((mesh, i) => {
        mesh.position.x = Math.sin(time * 0.001 + i) * 3;
        mesh.position.z = Math.cos(time * 0.001 + i) * 2 - 2;
        mesh.rotation.y = Math.atan2(mesh.position.x, mesh.position.z + 2);
      });
      renderer.render({ scene, camera });
    }
    request = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(request);
      if (containerRef.current) {
        containerRef.current.removeChild(gl.canvas);
      }
    };
  }, [images]);

  return <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none opacity-40" />;
};
