import * as THREE from 'three';

export class Cyber3DScene {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    
    // Canvas dimensions
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.activeSection = 0;
    
    // Mouse interaction tracking
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    
    // Section parameters (Editorial Minimalist Architecture in White & Grays)
    this.sectionConfigs = [
      { // 0. Home: Deep Titanium & Clean Neutral Platinum
        camPos: new THREE.Vector3(0, 0.4, 5.5),
        lookAt: new THREE.Vector3(0, 0, 0),
        corePos: new THREE.Vector3(1.5, 0, 0),
        coreScale: 1.0,
        morphIntensity: 0.9,
        gyroSpeed: 0.9,
        particleColor: new THREE.Color(0x27272a),
        keyLightColor: new THREE.Color(0xffffff),
        fillLightColor: new THREE.Color(0xd4d4d8),
        rimLightColor: new THREE.Color(0xf4f4f5)
      },
      { // 1. Projects: Technical Graphite & Slate
        camPos: new THREE.Vector3(-2.2, 2.4, 6.2),
        lookAt: new THREE.Vector3(0.6, -0.4, 0),
        corePos: new THREE.Vector3(2.2, -1.2, -1.0),
        coreScale: 0.75,
        morphIntensity: 1.4,
        gyroSpeed: 1.3,
        particleColor: new THREE.Color(0x334155),
        keyLightColor: new THREE.Color(0xffffff),
        fillLightColor: new THREE.Color(0xcbd5e1),
        rimLightColor: new THREE.Color(0x94a3b8)
      },
      { // 2. Education: Warm Tungsten & Architecture Stone
        camPos: new THREE.Vector3(1.8, -1.2, 5.8),
        lookAt: new THREE.Vector3(-0.6, 0.2, 0),
        corePos: new THREE.Vector3(-1.8, 0.6, 0),
        coreScale: 0.85,
        morphIntensity: 0.6,
        gyroSpeed: 0.6,
        particleColor: new THREE.Color(0x44403c),
        keyLightColor: new THREE.Color(0xffffff),
        fillLightColor: new THREE.Color(0xd6d3d1),
        rimLightColor: new THREE.Color(0xa8a29e)
      },
      { // 3. Skills: Cold Cobalt Graphite & Deep Steel
        camPos: new THREE.Vector3(0, -2.5, 4.6),
        lookAt: new THREE.Vector3(0, 0.2, 0),
        corePos: new THREE.Vector3(0, 0.2, -1.0),
        coreScale: 1.25,
        morphIntensity: 1.6,
        gyroSpeed: 1.1,
        particleColor: new THREE.Color(0x1e293b),
        keyLightColor: new THREE.Color(0xffffff),
        fillLightColor: new THREE.Color(0x94a3b8),
        rimLightColor: new THREE.Color(0x64748b)
      },
      { // 4. Contact: Sage Charcoal & Pale Silver
        camPos: new THREE.Vector3(0, 4.0, 7.8),
        lookAt: new THREE.Vector3(0, 0.5, 0),
        corePos: new THREE.Vector3(0, 1.4, 0),
        coreScale: 0.55,
        morphIntensity: 0.5,
        gyroSpeed: 0.4,
        particleColor: new THREE.Color(0x134e4a),
        keyLightColor: new THREE.Color(0xffffff),
        fillLightColor: new THREE.Color(0xccfbf1),
        rimLightColor: new THREE.Color(0x99f6e4)
      }
    ];

    // Current interpolation state
    this.currentCamPos = this.sectionConfigs[0].camPos.clone();
    this.currentLookAt = this.sectionConfigs[0].lookAt.clone();
    this.currentCorePos = this.sectionConfigs[0].corePos.clone();
    this.currentCoreScale = this.sectionConfigs[0].coreScale;
    this.currentMorphIntensity = this.sectionConfigs[0].morphIntensity;
    this.currentGyroSpeed = this.sectionConfigs[0].gyroSpeed;
    
    this.isMobile = this.width < 1024;
    this.adjustForDevice();
    
    this.init();
  }

  adjustForDevice() {
    this.isMobile = this.width < 1024;
    
    if (this.isMobile) {
      this.sectionConfigs.forEach((config) => {
        config.corePos.set(0, 0.2, -1.8);
        config.coreScale *= 0.65;
        config.morphIntensity *= 0.7;
      });
    }
  }

  // Generate crisp dot texture for light theme
  createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(24, 24, 27, 0.95)');
    gradient.addColorStop(0.4, 'rgba(63, 63, 70, 0.6)');
    gradient.addColorStop(0.8, 'rgba(161, 161, 170, 0.15)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    
    return new THREE.CanvasTexture(canvas);
  }

  init() {
    // 1. Scene
    this.scene = new THREE.Scene();
    
    // 2. Perspective Camera
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
    this.camera.position.copy(this.currentCamPos);
    this.camera.lookAt(this.currentLookAt);
    
    // 3. WebGL Renderer with Alpha transparency for white & gray canvas
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    
    // 4. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);
    
    this.keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    this.keyLight.position.set(5, 5, 4);
    this.scene.add(this.keyLight);
    
    this.fillLight = new THREE.DirectionalLight(0xd4d4d8, 1.4);
    this.fillLight.position.set(-5, 3, 2);
    this.scene.add(this.fillLight);

    this.rimLight = new THREE.DirectionalLight(0xf4f4f5, 1.6);
    this.rimLight.position.set(0, -3, -5);
    this.scene.add(this.rimLight);

    // Interactive Mouse PointLight
    this.mouseLight = new THREE.PointLight(0xffffff, 5.0, 15);
    this.mouseLight.position.set(0, 0, 2);
    this.scene.add(this.mouseLight);

    // 5. Build Concentric Gyroscope Core
    this.createGyroscope();

    // 6. Build 3D Particle Wave Grid (Architectural Dot Matrix)
    this.createParticleWaveGrid();
    
    // Listeners
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    
    this.clock = new THREE.Clock();
    this.animate();
  }

  createGyroscope() {
    this.gyroGroup = new THREE.Group();
    this.gyroGroup.position.copy(this.currentCorePos);
    this.scene.add(this.gyroGroup);

    // Material: Brushed Dark Titanium / Obsidian Steel
    const metalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x18181b,
      metalness: 0.92,
      roughness: 0.18,
      clearcoat: 0.9,
      clearcoatRoughness: 0.05,
      reflectivity: 0.95
    });

    const segments = this.isMobile ? 50 : 80;
    const outerGeo = new THREE.TorusGeometry(1.8, 0.045, 16, segments);
    this.outerRing = new THREE.Mesh(outerGeo, metalMaterial);
    
    const middleGeo = new THREE.TorusGeometry(1.4, 0.038, 16, segments);
    this.middleRing = new THREE.Mesh(middleGeo, metalMaterial);

    const innerGeo = new THREE.TorusGeometry(1.0, 0.03, 16, segments);
    this.innerRing = new THREE.Mesh(innerGeo, metalMaterial);

    this.outerGroup = new THREE.Group();
    this.middleGroup = new THREE.Group();
    this.innerGroup = new THREE.Group();

    this.outerGroup.add(this.outerRing);
    this.middleGroup.add(this.middleRing);
    this.innerGroup.add(this.innerRing);

    this.gyroGroup.add(this.outerGroup);
    this.gyroGroup.add(this.middleGroup);
    this.gyroGroup.add(this.innerGroup);

    const coreGeo = new THREE.SphereGeometry(0.08, 16, 16);
    this.coreMesh = new THREE.Mesh(coreGeo, metalMaterial);
    this.gyroGroup.add(this.coreMesh);
  }

  createParticleWaveGrid() {
    const sizeX = this.isMobile ? 25 : 50;
    const sizeZ = this.isMobile ? 25 : 50;
    const spacing = 0.55;
    
    this.particleCount = sizeX * sizeZ;
    this.particleGeometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);
    
    const baseCharcoal = new THREE.Color(0x18181b);
    const fadeSlate = new THREE.Color(0xa1a1aa);
    
    let index = 0;
    const halfWidth = (sizeX * spacing) / 2;
    const halfDepth = (sizeZ * spacing) / 2;

    for (let x = 0; x < sizeX; x++) {
      for (let z = 0; z < sizeZ; z++) {
        const i3 = index * 3;
        const px = x * spacing - halfWidth;
        const pz = z * spacing - halfDepth;
        const py = 0;
        
        positions[i3] = px;
        positions[i3 + 1] = py;
        positions[i3 + 2] = pz;
        
        const dist = Math.sqrt(px * px + pz * pz) / halfWidth;
        const lerpedColor = baseCharcoal.clone().lerp(fadeSlate, Math.min(dist, 1.0));
        
        colors[i3] = lerpedColor.r;
        colors[i3 + 1] = lerpedColor.g;
        colors[i3 + 2] = lerpedColor.b;
        
        index++;
      }
    }
    
    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    this.particleMaterial = new THREE.PointsMaterial({
      color: 0x27272a,
      size: this.isMobile ? 0.065 : 0.055,
      sizeAttenuation: true,
      depthWrite: false,
      transparent: true,
      opacity: 0.38,
      blending: THREE.NormalBlending,
      vertexColors: true,
      map: this.createGlowTexture()
    });
    
    this.particleGrid = new THREE.Points(this.particleGeometry, this.particleMaterial);
    this.particleGrid.position.y = -1.2;
    this.scene.add(this.particleGrid);
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
    this.targetMouseX = (event.clientX / this.width) - 0.5;
    this.targetMouseY = (event.clientY / this.height) - 0.5;
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    const elapsedTime = this.clock.getElapsedTime();
    const config = this.sectionConfigs[this.activeSection];
    
    const lerpSpeed = 0.035;
    this.currentCamPos.lerp(config.camPos, lerpSpeed);
    this.currentLookAt.lerp(config.lookAt, lerpSpeed);
    this.camera.position.copy(this.currentCamPos);
    
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;
    
    this.camera.position.x += this.mouseX * 0.4;
    this.camera.position.y -= this.mouseY * 0.4;
    
    this.camera.lookAt(this.currentLookAt);
    
    this.mouseLight.position.x = this.mouseX * 6.5;
    this.mouseLight.position.y = -this.mouseY * 4.5 + 0.5;
    this.mouseLight.position.z = 2.2;
    
    this.currentCorePos.lerp(config.corePos, lerpSpeed);
    this.currentCoreScale += (config.coreScale - this.currentCoreScale) * lerpSpeed;
    this.currentMorphIntensity += (config.morphIntensity - this.currentMorphIntensity) * lerpSpeed;
    this.currentGyroSpeed += (config.gyroSpeed - this.currentGyroSpeed) * lerpSpeed;
    
    this.gyroGroup.position.copy(this.currentCorePos);
    this.gyroGroup.scale.setScalar(this.currentCoreScale);
    
    const colorLerpSpeed = 0.025;
    this.keyLight.color.lerp(config.keyLightColor, colorLerpSpeed);
    this.fillLight.color.lerp(config.fillLightColor, colorLerpSpeed);
    this.rimLight.color.lerp(config.rimLightColor, colorLerpSpeed);
    
    this.particleMaterial.color.lerp(config.particleColor, colorLerpSpeed);
    
    const gSpeed = this.currentGyroSpeed;
    this.outerGroup.rotation.x = elapsedTime * 0.16 * gSpeed;
    this.middleGroup.rotation.y = elapsedTime * 0.22 * gSpeed;
    this.innerGroup.rotation.z = elapsedTime * 0.28 * gSpeed;
    
    this.coreMesh.scale.setScalar(1.0);
    
    const time = elapsedTime * 0.85;
    const positions = this.particleGeometry.attributes.position.array;
    
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      const px = positions[i3];
      const pz = positions[i3 + 2];
      
      const wave1 = Math.sin(px * 0.22 + time) * Math.cos(pz * 0.22 + time) * 0.45;
      const wave2 = Math.sin(px * 0.08 + time * 1.6) * 0.2;
      const wave3 = Math.cos(pz * 0.12 + time * 0.85) * 0.3;
      
      positions[i3 + 1] = (wave1 + wave2 + wave3) * this.currentMorphIntensity;
    }
    
    this.particleGeometry.attributes.position.needsUpdate = true;
    
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    
    this.particleGeometry.dispose();
    this.particleGrid.material.dispose();
    
    this.gyroGroup.traverse((object) => {
      if (object.isMesh) {
        object.geometry.dispose();
        object.material.dispose();
      }
    });
    
    this.renderer.dispose();
  }
}
