/**
 * Roundabout.js — Authentic 3-Tier Giant Tire Monument (Tugu 3 Ban Besar Ditumpuk).
 *
 * Faithfully recreated from Google Street View reference photo (Kalimantan Selatan):
 *  - Stack of 3 massive heavy-equipment / tractor tires ("3 ban besar ditumpuk 3").
 *  - Hand-painted red & white alternating diagonal chevron stripes (corak merah-putih miring).
 *  - 3D tractor chevron tread lugs (ban pacul) with physical depth and shadows.
 *  - Filled soil/earth core inside the top tire.
 *  - Natural rural divider island with gravelly soil, dry grass patches, and concrete curb.
 */

import * as THREE from 'three';

export class RoundaboutSystem {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.lightingManager = null;
    this.monumentGroup = null;
  }

  setLightingManager(lm) {
    this.lightingManager = lm;
  }

  build() {
    const rb = this.config.roundabout;
    const center = rb.center;

    // 1. Asphalt road ring surrounding the roundabout
    this.createRoadRing(center, rb);

    // 2. Rural divider island with soil, curb & vegetation
    this.createIsland(center, rb);

    // 3. Iconic 3-Tier Giant Tire Monument (3 Ban Besar Ditumpuk)
    this.createTireMonument(center);
  }

  createRoadRing(center, rb) {
    const roadWidth = this.config.road.width;
    const outerR = rb.outerRadius + roadWidth / 2;
    const innerR = rb.outerRadius - roadWidth / 2;

    const ringShape = new THREE.Shape();
    ringShape.absarc(0, 0, outerR, 0, Math.PI * 2, false);

    const hole = new THREE.Path();
    hole.absarc(0, 0, innerR, 0, Math.PI * 2, true);
    ringShape.holes.push(hole);

    const ringGeo = new THREE.ShapeGeometry(ringShape, 48);
    const roadMat = new THREE.MeshStandardMaterial({
      color: this.config.road.surfaceColor,
      roughness: 0.88,
      metalness: 0.05,
    });

    const ring = new THREE.Mesh(ringGeo, roadMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(center.x, 0.015, center.z);
    ring.receiveShadow = true;
    this.scene.add(ring);
  }

  createIsland(center, rb) {
    const islandR = rb.innerRadius;
    const islandH = 0.22;

    const group = new THREE.Group();
    group.position.set(center.x, 0, center.z);

    // 1. Island Earth Mound with Natural Soil & Grass Texture
    const islandGeo = new THREE.CylinderGeometry(islandR, islandR + 0.15, islandH, 40);
    const islandMat = new THREE.MeshStandardMaterial({
      map: this.createIslandGroundTexture(),
      roughness: 0.95,
      metalness: 0.0,
    });
    const island = new THREE.Mesh(islandGeo, islandMat);
    island.position.y = islandH / 2;
    island.receiveShadow = true;
    group.add(island);

    // 2. Weathered Concrete Curb Ring
    const curbGeo = new THREE.TorusGeometry(islandR + 0.05, 0.14, 10, 48);
    const curbMat = new THREE.MeshStandardMaterial({
      color: 0x8a8479, // Weathered dusty concrete
      roughness: 0.85,
      metalness: 0.05,
    });
    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.rotation.x = Math.PI / 2;
    curb.position.y = islandH * 0.7;
    curb.receiveShadow = true;
    group.add(curb);

    // 3. Small Natural Weed/Grass Tufts scattered on the island
    this.createGrassTufts(group, islandR);

    // 4. Subtle weathered plank / wood scrap on ground (seen in street view photo!)
    const plankGeo = new THREE.BoxGeometry(0.12, 0.03, 0.65);
    const plankMat = new THREE.MeshStandardMaterial({
      color: 0xd6c29c, // Weathered plywood/timber scrap
      roughness: 0.9,
    });
    const plank = new THREE.Mesh(plankGeo, plankMat);
    plank.position.set(-1.15, islandH + 0.015, 0.75);
    plank.rotation.y = 0.45;
    plank.rotation.z = 0.02;
    plank.castShadow = true;
    group.add(plank);

    this.scene.add(group);
  }

  /**
   * Iconic Monument: 3 Massive Heavy-Equipment / Tractor Tires Stacked Vertically.
   * Painted in bold alternating Red and White chevron stripes.
   */
  createTireMonument(center) {
    const group = new THREE.Group();
    group.position.set(center.x, 0.22, center.z); // Placed on top of island mound
    group.name = 'tire-monument-stack';

    // Dimensions for massive heavy-equipment / tractor tires:
    const outerRadius = 1.15; // 2.30m outer diameter
    const innerRadius = 0.52; // 1.04m inner hole diameter
    const tireHeight = 0.58;  // 0.58m height per tire (total stack = ~1.74m)
    const lugCount = 20;      // 20 pairs of physical 3D tractor chevron lugs

    // Rubber materials
    const rubberDarkMat = new THREE.MeshStandardMaterial({
      color: 0x181818, // Deep vulcanized black rubber
      roughness: 0.85,
      metalness: 0.05,
    });

    const soilMat = new THREE.MeshStandardMaterial({
      color: 0x241c14, // Dark damp compacted soil/gravel inside tires
      roughness: 0.98,
      metalness: 0.0,
    });

    // 3-Tier Stacking Configurations (with slight realistic handmade rotational offsets)
    const tiers = [
      { index: 0, yOffset: tireHeight * 0.5, rotY: 0.0, label: 'bottom' },
      { index: 1, yOffset: tireHeight * 1.5 - 0.015, rotY: 0.32, label: 'middle' },
      { index: 2, yOffset: tireHeight * 2.5 - 0.03, rotY: -0.22, label: 'top' },
    ];

    tiers.forEach(tier => {
      const tireMesh = this.createSingleTire({
        outerR: outerRadius,
        innerR: innerRadius,
        height: tireHeight,
        lugCount: lugCount,
        tireIndex: tier.index,
        rubberDarkMat: rubberDarkMat,
        rotY: tier.rotY,
        isTop: tier.index === 2,
        soilMat: soilMat,
      });

      tireMesh.position.y = tier.yOffset;
      group.add(tireMesh);
    });

    // Bottom dirt rim / road dust accumulation around the base
    const dustRimGeo = new THREE.TorusGeometry(outerRadius + 0.06, 0.08, 8, 32);
    const dustRimMat = new THREE.MeshStandardMaterial({
      color: 0x6e5c46, // Earth / red dust
      roughness: 0.95,
    });
    const dustRim = new THREE.Mesh(dustRimGeo, dustRimMat);
    dustRim.rotation.x = Math.PI / 2;
    dustRim.position.y = 0.04;
    group.add(dustRim);

    this.monumentGroup = group;
    this.scene.add(group);
  }

  /**
   * Builds one heavy-duty tractor tire with:
   *  - Procedural Red-White chevron painted tread canvas texture.
   *  - Physical 3D chevron/angled tractor lugs (ban pacul).
   *  - Bulged rubber sidewalls & inner bead lip.
   */
  createSingleTire({ outerR, innerR, height, lugCount, tireIndex, rubberDarkMat, rotY, isTop, soilMat }) {
    const tireGroup = new THREE.Group();
    tireGroup.rotation.y = rotY;

    // 1. Outer Tread Band Cylinder with Red-White Chevron Painted Texture
    const treadTex = this.createTireTreadTexture(lugCount, tireIndex);
    const treadMat = new THREE.MeshStandardMaterial({
      map: treadTex,
      roughness: 0.65,
      metalness: 0.05,
    });

    const treadGeo = new THREE.CylinderGeometry(outerR, outerR, height * 0.94, 48, 1, true);
    const treadMesh = new THREE.Mesh(treadGeo, treadMat);
    treadMesh.castShadow = true;
    treadMesh.receiveShadow = true;
    tireGroup.add(treadMesh);

    // 2. Bulged Curved Rubber Sidewalls (Top & Bottom)
    // Upper sidewall beveled torus
    const upperWallGeo = new THREE.RingGeometry(innerR, outerR, 36);
    const upperWall = new THREE.Mesh(upperWallGeo, rubberDarkMat);
    upperWall.rotation.x = -Math.PI / 2;
    upperWall.position.y = height * 0.47;
    upperWall.castShadow = true;
    tireGroup.add(upperWall);

    // Lower sidewall
    const lowerWall = new THREE.Mesh(upperWallGeo, rubberDarkMat);
    lowerWall.rotation.x = Math.PI / 2;
    lowerWall.position.y = -height * 0.47;
    lowerWall.castShadow = true;
    tireGroup.add(lowerWall);

    // Rounded shoulder chamfer rings (smoothing transition from tread to sidewall)
    const shoulderGeo = new THREE.TorusGeometry(outerR - 0.04, 0.05, 10, 40);
    const topShoulder = new THREE.Mesh(shoulderGeo, rubberDarkMat);
    topShoulder.rotation.x = Math.PI / 2;
    topShoulder.position.y = height * 0.45;
    tireGroup.add(topShoulder);

    const botShoulder = new THREE.Mesh(shoulderGeo, rubberDarkMat);
    botShoulder.rotation.x = Math.PI / 2;
    botShoulder.position.y = -height * 0.45;
    tireGroup.add(botShoulder);

    // Inner rim bead ring
    const beadGeo = new THREE.CylinderGeometry(innerR, innerR, height, 32, 1, true);
    const beadMesh = new THREE.Mesh(beadGeo, rubberDarkMat);
    tireGroup.add(beadMesh);

    // 3. Physical 3D Tractor Chevron Lugs (Ban Pacul)
    // Red and White painted lug materials for distinct 3D depth & shadow
    const redLugMat = new THREE.MeshStandardMaterial({
      color: 0xc41b1b, // Rich weathered Indonesian red paint
      roughness: 0.6,
      metalness: 0.05,
    });

    const whiteLugMat = new THREE.MeshStandardMaterial({
      color: 0xedf1f5, // Weathered road-white paint
      roughness: 0.55,
      metalness: 0.05,
    });

    const lugW = 0.14; // Lug width along circumference
    const lugH = height * 0.42; // Half-height of tire
    const lugDepth = 0.065; // Protrusion beyond tire radius

    for (let i = 0; i < lugCount; i++) {
      const angle = (i / lugCount) * Math.PI * 2;
      const isRed = i % 2 === 0;
      const currentMat = isRed ? redLugMat : whiteLugMat;

      // Upper angled chevron lug (slanted +35°)
      const upperLug = this.createChevronLugMesh(lugW, lugH, lugDepth, 0.45, currentMat);
      const ux = Math.cos(angle) * (outerR + lugDepth * 0.35);
      const uz = Math.sin(angle) * (outerR + lugDepth * 0.35);
      upperLug.position.set(ux, height * 0.22, uz);
      upperLug.rotation.y = -angle + Math.PI / 2;
      upperLug.rotation.z = 0.25; // Chevron slant
      upperLug.castShadow = true;
      tireGroup.add(upperLug);

      // Lower angled chevron lug (slanted opposing -35°)
      const lowerLug = this.createChevronLugMesh(lugW, lugH, lugDepth, -0.45, currentMat);
      const lx = Math.cos(angle + 0.04) * (outerR + lugDepth * 0.35);
      const lz = Math.sin(angle + 0.04) * (outerR + lugDepth * 0.35);
      lowerLug.position.set(lx, -height * 0.22, lz);
      lowerLug.rotation.y = -angle + Math.PI / 2;
      lowerLug.rotation.z = -0.25; // Opposing chevron slant
      lowerLug.castShadow = true;
      tireGroup.add(lowerLug);
    }

    // 4. Center Hole Fill (Compacted Soil/Earth for the Top Tire)
    if (isTop) {
      const soilGeo = new THREE.CylinderGeometry(innerR + 0.02, innerR + 0.02, 0.15, 32);
      const soil = new THREE.Mesh(soilGeo, soilMat);
      soil.position.y = height * 0.40;
      soil.receiveShadow = true;
      tireGroup.add(soil);

      // Subtle dark center rubber hub lid
      const lidGeo = new THREE.CylinderGeometry(innerR * 0.75, innerR * 0.75, 0.04, 24);
      const lid = new THREE.Mesh(lidGeo, rubberDarkMat);
      lid.position.y = height * 0.44;
      lid.receiveShadow = true;
      tireGroup.add(lid);
    }

    return tireGroup;
  }

  /**
   * Helper to create a single beveled tractor tire chevron lug.
   */
  createChevronLugMesh(w, h, d, slantAngle, mat) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = slantAngle;
    return mesh;
  }

  /**
   * Procedural High-Resolution Texture for Tire Tread:
   * Hand-painted alternating Red and White diagonal chevron stripes
   * with authentic rubber groove lines, tread edges, and subtle road dust.
   */
  createTireTreadTexture(lugCount, tireIndex) {
    const w = 2048;
    const h = 512;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    // 1. Dark Vulcanized Rubber Base
    ctx.fillStyle = '#141414';
    ctx.fillRect(0, 0, w, h);

    // Subtle rubber grain
    for (let i = 0; i < 600; i++) {
      const gx = Math.random() * w;
      const gy = Math.random() * h;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(35, 35, 35, 0.25)' : 'rgba(5, 5, 5, 0.35)';
      ctx.fillRect(gx, gy, 4, 3);
    }

    // 2. Alternating Red and White Slanted / Chevron Bands
    const stripeCount = lugCount; // 20 stripes around circumference
    const stripeWidth = w / stripeCount;
    const slant = 140; // Diagonal pixel shift across height

    for (let s = 0; s < stripeCount; s++) {
      const isRed = s % 2 === 0;
      const xStart = s * stripeWidth;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(xStart, 0);
      ctx.lineTo(xStart + stripeWidth, 0);
      ctx.lineTo(xStart + stripeWidth + slant, h);
      ctx.lineTo(xStart + slant, h);
      ctx.closePath();

      // Bold Paint Fill
      if (isRed) {
        // Red with subtle internal shading
        const redGrad = ctx.createLinearGradient(xStart, 0, xStart + stripeWidth, 0);
        redGrad.addColorStop(0, '#a81515');
        redGrad.addColorStop(0.3, '#d32323');
        redGrad.addColorStop(0.8, '#c21b1b');
        redGrad.addColorStop(1, '#9e1414');
        ctx.fillStyle = redGrad;
      } else {
        // White with subtle weathering
        const whiteGrad = ctx.createLinearGradient(xStart, 0, xStart + stripeWidth, 0);
        whiteGrad.addColorStop(0, '#e2e8f0');
        whiteGrad.addColorStop(0.4, '#ffffff');
        whiteGrad.addColorStop(0.8, '#f1f5f9');
        whiteGrad.addColorStop(1, '#d8e0e8');
        ctx.fillStyle = whiteGrad;
      }
      ctx.fill();

      // Deep Rubber Groove Line between adjacent stripes
      ctx.strokeStyle = '#101010';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(xStart, 0);
      ctx.lineTo(xStart + slant, h);
      ctx.stroke();

      ctx.restore();
    }

    // 3. Central Circumferential Channel / Tread Center Line
    ctx.strokeStyle = 'rgba(10, 10, 10, 0.75)';
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // 4. Subtle Road Dust Grime along Top & Bottom Edges
    const topGrime = ctx.createLinearGradient(0, 0, 0, 80);
    topGrime.addColorStop(0, 'rgba(80, 68, 52, 0.65)');
    topGrime.addColorStop(1, 'rgba(80, 68, 52, 0.0)');
    ctx.fillStyle = topGrime;
    ctx.fillRect(0, 0, w, 80);

    const botGrime = ctx.createLinearGradient(0, h - 90, 0, h);
    botGrime.addColorStop(0, 'rgba(80, 68, 52, 0.0)');
    botGrime.addColorStop(1, 'rgba(85, 70, 54, 0.75)');
    ctx.fillStyle = botGrime;
    ctx.fillRect(0, h - 90, w, 90);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }

  /**
   * Procedural Ground Texture for Rural Island:
   * Blend of reddish-brown Banjarmasin / South Kalimantan soil, gravel pebbles, and dry patchy grass.
   */
  createIslandGroundTexture() {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // 1. Dry Warm Soil Base
    const bg = ctx.createRadialGradient(size / 2, size / 2, 80, size / 2, size / 2, size / 2);
    bg.addColorStop(0, '#5a4938'); // Compacted earth under tires
    bg.addColorStop(0.5, '#6b5842'); // Gravelly brown earth
    bg.addColorStop(0.85, '#544634'); // Outer perimeter
    bg.addColorStop(1, '#473c2e');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    // 2. Scattered Gravel & Small Stones
    for (let i = 0; i < 800; i++) {
      const gx = Math.random() * size;
      const gy = Math.random() * size;
      const r = Math.random() * 3 + 1.5;
      ctx.fillStyle = Math.random() > 0.4 ? 'rgba(170, 160, 145, 0.35)' : 'rgba(50, 42, 32, 0.4)';
      ctx.beginPath();
      ctx.arc(gx, gy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Patchy Wild Grass & Weeds around the edges
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = size * 0.28 + Math.random() * (size * 0.20);
      const px = size / 2 + Math.cos(angle) * dist;
      const py = size / 2 + Math.sin(angle) * dist;
      const patchR = 30 + Math.random() * 45;

      const grassGrad = ctx.createRadialGradient(px, py, 0, px, py, patchR);
      grassGrad.addColorStop(0, 'rgba(68, 88, 48, 0.6)');
      grassGrad.addColorStop(0.7, 'rgba(84, 98, 54, 0.35)');
      grassGrad.addColorStop(1, 'rgba(84, 98, 54, 0.0)');
      ctx.fillStyle = grassGrad;
      ctx.beginPath();
      ctx.arc(px, py, patchR, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  /**
   * Scattered 3D Wild Grass Tufts around the island.
   */
  createGrassTufts(parentGroup, islandR) {
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x4f6b35, // Dry tropical grass
      roughness: 0.9,
    });

    const tuftCount = 22;
    for (let i = 0; i < tuftCount; i++) {
      const angle = (i / tuftCount) * Math.PI * 2 + (Math.random() * 0.3 - 0.15);
      const dist = 1.35 + Math.random() * (islandR - 1.55); // Around the tire base to curb
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      const bladeGeo = new THREE.ConeGeometry(0.06, 0.22 + Math.random() * 0.14, 4);
      const blade = new THREE.Mesh(bladeGeo, grassMat);
      blade.position.set(x, 0.22 + 0.1, z);
      blade.rotation.x = (Math.random() - 0.5) * 0.3;
      blade.rotation.z = (Math.random() - 0.5) * 0.3;
      parentGroup.add(blade);
    }
  }
}
