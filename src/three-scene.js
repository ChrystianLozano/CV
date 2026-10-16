import * as THREE from 'three';

export class Cyber3DScene {
  constructor(canvasElement) {
    this.canvas = canvasElement;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.activeSection = 0;

    // Smooth pointer & scroll state
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.scrollY = window.scrollY || 0;
    this.targetScrollY = this.scrollY;
    this.scrollVelocity = 0;

    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Section choreography (Subtle, architectural, framing the editorial layout)
    this.sectionConfigs = [
      {
        // 0. Hero: Precision Astrolabe framing the right side
        camPos: new THREE.Vector3(0, 0.35, 5.6),
        lookAt: new THREE.Vector3(0, 0.05, 0),
        corePos: new THREE.Vector3(1.85, 0.18, -0.2),
        coreScale: 0.92,
        morphIntensity: 0.65,
        gyroSpeed: 0.65,
        waveElevation: -1.35,
        ringSpread: 1.0,
        particleColor: new THREE.Color(0x27272a),
        accentColor: new THREE.Color(0x18181b),
        keyLightColor: new THREE.Color(0xffffff),
        fillLightColor: new THREE.Color(0xe4e4e7),
        rimLightColor: new THREE.Color(0xd4d4d8)
      },
      {
        // 1. Projects: Wide technical perspective, subtle background depth
        camPos: new THREE.Vector3(-1.4, 1.8, 6.6),
        lookAt: new THREE.Vector3(0.4, -0.2, 0),
        corePos: new THREE.Vector3(2.3, 0.6, -1.4),
        coreScale: 0.72,
        morphIntensity: 0.85,
        gyroSpeed: 0.8,
        waveElevation: -1.55,
        ringSpread: 1.18,
        particleColor: new THREE.Color(0x3f3f46),
        accentColor: new THREE.Color(0x27272a),
        keyLightColor: new THREE.Color(0xffffff),
        fillLightColor: new THREE.Color(0xd4d4d8),
        rimLightColor: new THREE.Color(0xa1a1aa)
      },
      {
        // 2. Trajectory: Balanced warm architectural stone & graphite
        camPos: new THREE.Vector3(1.5, -0.9, 5.9),
        lookAt: new THREE.Vector3(-0.35, 0.1, 0),
        corePos: new THREE.Vector3(-2.0, 0.35, -0.6),
        coreScale: 0.82,
        morphIntensity: 0.5,
        gyroSpeed: 0.5,
        waveElevation: -1.3,
        ringSpread: 0.94,
        particleColor: new THREE.Color(0x44403c),
        accentColor: new THREE.Color(0x292524),
        keyLightColor: new THREE.Color(0xffffff),
        fillLightColor: new THREE.Color(0xe7e5e4),
        rimLightColor: new THREE.Color(0xa8a29e)
      },
      {
        // 3. Stack: High-precision overhead isometric view
        camPos: new THREE.Vector3(0, -2.1, 5.2),
        lookAt: new THREE.Vector3(0, 0.15, 0),
        corePos: new THREE.Vector3(0, 0.25, -1.2),
        coreScale: 1.05,
        morphIntensity: 0.95,
        gyroSpeed: 0.75,
        waveElevation: -1.45,
        ringSpread: 1.12,
        particleColor: new THREE.Color(0x27272a),
        accentColor: new THREE.Color(0x18181b),
        keyLightColor: new THREE.Color(0xffffff),
        fillLightColor: new THREE.Color(0xd4d4d8),
        rimLightColor: new THREE.Color(0x71717a)
      },
      {
        // 4. Contact: Calm horizon, subtle emerald-tinted platinum
        camPos: new THREE.Vector3(0, 2.8, 7.2),
        lookAt: new THREE.Vector3(0, 0.3, 0),
        corePos: new THREE.Vector3(1.6, 0.85, -0.8),
        coreScale: 0.68,
        morphIntensity: 0.42,
        gyroSpeed: 0.38,
        waveElevation: -1.2,
        ringSpread: 0.88,
        particleColor: new THREE.Color(0x1f2937),
        accentColor: new THREE.Color(0x065f46),
        keyLightColor: new THREE.Color(0xffffff),
        fillLightColor: new THREE.Color(0xd1fae5),
        rimLightColor: new THREE.Color(0xa7f3d0)
      }
    ];

    // Base desktop core positions backup for responsive recalculation
    this.baseCorePositions = this.sectionConfigs.map((c) => c.corePos.clone());
    this.baseCoreScales = this.sectionConfigs.map((c) => c.coreScale);
    this.baseMorphIntensities = this.sectionConfigs.map((c) => c.morphIntensity);

    // Current interpolation state
    this.currentCamPos = this.sectionConfigs[0].camPos.clone();
    this.currentLookAt = this.sectionConfigs[0].lookAt.clone();
    this.currentCorePos = this.sectionConfigs[0].corePos.clone();
    this.currentCoreScale = this.sectionConfigs[0].coreScale;
    this.currentMorphIntensity = this.sectionConfigs[0].morphIntensity;
    this.currentGyroSpeed = this.sectionConfigs[0].gyroSpeed;
    this.currentWaveElevation = this.sectionConfigs[0].waveElevation;
    this.currentRingSpread = this.sectionConfigs[0].ringSpread;

    this.isMobile = this.width < 1024;
    this.adjustForDevice();

    this.onResizeBound = this.onResize.bind(this);
    this.onMouseMoveBound = this.onMouseMove.bind(this);
    this.onScrollBound = this.onScroll.bind(this);

    this.init();
  }

  adjustForDevice() {
    this.isMobile = this.width < 1024;

    this.sectionConfigs.forEach((config, i) => {
      if (this.isMobile) {
        config.corePos.set(0, 0.45, -1.6);
        config.coreScale = this.baseCoreScales[i] * 0.62;
        config.morphIntensity = this.baseMorphIntensities[i] * 0.65;
      } else {
        config.corePos.copy(this.baseCorePositions[i]);
        config.coreScale = this.baseCoreScales[i];
        config.morphIntensity = this.baseMorphIntensities[i];
      }
    });
  }

  // Crisp architectural micro-dot texture
  createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(9, 9, 11, 1)');
    gradient.addColorStop(0.35, 'rgba(24, 24, 27, 0.85)');
    gradient.addColorStop(0.7, 'rgba(113, 113, 122, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(32, 32, 32, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }

  // Procedural studio reflection map so metallic & glass materials look authentic and refined
  createStudioEnvironment() {
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();

    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0xf4f4f5);

    const lightGeo = new THREE.PlaneGeometry(10, 10);
    const topLightMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const topPanel = new THREE.Mesh(lightGeo, topLightMat);
    topPanel.position.set(0, 6, 0);
    topPanel.rotation.x = Math.PI / 2;
    envScene.add(topPanel);

    const darkGeo = new THREE.PlaneGeometry(12, 6);
    const darkMat = new THREE.MeshBasicMaterial({ color: 0x18181b, side: THREE.DoubleSide });
    const sideContrast1 = new THREE.Mesh(darkGeo, darkMat);
    sideContrast1.position.set(6, 0, 0);
    sideContrast1.rotation.y = Math.PI / 2;
    envScene.add(sideContrast1);

    const sideContrast2 = new THREE.Mesh(darkGeo, darkMat);
    sideContrast2.position.set(-6, -1, -4);
    sideContrast2.rotation.y = -Math.PI / 4;
    envScene.add(sideContrast2);

    const rimPanelMat = new THREE.MeshBasicMaterial({ color: 0xe4e4e7, side: THREE.DoubleSide });
    const rimPanel = new THREE.Mesh(lightGeo, rimPanelMat);
    rimPanel.position.set(0, -5, 4);
    rimPanel.rotation.x = -Math.PI / 3;
    envScene.add(rimPanel);

    const envMap = pmremGenerator.fromScene(envScene, 0.04).texture;
    pmremGenerator.dispose();
    return envMap;
  }

  init() {
    // 1. Scene & subtle atmospheric fog blending into canvas background
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xfafafa, 0.065);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(42, this.width / this.height, 0.1, 100);
    this.camera.position.copy(this.currentCamPos);
    this.camera.lookAt(this.currentLookAt);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;

    // Apply procedural studio environment for crisp metallic speculars
    this.scene.environment = this.createStudioEnvironment();

    // 4. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(ambientLight);

    this.keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    this.keyLight.position.set(5, 6, 5);
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.DirectionalLight(0xe4e4e7, 1.2);
    this.fillLight.position.set(-5, 3, 2);
    this.scene.add(this.fillLight);

    this.rimLight = new THREE.DirectionalLight(0xd4d4d8, 1.5);
    this.rimLight.position.set(0, -4, -5);
    this.scene.add(this.rimLight);

    this.mouseLight = new THREE.PointLight(0xffffff, 3.5, 14);
    this.mouseLight.position.set(0, 0, 2.5);
    this.scene.add(this.mouseLight);

    // 5. Build Kinetic Precision Sculpture (Astrolabe + Geodesic Core)
    this.createKineticSculpture();

    // 6. Build Topographic Silk Wave Field + Ambient Depth Nodes
    this.createParticleWaveGrid();
    this.createAmbientDepthNodes();

    // Listeners
    window.addEventListener('resize', this.onResizeBound, { passive: true });
    window.addEventListener('mousemove', this.onMouseMoveBound, { passive: true });
    window.addEventListener('scroll', this.onScrollBound, { passive: true });

    this.clock = new THREE.Clock();
    this.animate();
  }

  createKineticSculpture() {
    this.gyroGroup = new THREE.Group();
    this.gyroGroup.position.copy(this.currentCorePos);
    this.scene.add(this.gyroGroup);

    // Material 1: Anodized Dark Titanium (Primary precision rings)
    this.titaniumMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x18181b,
      metalness: 0.88,
      roughness: 0.2,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.4
    });

    // Material 2: Brushed Architectural Silver / Platinum (Secondary rings & core)
    this.platinumMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x71717a,
      metalness: 0.9,
      roughness: 0.24,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.6
    });

    // Material 3: Subtle Wireframe Line Material
    this.wireMaterial = new THREE.LineBasicMaterial({
      color: 0x27272a,
      transparent: true,
      opacity: 0.22
    });

    const segments = this.isMobile ? 72 : 128;

    // Ring 1 (Outer Primary Gimbal - Razor Thin)
    const outerGeo = new THREE.TorusGeometry(1.85, 0.014, 20, segments);
    this.outerRing = new THREE.Mesh(outerGeo, this.titaniumMaterial);

    // Ring 2 (Middle Harmonic Orbit)
    const middleGeo = new THREE.TorusGeometry(1.42, 0.012, 20, segments);
    this.middleRing = new THREE.Mesh(middleGeo, this.platinumMaterial);

    // Ring 3 (Inner Precision Orbit)
    const innerGeo = new THREE.TorusGeometry(1.02, 0.011, 20, segments);
    this.innerRing = new THREE.Mesh(innerGeo, this.titaniumMaterial);

    // Ring 4 (tilted ultra-fine meridian filament)
    const filamentGeo = new THREE.TorusGeometry(2.18, 0.0055, 12, segments);
    this.filamentRing = new THREE.Mesh(filamentGeo, this.platinumMaterial);

    // Orbital calibration nodes (small spheres mounted on the rings)
    const nodeGeo = new THREE.SphereGeometry(0.036, 16, 16);
    const outerNode1 = new THREE.Mesh(nodeGeo, this.titaniumMaterial);
    outerNode1.position.set(1.85, 0, 0);
    const outerNode2 = new THREE.Mesh(nodeGeo, this.titaniumMaterial);
    outerNode2.position.set(-1.85, 0, 0);

    const middleNodeGeo = new THREE.SphereGeometry(0.028, 16, 16);
    const middleNode = new THREE.Mesh(middleNodeGeo, this.platinumMaterial);
    middleNode.position.set(0, 1.42, 0);

    const innerNode = new THREE.Mesh(middleNodeGeo, this.titaniumMaterial);
    innerNode.position.set(0, -1.02, 0);

    this.outerGroup = new THREE.Group();
    this.middleGroup = new THREE.Group();
    this.innerGroup = new THREE.Group();
    this.filamentGroup = new THREE.Group();

    this.outerGroup.add(this.outerRing, outerNode1, outerNode2);
    this.middleGroup.add(this.middleRing, middleNode);
    this.innerGroup.add(this.innerRing, innerNode);
    this.filamentGroup.add(this.filamentRing);

    // Equatorial Precision Dial (108 radial micro-dots around radius 1.64)
    const dialCount = 108;
    const dialPositions = new Float32Array(dialCount * 3);
    const dialRadius = 1.64;
    for (let i = 0; i < dialCount; i++) {
      const angle = (i / dialCount) * Math.PI * 2;
      dialPositions[i * 3] = Math.cos(angle) * dialRadius;
      dialPositions[i * 3 + 1] = Math.sin(angle) * dialRadius;
      dialPositions[i * 3 + 2] = 0;
    }
    const dialGeo = new THREE.BufferGeometry();
    dialGeo.setAttribute('position', new THREE.BufferAttribute(dialPositions, 3));
    const dialMat = new THREE.PointsMaterial({
      color: 0x27272a,
      size: 0.028,
      transparent: true,
      opacity: 0.45,
      sizeAttenuation: true
    });
    this.dialPoints = new THREE.Points(dialGeo, dialMat);
    this.filamentGroup.add(this.dialPoints);

    // Central Geodesic Core (Faceted Platinum Polyhedron + Counter-Rotating Wireframe Cage)
    this.coreCluster = new THREE.Group();

    const corePolyGeo = new THREE.IcosahedronGeometry(0.36, 1);
    this.coreMesh = new THREE.Mesh(corePolyGeo, this.platinumMaterial);

    const cageGeo = new THREE.IcosahedronGeometry(0.56, 1);
    const cageEdges = new THREE.EdgesGeometry(cageGeo);
    this.cageLines = new THREE.LineSegments(cageEdges, this.wireMaterial);

    // Subtle vertex dots on the geodesic cage
    const cageVertices = cageGeo.attributes.position.array;
    const cageDotsGeo = new THREE.BufferGeometry();
    cageDotsGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(cageVertices), 3));
    const cageDotsMat = new THREE.PointsMaterial({
      color: 0x18181b,
      size: 0.035,
      transparent: true,
      opacity: 0.5
    });
    this.cageDots = new THREE.Points(cageDotsGeo, cageDotsMat);
    this.cageLines.add(this.cageDots);

    this.coreCluster.add(this.coreMesh, this.cageLines);

    // Initial architectural tilt
    this.outerGroup.rotation.set(0.35, 0.2, 0);
    this.middleGroup.rotation.set(-0.4, 0.5, 0.2);
    this.innerGroup.rotation.set(0.2, -0.3, 0.6);
    this.filamentGroup.rotation.set(1.1, 0.25, -0.3);

    this.gyroGroup.add(
      this.outerGroup,
      this.middleGroup,
      this.innerGroup,
      this.filamentGroup,
      this.coreCluster
    );
  }

  createParticleWaveGrid() {
    const sizeX = this.isMobile ? 32 : 64;
    const sizeZ = this.isMobile ? 28 : 48;
    const spacing = this.isMobile ? 0.48 : 0.38;

    this.gridSizeX = sizeX;
    this.gridSizeZ = sizeZ;
    this.particleCount = sizeX * sizeZ;
    this.particleGeometry = new THREE.BufferGeometry();

    const positions = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);

    const centerInk = new THREE.Color(0x18181b);
    const edgeMist = new THREE.Color(0xd4d4d8);

    let index = 0;
    const halfWidth = ((sizeX - 1) * spacing) / 2;
    const halfDepth = ((sizeZ - 1) * spacing) / 2;
    const maxRadius = Math.sqrt(halfWidth * halfWidth + halfDepth * halfDepth);

    for (let x = 0; x < sizeX; x++) {
      for (let z = 0; z < sizeZ; z++) {
        const i3 = index * 3;
        const px = x * spacing - halfWidth;
        const pz = z * spacing - halfDepth;

        positions[i3] = px;
        positions[i3 + 1] = 0;
        positions[i3 + 2] = pz;

        const dist = Math.sqrt(px * px + pz * pz) / maxRadius;
        const smoothDist = Math.min(Math.pow(dist, 1.15), 1.0);
        const lerpedColor = centerInk.clone().lerp(edgeMist, smoothDist);

        colors[i3] = lerpedColor.r;
        colors[i3 + 1] = lerpedColor.g;
        colors[i3 + 2] = lerpedColor.b;

        index++;
      }
    }

    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.particleTexture = this.createParticleTexture();

    this.particleMaterial = new THREE.PointsMaterial({
      color: 0x27272a,
      size: this.isMobile ? 0.048 : 0.038,
      sizeAttenuation: true,
      depthWrite: false,
      transparent: true,
      opacity: 0.34,
      blending: THREE.NormalBlending,
      vertexColors: true,
      map: this.particleTexture
    });

    this.particleGrid = new THREE.Points(this.particleGeometry, this.particleMaterial);
    this.particleGrid.position.y = this.currentWaveElevation;
    this.scene.add(this.particleGrid);
  }

  // Subtle floating spatial depth markers for parallax richness
  createAmbientDepthNodes() {
    const count = this.isMobile ? 14 : 28;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    this.ambientOffsets = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 7;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1.5;
      this.ambientOffsets[i] = Math.random() * Math.PI * 2;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x52525b,
      size: 0.042,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      map: this.particleTexture
    });

    this.ambientPoints = new THREE.Points(geo, mat);
    this.scene.add(this.ambientPoints);
  }

  setSection(index) {
    if (index >= 0 && index < this.sectionConfigs.length) {
      this.activeSection = index;
    }
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.adjustForDevice();

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  onMouseMove(event) {
    this.targetMouseX = event.clientX / this.width - 0.5;
    this.targetMouseY = event.clientY / this.height - 0.5;
  }

  onScroll() {
    this.targetScrollY = window.scrollY || 0;
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));

    const elapsedTime = this.clock.getElapsedTime();
    const config = this.sectionConfigs[this.activeSection];

    // Smooth scroll interpolation & velocity
    const prevScroll = this.scrollY;
    this.scrollY += (this.targetScrollY - this.scrollY) * 0.08;
    this.scrollVelocity = (this.scrollY - prevScroll) * 0.002;
    const normalizedScroll = this.scrollY / Math.max(window.innerHeight, 1);

    // Camera & state damping
    const lerpSpeed = 0.032;
    this.currentCamPos.lerp(config.camPos, lerpSpeed);
    this.currentLookAt.lerp(config.lookAt, lerpSpeed);
    this.camera.position.copy(this.currentCamPos);

    this.mouseX += (this.targetMouseX - this.mouseX) * 0.055;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.055;

    // Subtle parallax camera response
    this.camera.position.x += this.mouseX * 0.35;
    this.camera.position.y += -this.mouseY * 0.32;
    this.camera.lookAt(this.currentLookAt);

    // Interactive specular light follows cursor
    this.mouseLight.position.x = this.mouseX * 7.0;
    this.mouseLight.position.y = -this.mouseY * 5.0 + 1.0;
    this.mouseLight.position.z = 2.6;

    // Core position, scale & harmonic spread interpolation
    this.currentCorePos.lerp(config.corePos, lerpSpeed);
    this.currentCoreScale += (config.coreScale - this.currentCoreScale) * lerpSpeed;
    this.currentMorphIntensity += (config.morphIntensity - this.currentMorphIntensity) * lerpSpeed;
    this.currentGyroSpeed += (config.gyroSpeed - this.currentGyroSpeed) * lerpSpeed;
    this.currentWaveElevation += (config.waveElevation - this.currentWaveElevation) * lerpSpeed;
    this.currentRingSpread += (config.ringSpread - this.currentRingSpread) * lerpSpeed;

    // Gentle floating levitation on the sculpture
    const floatOffset = this.prefersReducedMotion ? 0 : Math.sin(elapsedTime * 0.9) * 0.07;
    this.gyroGroup.position.set(
      this.currentCorePos.x + this.mouseX * 0.18,
      this.currentCorePos.y + floatOffset - this.mouseY * 0.14,
      this.currentCorePos.z
    );
    this.gyroGroup.scale.setScalar(this.currentCoreScale);

    // Dynamic ring expansion / breathing per section
    this.outerGroup.scale.setScalar(this.currentRingSpread);
    this.middleGroup.scale.setScalar(1 + (this.currentRingSpread - 1) * 0.6);
    this.filamentGroup.scale.setScalar(this.currentRingSpread * 1.02);

    // Smooth lighting & color transitions
    const colorLerpSpeed = 0.025;
    this.keyLight.color.lerp(config.keyLightColor, colorLerpSpeed);
    this.fillLight.color.lerp(config.fillLightColor, colorLerpSpeed);
    this.rimLight.color.lerp(config.rimLightColor, colorLerpSpeed);
    this.particleMaterial.color.lerp(config.particleColor, colorLerpSpeed);

    // Kinetic rotation coupled with time + scroll progress + mouse tilt
    const motionFactor = this.prefersReducedMotion ? 0.1 : 1.0;
    const gSpeed = this.currentGyroSpeed * motionFactor;
    const scrollPhase = normalizedScroll * 0.65;

    this.outerGroup.rotation.x = 0.35 + elapsedTime * 0.12 * gSpeed + scrollPhase * 0.5 + this.mouseY * 0.2;
    this.outerGroup.rotation.y = 0.2 + elapsedTime * 0.08 * gSpeed + this.mouseX * 0.25;

    this.middleGroup.rotation.y = 0.5 + elapsedTime * 0.18 * gSpeed - scrollPhase * 0.7;
    this.middleGroup.rotation.z = 0.2 + elapsedTime * 0.1 * gSpeed + this.mouseX * 0.15;

    this.innerGroup.rotation.z = 0.6 + elapsedTime * 0.24 * gSpeed + scrollPhase * 0.9;
    this.innerGroup.rotation.x = 0.2 - elapsedTime * 0.14 * gSpeed - this.mouseY * 0.2;

    this.filamentGroup.rotation.z = -elapsedTime * 0.07 * gSpeed - scrollPhase * 0.4;
    this.filamentGroup.rotation.x = 1.15 + Math.sin(elapsedTime * 0.3) * 0.08;

    // Inner faceted core & geodesic cage counter-rotation
    this.coreMesh.rotation.y = elapsedTime * 0.25 * motionFactor + scrollPhase;
    this.coreMesh.rotation.x = elapsedTime * 0.16 * motionFactor;
    this.cageLines.rotation.y = -elapsedTime * 0.18 * motionFactor - scrollPhase * 0.5;
    this.cageLines.rotation.z = elapsedTime * 0.12 * motionFactor;

    // Subtle breathing pulse on inner core
    const corePulse = 1 + Math.sin(elapsedTime * 1.8) * 0.035 * motionFactor;
    this.coreMesh.scale.setScalar(corePulse);

    // Topographic Silk Wave Field with Interactive Cursor Ripple
    this.particleGrid.position.y = this.currentWaveElevation;
    this.particleGrid.rotation.y = this.mouseX * 0.06;

    if (!this.prefersReducedMotion) {
      const time = elapsedTime * 0.65;
      const positions = this.particleGeometry.attributes.position.array;

      // Cursor projected into wave coordinates
      const cursorWorldX = this.mouseX * 9.0;
      const cursorWorldZ = this.mouseY * 6.0 + 1.2;

      for (let i = 0; i < this.particleCount; i++) {
        const i3 = i * 3;
        const px = positions[i3];
        const pz = positions[i3 + 2];

        // Layered harmonic interference waves
        const wave1 = Math.sin(px * 0.26 + time + normalizedScroll * 0.8) * Math.cos(pz * 0.24 + time * 0.8) * 0.36;
        const wave2 = Math.sin((px + pz) * 0.14 - time * 1.15) * 0.18;
        const wave3 = Math.cos(Math.sqrt(px * px + pz * pz) * 0.32 - time * 0.9) * 0.16;

        // Interactive cursor ripple (Gaussian bell curve + concentric ripple)
        const dx = px - cursorWorldX;
        const dz = pz - cursorWorldZ;
        const distSq = dx * dx + dz * dz;
        const cursorInfluence = Math.exp(-distSq * 0.28) * Math.cos(Math.sqrt(distSq) * 2.2 - time * 3.0) * 0.26;

        positions[i3 + 1] = (wave1 + wave2 + wave3) * this.currentMorphIntensity + cursorInfluence;
      }

      this.particleGeometry.attributes.position.needsUpdate = true;

      // Drift ambient depth nodes
      if (this.ambientPoints) {
        this.ambientPoints.rotation.y = elapsedTime * 0.02 + this.mouseX * 0.08;
        this.ambientPoints.position.y = (normalizedScroll % 2) * 0.15 - this.mouseY * 0.15;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onResizeBound);
    window.removeEventListener('mousemove', this.onMouseMoveBound);
    window.removeEventListener('scroll', this.onScrollBound);

    this.particleGeometry.dispose();
    this.particleGrid.material.dispose();
    if (this.particleTexture) this.particleTexture.dispose();

    this.gyroGroup.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) object.material.dispose();
    });

    this.renderer.dispose();
  }
}
