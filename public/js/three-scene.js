/**
 * ══════════════════════════════════════════════════
 *  FUTURE MIRROR — Three.js Scene
 *  3D rotating future sphere with particle system
 * ══════════════════════════════════════════════════
 */

function initThreeScene(containerId = 'three-container') {
  const container = document.getElementById(containerId);
  if (!container || typeof THREE === 'undefined') return null;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 4;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  /* ── Main Sphere ─────────────────────────────── */
  const sphereGeom = new THREE.IcosahedronGeometry(1.2, 3);
  const sphereMat = new THREE.MeshPhongMaterial({
    color: 0x7c3aed,
    emissive: 0x3b0764,
    wireframe: true,
    transparent: true,
    opacity: 0.6,
  });
  const sphere = new THREE.Mesh(sphereGeom, sphereMat);
  scene.add(sphere);

  /* ── Inner Glow Sphere ─────────────────────── */
  const innerGeom = new THREE.IcosahedronGeometry(0.9, 2);
  const innerMat = new THREE.MeshPhongMaterial({
    color: 0x06b6d4,
    emissive: 0x0891b2,
    transparent: true,
    opacity: 0.15,
  });
  const innerSphere = new THREE.Mesh(innerGeom, innerMat);
  scene.add(innerSphere);

  /* ── Particles ─────────────────────────────── */
  const particleCount = 800;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const radius = 2 + Math.random() * 3;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);

    // Purple to cyan gradient
    const t = Math.random();
    colors[i3] = 0.49 * (1 - t) + 0.02 * t;
    colors[i3 + 1] = 0.23 * (1 - t) + 0.71 * t;
    colors[i3 + 2] = 0.93 * (1 - t) + 0.83 * t;
  }

  const particleGeom = new THREE.BufferGeometry();
  particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.02,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
  });
  const particles = new THREE.Points(particleGeom, particleMat);
  scene.add(particles);

  /* ── Lighting ──────────────────────────────── */
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0x7c3aed, 2, 10);
  pointLight.position.set(2, 2, 3);
  scene.add(pointLight);

  const pointLight2 = new THREE.PointLight(0x06b6d4, 1.5, 10);
  pointLight2.position.set(-2, -1, 2);
  scene.add(pointLight2);

  /* ── Mouse interaction ─────────────────────── */
  let mouseX = 0, mouseY = 0;
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  });

  /* ── Animation Loop ────────────────────────── */
  let animId;
  function animate() {
    animId = requestAnimationFrame(animate);

    sphere.rotation.x += 0.003;
    sphere.rotation.y += 0.005;

    innerSphere.rotation.x -= 0.002;
    innerSphere.rotation.y -= 0.003;

    particles.rotation.y += 0.001;

    // Mouse follow
    sphere.rotation.x += mouseY * 0.01;
    sphere.rotation.y += mouseX * 0.01;

    // Pulse effect
    const scale = 1 + Math.sin(Date.now() * 0.001) * 0.03;
    sphere.scale.set(scale, scale, scale);

    renderer.render(scene, camera);
  }
  animate();

  /* ── Resize Handler ────────────────────────── */
  function onResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
  window.addEventListener('resize', onResize);

  return {
    scene, camera, renderer, sphere, particles,
    destroy() {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    },
    updateColors(primaryHex, secondaryHex) {
      sphereMat.color.set(primaryHex);
      sphereMat.emissive.set(secondaryHex);
    }
  };
}
