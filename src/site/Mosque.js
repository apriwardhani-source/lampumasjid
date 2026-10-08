/**
 * Mosque.js — Faithful procedural architectural model of Masjid Al-Muhajirin
 * based on the actual reference photos (masjid.png, tata letak.jpeg).
 *
 * Authentic Architectural Features:
 *  - Oriented facing EAST (+X) towards the road and front courtyard
 *  - Signature bell/onion shaped weathered dome with vertical flutes & scalloped eaves
 *  - Cylindrical drum with a complete ring of 16 arched clerestory windows
 *  - 4 Megaphone speakers (Toa Masjid) mounted under the dome eaves
 *  - 1-story building in warm ochre-cream with dark navy blue accent trims
 *  - Grand front veranda (serambi) with 7 columns, horseshoe arches & blue trim
 *  - Central raised parapet with Arabic calligraphy plaque: "مسجد المهاجرين"
 *  - Wrap-around side veranda along the south side
 *  - Raised tiled plinth with perimeter entrance steps
 *  - Shaded steel carport with ambulance/van on the south side
 *  - Standalone 4-legged steel lattice loudspeaker tower on the southwest corner
 *  - Wide gravel/paved front courtyard with garden globe lamps
 */

import * as THREE from 'three';

export class MosqueBuilder {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.lightingManager = null;
  }

  setLightingManager(lm) {
    this.lightingManager = lm;
  }

  build() {
    const layout = this.config.layout.mosque;
    const group = new THREE.Group();
    group.position.set(layout.position.x, layout.position.y, layout.position.z);
    group.rotation.y = layout.rotation || 0;
    group.name = 'mosque-al-muhajirin';

    // ==========================================
    // COLOR PALETTE & MATERIALS (FROM REFERENCE)
    // ==========================================
    // Walls: warm ochre-cream
    const wallCreamMat = new THREE.MeshStandardMaterial({
      color: 0xedd9a6,
      roughness: 0.75,
      metalness: 0.05,
    });

    // Darker recessed walls behind veranda
    const wallInnerMat = new THREE.MeshStandardMaterial({
      color: 0xdfcb94,
      roughness: 0.8,
    });

    // Dark navy blue accent trim
    const navyBlueMat = new THREE.MeshStandardMaterial({
      color: 0x1b3c6e,
      roughness: 0.45,
      metalness: 0.2,
    });

    // Gold for finial, column rings, calligraphy
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xdca638,
      roughness: 0.25,
      metalness: 0.85,
      emissive: new THREE.Color(0xdca638),
      emissiveIntensity: this.config.nightMode ? 1.0 : 0,
    });

    // Weathered metallic bell dome (zinc / tin)
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0x9e9486,
      roughness: 0.45,
      metalness: 0.35,
    });

    // Plinth floor (sandstone cream tile)
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0xdfd4bc,
      roughness: 0.7,
    });

    // Window glass (dark reflective by day, warm glowing by night)
    const windowGlassMat = new THREE.MeshStandardMaterial({
      color: 0x223344,
      roughness: 0.2,
      metalness: 0.1,
      emissive: new THREE.Color(0xff9922),
      emissiveIntensity: this.config.nightMode ? 1.8 : 0,
    });

    // Carport steel & corrugated roof
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x7a828e,
      roughness: 0.4,
      metalness: 0.8,
    });
    const carportRoofMat = new THREE.MeshStandardMaterial({
      color: 0x2a4c78,
      roughness: 0.5,
      metalness: 0.2,
    });

    // Speaker horn material (cream/white plastic)
    const speakerMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5f0,
      roughness: 0.4,
    });

    // ==========================================
    // 1. RAISED PLINTH & STEPS (Lantai Teras)
    // ==========================================
    // Base platform: Width Z=18m, Depth X=16m, Height 0.45m
    const plinthGeo = new THREE.BoxGeometry(16, 0.45, 19);
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.set(-0.5, 0.225, -0.5);
    plinth.receiveShadow = true;
    group.add(plinth);

    // Front perimeter steps (2 steps leading down to courtyard)
    const step1Geo = new THREE.BoxGeometry(1.2, 0.25, 19.8);
    const step1 = new THREE.Mesh(step1Geo, plinthMat);
    step1.position.set(7.8, 0.125, -0.5);
    step1.receiveShadow = true;
    group.add(step1);

    const step2Geo = new THREE.BoxGeometry(1.0, 0.12, 20.4);
    const step2 = new THREE.Mesh(step2Geo, plinthMat);
    step2.position.set(8.7, 0.06, -0.5);
    step2.receiveShadow = true;
    group.add(step2);

    // ==========================================
    // 2. MAIN PRAYER HALL (Ruang Sholat Utama)
    // ==========================================
    // Main enclosed building block behind the veranda
    // Placed from x = -7.5 to x = +2.5, z = -7.5 to z = +6.5, height = 4.5m
    const hallWidthX = 10.0;
    const hallWidthZ = 14.0;
    const hallHeight = 4.5;
    const hallGeo = new THREE.BoxGeometry(hallWidthX, hallHeight, hallWidthZ);
    const hall = new THREE.Mesh(hallGeo, wallInnerMat);
    hall.position.set(-2.5, hallHeight / 2 + 0.45, -0.5);
    hall.castShadow = true;
    hall.receiveShadow = true;
    group.add(hall);

    // Front wall doors and windows under veranda (facing East / +X)
    this.createFacadeOpenings(group, windowGlassMat, navyBlueMat);

    // ==========================================
    // 3. VERANDA (Serambi Depan & Samping)
    // ==========================================
    // Flat cantilevered veranda canopy roof
    const verandaRoofGeo = new THREE.BoxGeometry(7.0, 0.28, 18.0);
    const verandaRoof = new THREE.Mesh(verandaRoofGeo, wallCreamMat);
    verandaRoof.position.set(4.0, 4.65, -0.5);
    verandaRoof.castShadow = true;
    verandaRoof.receiveShadow = true;
    group.add(verandaRoof);

    // Blue fascia band along veranda roof edge
    const fasciaGeo = new THREE.BoxGeometry(0.08, 0.12, 18.04);
    const fascia = new THREE.Mesh(fasciaGeo, navyBlueMat);
    fascia.position.set(7.54, 4.65, -0.5);
    group.add(fascia);

    // Side fascia band (North and South edges)
    [-9.5, 8.5].forEach(fz => {
      const sFasciaGeo = new THREE.BoxGeometry(7.04, 0.12, 0.08);
      const sFascia = new THREE.Mesh(sFasciaGeo, navyBlueMat);
      sFascia.position.set(4.0, 4.65, fz);
      group.add(sFascia);
    });

    // 7 Columns along the Front Facade (6 bays, facing East / +X)
    const colCount = 7;
    const colZStart = -8.0;
    const colZEnd = 7.0;
    const colX = 7.0;
    const colRadius = 0.16;
    const colHeight = 4.1;

    for (let i = 0; i < colCount; i++) {
      const zPos = colZStart + (i / (colCount - 1)) * (colZEnd - colZStart);
      this.createVerandaColumn(group, colX, zPos, colRadius, colHeight, wallCreamMat, navyBlueMat, goldMat);
    }

    // Horseshoe / Moorish arches spanning between front columns
    for (let i = 0; i < colCount - 1; i++) {
      const z1 = colZStart + (i / (colCount - 1)) * (colZEnd - colZStart);
      const z2 = colZStart + ((i + 1) / (colCount - 1)) * (colZEnd - colZStart);
      const span = Math.abs(z2 - z1);
      const midZ = (z1 + z2) / 2;
      this.createArchedHeader(group, colX, midZ, span, wallCreamMat, navyBlueMat, false);
    }

    // 4 Columns along South Side Veranda (+Z side, wrapping around)
    const sideColCount = 4;
    const sideStartX = 1.0;
    const sideEndX = 7.0;
    const sideZ = 7.0;
    for (let i = 0; i < sideColCount - 1; i++) {
      const xPos = sideStartX + (i / (sideColCount - 1)) * (sideEndX - sideStartX);
      this.createVerandaColumn(group, xPos, sideZ, colRadius, colHeight, wallCreamMat, navyBlueMat, goldMat);
      
      const xNext = sideStartX + ((i + 1) / (sideColCount - 1)) * (sideEndX - sideStartX);
      const span = Math.abs(xNext - xPos);
      const midX = (xPos + xNext) / 2;
      this.createArchedHeader(group, midX, sideZ, span, wallCreamMat, navyBlueMat, true);
    }

    // Central Parapet Header with Arabic Calligraphy Plaque: "مسجد المهاجرين"
    this.createCalligraphyPlaque(group, colX, -0.5, wallCreamMat, navyBlueMat, goldMat);

    // Warm veranda ceiling lights
    [-4.5, -0.5, 3.5].forEach(lz => {
      const vLight = new THREE.PointLight(0xffbe6b, 2.0, 10, 1.4);
      vLight.position.set(4.0, 4.3, lz);
      vLight.userData.baseIntensity = 2.0;
      group.add(vLight);
      if (this.lightingManager) this.lightingManager.registerDecorativeLight(vLight);
    });

    // ==========================================
    // 4. UPPER CLERESTORY TIER (Tingkat Atas Bawah Kubah)
    // ==========================================
    // Stepped square tier between main roof and dome drum
    const upperGeo = new THREE.BoxGeometry(11.0, 1.3, 11.0);
    const upperTier = new THREE.Mesh(upperGeo, wallCreamMat);
    upperTier.position.set(-2.5, 5.4, -0.5);
    upperTier.castShadow = true;
    upperTier.receiveShadow = true;
    group.add(upperTier);

    // Blue horizontal accent band around upper clerestory
    const bandGeo = new THREE.BoxGeometry(11.1, 0.1, 11.1);
    const band = new THREE.Mesh(bandGeo, navyBlueMat);
    band.position.set(-2.5, 5.9, -0.5);
    group.add(band);

    // Rectangular ventilation vents/louvers on clerestory
    this.createClerestoryVents(group, navyBlueMat);

    // ==========================================
    // 5. DRUM WITH RING OF ARCHED WINDOWS (Leher Kubah)
    // ==========================================
    const drumRadius = 4.2;
    const drumHeight = 1.6;
    const drumCenterY = 6.8;

    // Drum solid wall cylinder
    const drumGeo = new THREE.CylinderGeometry(drumRadius, drumRadius, drumHeight, 32);
    const drum = new THREE.Mesh(drumGeo, wallCreamMat);
    drum.position.set(-2.5, drumCenterY, -0.5);
    drum.castShadow = true;
    drum.receiveShadow = true;
    group.add(drum);

    // 16 Arched windows completely surrounding the drum
    const windowCount = 16;
    for (let i = 0; i < windowCount; i++) {
      const angle = (i / windowCount) * Math.PI * 2;
      const wx = -2.5 + Math.cos(angle) * (drumRadius + 0.04);
      const wz = -0.5 + Math.sin(angle) * (drumRadius + 0.04);

      // Window pane
      const winGeo = new THREE.BoxGeometry(0.55, 1.0, 0.06);
      const winMesh = new THREE.Mesh(winGeo, windowGlassMat.clone());
      winMesh.userData.ledColor = new THREE.Color(0xff8c00);
      winMesh.userData.baseEmissiveIntensity = 1.8;
      winMesh.position.set(wx, drumCenterY, wz);
      winMesh.lookAt(-2.5, drumCenterY, -0.5);
      group.add(winMesh);
      if (this.lightingManager) this.lightingManager.registerEmissiveMesh(winMesh);

      // Arch moulding above window
      const archTopGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.08, 12, 1, false, 0, Math.PI);
      archTopGeo.rotateZ(Math.PI / 2);
      const archTop = new THREE.Mesh(archTopGeo, wallCreamMat);
      archTop.position.set(wx, drumCenterY + 0.52, wz);
      archTop.lookAt(-2.5, drumCenterY + 0.52, -0.5);
      group.add(archTop);
    }

    // ==========================================
    // 6. BELL / ONION SHAPED DOME (Kubah Khas Al-Muhajirin)
    // ==========================================
    // Profile curve for authentic bell / onion dome
    const domePoints = [
      new THREE.Vector2(4.65, 0.0),    // Flared bottom rim
      new THREE.Vector2(4.75, 0.5),    // Swelling curve
      new THREE.Vector2(4.70, 1.4),
      new THREE.Vector2(4.30, 2.5),    // Curving in
      new THREE.Vector2(3.60, 3.5),
      new THREE.Vector2(2.40, 4.4),    // Tapering
      new THREE.Vector2(1.10, 5.1),    // Peak neck
      new THREE.Vector2(0.30, 5.6),    // Pointed tip
      new THREE.Vector2(0.00, 5.8),
    ];

    const domeShellGeo = new THREE.LatheGeometry(domePoints, 32);
    const domeShell = new THREE.Mesh(domeShellGeo, domeMat);
    domeShell.position.set(-2.5, 7.6, -0.5);
    domeShell.castShadow = true;
    domeShell.receiveShadow = true;
    group.add(domeShell);

    // 16 Vertical ribs / flutes along the dome
    const ribCount = 16;
    for (let i = 0; i < ribCount; i++) {
      const angle = (i / ribCount) * Math.PI * 2;
      const ribCurvePoints = domePoints.map(p => {
        return new THREE.Vector3(
          Math.cos(angle) * (p.x + 0.02),
          p.y,
          Math.sin(angle) * (p.x + 0.02)
        );
      });
      const ribCurve = new THREE.CatmullRomCurve3(ribCurvePoints);
      const ribGeo = new THREE.TubeGeometry(ribCurve, 20, 0.025, 4, false);
      const ribMesh = new THREE.Mesh(ribGeo, domeMat);
      ribMesh.position.set(-2.5, 7.6, -0.5);
      group.add(ribMesh);
    }

    // Scalloped / Petal Eaves around the bottom rim of the dome
    const petalCount = 20;
    const petalRadius = 4.75;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const px = -2.5 + Math.cos(angle) * petalRadius;
      const pz = -0.5 + Math.sin(angle) * petalRadius;

      const petalGeo = new THREE.CylinderGeometry(0.42, 0.25, 0.08, 12);
      petalGeo.rotateX(Math.PI / 2);
      const petal = new THREE.Mesh(petalGeo, domeMat);
      petal.position.set(px, 7.55, pz);
      petal.lookAt(-2.5, 7.55, -0.5);
      group.add(petal);
    }

    // 4 Loudspeakers (Toa Masjid) mounted under dome eaves facing 4 directions
    [
      { dx: 4.2, dz: 0, rot: 0 },
      { dx: -4.2, dz: 0, rot: Math.PI },
      { dx: 0, dz: 4.2, rot: Math.PI / 2 },
      { dx: 0, dz: -4.2, rot: -Math.PI / 2 },
    ].forEach(spk => {
      const hornGeo = new THREE.ConeGeometry(0.35, 0.65, 12, 1, true);
      hornGeo.rotateX(Math.PI / 2);
      const horn = new THREE.Mesh(hornGeo, speakerMat);
      horn.position.set(-2.5 + spk.dx, 7.45, -0.5 + spk.dz);
      horn.rotation.y = spk.rot;
      group.add(horn);

      const baseCyl = new THREE.CylinderGeometry(0.12, 0.12, 0.25, 8);
      baseCyl.rotateX(Math.PI / 2);
      const baseMesh = new THREE.Mesh(baseCyl, speakerMat);
      baseMesh.position.set(-2.5 + spk.dx * 0.95, 7.45, -0.5 + spk.dz * 0.95);
      baseMesh.rotation.y = spk.rot;
      group.add(baseMesh);
    });

    // Dome Spike Finial & Crescent Moon
    const spikeGeo = new THREE.CylinderGeometry(0.04, 0.06, 1.8, 8);
    const spike = new THREE.Mesh(spikeGeo, goldMat);
    spike.position.set(-2.5, 7.6 + 5.8 + 0.9, -0.5);
    group.add(spike);

    const crescentGeo = new THREE.TorusGeometry(0.38, 0.055, 8, 24, Math.PI * 1.55);
    const crescent = new THREE.Mesh(crescentGeo, goldMat);
    crescent.position.set(-2.5, 7.6 + 5.8 + 1.9, -0.5);
    crescent.rotation.z = Math.PI * 0.25;
    crescent.userData.ledColor = new THREE.Color(0xffaa00);
    crescent.userData.baseEmissiveIntensity = 1.2;
    group.add(crescent);
    if (this.lightingManager) this.lightingManager.registerEmissiveMesh(crescent);

    // ==========================================
    // 7. CARPORT CANOPY & VEHICLE (South Side / +Z)
    // ==========================================
    // Lean-to steel canopy on south side where ambulance is parked
    this.createCarportAndVehicle(group, steelMat, carportRoofMat);

    // ==========================================
    // 8. STANDALONE LATTICE SPEAKER TOWER (Menara Kisi Baja)
    // ==========================================
    // Located southwest corner behind the carport
    this.createLatticeSpeakerTower(group, steelMat, speakerMat);

    // ==========================================
    // 9. COURTYARD & GARDEN GLOBE LAMPS (Halaman Masjid)
    // ==========================================
    this.createCourtyard(group);

    this.scene.add(group);
    this.mosqueGroup = group;
  }

  /**
   * Front veranda cylindrical column with navy blue & gold accents.
   */
  createVerandaColumn(group, x, z, radius, height, creamMat, blueMat, goldMat) {
    const colGroup = new THREE.Group();
    colGroup.position.set(x, 0.45, z);

    // Square plinth base
    const baseBlockGeo = new THREE.BoxGeometry(radius * 3.0, 0.22, radius * 3.0);
    const baseBlock = new THREE.Mesh(baseBlockGeo, creamMat);
    baseBlock.position.y = 0.11;
    colGroup.add(baseBlock);

    // Blue collar ring at base
    const baseRingGeo = new THREE.CylinderGeometry(radius * 1.35, radius * 1.45, 0.28, 16);
    const baseRing = new THREE.Mesh(baseRingGeo, blueMat);
    baseRing.position.y = 0.36;
    colGroup.add(baseRing);

    // Gold trim band at base
    const goldBandGeo = new THREE.TorusGeometry(radius * 1.2, 0.02, 6, 16);
    goldBandGeo.rotateX(Math.PI / 2);
    const goldBand = new THREE.Mesh(goldBandGeo, goldMat);
    goldBand.position.y = 0.52;
    colGroup.add(goldBand);

    // Column shaft
    const shaftGeo = new THREE.CylinderGeometry(radius, radius * 1.05, height - 1.0, 16);
    const shaft = new THREE.Mesh(shaftGeo, creamMat);
    shaft.position.y = (height - 1.0) / 2 + 0.52;
    shaft.castShadow = true;
    colGroup.add(shaft);

    // Top capital with blue collar & gold ring
    const topGoldGeo = new THREE.TorusGeometry(radius * 1.2, 0.02, 6, 16);
    topGoldGeo.rotateX(Math.PI / 2);
    const topGold = new THREE.Mesh(topGoldGeo, goldMat);
    topGold.position.y = height - 0.45;
    colGroup.add(topGold);

    const topRingGeo = new THREE.CylinderGeometry(radius * 1.4, radius * 1.15, 0.28, 16);
    const topRing = new THREE.Mesh(topRingGeo, blueMat);
    topRing.position.y = height - 0.3;
    colGroup.add(topRing);

    const capBlockGeo = new THREE.BoxGeometry(radius * 3.0, 0.16, radius * 3.0);
    const capBlock = new THREE.Mesh(capBlockGeo, creamMat);
    capBlock.position.y = height - 0.08;
    colGroup.add(capBlock);

    group.add(colGroup);
  }

  /**
   * Arched spandrel beam spanning between two columns with blue accent trim.
   */
  createArchedHeader(group, x, z, span, creamMat, blueMat, isSide) {
    const archGroup = new THREE.Group();
    archGroup.position.set(x, 4.4, z);
    if (isSide) archGroup.rotation.y = Math.PI / 2;

    // Horizontal header beam
    const beamGeo = new THREE.BoxGeometry(0.32, 0.35, span);
    const beam = new THREE.Mesh(beamGeo, creamMat);
    beam.position.y = 0.1;
    archGroup.add(beam);

    // Curved arched trim (horseshoe style)
    const curvePoints = [];
    const segments = 16;
    const archH = 0.45;
    const halfSpan = span / 2 - 0.2;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = Math.PI * t;
      const az = -halfSpan + t * (span - 0.4);
      const ay = -archH * Math.sin(angle);
      curvePoints.push(new THREE.Vector3(0, ay, az));
    }

    const archCurve = new THREE.CatmullRomCurve3(curvePoints);
    const archTubeGeo = new THREE.TubeGeometry(archCurve, 16, 0.045, 6, false);
    const archTube = new THREE.Mesh(archTubeGeo, blueMat);
    archGroup.add(archTube);

    group.add(archGroup);
  }

  /**
   * Front Facade Door & Windows behind the veranda.
   */
  createFacadeOpenings(group, glassMat, blueMat) {
    const wallX = 2.52; // Front surface of main hall

    // Center double entrance doors
    const doorFrameGeo = new THREE.BoxGeometry(0.12, 2.7, 2.0);
    const doorFrame = new THREE.Mesh(doorFrameGeo, blueMat);
    doorFrame.position.set(wallX, 1.8, -0.5);
    group.add(doorFrame);

    const doorGlassGeo = new THREE.BoxGeometry(0.08, 2.4, 1.7);
    const doorGlass = new THREE.Mesh(doorGlassGeo, glassMat.clone());
    doorGlass.userData.ledColor = new THREE.Color(0xff8c00);
    doorGlass.userData.baseEmissiveIntensity = 1.8;
    doorGlass.position.set(wallX + 0.02, 1.8, -0.5);
    group.add(doorGlass);
    if (this.lightingManager) this.lightingManager.registerEmissiveMesh(doorGlass);

    // Rectangular windows on either side of the entrance
    [-5.5, -3.2, 2.2, 4.5].forEach(wz => {
      const winFrameGeo = new THREE.BoxGeometry(0.12, 2.2, 1.3);
      const winFrame = new THREE.Mesh(winFrameGeo, blueMat);
      winFrame.position.set(wallX, 2.0, wz);
      group.add(winFrame);

      const winGlassGeo = new THREE.BoxGeometry(0.06, 1.9, 1.05);
      const winGlass = new THREE.Mesh(winGlassGeo, glassMat.clone());
      winGlass.userData.ledColor = new THREE.Color(0xff8c00);
      winGlass.userData.baseEmissiveIntensity = 1.8;
      winGlass.position.set(wallX + 0.02, 2.0, wz);
      group.add(winGlass);
      if (this.lightingManager) this.lightingManager.registerEmissiveMesh(winGlass);
    });
  }

  /**
   * Raised Arabic Calligraphy Plaque above center entrance: "مسjid Al-Muhajirin".
   */
  createCalligraphyPlaque(group, x, z, creamMat, blueMat, goldMat) {
    const plaqueGroup = new THREE.Group();
    plaqueGroup.position.set(x + 0.05, 5.15, z);

    // Raised decorative parapet
    const parapetGeo = new THREE.BoxGeometry(0.25, 0.85, 3.8);
    const parapet = new THREE.Mesh(parapetGeo, creamMat);
    plaqueGroup.add(parapet);

    // Blue frame moulding
    const borderGeo = new THREE.BoxGeometry(0.28, 0.75, 3.6);
    const border = new THREE.Mesh(borderGeo, blueMat);
    plaqueGroup.add(border);

    // Cream inner cartouche
    const innerCartGeo = new THREE.BoxGeometry(0.3, 0.62, 3.4);
    const innerCart = new THREE.Mesh(innerCartGeo, creamMat);
    plaqueGroup.add(innerCart);

    // Canvas texture with Arabic Calligraphy
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Cartouche background
    ctx.fillStyle = '#f2e2be';
    ctx.fillRect(0, 0, 512, 128);

    // Ornate gold calligraphy simulation / text
    ctx.strokeStyle = '#1b3c6e';
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, 496, 112);

    ctx.fillStyle = '#b88618';
    ctx.font = 'bold 52px "Traditional Arabic", "Amiri", "Scheherazade", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('مَسْجِدُ الْمُهَاجِرِيْن', 256, 64);

    const plaqueTex = new THREE.CanvasTexture(canvas);
    const plaqueMat = new THREE.MeshStandardMaterial({
      map: plaqueTex,
      roughness: 0.4,
    });

    const signPlaneGeo = new THREE.PlaneGeometry(3.35, 0.6);
    const signMesh = new THREE.Mesh(signPlaneGeo, plaqueMat);
    signMesh.rotation.y = Math.PI / 2;
    signMesh.position.set(0.16, 0, 0);
    plaqueGroup.add(signMesh);

    group.add(plaqueGroup);
  }

  /**
   * Clerestory vents / louvers below the dome.
   */
  createClerestoryVents(group, blueMat) {
    [-6.0, 1.0].forEach(vz => {
      const ventGeo = new THREE.BoxGeometry(0.08, 0.35, 1.8);
      const vent = new THREE.Mesh(ventGeo, blueMat);
      vent.position.set(3.02, 5.4, vz);
      group.add(vent);
    });
  }

  /**
   * Carport canopy and operational van / ambulance on south side (+Z).
   */
  createCarportAndVehicle(group, steelMat, roofMat) {
    const cpX = -0.5;
    const cpZ = 12.0;

    // Steel post canopy frame
    const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 3.8, 8);
    [
      { x: -3.5, z: 9.5 },
      { x: 3.5, z: 9.5 },
      { x: -3.5, z: 14.5 },
      { x: 3.5, z: 14.5 },
    ].forEach(p => {
      const post = new THREE.Mesh(postGeo, steelMat);
      post.position.set(p.x, 1.9, p.z);
      post.castShadow = true;
      group.add(post);
    });

    // Sloped carport roof
    const roofGeo = new THREE.BoxGeometry(8.0, 0.1, 6.0);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 3.7, 12.0);
    roof.rotation.z = -0.06; // slight slope
    roof.castShadow = true;
    group.add(roof);

    // Operational Ambulance / Van parked under canopy
    const vanGroup = new THREE.Group();
    vanGroup.position.set(0, 0, 12.0);

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd8ded8, roughness: 0.5 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x1a2430, roughness: 0.2 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });

    // Lower chassis
    const bodyGeo = new THREE.BoxGeometry(4.2, 1.2, 1.8);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.9;
    body.castShadow = true;
    vanGroup.add(body);

    // Cabin top
    const cabGeo = new THREE.BoxGeometry(3.0, 0.9, 1.7);
    const cab = new THREE.Mesh(cabGeo, bodyMat);
    cab.position.set(-0.3, 1.8, 0);
    cab.castShadow = true;
    vanGroup.add(cab);

    // Windshield & side glass
    const wsGeo = new THREE.BoxGeometry(0.1, 0.7, 1.6);
    const ws = new THREE.Mesh(wsGeo, glassMat);
    ws.position.set(1.22, 1.75, 0);
    vanGroup.add(ws);

    // Green stripe along ambulance side (Puskesmas / Layanan Ummat)
    const stripeGeo = new THREE.BoxGeometry(4.22, 0.15, 1.82);
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32 });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.y = 1.0;
    vanGroup.add(stripe);

    // Red emergency lightbar on roof
    const lightbarGeo = new THREE.BoxGeometry(0.3, 0.12, 0.9);
    const lightbarMat = new THREE.MeshStandardMaterial({
      color: 0xd32f2f,
      emissive: new THREE.Color(0xd32f2f),
      emissiveIntensity: 0.5,
    });
    const lightbar = new THREE.Mesh(lightbarGeo, lightbarMat);
    lightbar.position.set(0.6, 2.3, 0);
    vanGroup.add(lightbar);

    // Wheels
    const wGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.25, 12);
    wGeo.rotateX(Math.PI / 2);
    [
      { x: 1.3, z: 0.9 },
      { x: 1.3, z: -0.9 },
      { x: -1.3, z: 0.9 },
      { x: -1.3, z: -0.9 },
    ].forEach(wp => {
      const w = new THREE.Mesh(wGeo, wheelMat);
      w.position.set(wp.x, 0.32, wp.z);
      vanGroup.add(w);
    });

    group.add(vanGroup);
  }

  /**
   * Standalone 4-legged steel lattice loudspeaker tower on southwest corner.
   */
  createLatticeSpeakerTower(group, steelMat, speakerMat) {
    const towerGroup = new THREE.Group();
    towerGroup.position.set(-7.5, 0, 13.5);

    const towerHeight = 15.0;
    const baseW = 1.6;
    const topW = 0.6;

    // 4 Corner legs
    [-1, 1].forEach(sx => {
      [-1, 1].forEach(sz => {
        const legPoints = [
          new THREE.Vector3(sx * baseW / 2, 0, sz * baseW / 2),
          new THREE.Vector3(sx * topW / 2, towerHeight, sz * topW / 2),
        ];
        const legCurve = new THREE.CatmullRomCurve3(legPoints);
        const legGeo = new THREE.TubeGeometry(legCurve, 8, 0.04, 6, false);
        const leg = new THREE.Mesh(legGeo, steelMat);
        leg.castShadow = true;
        towerGroup.add(leg);
      });
    });

    // Horizontal & diagonal cross-braces
    const tiers = 8;
    for (let t = 1; t <= tiers; t++) {
      const frac = t / tiers;
      const y = frac * towerHeight;
      const curW = baseW + frac * (topW - baseW);

      // Horizontal perimeter frame
      const ringGeo = new THREE.BoxGeometry(curW, 0.04, curW);
      const ring = new THREE.Mesh(ringGeo, steelMat);
      ring.position.y = y;
      towerGroup.add(ring);
    }

    // Top platform & antenna pole
    const platGeo = new THREE.BoxGeometry(0.85, 0.06, 0.85);
    const plat = new THREE.Mesh(platGeo, steelMat);
    plat.position.y = towerHeight;
    towerGroup.add(plat);

    const mastGeo = new THREE.CylinderGeometry(0.04, 0.05, 2.5, 6);
    const mast = new THREE.Mesh(mastGeo, steelMat);
    mast.position.y = towerHeight + 1.25;
    towerGroup.add(mast);

    // 4 Loudspeakers at the top of the tower facing 4 directions
    [
      { dx: 0.4, dz: 0, rot: 0 },
      { dx: -0.4, dz: 0, rot: Math.PI },
      { dx: 0, dz: 0.4, rot: Math.PI / 2 },
      { dx: 0, dz: -0.4, rot: -Math.PI / 2 },
    ].forEach(spk => {
      const hGeo = new THREE.ConeGeometry(0.28, 0.55, 10, 1, true);
      hGeo.rotateX(Math.PI / 2);
      const horn = new THREE.Mesh(hGeo, speakerMat);
      horn.position.set(spk.dx, towerHeight + 1.2, spk.dz);
      horn.rotation.y = spk.rot;
      towerGroup.add(horn);
    });

    group.add(towerGroup);
  }

  /**
   * Front Courtyard paving and garden globe lamps.
   */
  createCourtyard(group) {
    // Interlocking paving apron directly in front of veranda steps
    const apronGeo = new THREE.PlaneGeometry(8.0, 22.0);
    const apronMat = new THREE.MeshStandardMaterial({
      color: 0xbaa88c,
      roughness: 0.85,
    });
    const apron = new THREE.Mesh(apronGeo, apronMat);
    apron.rotation.x = -Math.PI / 2;
    apron.position.set(12.0, 0.015, -0.5);
    apron.receiveShadow = true;
    group.add(apron);

    // Courtyard sand/gravel ground extending to roadside fence
    const yardGeo = new THREE.PlaneGeometry(16.0, 28.0);
    const yardMat = new THREE.MeshStandardMaterial({
      color: 0x5a554a,
      roughness: 0.9,
    });
    const yard = new THREE.Mesh(yardGeo, yardMat);
    yard.rotation.x = -Math.PI / 2;
    yard.position.set(11.0, 0.008, -0.5);
    yard.receiveShadow = true;
    group.add(yard);

    // Garden Globe Lamps along courtyard edge
    [
      { x: 15.5, z: -10.0 },
      { x: 15.5, z: 9.0 },
    ].forEach(pos => {
      // Concrete pillar (green-blue like fence pillars)
      const postGeo = new THREE.BoxGeometry(0.35, 1.4, 0.35);
      const postMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 0.6 });
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(pos.x, 0.7, pos.z);
      group.add(post);

      // White glowing sphere lamp
      const globeGeo = new THREE.SphereGeometry(0.18, 12, 12);
      const globeMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: new THREE.Color(0xfff0cc),
        emissiveIntensity: this.config.nightMode ? 1.6 : 0,
      });
      const globe = new THREE.Mesh(globeGeo, globeMat);
      globe.userData.ledColor = new THREE.Color(0xfff0cc);
      globe.userData.baseEmissiveIntensity = 1.6;
      globe.position.set(pos.x, 1.55, pos.z);
      group.add(globe);
      if (this.lightingManager) this.lightingManager.registerEmissiveMesh(globe);

      const pLight = new THREE.PointLight(0xffbe6b, 1.8, 10, 1.4);
      pLight.position.set(pos.x, 1.6, pos.z);
      pLight.userData.baseIntensity = 1.8;
      group.add(pLight);
      if (this.lightingManager) this.lightingManager.registerDecorativeLight(pLight);
    });
  }
}
