/**
 * Environment.js — Ground, sky, fog, and simplified vegetation.
 */

import * as THREE from 'three';

export class EnvironmentBuilder {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.trees = [];
  }

  build() {
    this.riverPoints = [
      new THREE.Vector3(-65, 0, 10),
      new THREE.Vector3(-45, 0, 22),
      new THREE.Vector3(-25, 0, 36),
      new THREE.Vector3(-12, 0, 44),
      new THREE.Vector3(0,   0, 50),
      new THREE.Vector3(14,  0, 56),
      new THREE.Vector3(28,  0, 63),
      new THREE.Vector3(60,  0, 76),
    ];
    this.riverCurve = new THREE.CatmullRomCurve3(this.riverPoints);
    this.sampledRiverPoints = this.riverCurve.getPoints(60);

    this.createGround();
    this.createSky();
    this.createStars();
    this.createMoon();
    this.createFog();
    this.createTrees();
    this.createDistantBuildings();
  }

  getRiverDistance(x, z) {
    let minDist = Infinity;
    for (let i = 0; i < this.sampledRiverPoints.length; i++) {
      const p = this.sampledRiverPoints[i];
      const d = Math.hypot(x - p.x, z - p.z);
      if (d < minDist) minDist = d;
    }
    return minDist;
  }

  createGround() {
    const size = this.config.environment.groundSize;
    // High-resolution subdivided terrain grid to seamlessly carve the river valley
    const geo = new THREE.PlaneGeometry(size, size, 120, 120);
    geo.rotateX(-Math.PI / 2);

    const posAttr = geo.attributes.position;
    const vertexCount = posAttr.count;

    for (let i = 0; i < vertexCount; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);
      const dist = this.getRiverDistance(vx, vz);

      // Carve natural river valley channel (16m wide corridor)
      if (dist < 8.0) {
        const norm = dist / 8.0;
        const dip = -2.2 * Math.cos(norm * Math.PI * 0.5);
        posAttr.setY(i, dip - 0.05);
      } else {
        posAttr.setY(i, -0.05);
      }
    }

    posAttr.needsUpdate = true;
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      color: this.config.environment.groundColor,
      roughness: 0.9,
      metalness: 0.0,
    });
    const ground = new THREE.Mesh(geo, mat);
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.ground = ground;
  }

  createSky() {
    // Rich twilight gradient sky dome
    const skyGeo = new THREE.SphereGeometry(220, 32, 16);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x0a162e) },
        bottomColor: { value: new THREE.Color(0x244474) },
        offset: { value: 25 },
        exponent: { value: 0.5 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyMesh);
  }

  createStars() {
    const starCount = 800;
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      // Place stars on upper dome (radius 200)
      const u = Math.random();
      const v = Math.random() * 0.7 + 0.1; // keep above horizon
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);

      const r = 200;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.2,
      transparent: true,
      opacity: 0.85,
    });

    this.starPoints = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starPoints);
  }

  createMoon() {
    // Beautiful glowing crescent moon in the night sky
    const moonGroup = new THREE.Group();
    moonGroup.position.set(-65, 80, -90);

    const moonGeo = new THREE.SphereGeometry(3.5, 24, 24);
    const moonMat = new THREE.MeshBasicMaterial({
      color: 0xfff9e6,
    });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moonGroup.add(moon);

    // Soft moon aura glow sprite
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(230, 240, 255, 0.9)');
    grad.addColorStop(0.3, 'rgba(180, 210, 255, 0.4)');
    grad.addColorStop(0.7, 'rgba(120, 160, 230, 0.1)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      color: 0xadc8f0,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const moonGlow = new THREE.Sprite(spriteMat);
    moonGlow.scale.set(24, 24, 1);
    moonGroup.add(moonGlow);

    this.moonGroup = moonGroup;
    this.scene.add(moonGroup);
  }

  createFog() {
    this.scene.fog = new THREE.Fog(
      0x192b4a,
      this.config.environment.fogNear,
      this.config.environment.fogFar
    );
  }

  createTrees() {
    const count = this.config.environment.treeCount;
    const treeGroup = new THREE.Group();
    treeGroup.name = 'trees';

    // Predefine positions to avoid placing on roads/mosque
    const positions = [];
    for (let i = 0; i < count; i++) {
      let x, z;
      let valid = false;
      let attempts = 0;
      while (!valid && attempts < 50) {
        x = (Math.random() - 0.5) * 100;
        z = (Math.random() - 0.5) * 100;
        // Avoid roads (within 6m of x=0 axis and z=0 axis near center)
        const onMainRoad = Math.abs(x) < 6 && z > -45 && z < 45;
        const onEastRoad = Math.abs(z) < 6 && x > -5 && x < 40;
        const onRoundabout = Math.hypot(x - 3.6, z) < 8.5;
        const onRiver = this.getRiverDistance(x, z) < 7.0;
        valid = !onMainRoad && !onEastRoad && !onMosque && !onRoundabout && !onRiver;
        attempts++;
      }
      if (valid) positions.push({ x, z });
    }

    positions.forEach(pos => {
      const tree = this.createTree();
      const scale = 0.7 + Math.random() * 0.8;
      tree.scale.set(scale, scale, scale);
      tree.position.set(pos.x, 0, pos.z);
      tree.rotation.y = Math.random() * Math.PI * 2;
      treeGroup.add(tree);
      this.trees.push(tree);
    });

    this.scene.add(treeGroup);
  }

  createTree() {
    const tree = new THREE.Group();

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.15, 0.25, 3, 6);
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x4a3520,
      roughness: 0.9,
    });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    tree.add(trunk);

    // Crown layers (cone shapes for a tropical look)
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0x1a4a2a,
      roughness: 0.85,
    });

    const layers = [
      { y: 4.5, radius: 2.2, height: 3 },
      { y: 5.5, radius: 1.6, height: 2.5 },
      { y: 6.3, radius: 1.0, height: 2 },
    ];

    layers.forEach(l => {
      const geo = new THREE.ConeGeometry(l.radius, l.height, 7);
      const mesh = new THREE.Mesh(geo, crownMat);
      mesh.position.y = l.y;
      mesh.castShadow = true;
      tree.add(mesh);
    });

    return tree;
  }

  createDistantBuildings() {
    // Simple box buildings in the distance for context
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.9,
    });

    const buildingPositions = [
      { x: 30, z: -30, w: 5, h: 4, d: 6 },
      { x: 35, z: 15, w: 6, h: 3, d: 5 },
      { x: -35, z: 10, w: 7, h: 3.5, d: 5 },
      { x: -30, z: -35, w: 5, h: 3, d: 4 },
      { x: 20, z: -40, w: 4, h: 3, d: 6 },
      { x: -25, z: 25, w: 6, h: 3, d: 5 },
      { x: 15, z: 35, w: 5, h: 3.5, d: 7 },
      { x: -15, z: 35, w: 7, h: 2.5, d: 4 },
    ];

    buildingPositions.forEach(b => {
      const geo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const mesh = new THREE.Mesh(geo, buildingMat);
      mesh.position.set(b.x, b.h / 2, b.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);

      // Roof
      const roofGeo = new THREE.BoxGeometry(b.w + 0.6, 0.15, b.d + 0.6);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.set(b.x, b.h + 0.07, b.z);
      this.scene.add(roof);
    });
  }

  setDayMode(isDay) {
    const sky = this.skyMesh;
    if (!sky) return;
    if (isDay) {
      sky.material.uniforms.topColor.value.set(0x4a8ec2);
      sky.material.uniforms.bottomColor.value.set(0xc8d8e8);
      this.scene.fog.color.set(0xb8c8d8);
      this.ground.material.color.set(0x386138);
      if (this.starPoints) this.starPoints.visible = false;
      if (this.moonGroup) this.moonGroup.visible = false;
    } else {
      sky.material.uniforms.topColor.value.set(0x0a162e);
      sky.material.uniforms.bottomColor.value.set(0x244474);
      this.scene.fog.color.set(0x192b4a);
      this.ground.material.color.set(0x1d3624);
      if (this.starPoints) this.starPoints.visible = true;
      if (this.moonGroup) this.moonGroup.visible = true;
    }
  }
}
