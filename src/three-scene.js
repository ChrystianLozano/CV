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
    
    // Section parameters (Apple/Tesla cinematic layout)
    // Camera coordinates fly *through* the wave field, and studio colors morph dynamically per section
    this.sectionConfigs = [
      { // 0. Home: Clean Silver / White (Neutral luxury)
        camPos: new THREE.Vector3(0, 0.4, 5.5),
        lookAt: new THREE.Vector3(0, 0, 0),
        corePos: new THREE.Vector3(1.4, 0, 0),
        coreScale: 1.0,
        morphIntensity: 1.0,
        gyroSpeed: 1.0,
        particleColor: new THREE.Color(0xffffff),
        keyLightColor: new THREE.Color(0xffffff),
        fillLightColor: new THREE.Color(0x88bbff), // Soft ice blue
        rimLightColor: new THREE.Color(0xffeedd)   // Soft gold highlight
      },
      { // 1. Projects: Cold Ice-Cyan & Deep Navy (Technical)
        camPos: new THREE.Vector3(-2.2, 2.5, 6.2),
        lookAt: new THREE.Vector3(0.6, -0.4, 0),
        corePos: new THREE.Vector3(2.2, -1.2, -1.0),
        coreScale: 0.75,
        morphIntensity: 1.8,
        gyroSpeed: 1.6,
        particleColor: new THREE.Color(0x3de6ff), // Electric cyan
        keyLightColor: new THREE.Color(0xd0f6ff),
        fillLightColor: new THREE.Color(0x0099ff),
        rimLightColor: new THREE.Color(0x002288)
      },
      { // 2. Education: Warm Copper / Gold (Humanist/Organic)
        camPos: new THREE.Vector3(1.8, -1.2, 5.8),
        lookAt: new THREE.Vector3(-0.6, 0.2, 0),
        corePos: new THREE.Vector3(-1.8, 0.6, 0),
        coreScale: 0.85,
        morphIntensity: 0.6,
        gyroSpeed: 0.5,
        particleColor: new THREE.Color(0xff9f3d), // Warm Amber
        keyLightColor: new THREE.Color(0xffebd2),
        fillLightColor: new THREE.Color(0xe67300),
        rimLightColor: new THREE.Color(0x330066)
      },
      { // 3. Specifications (Skills): Deep Cobalt & Neon Purple (Advanced Tech)
        camPos: new THREE.Vector3(0, -2.6, 4.6),
        lookAt: new THREE.Vector3(0, 0.2, 0),
        corePos: new THREE.Vector3(0, 0.2, -1.0),
        coreScale: 1.3,
        morphIntensity: 2.2,
        gyroSpeed: 1.2,
        particleColor: new THREE.Color(0xaa55ff), // Deep neon purple
        keyLightColor: new THREE.Color(0xfad2ff),
        fillLightColor: new THREE.Color(0x7f00ff),
        rimLightColor: new THREE.Color(0x0000ff)
      },
      { // 4. Contact: Emerald Green & Platinum (Sustainable/Future)
        camPos: new THREE.Vector3(0, 4.2, 8.0),
        lookAt: new THREE.Vector3(0, 0.5, 0),
        corePos: new THREE.Vector3(0, 1.4, 0),
        coreScale: 0.55,
        morphIntensity: 0.4,
        gyroSpeed: 0.3,
        particleColor: new THREE.Color(0x3dffaa), // Minty emerald green
        keyLightColor: new THREE.Color(0xe2ffe2),
        fillLightColor: new THREE.Color(0x00e676),
        rimLightColor: new THREE.Color(0x003311)
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
    
    // Mobile viewports: center the 3D element to serve as an elegant layout background
    if (this.isMobile) {
      this.sectionConfigs.forEach((config) => {
        config.corePos.set(0, 0.2, -1.8);
        config.coreScale *= 0.65;
        config.morphIntensity *= 0.7; // Dampen particle waves on mobile
      });
    }
  }

  // Generate glowing dot textures dynamically
  createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(245, 245, 247, 0.8)');
    gradient.addColorStop(0.7, 'rgba(134, 134, 139, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 16, 16);
    
    return new THREE.CanvasTexture(canvas);
  }

  init() {
    // 1. Scene
    this.scene = new THREE.Scene();
    
    // 2. Perspective Camera
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
    this.camera.position.copy(this.currentCamPos);
    this.camera.lookAt(this.currentLookAt);
    
    // 3. WebGL Renderer with Tone Mapping (crucial for physical materials)
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true, // Seamless overlay with CSS background
      powerPreference: "high-performance"
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    
    // 4. Studio Lighting Rig (Dynamic color targets mapped to scroll)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);
    
    // Main Studio Key-Light
    this.keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    this.keyLight.position.set(5, 5, 4);
    this.scene.add(this.keyLight);
    
    // Soft detuned fill light
    this.fillLight = new THREE.DirectionalLight(0x88bbff, 1.8);
    this.fillLight.position.set(-5, 3, 2);
    this.scene.add(this.fillLight);

    // Warm back rim light
    this.rimLight = new THREE.DirectionalLight(0xffeedd, 2.0);
    this.rimLight.position.set(0, -3, -5);
    this.scene.add(this.rimLight);

    // 5. Interactive Mouse PointLight (Casts shiny specularity on cursor move)
    this.mouseLight = new THREE.PointLight(0xffffff, 8.0, 15);
    this.mouseLight.position.set(0, 0, 2);
    this.scene.add(this.mouseLight);

    // 6. Build Concentric Gyroscope Core
    this.createGyroscope();

    // 7. Build 3D Particle Wave Field
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

    // Material: Highly polished titanium chrome (Apple M-series / Tesla hardware aesthetic)
    const metalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1d1d1f, // Space Gray
      metalness: 0.98,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      reflectivity: 1.0
    });

    // Create 3 Concentric Rings
    const outerGeo = new THREE.TorusGeometry(1.8, 0.045, 16, this.isMobile ? 50 : 80);
    this.outerRing = new THREE.Mesh(outerGeo, metalMaterial);
    
    const middleGeo = new THREE.TorusGeometry(1.4, 0.038, 16, this.isMobile ? 50 : 80);
    this.middleRing = new THREE.Mesh(middleGeo, metalMaterial);

    const innerGeo = new THREE.TorusGeometry(1.0, 0.03, 16, this.isMobile ? 50 : 80);
    this.innerRing = new THREE.Mesh(innerGeo, metalMaterial);

    // Add rings to detuned axes group
    this.outerGroup = new THREE.Group();
    this.middleGroup = new THREE.Group();
    this.innerGroup = new THREE.Group();

    this.outerGroup.add(this.outerRing);
    this.middleGroup.add(this.middleRing);
    this.innerGroup.add(this.innerRing);

    this.gyroGroup.add(this.outerGroup);
    this.gyroGroup.add(this.middleGroup);
    this.gyroGroup.add(this.innerGroup);

    // Center precision titanium bead (diameter 0.16 units)
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
    
    const baseWhite = new THREE.Color(0xffffff);
    const fadeSlate = new THREE.Color(0x32353e);
    
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
        
        // Base coloring decaying to edges
        const dist = Math.sqrt(px * px + pz * pz) / halfWidth;
        const lerpedColor = baseWhite.clone().lerp(fadeSlate, Math.min(dist, 1.0));
        
        colors[i3] = lerpedColor.r;
        colors[i3 + 1] = lerpedColor.g;
        colors[i3 + 2] = lerpedColor.b;
        
        index++;
      }
    }
    
    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // We use points material, whose color property acts as a multiplier tint
    this.particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: this.isMobile ? 0.075 : 0.065,
      sizeAttenuation: true,
      depthWrite: false,
      transparent: true,
      blending: THREE.AdditiveBlending,
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
    
    // 1. Smoothly fly camera to section target coordinates
    const lerpSpeed = 0.035;
    this.currentCamPos.lerp(config.camPos, lerpSpeed);
    this.currentLookAt.lerp(config.lookAt, lerpSpeed);
    this.camera.position.copy(this.currentCamPos);
    
    // 2. Cursor Parallax
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;
    
    this.camera.position.x += this.mouseX * 0.4;
    this.camera.position.y -= this.mouseY * 0.4;
    
    this.camera.lookAt(this.currentLookAt);
    
    // 3. Move the spotlight with the cursor
    this.mouseLight.position.x = this.mouseX * 6.5;
    this.mouseLight.position.y = -this.mouseY * 4.5 + 0.5;
    this.mouseLight.position.z = 2.2;
    
    // 4. Lerp Core positioning and scaling
    this.currentCorePos.lerp(config.corePos, lerpSpeed);
    this.currentCoreScale += (config.coreScale - this.currentCoreScale) * lerpSpeed;
    this.currentMorphIntensity += (config.morphIntensity - this.currentMorphIntensity) * lerpSpeed;
    this.currentGyroSpeed += (config.gyroSpeed - this.currentGyroSpeed) * lerpSpeed;
    
    this.gyroGroup.position.copy(this.currentCorePos);
    this.gyroGroup.scale.setScalar(this.currentCoreScale);
    
    // 5. Smooth Color Lerp (Studio lights & Core energy nodes & Particle grids)
    const colorLerpSpeed = 0.025; // Smooth color crossfades
    
    this.keyLight.color.lerp(config.keyLightColor, colorLerpSpeed);
    this.fillLight.color.lerp(config.fillLightColor, colorLerpSpeed);
    this.rimLight.color.lerp(config.rimLightColor, colorLerpSpeed);
    
    this.particleMaterial.color.lerp(config.particleColor, colorLerpSpeed);
    
    // 6. Spin Concentric Gyroscope Rings
    const gSpeed = this.currentGyroSpeed;
    this.outerGroup.rotation.x = elapsedTime * 0.18 * gSpeed;
    this.middleGroup.rotation.y = elapsedTime * 0.25 * gSpeed;
    this.innerGroup.rotation.z = elapsedTime * 0.32 * gSpeed;
    
    this.coreMesh.scale.setScalar(1.0);
    
    // 7. Animate 3D Particle Wave Field
    const time = elapsedTime * 0.9;
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
    
    // Render
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
