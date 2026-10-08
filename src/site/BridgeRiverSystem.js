/**
 * BridgeRiverSystem.js — Authentic Rural River & Wooden Bridge ("Jembatan Kayu HUT RI").
 *
 * Faithfully created from user reference photo:
 *  - Winding natural river / creek flowing under the road in the south.
 *  - Flowing water surface with gentle animated ripples.
 *  - Riverbed with natural stone revetments (batu kali) and lush riverside flora.
 *  - Rural timber bridge (Jembatan Kayu Ulin) with:
 *      * Longitudinal wooden runner planks for vehicle wheels (2 jalur papan ulin memanjang).
 *      * Heavy timber girders & pile bents in the river channel.
 *      * Stone masonry abutments and wing walls.
 *      * Red-and-White painted bridge guardrails.
 *      * Entry boundary blocks with "HUT RI" in bold red on the left approach block.
 *      * Tall spiral red-and-white festival flagpole (tiang umbul-umbul).
 *      * Rural utility power pole with transformer.
 */

import * as THREE from 'three';

export class BridgeRiverSystem {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.lightingManager = null;
    this.waterTexture = null;
    this.waterMesh = null;
  }

  setLightingManager(lm) {
    this.lightingManager = lm;
  }

  build() {
    const group = new THREE.Group();
    group.name = 'bridge-river-system';

    // 1. Natural River Channel, Water, and Flora
    this.createRiver(group);

    // 2. Rural Timber Bridge Structure (Jembatan Kayu)
    this.createBridge(group);

    // 3. HUT RI Monument Blocks, Festival Pole, and Utility Pole
    this.createApproachDecorations(group);

    this.scene.add(group);
  }

  // ==========================================
  // A. RIVER CHANNEL & FLOWING WATER
  // ==========================================
  createRiver(parentGroup) {
    const riverY = -0.42; // Water elevation: 0.48m below bridge deck, perfectly visible from all angles!
    const riverPoints = [
      new THREE.Vector3(-65, riverY, 10),
      new THREE.Vector3(-45, riverY, 22),
      new THREE.Vector3(-25, riverY, 36),
      new THREE.Vector3(-12, riverY, 44),
      new THREE.Vector3(0,   riverY, 50), // Under the bridge!
      new THREE.Vector3(14,  riverY, 56),
      new THREE.Vector3(28,  riverY, 63),
      new THREE.Vector3(60,  riverY, 76),
    ];

    this.riverCurve = new THREE.CatmullRomCurve3(riverPoints);
    const riverSamples = 80;
    const riverWidth = 13.5; // Broad, prominent 13.5m wide river water surface!

    // Build river water ribbon geometry
    const waterGeo = new THREE.BufferGeometry();
    const vertices = [];
    const uvs = [];
    const indices = [];

    for (let i = 0; i <= riverSamples; i++) {
      const t = i / riverSamples;
      const pt = this.riverCurve.getPointAt(t);
      const tangent = this.riverCurve.getTangentAt(t);

      // Normal perpendicular to tangent on XZ plane
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      const leftPt = pt.clone().addScaledVector(normal, riverWidth * 0.5);
      const rightPt = pt.clone().addScaledVector(normal, -riverWidth * 0.5);

      vertices.push(leftPt.x, leftPt.y, leftPt.z);
      vertices.push(rightPt.x, rightPt.y, rightPt.z);

      uvs.push(0, t * 10);
      uvs.push(1, t * 10);

      // Upward-facing triangle normals (+Y)
      if (i < riverSamples) {
        const base = i * 2;
        indices.push(base, base + 2, base + 1);
        indices.push(base + 1, base + 2, base + 3);
      }
    }

    waterGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    waterGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    waterGeo.setIndex(indices);
    waterGeo.computeVertexNormals();

    // Procedural river water ripple texture
    this.waterTexture = this.createWaterTexture();
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x1da5b8, // Vibrant glistening tropical river aqua/cyan
      emissive: new THREE.Color(0x0e505a), // Luminous water depth glow
      emissiveIntensity: 0.65,
      map: this.waterTexture,
      roughness: 0.08,
      metalness: 0.15,
      transparent: true,
      opacity: 0.94,
      side: THREE.DoubleSide, // Ensure always visible from all camera angles!
      depthWrite: true,
    });

    this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
    this.waterMesh.receiveShadow = true;
    parentGroup.add(this.waterMesh);

    // River bed silt layer below water
    const bedGeo = waterGeo.clone();
    bedGeo.translate(0, -0.75, 0); // 0.75m below water
    const bedMat = new THREE.MeshStandardMaterial({
      color: 0x221c16, // Dark wet silt & gravel
      roughness: 0.95,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
    const bedMesh = new THREE.Mesh(bedGeo, bedMat);
    bedMesh.receiveShadow = true;
    parentGroup.add(bedMesh);

    // River stones / boulders (batu kali) along the waterline
    this.createRiverStones(parentGroup);

    // Lush riverside vegetation (wild banana & tropical shrubs)
    this.createRiversideFoliage(parentGroup);
  }

  /**
   * Procedural river ripple normal/diffuse texture.
   */
  createWaterTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Vibrant tropical river cyan base
    ctx.fillStyle = '#1b7d8c';
    ctx.fillRect(0, 0, size, size);

    // Flowing water streaks and sunny ripples
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const len = Math.random() * 55 + 25;
      const grad = ctx.createLinearGradient(x, y, x, y + len);
      grad.addColorStop(0, 'rgba(80, 200, 215, 0.0)');
      grad.addColorStop(0.5, 'rgba(180, 245, 255, 0.6)'); // Bright glistening crests
      grad.addColorStop(1, 'rgba(80, 200, 215, 0.0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = Math.random() * 3 + 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 8, y + len);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /**
   * River stones (batu kali) scattered along both banks.
   */
  createRiverStones(parentGroup) {
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x696458, // Weathered river rock grey
      roughness: 0.85,
      metalness: 0.05,
    });

    const samples = [0.15, 0.28, 0.40, 0.52, 0.65, 0.78, 0.90];
    samples.forEach(t => {
      const pt = this.riverCurve.getPointAt(t);
      const tan = this.riverCurve.getTangentAt(t);
      const norm = new THREE.Vector3(-tan.z, 0, tan.x).normalize();

      [-1, 1].forEach(side => {
        for (let k = 0; k < 3; k++) {
          const dist = (4.0 + Math.random() * 1.8) * side;
          const pos = pt.clone().addScaledVector(norm, dist);
          pos.y = -1.4 + Math.random() * 0.4;

          const r = 0.25 + Math.random() * 0.45;
          const geo = new THREE.DodecahedronGeometry(r, 1);
          const stone = new THREE.Mesh(geo, stoneMat);
          stone.position.copy(pos);
          stone.scale.set(1.0 + Math.random() * 0.5, 0.7, 1.0 + Math.random() * 0.4);
          stone.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
          stone.castShadow = true;
          stone.receiveShadow = true;
          parentGroup.add(stone);
        }
      });
    });
  }

  /**
   * Lush riverside foliage (wild banana trees & bamboo bushes).
   */
  createRiversideFoliage(parentGroup) {
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x365a28,
      roughness: 0.7,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });

    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x4f432e,
      roughness: 0.9,
    });

    // Plant clusters along riverbanks near the bridge
    const spots = [
      { t: 0.42, side: -1 },
      { t: 0.45, side: 1 },
      { t: 0.55, side: -1 },
      { t: 0.58, side: 1 },
    ];

    spots.forEach(sp => {
      const pt = this.riverCurve.getPointAt(sp.t);
      const tan = this.riverCurve.getTangentAt(sp.t);
      const norm = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
      const pos = pt.clone().addScaledVector(norm, (6.5 + Math.random() * 2.0) * sp.side);
      pos.y = -0.5;

      const clump = new THREE.Group();
      clump.position.copy(pos);

      // 3 banana/shrub trunks
      for (let i = 0; i < 3; i++) {
        const ox = (Math.random() - 0.5) * 1.2;
        const oz = (Math.random() - 0.5) * 1.2;
        const h = 2.4 + Math.random() * 1.2;

        const trunkGeo = new THREE.CylinderGeometry(0.08, 0.14, h, 6);
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.set(ox, h / 2, oz);
        clump.add(trunk);

        // Broad tropical leaves
        for (let l = 0; l < 5; l++) {
          const lAngle = (l / 5) * Math.PI * 2;
          const leafGeo = new THREE.PlaneGeometry(0.45, 1.6);
          const leaf = new THREE.Mesh(leafGeo, leafMat);
          leaf.position.set(ox, h - 0.2, oz);
          leaf.rotation.y = lAngle;
          leaf.rotation.x = 0.55;
          clump.add(leaf);
        }
      }
      parentGroup.add(clump);
    });
  }

  // ==========================================
  // B. RURAL TIMBER BRIDGE STRUCTURE
  // ==========================================
  createBridge(parentGroup) {
    const bridgeZStart = 44.0;
    const bridgeZEnd = 56.0;
    const bridgeLen = bridgeZEnd - bridgeZStart; // 12.0m
    const bridgeMidZ = (bridgeZStart + bridgeZEnd) / 2; // 50.0m
    const bridgeW = 6.2; // Width across X
    const deckY = 0.06;  // Deck surface height

    const bridgeGroup = new THREE.Group();
    bridgeGroup.name = 'timber-bridge';

    // Materials
    const darkUlinMat = new THREE.MeshStandardMaterial({
      color: 0x3d2c1d, // Rich dark Kalimantan Ironwood (Kayu Ulin)
      roughness: 0.82,
      metalness: 0.05,
    });

    const lightUlinMat = new THREE.MeshStandardMaterial({
      color: 0x5a432f,
      roughness: 0.78,
      metalness: 0.05,
    });

    const masonryMat = new THREE.MeshStandardMaterial({
      color: 0x7c7569, // Stone masonry & concrete plaster
      roughness: 0.88,
      metalness: 0.05,
    });

    // 1. Concrete & Stone Masonry Abutments (North & South)
    [bridgeZStart, bridgeZEnd].forEach(az => {
      const abutGeo = new THREE.BoxGeometry(bridgeW + 1.2, 2.4, 1.2);
      const abut = new THREE.Mesh(abutGeo, masonryMat);
      abut.position.set(0, -1.05, az);
      abut.receiveShadow = true;
      abut.castShadow = true;
      bridgeGroup.add(abut);

      // Angled stone wing walls
      [-1, 1].forEach(side => {
        const wingGeo = new THREE.BoxGeometry(0.5, 2.2, 2.5);
        const wing = new THREE.Mesh(wingGeo, masonryMat);
        wing.position.set(side * (bridgeW / 2 + 0.9), -1.1, az + (az === bridgeZStart ? -1.0 : 1.0));
        wing.rotation.y = side * 0.35;
        bridgeGroup.add(wing);
      });
    });

    // 2. Heavy Longitudinal Timber Girders (Gelagar Kayu Ulin)
    const girderCount = 5;
    for (let g = 0; g < girderCount; g++) {
      const gx = -bridgeW / 2 + 0.6 + g * ((bridgeW - 1.2) / (girderCount - 1));
      const girderGeo = new THREE.BoxGeometry(0.28, 0.40, bridgeLen + 0.4);
      const girder = new THREE.Mesh(girderGeo, darkUlinMat);
      girder.position.set(gx, deckY - 0.23, bridgeMidZ);
      girder.castShadow = true;
      bridgeGroup.add(girder);
    }

    // 3. Central Timber Pile Bent in River Channel (Tiang Pancang Kayu Galam/Ulin)
    for (let p = 0; p < girderCount; p++) {
      const px = -bridgeW / 2 + 0.6 + p * ((bridgeW - 1.2) / (girderCount - 1));
      const pileGeo = new THREE.CylinderGeometry(0.14, 0.16, 2.4, 8);
      const pile = new THREE.Mesh(pileGeo, darkUlinMat);
      pile.position.set(px, -1.1, bridgeMidZ);
      pile.castShadow = true;
      bridgeGroup.add(pile);
    }

    // Pile cap cross-beam
    const capBeamGeo = new THREE.BoxGeometry(bridgeW - 0.8, 0.25, 0.35);
    const capBeam = new THREE.Mesh(capBeamGeo, darkUlinMat);
    capBeam.position.set(0, -0.42, bridgeMidZ);
    bridgeGroup.add(capBeam);

    // 4. Base Transverse Deck Planks (Lantai Kayu Melintang)
    const baseDeckGeo = new THREE.BoxGeometry(bridgeW, 0.08, bridgeLen);
    const baseDeck = new THREE.Mesh(baseDeckGeo, darkUlinMat);
    baseDeck.position.set(0, deckY - 0.04, bridgeMidZ);
    baseDeck.receiveShadow = true;
    baseDeck.castShadow = true;
    bridgeGroup.add(baseDeck);

    // 5. ICONIC LONGITUDINAL TIMBER RUNNER TRACKS (DUA JALUR PAPAN ULIN UNTUK RODA)
    // As seen in Photo #2: Two parallel tracks of thick longitudinal planks for car/motorcycle tires
    const trackW = 0.95; // Track width
    const trackH = 0.04; // Thickness above deck
    const trackOffset = 1.35; // Center distance from road axis

    const plankTex = this.createTimberRunnerTexture();
    const plankMat = new THREE.MeshStandardMaterial({
      map: plankTex,
      roughness: 0.75,
      metalness: 0.05,
    });

    // Left track (-X)
    const leftTrackGeo = new THREE.BoxGeometry(trackW, trackH, bridgeLen - 0.2);
    const leftTrack = new THREE.Mesh(leftTrackGeo, plankMat);
    leftTrack.position.set(-trackOffset, deckY + trackH / 2, bridgeMidZ);
    leftTrack.receiveShadow = true;
    leftTrack.castShadow = true;
    bridgeGroup.add(leftTrack);

    // Right track (+X)
    const rightTrackGeo = new THREE.BoxGeometry(trackW, trackH, bridgeLen - 0.2);
    const rightTrack = new THREE.Mesh(rightTrackGeo, plankMat);
    rightTrack.position.set(trackOffset, deckY + trackH / 2, bridgeMidZ);
    rightTrack.receiveShadow = true;
    rightTrack.castShadow = true;
    bridgeGroup.add(rightTrack);

    // 6. RED-AND-WHITE PAINTED BRIDGE GUARDRAILS (PEMBATAS MERAH-PUTIH)
    // As seen in Photo #2: Low side barriers with red and white horizontal/diagonal stripes
    const railTex = this.createRedWhiteRailTexture();
    const railMat = new THREE.MeshStandardMaterial({
      map: railTex,
      roughness: 0.65,
      metalness: 0.05,
    });

    [-1, 1].forEach(side => {
      const rx = side * (bridgeW / 2 - 0.15);

      // Continuous barrier wall
      const barrierGeo = new THREE.BoxGeometry(0.18, 0.62, bridgeLen);
      const barrier = new THREE.Mesh(barrierGeo, railMat);
      barrier.position.set(rx, deckY + 0.31, bridgeMidZ);
      barrier.castShadow = true;
      barrier.receiveShadow = true;
      bridgeGroup.add(barrier);

      // Top cap beam
      const topRailGeo = new THREE.BoxGeometry(0.24, 0.08, bridgeLen + 0.1);
      const topRail = new THREE.Mesh(topRailGeo, lightUlinMat);
      topRail.position.set(rx, deckY + 0.65, bridgeMidZ);
      bridgeGroup.add(topRail);

      // Posts at ends & center
      [bridgeZStart, bridgeMidZ, bridgeZEnd].forEach(pz => {
        const pGeo = new THREE.BoxGeometry(0.25, 0.75, 0.25);
        const post = new THREE.Mesh(pGeo, lightUlinMat);
        post.position.set(rx, deckY + 0.375, pz);
        post.castShadow = true;
        bridgeGroup.add(post);
      });
    });

    parentGroup.add(bridgeGroup);
  }

  /**
   * Procedural texture for longitudinal timber running tracks.
   * 4-5 parallel boards of weathered Kalimantan ironwood (Ulin) with bolt fixings.
   */
  createTimberRunnerTexture() {
    const w = 512;
    const h = 2048;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    // Dark ironwood base
    ctx.fillStyle = '#453322';
    ctx.fillRect(0, 0, w, h);

    // 4 individual wooden boards
    const boardCount = 4;
    const boardW = w / boardCount;

    for (let b = 0; b < boardCount; b++) {
      const bx = b * boardW;

      // Board grain variation
      const tone = Math.floor(Math.random() * 20 - 10);
      ctx.fillStyle = `rgb(${72 + tone}, ${53 + tone}, ${36 + tone})`;
      ctx.fillRect(bx + 2, 0, boardW - 4, h);

      // Fine wood grain lines
      for (let g = 0; g < 40; g++) {
        const gx = bx + Math.random() * boardW;
        ctx.strokeStyle = 'rgba(35, 24, 15, 0.35)';
        ctx.lineWidth = Math.random() * 2 + 1;
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx + (Math.random() - 0.5) * 6, h);
        ctx.stroke();
      }

      // Seam between boards
      ctx.strokeStyle = '#1e140d';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(bx, 0);
      ctx.lineTo(bx, h);
      ctx.stroke();

      // Bolt / spike heads along the boards
      for (let y = 80; y < h; y += 180) {
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(bx + boardW * 0.3, y, 6, 0, Math.PI * 2);
        ctx.arc(bx + boardW * 0.7, y, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 2);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  /**
   * Procedural Red-and-White barrier texture for bridge parapets.
   */
  createRedWhiteRailTexture() {
    const w = 1024;
    const h = 256;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    // Alternating Red and White bold diagonal stripes
    const stripeW = 128;
    const count = w / stripeW + 2;

    for (let i = 0; i < count; i++) {
      const x = i * stripeW;
      const isRed = i % 2 === 0;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + stripeW, 0);
      ctx.lineTo(x + stripeW - 50, h);
      ctx.lineTo(x - 50, h);
      ctx.closePath();

      ctx.fillStyle = isRed ? '#dc2626' : '#f8fafc';
      ctx.fill();

      // Weathering
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // Road dust gradient along bottom
    const dust = ctx.createLinearGradient(0, h - 50, 0, h);
    dust.addColorStop(0, 'rgba(80, 70, 55, 0.0)');
    dust.addColorStop(1, 'rgba(80, 70, 55, 0.6)');
    ctx.fillStyle = dust;
    ctx.fillRect(0, h - 50, w, 50);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.repeat.set(3, 1);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  // ==========================================
  // C. HUT RI MONUMENTS & APPROACH DECORATIONS
  // ==========================================
  createApproachDecorations(parentGroup) {
    const group = new THREE.Group();
    group.name = 'bridge-monuments-and-decorations';

    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.7,
      metalness: 0.05,
    });

    const redMat = new THREE.MeshStandardMaterial({
      color: 0xcc2222, // Indonesian Flag Red
      roughness: 0.55,
      metalness: 0.05,
    });

    const hutRiTex = this.createHutRiTexture();
    const hutRiMat = new THREE.MeshStandardMaterial({
      map: hutRiTex,
      roughness: 0.65,
    });

    // ============================================================
    // 1. ICONIC "HUT RI" MONUMENT BLOCK ON LEFT APPROACH (z = 42.4)
    // ============================================================
    const blockLen = 1.6;
    const blockH = 0.65;
    const blockThick = 0.36;

    // Left North Block (with "HUT RI")
    const leftBlock = new THREE.Group();
    leftBlock.position.set(-3.25, blockH / 2, 42.4);

    // Main white concrete block
    const lBodyGeo = new THREE.BoxGeometry(blockThick, blockH, blockLen);
    const lBody = new THREE.Mesh(lBodyGeo, whiteMat);
    lBody.castShadow = true;
    lBody.receiveShadow = true;
    leftBlock.add(lBody);

    // Red top cap ledge
    const lCapGeo = new THREE.BoxGeometry(blockThick + 0.08, 0.10, blockLen + 0.08);
    const lCap = new THREE.Mesh(lCapGeo, redMat);
    lCap.position.y = blockH / 2 + 0.05;
    lCap.castShadow = true;
    leftBlock.add(lCap);

    // "HUT RI" Inscription plaque facing the road (+X)
    const plaqueGeo = new THREE.PlaneGeometry(blockLen - 0.2, blockH - 0.2);
    const plaqueMesh = new THREE.Mesh(plaqueGeo, hutRiMat);
    plaqueMesh.position.set(blockThick / 2 + 0.015, 0, 0);
    plaqueMesh.rotation.y = Math.PI / 2;
    leftBlock.add(plaqueMesh);

    group.add(leftBlock);

    // Right North Block (White with Red Top)
    const rightBlock = new THREE.Group();
    rightBlock.position.set(3.25, blockH / 2, 42.4);

    const rBody = new THREE.Mesh(lBodyGeo, whiteMat);
    rBody.castShadow = true;
    rightBlock.add(rBody);

    const rCap = new THREE.Mesh(lCapGeo, redMat);
    rCap.position.y = blockH / 2 + 0.05;
    rightBlock.add(rCap);

    group.add(rightBlock);

    // Matching blocks on South exit approach (z = 57.6)
    [-1, 1].forEach(side => {
      const sBlock = new THREE.Group();
      sBlock.position.set(side * 3.25, blockH / 2, 57.6);
      sBlock.add(new THREE.Mesh(lBodyGeo, whiteMat));
      const cap = new THREE.Mesh(lCapGeo, redMat);
      cap.position.y = blockH / 2 + 0.05;
      sBlock.add(cap);
      group.add(sBlock);
    });

    // ============================================================
    // 2. TALL SPIRAL RED-AND-WHITE FESTIVAL POLE (TIANG BELANG MERAH-PUTIH)
    // As seen in Photo #2 standing beside the left block
    // ============================================================
    const spiralPoleGroup = new THREE.Group();
    spiralPoleGroup.position.set(-3.7, 0, 41.5);

    const poleH = 5.2;
    const spiralTex = this.createSpiralStripesTexture();
    const spiralMat = new THREE.MeshStandardMaterial({
      map: spiralTex,
      roughness: 0.5,
    });

    const spiralGeo = new THREE.CylinderGeometry(0.06, 0.08, poleH, 16);
    const spiralPole = new THREE.Mesh(spiralGeo, spiralMat);
    spiralPole.position.y = poleH / 2;
    spiralPole.castShadow = true;
    spiralPoleGroup.add(spiralPole);

    // Gold/Red finial ball on top
    const ballGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const ball = new THREE.Mesh(ballGeo, redMat);
    ball.position.y = poleH + 0.08;
    spiralPoleGroup.add(ball);

    group.add(spiralPoleGroup);

    // ============================================================
    // 3. RURAL UTILITY POWER POLE WITH TRANSFORMER (TIANG LISTRIK)
    // As seen in Photo #2 on the left side of the road approach
    // ============================================================
    const utilityGroup = new THREE.Group();
    utilityGroup.position.set(-4.6, 0, 38.5);

    const uPoleH = 8.0;
    const woodPoleMat = new THREE.MeshStandardMaterial({ color: 0x4a3b2c, roughness: 0.9 });
    const uPoleGeo = new THREE.CylinderGeometry(0.14, 0.18, uPoleH, 8);
    const uPole = new THREE.Mesh(uPoleGeo, woodPoleMat);
    uPole.position.y = uPoleH / 2;
    uPole.castShadow = true;
    utilityGroup.add(uPole);

    // Horizontal wooden crossarms
    const armGeo = new THREE.BoxGeometry(0.10, 0.10, 1.8);
    const arm1 = new THREE.Mesh(armGeo, woodPoleMat);
    arm1.position.set(0, uPoleH - 0.4, 0);
    utilityGroup.add(arm1);

    const arm2 = new THREE.Mesh(armGeo, woodPoleMat);
    arm2.position.set(0, uPoleH - 1.2, 0);
    utilityGroup.add(arm2);

    // Transformer cylinder
    const transGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.8, 12);
    const transMat = new THREE.MeshStandardMaterial({ color: 0x5b6470, roughness: 0.4, metalness: 0.7 });
    const trans = new THREE.Mesh(transGeo, transMat);
    trans.position.set(0.26, uPoleH - 2.0, 0);
    utilityGroup.add(trans);

    group.add(utilityGroup);

    // ============================================================
    // 4. NIGHT LIGHTING FOR BRIDGE & HUT RI MONUMENT
    // ============================================================
    const bridgeSpot = new THREE.SpotLight(0xffecd1, this.config.nightMode ? 2.6 : 0, 18, Math.PI / 3, 0.45, 1.2);
    bridgeSpot.position.set(4.0, 6.0, 42.0);
    bridgeSpot.target.position.set(0, 0.5, 49.0);
    group.add(bridgeSpot.target);
    group.add(bridgeSpot);
    bridgeSpot.userData.baseIntensity = 2.6;

    if (this.lightingManager) {
      this.lightingManager.registerDecorativeLight(bridgeSpot);
    }

    parentGroup.add(group);
  }

  /**
   * Procedural texture for "HUT RI" inscription plaque.
   */
  createHutRiTexture() {
    const w = 512;
    const h = 256;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    // Clean white concrete with subtle bevel
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, w - 12, h - 12);

    // Bold red lettering: "HUT RI"
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 84px "Montserrat", "Arial Black", sans-serif';
    ctx.fillStyle = '#cc1818';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText('HUT RI', w / 2, h / 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /**
   * Procedural spiral red-and-white stripes texture for festive flagpole.
   */
  createSpiralStripesTexture() {
    const w = 256;
    const h = 512;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    // Diagonal stripes
    ctx.fillStyle = '#d32f2f';
    for (let y = -w; y < h + w; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y + w * 0.8);
      ctx.lineTo(w, y + w * 0.8 + 32);
      ctx.lineTo(0, y + 32);
      ctx.closePath();
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 4);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /**
   * Animation update for river water ripple flow.
   */
  update(delta) {
    if (this.waterTexture) {
      this.waterTexture.offset.y += delta * 0.08;
    }
  }
}
