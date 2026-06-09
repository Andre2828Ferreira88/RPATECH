import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.174.0/build/three.module.js';

function initRpatechTechBackground() {
  const wrapper = document.querySelector('.rpatech-tech-bg');
  const container = document.getElementById('tech-canvas-container');
  const loading = document.querySelector('.tech-bg-loading');

  if (!wrapper || !container) return;

  const isMobile = window.innerWidth < 768;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scene = new THREE.Scene();
  const techSceneGroup = new THREE.Group();
  scene.add(techSceneGroup);

  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 2200);
  camera.position.set(0, 0, isMobile ? 420 : 360);

  const renderer = new THREE.WebGLRenderer({
    antialias: !isMobile,
    alpha: true,
    powerPreference: 'high-performance'
  });

  renderer.setClearColor(0x050505, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.4 : 2));
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.appendChild(renderer.domElement);

  const clock = new THREE.Clock();
  let width = 1;
  let height = 1;
  let mouseX = 0;
  let mouseY = 0;
  let isVisible = true;
  let animationFrame = 0;

  const bgVertexShader = `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const bgFragmentShader = `
    uniform float uTime;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
        f.y
      );
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p *= 2.0;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = vUv * 2.0;
      float t = uTime * 0.018;
      float dataBand = smoothstep(0.58, 0.0, abs(vUv.y - 0.52));
      float sideGlow = smoothstep(0.8, 0.12, distance(vUv, vec2(0.22, 0.42)));

      float n1 = fbm(uv * 3.0 + vec2(t, t * 0.7));
      float n2 = fbm(uv * 5.0 - vec2(t * 1.15, t * 0.85) + n1);
      float scan = smoothstep(0.02, 0.0, abs(fract(vUv.y * 16.0 - uTime * 0.045) - 0.5)) * 0.035;

      vec3 baseSpace = vec3(0.005, 0.006, 0.008);
      vec3 color1 = vec3(0.25, 0.08, 0.01);
      vec3 color2 = vec3(0.10, 0.035, 0.005);
      vec3 dataGlow = vec3(0.35, 0.13, 0.02);

      vec3 finalColor = baseSpace;
      finalColor += color1 * n1 * 0.28;
      finalColor += color2 * n2 * 0.22;
      finalColor += dataGlow * dataBand * (n1 * n2) * 0.65;
      finalColor += dataGlow * sideGlow * 0.10;
      finalColor += vec3(1.0, 0.58, 0.18) * scan;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  const bgGeometry = new THREE.SphereGeometry(1000, 32, 32);
  const bgMaterial = new THREE.ShaderMaterial({
    vertexShader: bgVertexShader,
    fragmentShader: bgFragmentShader,
    uniforms: { uTime: { value: 0 } },
    side: THREE.BackSide,
    depthWrite: false
  });
  const techBackgroundMesh = new THREE.Mesh(bgGeometry, bgMaterial);
  techSceneGroup.add(techBackgroundMesh);

  const particleCount = prefersReducedMotion ? (isMobile ? 2600 : 7000) : (isMobile ? 6000 : 18000);
  const connectionCount = prefersReducedMotion ? (isMobile ? 180 : 480) : (isMobile ? 450 : 1300);
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const phases = new Float32Array(particleCount);
  const pulseSpeeds = new Float32Array(particleCount);

  const colorPalette = [
    '#ff7a18',
    '#ff9f1c',
    '#ffb347',
    '#ffffff',
    '#f97316',
    '#fb923c'
  ].map((c) => new THREE.Color(c));

  const spreadX = isMobile ? 620 : 900;
  const spreadY = isMobile ? 380 : 420;
  const spreadZ = isMobile ? 520 : 700;

  for (let i = 0; i < particleCount; i += 1) {
    const layer = Math.floor(Math.random() * 5) / 4;
    const gridBias = Math.random() < 0.38;

    let x = (Math.random() - 0.5) * spreadX;
    let y = (Math.random() - 0.5) * spreadY;
    let z = (Math.random() - 0.5) * spreadZ;

    if (gridBias) {
      x = Math.round(x / 34) * 34 + (Math.random() - 0.5) * 10;
      y = Math.round(y / 34) * 34 + (Math.random() - 0.5) * 10;
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y + Math.sin(layer * Math.PI) * 24;
    positions[i * 3 + 2] = z;

    let paletteIndex;
    const chance = Math.random();
    if (chance < 0.70) paletteIndex = Math.random() < 0.5 ? 0 : 4;
    else if (chance < 0.90) paletteIndex = Math.random() < 0.5 ? 1 : 2;
    else paletteIndex = 3;

    const baseColor = colorPalette[paletteIndex];
    const color = baseColor.clone().lerp(new THREE.Color(0xffffff), paletteIndex === 3 ? 0.05 : Math.random() * 0.10);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    sizes[i] = Math.pow(Math.random(), 4.5) * (isMobile ? 7.5 : 9.5) + 0.8;
    phases[i] = Math.random() * Math.PI * 2;
    pulseSpeeds[i] = Math.random() * 1.2 + 0.35;
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
  particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  particleGeometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
  particleGeometry.setAttribute('pulseSpeed', new THREE.BufferAttribute(pulseSpeeds, 1));

  const particleVertexShader = `
    uniform float uTime;
    uniform float uPixelRatio;

    attribute float size;
    attribute float phase;
    attribute float pulseSpeed;
    attribute vec3 customColor;

    varying vec3 vColor;
    varying float vPulse;

    void main() {
      vColor = customColor;
      float wave = sin(uTime * pulseSpeed + phase) * 0.5 + 0.5;
      vPulse = 0.55 + wave * 0.55;

      vec3 animatedPosition = position;
      animatedPosition.y += sin(uTime * 0.18 + position.x * 0.012 + phase) * 1.6;
      animatedPosition.x += cos(uTime * 0.14 + position.z * 0.01 + phase) * 1.2;

      vec4 mvPosition = modelViewMatrix * vec4(animatedPosition, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      float dist = max(length(mvPosition.xyz), 1.0);
      gl_PointSize = size * uPixelRatio * (390.0 / dist) * vPulse;
    }
  `;

  const particleFragmentShader = `
    varying vec3 vColor;
    varying float vPulse;

    void main() {
      vec2 uv = gl_PointCoord.xy * 2.0 - 1.0;
      float d = length(uv);
      float core = smoothstep(0.42, 0.0, d);
      float halo = smoothstep(1.0, 0.05, d) * 0.34;
      float alpha = (core + halo) * vPulse;

      if (alpha < 0.025) discard;

      vec3 finalColor = mix(vColor, vec3(1.0, 0.72, 0.42), core * 0.26);
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  const dataParticleMaterial = new THREE.ShaderMaterial({
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: renderer.getPixelRatio() }
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const dataParticleMesh = new THREE.Points(particleGeometry, dataParticleMaterial);
  techSceneGroup.add(dataParticleMesh);

  const lineGeometry = new THREE.BufferGeometry();
  const linePositions = new Float32Array(connectionCount * 2 * 3);
  const lineColors = new Float32Array(connectionCount * 2 * 3);

  for (let i = 0; i < connectionCount; i += 1) {
    const a = Math.floor(Math.random() * particleCount);
    const ax = positions[a * 3];
    const ay = positions[a * 3 + 1];
    const az = positions[a * 3 + 2];

    const bx = ax + (Math.random() - 0.5) * (isMobile ? 95 : 120);
    const by = ay + (Math.random() - 0.5) * (isMobile ? 60 : 70);
    const bz = az + (Math.random() - 0.5) * (isMobile ? 95 : 120);

    const p = i * 6;
    linePositions[p] = ax;
    linePositions[p + 1] = ay;
    linePositions[p + 2] = az;
    linePositions[p + 3] = bx;
    linePositions[p + 4] = by;
    linePositions[p + 5] = bz;

    const lineColor = colorPalette[Math.random() < 0.82 ? 0 : (Math.random() < 0.92 ? 1 : 3)].clone();
    lineColor.multiplyScalar(Math.random() < 0.9 ? 0.76 : 0.95);

    lineColors[p] = lineColor.r;
    lineColors[p + 1] = lineColor.g;
    lineColors[p + 2] = lineColor.b;
    lineColors[p + 3] = lineColor.r;
    lineColors[p + 4] = lineColor.g;
    lineColors[p + 5] = lineColor.b;
  }

  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

  const lineMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: isMobile ? 0.17 : 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
  techSceneGroup.add(lineMesh);

  function resize() {
    const rect = wrapper.getBoundingClientRect();
    width = Math.max(1, rect.width || window.innerWidth);
    height = Math.max(1, rect.height || window.innerHeight * 0.88);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    dataParticleMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, isMobile ? 1.4 : 2);
  }

  function hideLoading() {
    if (!loading) return;
    loading.classList.add('is-hidden');
    window.setTimeout(() => {
      if (loading) loading.style.display = 'none';
    }, 650);
  }

  if (!isMobile) {
    window.addEventListener('mousemove', (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });
  }

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      }, { threshold: 0.05 })
    : null;

  observer?.observe(wrapper);

  window.addEventListener('resize', resize, { passive: true });
  resize();
  hideLoading();

  function animate() {
    animationFrame = window.requestAnimationFrame(animate);
    if (!isVisible) return;

    const elapsedTime = clock.getElapsedTime();
    const motion = prefersReducedMotion ? 0.35 : 1;

    bgMaterial.uniforms.uTime.value = elapsedTime * motion;
    dataParticleMaterial.uniforms.uTime.value = elapsedTime * motion;

    techSceneGroup.rotation.y = elapsedTime * 0.025 * motion;
    techSceneGroup.rotation.x += (mouseY * 0.035 - techSceneGroup.rotation.x) * 0.04;
    techSceneGroup.rotation.z += (mouseX * 0.012 - techSceneGroup.rotation.z) * 0.03;
    lineMesh.rotation.y = Math.sin(elapsedTime * 0.08) * 0.035;

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('pagehide', () => {
    window.cancelAnimationFrame(animationFrame);
    observer?.disconnect();
    renderer.dispose();
    particleGeometry.dispose();
    lineGeometry.dispose();
    bgGeometry.dispose();
    dataParticleMaterial.dispose();
    lineMaterial.dispose();
    bgMaterial.dispose();
  }, { once: true });
}

try {
  initRpatechTechBackground();
} catch (error) {
  console.warn('RPATECH tech background não carregou:', error);
  document.querySelector('.tech-bg-loading')?.classList.add('is-hidden');
}
