'use client';

import { useEffect, useRef } from 'react';

export default function ThreeScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: any;
    camera: any;
    renderer: any;
    objects: any[];
    particles: any;
    animationId: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    import('three').then((THREE) => {
      if (!containerRef.current || sceneRef.current) return;

      const container = containerRef.current;
      let mouseX = 0, mouseY = 0;
      let time = 0;

      // Get container dimensions - full screen
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Scene setup
      const scene = new THREE.Scene();
      scene.background = null; // Transparent background
      scene.fog = new THREE.Fog(0xfafafa, 30, 100);

      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
      camera.position.set(0, 0, 30);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0); // Transparent
      container.appendChild(renderer.domElement);

      // Lights
      const ambient = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambient);
      const keyLight = new THREE.DirectionalLight(0xffffff, 0.5);
      keyLight.position.set(10, 10, 15);
      scene.add(keyLight);

      const objects: any[] = [];

      // Floating particles - spread across full screen
      const particleCount = 120;
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 80;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10; // Push back
      }
      const particlesGeometry = new THREE.BufferGeometry();
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.08,
        color: 0xbbbbbb,
        transparent: true,
        opacity: 0.4,
        sizeAttenuation: true
      });
      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particles);

      // Wireframe shapes - spread across but pushed back (negative z)
      const shapeConfigs = [
        { type: 'icosahedron', size: 1.0, pos: [18, 8, -15] },
        { type: 'octahedron', size: 0.8, pos: [-15, -10, -12] },
        { type: 'dodecahedron', size: 0.6, pos: [20, -6, -18] },
        { type: 'tetrahedron', size: 0.9, pos: [-18, 6, -14] },
        { type: 'icosahedron', size: 0.7, pos: [10, 12, -20] },
        { type: 'octahedron', size: 0.6, pos: [-10, -12, -16] },
      ];
      
      shapeConfigs.forEach((config) => {
        let geo;
        switch (config.type) {
          case 'icosahedron': geo = new THREE.IcosahedronGeometry(config.size, 0); break;
          case 'octahedron': geo = new THREE.OctahedronGeometry(config.size, 0); break;
          case 'tetrahedron': geo = new THREE.TetrahedronGeometry(config.size, 0); break;
          case 'dodecahedron': geo = new THREE.DodecahedronGeometry(config.size, 0); break;
          default: geo = new THREE.IcosahedronGeometry(config.size, 0);
        }
        const edges = new THREE.EdgesGeometry(geo);
        const line = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.2 })
        );
        line.position.set(config.pos[0], config.pos[1], config.pos[2]);
        line.userData = {
          rotSpeed: { x: 0.002 + Math.random() * 0.004, y: 0.003 + Math.random() * 0.004 },
          floatSpeed: 0.2 + Math.random() * 0.3,
          floatOffset: Math.random() * Math.PI * 2,
          originalY: config.pos[1]
        };
        scene.add(line);
        objects.push(line);
      });

      // Soft spheres (bokeh-like) - spread across, pushed back
      for (let i = 0; i < 12; i++) {
        const size = 0.2 + Math.random() * 0.4;
        const sphereGeo = new THREE.SphereGeometry(size, 12, 12);
        const grayValue = 0.75 + Math.random() * 0.2;
        const sphereMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(grayValue, grayValue, grayValue),
          transparent: true,
          opacity: 0.15 + Math.random() * 0.1
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        sphere.position.set(
          (Math.random() - 0.5) * 50,
          (Math.random() - 0.5) * 35,
          (Math.random() - 0.5) * 20 - 15 // Push back
        );
        sphere.userData = {
          floatSpeed: 0.15 + Math.random() * 0.25,
          floatOffset: Math.random() * Math.PI * 2,
          floatAmplitude: 0.5 + Math.random() * 1,
          originalY: sphere.position.y,
          originalX: sphere.position.x
        };
        scene.add(sphere);
        objects.push(sphere);
      }

      // Rings - spread across, pushed back
      for (let i = 0; i < 4; i++) {
        const ringGeo = new THREE.TorusGeometry(0.4 + Math.random() * 0.4, 0.02, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xaaaaaa,
          transparent: true,
          opacity: 0.15
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(
          (Math.random() - 0.5) * 45,
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 15 - 12 // Push back
        );
        ring.rotation.x = Math.random() * Math.PI;
        ring.rotation.y = Math.random() * Math.PI;
        ring.userData = {
          rotSpeed: { x: 0.002 + Math.random() * 0.003, y: 0.002 + Math.random() * 0.003 },
          floatSpeed: 0.2 + Math.random() * 0.25,
          floatOffset: Math.random() * Math.PI * 2,
          originalY: ring.position.y
        };
        scene.add(ring);
        objects.push(ring);
      }

      sceneRef.current = {
        scene,
        camera,
        renderer,
        objects,
        particles,
        animationId: 0
      };

      // Mouse move handler
      const handleMouseMove = (e: MouseEvent) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      };
      window.addEventListener('mousemove', handleMouseMove);

      // Resize handler
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', handleResize);

      // Animation loop
      const animate = () => {
        sceneRef.current!.animationId = requestAnimationFrame(animate);
        time += 0.01;

        // Animate particles
        particles.rotation.y += 0.0002;

        // Animate all objects
        objects.forEach((obj) => {
          if (obj.userData.rotSpeed) {
            obj.rotation.x += obj.userData.rotSpeed.x;
            obj.rotation.y += obj.userData.rotSpeed.y;
          }
          if (obj.userData.floatSpeed !== undefined) {
            obj.position.y = obj.userData.originalY + 
              Math.sin(time * obj.userData.floatSpeed + obj.userData.floatOffset) * (obj.userData.floatAmplitude || 0.8);
          }
          if (obj.userData.originalX !== undefined) {
            obj.position.x = obj.userData.originalX + 
              Math.cos(time * obj.userData.floatSpeed * 0.7 + obj.userData.floatOffset) * (obj.userData.floatAmplitude || 0.5) * 0.5;
          }
        });

        // Camera follows mouse subtly
        camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
        camera.position.y += (mouseY * 2 - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      };
      animate();

      // Cleanup
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        if (sceneRef.current) {
          cancelAnimationFrame(sceneRef.current.animationId);
          sceneRef.current.renderer.dispose();
          if (container.contains(sceneRef.current.renderer.domElement)) {
            container.removeChild(sceneRef.current.renderer.domElement);
          }
          sceneRef.current = null;
        }
      };
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
    />
  );
}
