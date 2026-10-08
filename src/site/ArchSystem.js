/**
 * ArchSystem.js — Roadside Decorative Lighting System (Lampu Kanan-Kiri Jalan).
 *
 * Requirements:
 *  - Removed overhead semi-circular bamboo arches (hapus bambu setengah lingkaran).
 *  - Lights placed along the left and right sides of the road (di kanan kiri jalan).
 *  - Bamboo posts on left & right roadside with spiral string lights & top lanterns.
 *  - Continuous catenary festoon string lights connecting along the roadside from post to post.
 *  - Monochromatic light theme (starting with warm yellow / kuning), switchable via button.
 */

import * as THREE from 'three';

export class ArchSystem {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.posts = [];
    this.lightingManager = null;
    this.glowTexture = null;

    // Default decorative color (Kuning Hangat)
    this.currentColorHex = (this.config.lighting && this.config.lighting.decorativeColor) || 0xffbe3b;
  }

  setLightingManager(lm) {
    this.lightingManager = lm;
    if (lm && lm.currentDecorativeColor) {
      this.currentColorHex = lm.currentDecorativeColor.getHex();
    }
  }

  build() {
    const layout = this.config.layout;
    const roadWidth = this.config.road.width;
    const curbW = this.config.road.curbWidth;

    // Half span distance from road centerline to roadside posts
    const halfWidth = roadWidth / 2 + curbW + 0.35; // ~4.15m from centerline

    // 1. Main road — North section (z = -30, -25, -20, -15, -10)
    const northPoles = layout.poles.mainRoad
      .filter(p => p.type === 'arch' && p.z < 0)
      .sort((a, b) => a.z - b.z); // -30 to -10

    this.createRoadsideRun(northPoles, halfWidth, 'north', false);

    // 2. Main road — South section (z = 10, 15, 20, 25, 30)
    const southPoles = layout.poles.mainRoad
      .filter(p => p.type === 'arch' && p.z > 0)
      .sort((a, b) => a.z - b.z); // 10 to 30

    this.createRoadsideRun(southPoles, halfWidth, 'south', false);

    // 3. East road (x = 8, 14, 20, 26, 32)
    const eastPoles = layout.poles.eastRoad
      .filter(p => p.type === 'arch')
      .sort((a, b) => a.x - b.x); // 8 to 32

    this.createRoadsideRun(eastPoles, halfWidth, 'east', true);
  }

  /**
   * Create roadside posts on left & right sides, plus festoon string lights between them.
   */
  createRoadsideRun(poles, halfWidth, runName, isEastRoad) {
    const bambooMat = new THREE.MeshStandardMaterial({
      color: 0xc89b3c, // Golden natural bamboo
      roughness: 0.72,
      metalness: 0.05,
    });

    const bambooDarkMat = new THREE.MeshStandardMaterial({
      color: 0x8a6422, // Dark bamboo nodes
      roughness: 0.7,
      metalness: 0.05,
    });

    const baseStoneMat = new THREE.MeshStandardMaterial({
      color: 0x5a6370,
      roughness: 0.85,
    });

    const postHeight = 4.6;

    // Track pole 3D coordinates for string lights along left & right sides
    const leftPoles = [];
    const rightPoles = [];

    poles.forEach((pole, index) => {
      let leftPos, rightPos;

      if (!isEastRoad) {
        // Main road runs along Z
        leftPos = { x: -halfWidth, y: 0, z: pole.z, side: -1 };
        rightPos = { x: halfWidth, y: 0, z: pole.z, side: 1 };
      } else {
        // East road runs along X
        leftPos = { x: pole.x, y: 0, z: -halfWidth, side: -1 };
        rightPos = { x: pole.x, y: 0, z: halfWidth, side: 1 };
      }

      // Strategic zone illumination: 2 key PointLights per road section provide unbroken coverage
      // without overloading WebGL fragment shaders with 30 overlapping point lights
      const hasRoadLight = (index === 1 || index === 3);

      // Build left roadside post
      this.createBambooPost(leftPos, postHeight, bambooMat, bambooDarkMat, baseStoneMat, isEastRoad, hasRoadLight);
      leftPoles.push(leftPos);

      // Build right roadside post
      this.createBambooPost(rightPos, postHeight, bambooMat, bambooDarkMat, baseStoneMat, isEastRoad, false);
      rightPoles.push(rightPos);
    });

    // Create festoon swag string lights connecting consecutive posts along roadside
    this.createFestoonLine(leftPoles, postHeight);
    this.createFestoonLine(rightPoles, postHeight);
  }

  /**
   * Create a single vertical roadside bamboo post with spiral lights and top lantern.
   */
  createBambooPost(pos, height, bambooMat, bambooDarkMat, baseStoneMat, isEastRoad, addPointLight = false) {
    const group = new THREE.Group();
    group.position.set(pos.x, 0, pos.z);
    group.name = `bamboo-post-${pos.x.toFixed(1)}-${pos.z.toFixed(1)}`;

    // 1. Base pedestal
    const baseGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.25, 12);
    const base = new THREE.Mesh(baseGeo, baseStoneMat);
    base.position.y = 0.125;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // 2. Main vertical bamboo pole
    const poleGeo = new THREE.CylinderGeometry(0.05, 0.07, height - 0.25, 8);
    const pole = new THREE.Mesh(poleGeo, bambooMat);
    pole.position.y = 0.25 + (height - 0.25) / 2;
    pole.castShadow = true;
    group.add(pole);

    // 3. Bamboo nodes/rings
    const nodeCount = 6;
    for (let i = 1; i <= nodeCount; i++) {
      const ny = 0.25 + (i / (nodeCount + 1)) * (height - 0.25);
      const ringGeo = new THREE.TorusGeometry(0.065, 0.015, 6, 12);
      const ring = new THREE.Mesh(ringGeo, bambooDarkMat);
      ring.position.y = ny;
      ring.rotation.x = Math.PI / 2;
      group.add(ring);
    }

    // 4. Diagonal bamboo brace (leaning away from road for ground stability)
    const braceLen = 1.8;
    const braceGeo = new THREE.CylinderGeometry(0.035, 0.045, braceLen, 6);
    const brace = new THREE.Mesh(braceGeo, bambooMat);
    if (!isEastRoad) {
      brace.position.set(pos.side * 0.45, 0.9, 0);
      brace.rotation.z = -pos.side * 0.45;
    } else {
      brace.position.set(0, 0.9, pos.side * 0.45);
      brace.rotation.x = pos.side * 0.45;
    }
    group.add(brace);

    // 5. Top cap & lantern sphere
    const capGeo = new THREE.CylinderGeometry(0.09, 0.05, 0.08, 8);
    const cap = new THREE.Mesh(capGeo, bambooDarkMat);
    cap.position.y = height + 0.04;
    group.add(cap);

    // Top Lantern Sphere
    const lanternMat = new THREE.MeshStandardMaterial({
      color: this.currentColorHex,
      roughness: 0.25,
      emissive: new THREE.Color(this.currentColorHex),
      emissiveIntensity: this.config.nightMode ? 2.5 : 0.2,
    });
    const lanternGeo = new THREE.SphereGeometry(0.14, 12, 12);
    const lantern = new THREE.Mesh(lanternGeo, lanternMat);
    lantern.position.y = height + 0.18;
    lantern.userData.isRoadsideLED = true;
    lantern.userData.ledColor = new THREE.Color(this.currentColorHex);
    lantern.userData.baseEmissiveIntensity = 2.5;
    group.add(lantern);

    if (this.lightingManager) {
      this.lightingManager.registerEmissiveMesh(lantern);
    }

    // Glow halo on top lantern
    const glowTex = this.getGlowTexture();
    const spriteMat = new THREE.SpriteMaterial({
      map: glowTex,
      color: new THREE.Color(this.currentColorHex),
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glowSprite = new THREE.Sprite(spriteMat);
    glowSprite.position.y = height + 0.18;
    glowSprite.scale.set(0.9, 0.9, 1);
    glowSprite.userData.baseScale = 0.9;
    glowSprite.userData.isRoadsideGlow = true;
    group.add(glowSprite);

    if (this.lightingManager) {
      this.lightingManager.registerGlowSprite(glowSprite);
    }

    // 6. Spiral string lights wrapping up the vertical bamboo pole
    this.createSpiralPoleLights(group, height);

    // 7. Soft downward point light on the roadside (only on key strategic posts)
    if (addPointLight) {
      const pointLight = new THREE.PointLight(
        this.currentColorHex,
        this.config.nightMode ? 2.4 : 0,
        18,
        1.5
      );
      pointLight.position.set(0, height * 0.85, 0);
      pointLight.userData.baseIntensity = 2.4;
      pointLight.userData.isRoadsideLight = true;
      group.add(pointLight);

      if (this.lightingManager) {
        this.lightingManager.registerDecorativeLight(pointLight);
      }
    }

    this.scene.add(group);
    this.posts.push(group);
  }

  /**
   * Spiral string lights wrapping around vertical bamboo pole.
   */
  createSpiralPoleLights(group, height) {
    const totalDots = 24;
    const turns = 4.5;
    const poleR = 0.09;
    const startY = 0.35;
    const endY = height - 0.1;

    const wirePoints = [];

    for (let i = 0; i <= totalDots; i++) {
      const t = i / totalDots;
      const py = startY + t * (endY - startY);
      const angle = t * turns * Math.PI * 2;
      const px = Math.cos(angle) * poleR;
      const pz = Math.sin(angle) * poleR;

      wirePoints.push(new THREE.Vector3(px, py, pz));

      // LED dot
      const dotMat = new THREE.MeshStandardMaterial({
        color: this.currentColorHex,
        roughness: 0.2,
        emissive: new THREE.Color(this.currentColorHex),
        emissiveIntensity: this.config.nightMode ? 2.4 : 0.2,
      });
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), dotMat);
      dot.position.set(px, py, pz);
      dot.userData.isRoadsideLED = true;
      dot.userData.ledColor = new THREE.Color(this.currentColorHex);
      dot.userData.baseEmissiveIntensity = 2.4;
      group.add(dot);

      if (this.lightingManager) {
        this.lightingManager.registerEmissiveMesh(dot);
      }
    }

    // Black wire wrapping pole
    if (wirePoints.length > 2) {
      const wireCurve = new THREE.CatmullRomCurve3(wirePoints);
      const wireGeo = new THREE.TubeGeometry(wireCurve, 30, 0.005, 4, false);
      const wireMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });
      group.add(new THREE.Mesh(wireGeo, wireMat));
    }
  }

  /**
   * Catenary festoon string lights connecting along the roadside from post to post.
   */
  createFestoonLine(poles, postHeight) {
    if (poles.length < 2) return;

    const topY = postHeight + 0.1;

    for (let i = 0; i < poles.length - 1; i++) {
      const p1 = poles[i];
      const p2 = poles[i + 1];

      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const spanLen = Math.hypot(dx, dz);
      const sagAmount = Math.min(0.65, spanLen * 0.12); // Natural catenary sag

      const wirePoints = [];
      const segments = 16;

      for (let s = 0; s <= segments; s++) {
        const t = s / segments;
        const wx = p1.x + dx * t;
        const wz = p1.z + dz * t;
        // Parabolic catenary sag curve
        const wy = topY - 4 * sagAmount * t * (1 - t);

        wirePoints.push(new THREE.Vector3(wx, wy, wz));
      }

      const catCurve = new THREE.CatmullRomCurve3(wirePoints);

      // Catenary black cable
      const cableGeo = new THREE.TubeGeometry(catCurve, segments, 0.006, 4, false);
      const cableMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
      const cable = new THREE.Mesh(cableGeo, cableMat);
      this.scene.add(cable);

      // Hanging LED bulbs along the catenary wire
      const bulbCount = 10;
      for (let b = 1; b < bulbCount; b++) {
        const t = b / bulbCount;
        const pt = catCurve.getPointAt(t);

        // Hanging socket
        const socketGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.04, 6);
        const socketMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.7 });
        const socket = new THREE.Mesh(socketGeo, socketMat);
        socket.position.set(pt.x, pt.y - 0.02, pt.z);
        this.scene.add(socket);

        // Glowing bulb
        const bulbMat = new THREE.MeshStandardMaterial({
          color: this.currentColorHex,
          roughness: 0.25,
          emissive: new THREE.Color(this.currentColorHex),
          emissiveIntensity: this.config.nightMode ? 2.4 : 0.2,
        });
        const bulbGeo = new THREE.SphereGeometry(0.038, 8, 8);
        const bulb = new THREE.Mesh(bulbGeo, bulbMat);
        bulb.position.set(pt.x, pt.y - 0.05, pt.z);
        bulb.userData.isRoadsideLED = true;
        bulb.userData.ledColor = new THREE.Color(this.currentColorHex);
        bulb.userData.baseEmissiveIntensity = 2.4;
        this.scene.add(bulb);

        if (this.lightingManager) {
          this.lightingManager.registerEmissiveMesh(bulb);
        }
      }
    }
  }

  getGlowTexture() {
    if (this.glowTexture) return this.glowTexture;

    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.5)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    this.glowTexture = new THREE.CanvasTexture(canvas);
    return this.glowTexture;
  }
}
