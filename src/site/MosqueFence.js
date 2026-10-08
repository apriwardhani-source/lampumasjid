/**
 * MosqueFence.js — Roadside Fence and Entrance Signboard Monument for Masjid Al-Muhajirin.
 *
 * Authentic Architectural Features:
 *  - Roadside green-blue fence along west edge of main road.
 *  - Flanking blue-green pillars with pointed dome lamps (kubah lancip).
 *  - Iconic central signboard monument with blue shingle gable roof canopy (atap genteng biru),
 *    tiled inscription wall: "MASJID AL-MUHAJIRIN DESA KARANG REJO DUSUN BANJAR SARI KEC. JORONG KAB. TANAH LAUT",
 *    and timber support frame with standing secretariat sign to the left.
 */

import * as THREE from 'three';

export class MosqueFenceSystem {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.lightingManager = null;
  }

  setLightingManager(lm) {
    this.lightingManager = lm;
  }

  build() {
    const matCfg = this.config.materials;
    const roadWidth = this.config.road.width;
    const curbW = this.config.road.curbWidth;

    const greenMat = new THREE.MeshStandardMaterial({
      color: matCfg.fenceColorGreen,
      roughness: 0.6,
    });

    const blueMat = new THREE.MeshStandardMaterial({
      color: matCfg.fenceColorBlue,
      roughness: 0.5,
    });

    const ironMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.4,
      metalness: 0.7,
    });

    // White Pointed Mosque Dome Lamp Materials & Geometry
    const domePoints = [];
    domePoints.push(new THREE.Vector2(0, 0));
    domePoints.push(new THREE.Vector2(0.08, 0));
    domePoints.push(new THREE.Vector2(0.09, 0.02));
    domePoints.push(new THREE.Vector2(0.14, 0.06));
    domePoints.push(new THREE.Vector2(0.18, 0.12));
    domePoints.push(new THREE.Vector2(0.20, 0.18)); // Belly diameter 0.40m
    domePoints.push(new THREE.Vector2(0.18, 0.25));
    domePoints.push(new THREE.Vector2(0.14, 0.32));
    domePoints.push(new THREE.Vector2(0.09, 0.38));
    domePoints.push(new THREE.Vector2(0.05, 0.44));
    domePoints.push(new THREE.Vector2(0.015, 0.48));
    domePoints.push(new THREE.Vector2(0.00, 0.51)); // Pointed tip (lancip)

    const domeLampGeo = new THREE.LatheGeometry(domePoints, 24);
    domeLampGeo.computeVertexNormals();

    const domeLampMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.05,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: this.config.nightMode ? 2.6 : 0.2,
    });

    // Lamp dark metal base collar
    const lampBaseGeo = new THREE.CylinderGeometry(0.10, 0.12, 0.03, 16);
    const lampBaseMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.8,
    });

    const fenceHeight = 1.6;
    const postSpacing = 3.0;

    // West side of main road: set back with a 4.0m wide grassy shoulder & ditch between road and fence
    // The road edge is at x = -3.5m, street light poles are at x = -4.15m, and fence is at x = -7.8m.
    const westFenceX = -7.8;

    // ============================================================
    // 1. NORTH FENCE: PART A (From North Gate to Signboard Monument)
    // ============================================================
    this.createFenceSegment(
      { x: westFenceX, z: -35 },
      { x: westFenceX, z: -22.6 },
      fenceHeight, postSpacing, greenMat, blueMat, ironMat,
      domeLampGeo, domeLampMat, lampBaseGeo, lampBaseMat
    );

    // ============================================================
    // 2. ICONIC ENTRANCE SIGNBOARD MONUMENT WITH BLUE ROOF (z = -20)
    // ============================================================
    this.createMosqueSignboardMonument(
      westFenceX,
      -20.0,
      fenceHeight,
      greenMat,
      blueMat,
      domeLampGeo,
      domeLampMat,
      lampBaseGeo,
      lampBaseMat
    );

    // ============================================================
    // 3. NORTH FENCE: PART B (From Signboard Monument to South)
    // ============================================================
    this.createFenceSegment(
      { x: westFenceX, z: -17.4 },
      { x: westFenceX, z: -5 },
      fenceHeight, postSpacing, greenMat, blueMat, ironMat,
      domeLampGeo, domeLampMat, lampBaseGeo, lampBaseMat
    );

    // ============================================================
    // 4. SOUTH FENCE (Main Road West Side towards Bridge)
    // ============================================================
    this.createFenceSegment(
      { x: westFenceX, z: 5 },
      { x: westFenceX, z: 35 },
      fenceHeight, postSpacing, greenMat, blueMat, ironMat,
      domeLampGeo, domeLampMat, lampBaseGeo, lampBaseMat
    );
  }

  createFenceSegment(start, end, h, spacing, greenMat, blueMat, ironMat, domeLampGeo, domeLampMat, lampBaseGeo, lampBaseMat) {
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    const length = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dx, dz);
    const postCount = Math.max(2, Math.floor(length / spacing) + 1);

    for (let i = 0; i < postCount; i++) {
      const t = i / (postCount - 1);
      const px = start.x + dx * t;
      const pz = start.z + dz * t;

      // Blue column
      const colGeo = new THREE.BoxGeometry(0.25, h + 0.3, 0.25);
      const col = new THREE.Mesh(colGeo, blueMat);
      col.position.set(px, (h + 0.3) / 2, pz);
      col.castShadow = true;
      this.scene.add(col);

      // Column cap
      const capGeo = new THREE.BoxGeometry(0.35, 0.1, 0.35);
      const cap = new THREE.Mesh(capGeo, blueMat);
      cap.position.set(px, h + 0.35, pz);
      this.scene.add(cap);

      // White pointed mosque dome lamp on top of cap
      const capTopY = h + 0.40;

      const baseMesh = new THREE.Mesh(lampBaseGeo, lampBaseMat);
      baseMesh.position.set(px, capTopY + 0.015, pz);
      this.scene.add(baseMesh);

      const lampMesh = new THREE.Mesh(domeLampGeo, domeLampMat);
      lampMesh.position.set(px, capTopY + 0.03, pz);
      lampMesh.castShadow = true;
      lampMesh.userData.ledColor = new THREE.Color(0xffffff);
      lampMesh.userData.baseEmissiveIntensity = 2.6;
      this.scene.add(lampMesh);

      if (this.lightingManager) {
        this.lightingManager.registerEmissiveMesh(lampMesh);
      }

      const lampLight = new THREE.PointLight(0xffffff, this.config.nightMode ? 0.75 : 0, 7.5, 1.5);
      lampLight.position.set(px, capTopY + 0.25, pz);
      lampLight.userData.baseIntensity = 0.75;
      this.scene.add(lampLight);

      if (this.lightingManager) {
        this.lightingManager.registerDecorativeLight(lampLight);
      }

      // Panel between columns
      if (i < postCount - 1) {
        const nextT = (i + 1) / (postCount - 1);
        const nx = start.x + dx * nextT;
        const nz = start.z + dz * nextT;
        const panelDx = nx - px;
        const panelDz = nz - pz;
        const panelLen = Math.sqrt(panelDx * panelDx + panelDz * panelDz);
        const panelAngle = Math.atan2(panelDx, panelDz);

        // Lower green panel
        const panelGeo = new THREE.BoxGeometry(0.1, h * 0.5, panelLen - 0.25);
        const panel = new THREE.Mesh(panelGeo, greenMat);
        panel.position.set((px + nx) / 2, h * 0.25, (pz + nz) / 2);
        panel.rotation.y = panelAngle;
        panel.castShadow = true;
        this.scene.add(panel);

        // Upper iron railings
        const railCount = Math.max(3, Math.floor(panelLen / 0.2));
        for (let r = 0; r < railCount; r++) {
          const rt = (r + 0.5) / railCount;
          const rx = px + panelDx * rt;
          const rz = pz + panelDz * rt;
          const railGeo = new THREE.CylinderGeometry(0.015, 0.015, h * 0.45, 4);
          const rail = new THREE.Mesh(railGeo, ironMat);
          rail.position.set(rx, h * 0.5 + h * 0.225, rz);
          this.scene.add(rail);
        }

        // Horizontal top rail
        const topRailGeo = new THREE.BoxGeometry(0.05, 0.04, panelLen - 0.2);
        const topRail = new THREE.Mesh(topRailGeo, ironMat);
        topRail.position.set((px + nx) / 2, h + 0.02, (pz + nz) / 2);
        topRail.rotation.y = panelAngle;
        this.scene.add(topRail);

        // Diamond decoration on green panel
        const diaGeo = new THREE.BoxGeometry(0.12, 0.35, 0.35);
        const dia = new THREE.Mesh(diaGeo, blueMat);
        dia.position.set((px + nx) / 2, h * 0.25, (pz + nz) / 2);
        dia.rotation.y = panelAngle;
        dia.rotation.z = Math.PI / 4;
        this.scene.add(dia);
      }
    }
  }

  /**
   * Iconic Entrance Signboard Monument with Blue Shingle Gable Roof Canopy.
   * Based directly on "pagar depan masjid.png".
   */
  createMosqueSignboardMonument(posX, posZ, h, greenMat, blueMat, domeLampGeo, domeLampMat, lampBaseGeo, lampBaseMat) {
    const group = new THREE.Group();
    group.position.set(posX, 0, posZ);
    group.name = 'mosque-entrance-signboard-monument';

    const wallW = 4.8;  // Width of signboard wall along Z
    const wallH = 1.8;  // Height of signboard wall
    const wallD = 0.28; // Wall thickness along X

    // Materials
    const darkWoodMat = new THREE.MeshStandardMaterial({
      color: 0x3d2612, // Rich dark timber
      roughness: 0.75,
      metalness: 0.05,
    });

    const blueRoofMat = new THREE.MeshStandardMaterial({
      color: 0x1d5ea8, // Glazed royal blue roof shingles
      roughness: 0.35,
      metalness: 0.15,
    });

    const blueRidgeMat = new THREE.MeshStandardMaterial({
      color: 0x14447d, // Darker blue ridge capping
      roughness: 0.3,
      metalness: 0.2,
    });

    // ============================================================
    // A. FLANKING PILLARS (LEFT & RIGHT)
    // ============================================================
    [-1, 1].forEach(side => {
      const pz = side * (wallW / 2 + 0.2);

      // Main concrete pillar (green)
      const postGeo = new THREE.BoxGeometry(0.42, wallH + 0.3, 0.42);
      const post = new THREE.Mesh(postGeo, greenMat);
      post.position.set(0, (wallH + 0.3) / 2, pz);
      post.castShadow = true;
      group.add(post);

      // Recessed blue arch niche on front face (+X)
      const nicheGeo = new THREE.BoxGeometry(0.04, wallH * 0.65, 0.22);
      const niche = new THREE.Mesh(nicheGeo, blueMat);
      niche.position.set(0.20, (wallH * 0.65) / 2 + 0.25, pz);
      group.add(niche);

      // Stepped pillar cap
      const capGeo = new THREE.BoxGeometry(0.54, 0.12, 0.54);
      const cap = new THREE.Mesh(capGeo, greenMat);
      cap.position.set(0, wallH + 0.35, pz);
      group.add(cap);

      // Pointed mosque dome white lamp
      const capTopY = wallH + 0.41;

      const baseMesh = new THREE.Mesh(lampBaseGeo, lampBaseMat);
      baseMesh.position.set(0, capTopY + 0.015, pz);
      group.add(baseMesh);

      const lampMesh = new THREE.Mesh(domeLampGeo, domeLampMat);
      lampMesh.position.set(0, capTopY + 0.03, pz);
      lampMesh.castShadow = true;
      lampMesh.userData.ledColor = new THREE.Color(0xffffff);
      lampMesh.userData.baseEmissiveIntensity = 2.6;
      group.add(lampMesh);

      if (this.lightingManager) {
        this.lightingManager.registerEmissiveMesh(lampMesh);
      }

      const lampLight = new THREE.PointLight(0xffffff, this.config.nightMode ? 0.9 : 0, 8, 1.5);
      lampLight.position.set(0, capTopY + 0.25, pz);
      lampLight.userData.baseIntensity = 0.9;
      group.add(lampLight);

      if (this.lightingManager) {
        this.lightingManager.registerDecorativeLight(lampLight);
      }
    });

    // ============================================================
    // B. SIGNBOARD MAIN WALL & TILED INSCRIPTION PLAQUE
    // ============================================================
    // Base plinth
    const plinthGeo = new THREE.BoxGeometry(wallD + 0.1, 0.35, wallW + 0.1);
    const plinth = new THREE.Mesh(plinthGeo, greenMat);
    plinth.position.set(0, 0.175, 0);
    plinth.receiveShadow = true;
    group.add(plinth);

    // Green wall body
    const bodyGeo = new THREE.BoxGeometry(wallD, wallH - 0.35, wallW);
    const body = new THREE.Mesh(bodyGeo, greenMat);
    body.position.set(0, (wallH + 0.35) / 2, 0);
    body.castShadow = true;
    group.add(body);

    // Top green cornice/molding
    const corniceGeo = new THREE.BoxGeometry(wallD + 0.12, 0.12, wallW + 0.2);
    const cornice = new THREE.Mesh(corniceGeo, greenMat);
    cornice.position.set(0, wallH + 0.06, 0);
    group.add(cornice);

    // Ceramic Tiled Inscription Board Texture
    const plaqueTex = this.createSignboardTexture();
    const plaqueMat = new THREE.MeshStandardMaterial({
      map: plaqueTex,
      roughness: 0.35,
      metalness: 0.05,
    });

    // Front Plaque (facing +X towards road)
    const plaqueGeo = new THREE.PlaneGeometry(wallW - 0.3, wallH - 0.55);
    const plaqueFront = new THREE.Mesh(plaqueGeo, plaqueMat);
    plaqueFront.position.set(wallD / 2 + 0.015, (wallH + 0.25) / 2, 0);
    plaqueFront.rotation.y = Math.PI / 2;
    group.add(plaqueFront);

    // Back Plaque (facing -X towards mosque)
    const plaqueBack = new THREE.Mesh(plaqueGeo, plaqueMat);
    plaqueBack.position.set(-wallD / 2 - 0.015, (wallH + 0.25) / 2, 0);
    plaqueBack.rotation.y = -Math.PI / 2;
    group.add(plaqueBack);

    // Soft warm plaque wash light at night
    const washLight = new THREE.SpotLight(0xfff2d4, this.config.nightMode ? 2.5 : 0, 10, Math.PI / 2.8, 0.5, 1.2);
    washLight.position.set(2.8, 2.2, 0);
    washLight.target.position.set(0, 1.1, 0);
    group.add(washLight.target);
    group.add(washLight);
    washLight.userData.baseIntensity = 2.5;

    if (this.lightingManager) {
      this.lightingManager.registerDecorativeLight(washLight);
    }

    // ============================================================
    // C. OVERHEAD TIMBER STRUCTURE & BLUE SHINGLE GABLE ROOF
    // ============================================================
    const roofSpanZ = 5.8;  // Roof length along Z
    const roofSpanX = 2.8;  // Roof span across X
    const eaveY = 2.45;     // Eaves height
    const ridgeY = 3.65;    // Ridge apex height
    const ridgeX = -0.05;   // Ridge center X

    // 4 Dark Timber Supporting Posts
    const postZ = wallW / 2 - 0.3; // ±2.1m
    const postX_front = wallD / 2 + 0.35;
    const postX_back = -wallD / 2 - 0.45;

    [
      { x: postX_front, z: -postZ },
      { x: postX_front, z: postZ },
      { x: postX_back, z: -postZ },
      { x: postX_back, z: postZ },
    ].forEach(pt => {
      const woodPostGeo = new THREE.BoxGeometry(0.12, eaveY + 0.2, 0.12);
      const woodPost = new THREE.Mesh(woodPostGeo, darkWoodMat);
      woodPost.position.set(pt.x, (eaveY + 0.2) / 2, pt.z);
      woodPost.castShadow = true;
      group.add(woodPost);
    });

    // Horizontal Wooden Tie Beams connecting the posts
    [-postZ, postZ].forEach(pz => {
      const tieGeo = new THREE.BoxGeometry(postX_front - postX_back + 0.15, 0.10, 0.10);
      const tie = new THREE.Mesh(tieGeo, darkWoodMat);
      tie.position.set((postX_front + postX_back) / 2, eaveY, pz);
      group.add(tie);
    });

    [postX_front, postX_back].forEach(px => {
      const tieGeo = new THREE.BoxGeometry(0.10, 0.10, postZ * 2 + 0.2);
      const tie = new THREE.Mesh(tieGeo, darkWoodMat);
      tie.position.set(px, eaveY, 0);
      group.add(tie);
    });

    // Timber Gable Truss Triangles at North and South ends
    [-postZ, postZ].forEach(pz => {
      const kingGeo = new THREE.BoxGeometry(0.08, ridgeY - eaveY, 0.08);
      const king = new THREE.Mesh(kingGeo, darkWoodMat);
      king.position.set(ridgeX, (eaveY + ridgeY) / 2, pz);
      group.add(king);
    });

    // Ridge Beam
    const ridgeBeamGeo = new THREE.BoxGeometry(0.12, 0.12, roofSpanZ);
    const ridgeBeam = new THREE.Mesh(ridgeBeamGeo, darkWoodMat);
    ridgeBeam.position.set(ridgeX, ridgeY, 0);
    group.add(ridgeBeam);

    // Blue Shingle Slanted Roof Slopes (East & West)
    const slopeLen = Math.hypot(roofSpanX / 2, ridgeY - eaveY) + 0.15;
    const slopeAngle = Math.atan2(ridgeY - eaveY, roofSpanX / 2);

    // 1. East Roof Slope (facing road +X)
    const eastSlopeGeo = new THREE.BoxGeometry(slopeLen, 0.06, roofSpanZ);
    const eastSlope = new THREE.Mesh(eastSlopeGeo, blueRoofMat);
    eastSlope.position.set(ridgeX + (roofSpanX / 4), (eaveY + ridgeY) / 2, 0);
    eastSlope.rotation.z = -slopeAngle;
    eastSlope.castShadow = true;
    group.add(eastSlope);

    // 2. West Roof Slope (facing mosque -X)
    const westSlopeGeo = new THREE.BoxGeometry(slopeLen, 0.06, roofSpanZ);
    const westSlope = new THREE.Mesh(westSlopeGeo, blueRoofMat);
    westSlope.position.set(ridgeX - (roofSpanX / 4), (eaveY + ridgeY) / 2, 0);
    westSlope.rotation.z = slopeAngle;
    westSlope.castShadow = true;
    group.add(westSlope);

    // Horizontal ridge capping tiles along the top
    const ridgeCapGeo = new THREE.BoxGeometry(0.24, 0.08, roofSpanZ + 0.1);
    const ridgeCap = new THREE.Mesh(ridgeCapGeo, blueRidgeMat);
    ridgeCap.position.set(ridgeX, ridgeY + 0.04, 0);
    group.add(ridgeCap);

    // Stepped Shingle / Tile Ribs on East Slope for Authentic Texture
    for (let r = 1; r <= 7; r++) {
      const frac = r / 8;
      const rx = ridgeX + frac * (roofSpanX / 2);
      const ry = ridgeY - frac * (ridgeY - eaveY);
      const ribGeo = new THREE.BoxGeometry(0.04, 0.03, roofSpanZ);
      const rib = new THREE.Mesh(ribGeo, blueRidgeMat);
      rib.position.set(rx, ry + 0.035, 0);
      rib.rotation.z = -slopeAngle;
      group.add(rib);
    }

    // Gable Finial Horns at Ridge Ends (Lancipan Khas Banjar)
    [-1, 1].forEach(side => {
      const fz = side * (roofSpanZ / 2 + 0.02);
      const finialGeo = new THREE.ConeGeometry(0.06, 0.35, 4);
      const finial = new THREE.Mesh(finialGeo, darkWoodMat);
      finial.position.set(ridgeX, ridgeY + 0.18, fz);
      finial.rotation.x = side * 0.3;
      group.add(finial);
    });

    // ============================================================
    // D. STANDING SECRETARIAT SIGN (TO THE LEFT)
    // ============================================================
    const signGroup = new THREE.Group();
    signGroup.position.set(-0.25, 0, -3.8); // To the left of main monument

    // 2 Steel posts
    [-0.32, 0.32].forEach(sz => {
      const legGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.6, 8);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(0, 0.8, sz);
      signGroup.add(leg);
    });

    // White signboard board
    const sBoardGeo = new THREE.BoxGeometry(0.03, 0.65, 0.85);
    const sBoardMat = new THREE.MeshStandardMaterial({
      map: this.createSekretariatTexture(),
      roughness: 0.35,
    });
    const sBoard = new THREE.Mesh(sBoardGeo, sBoardMat);
    sBoard.position.set(0, 1.25, 0);
    sBoard.rotation.y = Math.PI / 2;
    signGroup.add(sBoard);

    group.add(signGroup);

    this.scene.add(group);
  }

  /**
   * Procedural Inscription Board Texture for "MASJID AL-MUHAJIRIN"
   * Ceramic green tiles with ornate terracotta/gold border.
   */
  createSignboardTexture() {
    const w = 1536;
    const h = 768;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    // 1. Pale Sage / Mint Green Ceramic Tile Background
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#c6e3cb');
    bg.addColorStop(0.5, '#d3edd8');
    bg.addColorStop(1, '#c2dfc7');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Subtle ceramic tile grout lines (6x3 grid)
    ctx.save();
    ctx.strokeStyle = 'rgba(160, 195, 168, 0.5)';
    ctx.lineWidth = 2;
    const cols = 8;
    const rows = 4;
    for (let c = 1; c < cols; c++) {
      const gx = c * (w / cols);
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }
    for (let r = 1; r < rows; r++) {
      const gy = r * (h / rows);
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Ornamental Terracotta / Floral Border
    ctx.save();
    const bMargin = 28;
    const bThick = 24;

    // Terracotta outer band
    ctx.strokeStyle = '#8d4f2b';
    ctx.lineWidth = bThick;
    ctx.strokeRect(bMargin, bMargin, w - bMargin * 2, h - bMargin * 2);

    // Repeating gold diamond motifs along border
    ctx.fillStyle = '#f5d77f';
    const drawDiamondsAlongX = (y) => {
      for (let x = bMargin + 40; x < w - bMargin - 30; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, y - 6);
        ctx.lineTo(x + 6, y);
        ctx.lineTo(x, y + 6);
        ctx.lineTo(x - 6, y);
        ctx.closePath();
        ctx.fill();
      }
    };
    drawDiamondsAlongX(bMargin);
    drawDiamondsAlongX(h - bMargin);

    // Inner gold pinstripe
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.strokeRect(bMargin + 16, bMargin + 16, w - (bMargin + 16) * 2, h - (bMargin + 16) * 2);
    ctx.restore();

    // 3. Official Mosque Inscription Typography
    ctx.save();
    ctx.textAlign = 'center';

    // Line 1: MASJID
    ctx.font = 'bold 54px "Montserrat", "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#0a2e12'; // Dark forest green
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText('MASJID', w / 2, 190);

    // Line 2: AL - MUHAJIRIN (Prominent)
    ctx.font = '900 96px "Montserrat", "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#06240d';
    ctx.fillText('AL - MUHAJIRIN', w / 2, 310);

    // Decorative separator line with star
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#0a2e12';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 280, 360);
    ctx.lineTo(w / 2 + 280, 360);
    ctx.stroke();

    ctx.fillStyle = '#165b26';
    ctx.font = '22px Arial';
    ctx.fillText('✦ ✦ ✦', w / 2, 362);

    // Line 3: DESA KARANG REJO DUSUN BANJAR SARI
    ctx.font = 'bold 44px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#0a2e12';
    ctx.fillText('DESA KARANG REJO DUSUN BANJAR SARI', w / 2, 460);

    // Line 4: KEC. JORONG KAB. TANAH LAUT
    ctx.font = 'bold 44px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#0a2e12';
    ctx.fillText('KEC. JORONG KAB. TANAH LAUT', w / 2, 545);

    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  /**
   * Procedural Texture for Standing Secretariat Sign
   */
  createSekretariatTexture() {
    const w = 512;
    const h = 384;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    // White background with green frame
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 8;
    ctx.strokeRect(12, 12, w - 24, h - 24);

    ctx.textAlign = 'center';

    // Header
    ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#166534';
    ctx.fillText('SEKRETARIAT', w / 2, 68);

    // Subheader
    ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#1f2937';
    ctx.fillText('Remaja Masjid Al-Muhajirin', w / 2, 108);

    // Green circular logo in center
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(w / 2, 185, 45, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(w / 2, 185, 20, Math.PI, 0, false);
    ctx.fill();

    // Footer lines
    ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#374151';
    ctx.fillText('Dsn. Karang Rejo Ds. Banjar Sari', w / 2, 280);

    ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#166534';
    ctx.fillText('RT 004', w / 2, 325);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }
}
