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

      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xfafafa);
      scene.fog = new THREE.Fog(0xfafafa, 30, 100);

      const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 0, 30);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      // Lights
      const ambient = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambient);
      const keyLight = new THREE.DirectionalLight(0xffffff, 0.5);
      keyLight.position.set(10, 10, 15);
      scene.add(keyLight);

      const objects: any[] = [];

      // Small floating particles
      const particleCount = 200;
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 80;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      }
      const particlesGeometry = new THREE.BufferGeometry();
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.08,
        color: 0x999999,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true
      });
      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particles);

      // Small torus knots scattered around
      const knotConfigs = [
        { p: 2, q: 3, radius: 0.6, tube: 0.08, pos: [15, 8, -5] },
        { p: 3, q: 2, radius: 0.5, tube: 0.06, pos: [-12, -6, 3] },
        { p: 2, q: 5, radius: 0.4, tube: 0.05, pos: [18, -10, -8] },
        { p: 3, q: 4, radius: 0.35, tube: 0.04, pos: [-18, 10, 0] },
        { p: 2, q: 3, radius: 0.5, tube: 0.06, pos: [8, -15, 5] },
        { p: 3, q: 2, radius: 0.45, tube: 0.05, pos: [-8, 12, -6] },
      ];
      knotConfigs.forEach((config) => {
        const knotGeo = new THREE.TorusKnotGeometry(config.radius, config.tube, 64, 12, config.p, config.q);
        const knotMat = new THREE.MeshStandardMaterial({
          color: 0x2a2a2a,
          metalness: 0.8,
          roughness: 0.3
        });
        const knot = new THREE.Mesh(knotGeo, knotMat);
        knot.position.set(config.pos[0], config.pos[1], config.pos[2]);
        knot.userData = {
          rotSpeed: { x: 0.005 + Math.random() * 0.008, y: 0.008 + Math.random() * 0.008 },
          floatSpeed: 0.5 + Math.random() * 0.5,
          floatOffset: Math.random() * Math.PI * 2,
          originalY: config.pos[1]
        };
        scene.add(knot);
        objects.push(knot);
      });

      // Small wireframe shapes
      const shapeConfigs = [
        { type: 'icosahedron', size: 0.8, pos: [20, 5, -3] },
        { type: 'octahedron', size: 0.6, pos: [-15, -8, 5] },
        { type: 'tetrahedron', size: 0.7, pos: [12, -12, -6] },
        { type: 'dodecahedron', size: 0.5, pos: [-20, 6, -2] },
        { type: 'icosahedron', size: 0.5, pos: [5, 15, 2] },
        { type: 'octahedron', size: 0.5, pos: [-6, -14, -4] },
        { type: 'tetrahedron', size: 0.6, pos: [22, -3, 4] },
        { type: 'cube', size: 0.5, pos: [-22, -2, 6] },
      ];
      
      shapeConfigs.forEach((config) => {
        let geo;
        switch (config.type) {
          case 'icosahedron': geo = new THREE.IcosahedronGeometry(config.size, 0); break;
          case 'octahedron': geo = new THREE.OctahedronGeometry(config.size, 0); break;
          case 'tetrahedron': geo = new THREE.TetrahedronGeometry(config.size, 0); break;
          case 'dodecahedron': geo = new THREE.DodecahedronGeometry(config.size, 0); break;
          case 'cube': geo = new THREE.BoxGeometry(config.size, config.size, config.size); break;
          default: geo = new THREE.IcosahedronGeometry(config.size, 0);
        }
        const edges = new THREE.EdgesGeometry(geo);
        const line = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({ color: 0x1a1a1a, transparent: true, opacity: 0.25 })
        );
        line.position.set(config.pos[0], config.pos[1], config.pos[2]);
        line.userData = {
          rotSpeed: { x: 0.003 + Math.random() * 0.005, y: 0.004 + Math.random() * 0.005 },
          floatSpeed: 0.3 + Math.random() * 0.4,
          floatOffset: Math.random() * Math.PI * 2,
          originalY: config.pos[1]
        };
        scene.add(line);
        objects.push(line);
      });

      // Small spheres (bokeh-like)
      for (let i = 0; i < 15; i++) {
        const size = 0.15 + Math.random() * 0.25;
        const sphereGeo = new THREE.SphereGeometry(size, 12, 12);
        const grayValue = 0.3 + Math.random() * 0.4;
        const sphereMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(grayValue, grayValue, grayValue),
          transparent: true,
          opacity: 0.15 + Math.random() * 0.15
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        sphere.position.set(
          (Math.random() - 0.5) * 50,
          (Math.random() - 0.5) * 35,
          (Math.random() - 0.5) * 25
        );
        sphere.userData = {
          floatSpeed: 0.2 + Math.random() * 0.3,
          floatOffset: Math.random() * Math.PI * 2,
          floatAmplitude: 0.5 + Math.random() * 1,
          originalY: sphere.position.y,
          originalX: sphere.position.x
        };
        scene.add(sphere);
        objects.push(sphere);
      }

      // Small rings
      for (let i = 0; i < 6; i++) {
        const ringGeo = new THREE.TorusGeometry(0.4 + Math.random() * 0.4, 0.02, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x1a1a1a,
          transparent: true,
          opacity: 0.12 + Math.random() * 0.1
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(
          (Math.random() - 0.5) * 45,
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 20
        );
        ring.rotation.x = Math.random() * Math.PI;
        ring.rotation.y = Math.random() * Math.PI;
        ring.userData = {
          rotSpeed: { x: 0.002 + Math.random() * 0.004, y: 0.003 + Math.random() * 0.004 },
          floatSpeed: 0.25 + Math.random() * 0.3,
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
      style={{ zIndex: 0 }}
    />
  );
}
