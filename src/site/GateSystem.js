/**
 * GateSystem.js — Entrance Gates constructed from Taso (Baja Ringan) with Clean Banner Placeholders.
 *
 * Requirements:
 *  - Structure: Taso baja ringan (light-gauge galvalum steel truss framing).
 *  - Banners: Left pillar, right pillar, and top lintel covered with banners.
 *  - Content: Clean placeholder with text "NANTI DI KASIH BANER", ready for full photo replacement.
 *  - Lighting: NO lights on the gate (gapakai lampu).
 */

import * as THREE from 'three';

export class GateSystem {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.gates = [];
    this.lightingManager = null;

    // Cache generated textures so all gates share materials
    this.materials = null;
  }

  setLightingManager(lm) {
    this.lightingManager = lm;
    // Gates do not have lights
  }

  build() {
    this.initTexturesAndMaterials();

    const layout = this.config.layout;

    // Main road gates
    layout.poles.mainRoad.forEach(pole => {
      if (pole.type === 'gate') {
        this.createTasoGate(0, pole.z, 0);
      }
    });

    // East road gate
    layout.poles.eastRoad.forEach(pole => {
      if (pole.type === 'gate') {
        this.createTasoGate(pole.x, 0, Math.PI / 2);
      }
    });
  }

  initTexturesAndMaterials() {
    if (this.materials) return;

    // 1. Taso baja ringan (galvalum steel) materials
    const tasoMat = new THREE.MeshStandardMaterial({
      color: 0xd4dbe2,
      roughness: 0.32,
      metalness: 0.88,
    });

    const tasoDarkMat = new THREE.MeshStandardMaterial({
      color: 0x7a8592,
      roughness: 0.45,
      metalness: 0.75,
    });

    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x76808a,
      roughness: 0.85,
      metalness: 0.05,
    });

    // 2. Banner textures: Clean "NANTI DI KASIH BANER" placeholders
    const topBannerTex = this.generateArchedBannerTexture(2048, 768);
    const sideBannerTex = this.generatePlaceholderBannerTexture(512, 1536, true);

    // 3. Banner materials (frontlit flex vinyl)
    const bannerTopMat = new THREE.MeshStandardMaterial({
      map: topBannerTex,
      roughness: 0.38,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });

    const bannerSideMat = new THREE.MeshStandardMaterial({
      map: sideBannerTex,
      roughness: 0.38,
      metalness: 0.02,
    });

    this.materials = {
      taso: tasoMat,
      tasoDark: tasoDarkMat,
      concrete: concreteMat,
      bannerTop: bannerTopMat,
      bannerSide: bannerSideMat,
    };
  }

  createTasoGate(x, z, rotY) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotY;
    group.name = `taso-gate-${x}-${z}`;

    const mats = this.materials;

    // Dimensions
    const halfWidth = 4.3;       // Centerline of columns (span ~8.6m across road)
    const colWidth = 0.85;       // Column outer width (X)
    const colDepth = 0.70;       // Column outer depth (Z)
    const spanWidth = halfWidth * 2 + colWidth;  // 9.45m outer span
    const clearWidth = halfWidth * 2 - colWidth; // 7.75m inner opening

    const xOuterLeft = -spanWidth / 2;           // -4.725m
    const xOuterRight = spanWidth / 2;           // +4.725m
    const xInnerLeft = -clearWidth / 2;          // -3.875m
    const xInnerRight = clearWidth / 2;          // +3.875m

    // Height profiles
    const yPedestal = 0.42;        // Top of concrete foot pedestal
    const yArchStart = 4.65;       // Start of arch (top of vertical column banners)
    const yShoulder = 6.00;        // Outer top shoulder of arch
    const yTopApex = 7.45;         // Upper crown apex of arch
    const yClearanceSide = 4.65;   // Headroom clearance at inner columns
    const yClearanceCenter = 5.15; // Headroom clearance at road center

    const zOffset = colDepth / 2 + 0.015;

    // ============================================================
    // 1. LEFT & RIGHT COLUMNS (TASO BAJA RINGAN BOX TRUSS TOWERS)
    // ============================================================
    [-1, 1].forEach(side => {
      const colX = side * halfWidth;

      // Concrete footing pedestal
      const footGeo = new THREE.BoxGeometry(colWidth + 0.25, 0.4, colDepth + 0.25);
      const foot = new THREE.Mesh(footGeo, mats.concrete);
      foot.position.set(colX, 0.2, 0);
      foot.castShadow = true;
      foot.receiveShadow = true;
      group.add(foot);

      // Steel anchor base plate
      const plateGeo = new THREE.BoxGeometry(colWidth + 0.1, 0.04, colDepth + 0.1);
      const plate = new THREE.Mesh(plateGeo, mats.tasoDark);
      plate.position.set(colX, yPedestal, 0);
      group.add(plate);

      // 4 Vertical Taso C-channel Chords per column tower up to yShoulder
      const postRadius = 0.045;
      const postH = yShoulder - yPedestal;
      const cornerOffsets = [
        { dx: -colWidth / 2 + 0.05, dz: -colDepth / 2 + 0.05 },
        { dx: colWidth / 2 - 0.05, dz: -colDepth / 2 + 0.05 },
        { dx: -colWidth / 2 + 0.05, dz: colDepth / 2 - 0.05 },
        { dx: colWidth / 2 - 0.05, dz: colDepth / 2 - 0.05 },
      ];

      cornerOffsets.forEach(pt => {
        const chordGeo = new THREE.BoxGeometry(postRadius * 2, postH, postRadius * 2);
        const chord = new THREE.Mesh(chordGeo, mats.taso);
        chord.position.set(colX + pt.dx, yPedestal + postH / 2, pt.dz);
        chord.castShadow = true;
        group.add(chord);
      });

      // Horizontal taso ring ties every 0.6m
      const rings = Math.floor(postH / 0.6);
      for (let r = 1; r <= rings; r++) {
        const ry = yPedestal + r * 0.6;
        if (ry > yShoulder) break;

        // Front & Back ties
        [-1, 1].forEach(signZ => {
          const tieGeo = new THREE.BoxGeometry(colWidth, 0.05, 0.035);
          const tie = new THREE.Mesh(tieGeo, mats.taso);
          tie.position.set(colX, ry, signZ * (colDepth / 2 - 0.03));
          group.add(tie);
        });

        // Left & Right ties
        [-1, 1].forEach(signX => {
          const tieGeo = new THREE.BoxGeometry(0.035, 0.05, colDepth);
          const tie = new THREE.Mesh(tieGeo, mats.taso);
          tie.position.set(colX + signX * (colWidth / 2 - 0.03), ry, 0);
          group.add(tie);
        });
      }

      // Diagonal Taso Webbing on inner column faces
      for (let r = 0; r < rings - 1; r++) {
        const y1 = yPedestal + r * 0.6;
        const y2 = y1 + 0.6;
        const innerX = colX - side * (colWidth / 2 - 0.03);
        const diagLen = Math.sqrt(colDepth * colDepth + 0.36);
        const diagAngle = Math.atan2(0.6, colDepth);

        const diagGeo = new THREE.BoxGeometry(0.035, 0.04, diagLen);
        const diag = new THREE.Mesh(diagGeo, mats.taso);
        diag.position.set(innerX, (y1 + y2) / 2, 0);
        diag.rotation.x = (r % 2 === 0 ? 1 : -1) * (Math.PI / 2 - diagAngle);
        group.add(diag);
      }
    });

    // Helper mathematical functions for smooth cosine arch curves
    const getTopArchY = (curX) => {
      const normX = Math.max(-1, Math.min(1, curX / (spanWidth / 2)));
      return yShoulder + (yTopApex - yShoulder) * Math.cos(normX * Math.PI * 0.5);
    };

    const getBottomArchY = (curX) => {
      const normX = Math.max(-1, Math.min(1, curX / (clearWidth / 2)));
      return yClearanceSide + (yClearanceCenter - yClearanceSide) * Math.cos(normX * Math.PI * 0.5);
    };

    // ============================================================
    // 2. ROUNDED ARCH BANNER (FRONT & BACK 2D SHAPE WITH MATS)
    // ============================================================
    const bannerShape = new THREE.Shape();
    bannerShape.moveTo(xOuterLeft, yArchStart);
    bannerShape.lineTo(xOuterLeft, yShoulder);

    // Sample upper arch contour
    const topSteps = 32;
    for (let i = 1; i < topSteps; i++) {
      const t = i / topSteps;
      const curX = xOuterLeft + t * spanWidth;
      bannerShape.lineTo(curX, getTopArchY(curX));
    }
    bannerShape.lineTo(xOuterRight, yShoulder);
    bannerShape.lineTo(xOuterRight, yArchStart);
    bannerShape.lineTo(xInnerRight, yArchStart);

    // Sample inner underpass arch contour
    const botSteps = 24;
    for (let i = botSteps - 1; i >= 1; i--) {
      const t = i / botSteps;
      const curX = xInnerLeft + t * clearWidth;
      bannerShape.lineTo(curX, getBottomArchY(curX));
    }
    bannerShape.lineTo(xInnerLeft, yArchStart);
    const bannerGeo = new THREE.ShapeGeometry(bannerShape, 32);

    // CRITICAL THREE.JS FIX: ShapeGeometry sets UVs directly to world (X, Y) coords!
    // We must normalize UVs to [0, 1] across [xOuterLeft..xOuterRight] and [yArchStart..yTopApex]
    // so the texture maps perfectly across the entire arched fascia!
    const posAttr = bannerGeo.attributes.position;
    const uvAttr = bannerGeo.attributes.uv;
    const rangeX = xOuterRight - xOuterLeft; // 9.45m
    const rangeY = yTopApex - yArchStart;     // 2.80m

    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const u = (vx - xOuterLeft) / rangeX;
      const v = (vy - yArchStart) / rangeY;
      uvAttr.setXY(i, u, v);
    }
    uvAttr.needsUpdate = true;

    // Front Arched Banner Face
    const bannerFront = new THREE.Mesh(bannerGeo, mats.bannerTop);
    bannerFront.position.set(0, 0, zOffset);
    bannerFront.castShadow = true;
    bannerFront.receiveShadow = true;
    group.add(bannerFront);

    // Back Arched Banner Face (cloned geometry with flipped U so text is unreversed from behind)
    const bannerBackGeo = bannerGeo.clone();
    const backUvAttr = bannerBackGeo.attributes.uv;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const u = 1.0 - (vx - xOuterLeft) / rangeX; // horizontal flip for legible back reading
      const v = (vy - yArchStart) / rangeY;
      backUvAttr.setXY(i, u, v);
    }
    backUvAttr.needsUpdate = true;

    const bannerBack = new THREE.Mesh(bannerBackGeo, mats.bannerTop);
    bannerBack.position.set(0, 0, -zOffset);
    bannerBack.rotation.y = Math.PI;
    bannerBack.castShadow = true;
    bannerBack.receiveShadow = true;
    group.add(bannerBack);

    // ============================================================
    // 3. ARCHED TASO TRUSS FRAMEWORK, CAPPING & SOFFIT
    // ============================================================
    const zChordFront = colDepth / 2 - 0.05;

    // A. Upper & Lower Curved Taso Chords
    [-1, 1].forEach(signZ => {
      const zPos = signZ * zChordFront;

      // Upper chords
      for (let i = 0; i < topSteps; i++) {
        const x1 = xOuterLeft + (i / topSteps) * spanWidth;
        const x2 = xOuterLeft + ((i + 1) / topSteps) * spanWidth;
        const y1 = (i === 0) ? yShoulder : getTopArchY(x1);
        const y2 = (i === topSteps - 1) ? yShoulder : getTopArchY(x2);

        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy);
        const ang = Math.atan2(dy, dx);

        const segGeo = new THREE.BoxGeometry(len, 0.06, 0.06);
        const seg = new THREE.Mesh(segGeo, mats.taso);
        seg.position.set((x1 + x2) / 2, (y1 + y2) / 2, zPos);
        seg.rotation.z = ang;
        group.add(seg);
      }

      // Lower underpass chords
      for (let i = 0; i < botSteps; i++) {
        const x1 = xInnerLeft + (i / botSteps) * clearWidth;
        const x2 = xInnerLeft + ((i + 1) / botSteps) * clearWidth;
        const y1 = getBottomArchY(x1);
        const y2 = getBottomArchY(x2);

        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy);
        const ang = Math.atan2(dy, dx);

        const segGeo = new THREE.BoxGeometry(len, 0.06, 0.06);
        const seg = new THREE.Mesh(segGeo, mats.taso);
        seg.position.set((x1 + x2) / 2, (y1 + y2) / 2, zPos);
        seg.rotation.z = ang;
        group.add(seg);
      }
    });

    // B. Vertical Taso Webbing Studs & Spacers
    const studXs = [-3.8, -2.85, -1.9, -0.95, 0, 0.95, 1.9, 2.85, 3.8];
    studXs.forEach(sx => {
      const yBot = (Math.abs(sx) <= clearWidth / 2) ? getBottomArchY(sx) : yArchStart;
      const yTop = getTopArchY(sx);
      const studH = yTop - yBot;

      [-1, 1].forEach(signZ => {
        const studGeo = new THREE.BoxGeometry(0.05, studH, 0.05);
        const stud = new THREE.Mesh(studGeo, mats.taso);
        stud.position.set(sx, yBot + studH / 2, signZ * zChordFront);
        group.add(stud);
      });

      // Cross spacer between front and back
      const spacerGeo = new THREE.BoxGeometry(0.04, 0.04, colDepth - 0.1);
      const spacerMid = new THREE.Mesh(spacerGeo, mats.taso);
      spacerMid.position.set(sx, (yBot + yTop) / 2, 0);
      group.add(spacerMid);
    });

    // C. Curved Galvalum Roof Capping Strip (Along Top Arch)
    const capWidth = colDepth + 0.04;
    for (let i = 0; i < topSteps; i++) {
      const x1 = xOuterLeft + (i / topSteps) * spanWidth;
      const x2 = xOuterLeft + ((i + 1) / topSteps) * spanWidth;
      const y1 = (i === 0) ? yShoulder : getTopArchY(x1);
      const y2 = (i === topSteps - 1) ? yShoulder : getTopArchY(x2);

      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy);
      const ang = Math.atan2(dy, dx);

      const capGeo = new THREE.BoxGeometry(len + 0.02, 0.035, capWidth);
      const cap = new THREE.Mesh(capGeo, mats.tasoDark);
      cap.position.set((x1 + x2) / 2, (y1 + y2) / 2 + 0.015, 0);
      cap.rotation.z = ang;
      group.add(cap);
    }

    // D. Curved Soffit Strip (Along Bottom Underpass Arch)
    for (let i = 0; i < botSteps; i++) {
      const x1 = xInnerLeft + (i / botSteps) * clearWidth;
      const x2 = xInnerLeft + ((i + 1) / botSteps) * clearWidth;
      const y1 = getBottomArchY(x1);
      const y2 = getBottomArchY(x2);

      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy);
      const ang = Math.atan2(dy, dx);

      const sofGeo = new THREE.BoxGeometry(len + 0.02, 0.03, colDepth - 0.02);
      const sof = new THREE.Mesh(sofGeo, mats.taso);
      sof.position.set((x1 + x2) / 2, (y1 + y2) / 2 - 0.015, 0);
      sof.rotation.z = ang;
      group.add(sof);
    }

    // ============================================================
    // 4. VERTICAL COLUMN BANNERS (LEFT & RIGHT COLUMNS)
    // ============================================================
    const sideBannerW = colWidth - 0.05;
    const sideBannerH = yArchStart - yPedestal; // From pedestal (y=0.42) to arch start (y=4.65)
    const sideBannerCenterY = yPedestal + sideBannerH / 2;

    [-1, 1].forEach(side => {
      const colX = side * halfWidth;

      // Front Face Banner
      const sFrontGeo = new THREE.PlaneGeometry(sideBannerW, sideBannerH);
      const sFront = new THREE.Mesh(sFrontGeo, mats.bannerSide);
      sFront.position.set(colX, sideBannerCenterY, zOffset);
      sFront.castShadow = true;
      group.add(sFront);

      // Back Face Banner
      const sBackGeo = new THREE.PlaneGeometry(sideBannerW, sideBannerH);
      const sBack = new THREE.Mesh(sBackGeo, mats.bannerSide);
      sBack.position.set(colX, sideBannerCenterY, -zOffset);
      sBack.rotation.y = Math.PI;
      sBack.castShadow = true;
      group.add(sBack);

      // Outer Side Face Banner
      const outerX = colX + side * (colWidth / 2 + 0.015);
      const sOuterGeo = new THREE.PlaneGeometry(colDepth - 0.05, sideBannerH);
      const sOuter = new THREE.Mesh(sOuterGeo, mats.bannerSide);
      sOuter.position.set(outerX, sideBannerCenterY, 0);
      sOuter.rotation.y = side * Math.PI / 2;
      sOuter.castShadow = true;
      group.add(sOuter);

      // Perimeter taso frames around column banner faces
      [-1, 1].forEach(signZ => {
        const zFrame = signZ * (zOffset + 0.015);

        // Horizontal frame bars
        [sideBannerCenterY - sideBannerH / 2, sideBannerCenterY + sideBannerH / 2].forEach(fy => {
          const fGeo = new THREE.BoxGeometry(sideBannerW + 0.04, 0.035, 0.03);
          const fMesh = new THREE.Mesh(fGeo, mats.tasoDark);
          fMesh.position.set(colX, fy, zFrame);
          group.add(fMesh);
        });

        // Vertical frame bars
        [-sideBannerW / 2, sideBannerW / 2].forEach(fx => {
          const fGeo = new THREE.BoxGeometry(0.035, sideBannerH + 0.03, 0.03);
          const fMesh = new THREE.Mesh(fGeo, mats.tasoDark);
          fMesh.position.set(colX + fx, sideBannerCenterY, zFrame);
          group.add(fMesh);
        });
      });
    });

    this.scene.add(group);
    this.gates.push(group);
    return group;
  }

  // ============================================================
  // CLEAN PLACEHOLDER TEXTURE GENERATOR: "NANTI DI KASIH BANER"
  // ============================================================

  /**
   * Generates high-res placeholder texture for the Arched Top Banner ("NANTI DI KASIH BANER").
   * Beautifully composed to fit the rounded arch fascia.
   */
  generateArchedBannerTexture(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 1. Rich twilight slate/navy gradient background
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, '#0c131d');
    bg.addColorStop(0.35, '#1e293b');
    bg.addColorStop(0.7, '#182234');
    bg.addColorStop(1, '#0b1019');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;

    // 2. Arched Guideline and subtle decorative halo echoing the arch
    ctx.save();
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.55)';
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 14]);
    ctx.beginPath();
    for (let x = 80; x <= width - 80; x += 20) {
      const norm = (x - cx) / (width / 2 - 80);
      const y = 80 + (1 - Math.cos(norm * Math.PI * 0.5)) * (height * 0.45);
      if (x === 80) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 3. Center Graphic & Typography
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const centerY = height * 0.40;

    // Photo Icon Frame
    const iconW = 170;
    const iconH = 115;
    const iconY = centerY - 110;

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4.5;
    this.roundRect(ctx, cx - iconW / 2, iconY - iconH / 2, iconW, iconH, 16);
    ctx.stroke();

    // Mountain / photo peaks inside frame
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(cx - iconW / 2 + 18, iconY + iconH / 2 - 10);
    ctx.lineTo(cx - 20, iconY - 16);
    ctx.lineTo(cx + 18, iconY + 20);
    ctx.lineTo(cx + 48, iconY + 2);
    ctx.lineTo(cx + iconW / 2 - 18, iconY + iconH / 2 - 10);
    ctx.closePath();
    ctx.fill();

    // Sun / circle
    ctx.beginPath();
    ctx.arc(cx + 46, iconY - 28, 14, 0, Math.PI * 2);
    ctx.fill();

    // Main Text: "NANTI DI KASIH BANER"
    ctx.font = '900 74px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = 20;
    ctx.fillText('NANTI DI KASIH BANER', cx, centerY + 28);

    // Subtitle badge
    ctx.font = '700 26px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#38bdf8'; // Bright cyan accent badge
    ctx.shadowBlur = 8;
    ctx.fillText('[ FULL FOTO PLACEHOLDER ]', cx, centerY + 102);

    // Detail tag
    ctx.font = '600 19px monospace';
    ctx.fillStyle = '#cbd5e1';
    ctx.shadowBlur = 0;
    ctx.fillText('AREA BANNER GABUNGAN LENGKUNG • SIAP DIISI FOTO / DESAIN PENUH', cx, centerY + 150);

    // Subtle corner crop target crosses (+)
    const drawCross = (px, py) => {
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(px - 14, py);
      ctx.lineTo(px + 14, py);
      ctx.moveTo(px, py - 14);
      ctx.lineTo(px, py + 14);
      ctx.stroke();
    };
    drawCross(100, 100);
    drawCross(width - 100, 100);
    drawCross(100, height - 100);
    drawCross(width - 100, height - 100);

    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  generatePlaceholderBannerTexture(width, height, isVertical) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 1. Clean neutral studio background (dark slate/navy with subtle gradient)
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, '#131b26');
    bg.addColorStop(0.5, '#1e293b');
    bg.addColorStop(1, '#0f172a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // 2. Subtle dashed placeholder boundary border
    ctx.save();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = Math.max(3, Math.round(width / 350));
    ctx.setLineDash([18, 12]);
    const inset = Math.max(16, Math.round(width * 0.02));
    ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);
    ctx.setLineDash([]);

    // 3. Corner target marks (+)
    const crossSize = Math.max(14, Math.round(width * 0.02));
    const drawCross = (cx, cy) => {
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - crossSize, cy);
      ctx.lineTo(cx + crossSize, cy);
      ctx.moveTo(cx, cy - crossSize);
      ctx.lineTo(cx, cy + crossSize);
      ctx.stroke();
    };
    drawCross(inset * 2, inset * 2);
    drawCross(width - inset * 2, inset * 2);
    drawCross(inset * 2, height - inset * 2);
    drawCross(width - inset * 2, height - inset * 2);
    ctx.restore();

    // 4. Center Photo Placeholder Graphic & Clean Text
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const cx = width / 2;
    const cy = height / 2;

    if (isVertical) {
      // VERTICAL SIDE BANNER (512 x 1536)
      // Large Photo Frame Icon
      const iconW = 190;
      const iconH = 145;
      const iconY = cy - 150;

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 4;
      this.roundRect(ctx, cx - iconW / 2, iconY - iconH / 2, iconW, iconH, 14);
      ctx.stroke();

      // Mountain / photo peaks inside frame
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(cx - iconW / 2 + 16, iconY + iconH / 2 - 10);
      ctx.lineTo(cx - 20, iconY - 15);
      ctx.lineTo(cx + 15, iconY + 22);
      ctx.lineTo(cx + 42, iconY);
      ctx.lineTo(cx + iconW / 2 - 16, iconY + iconH / 2 - 10);
      ctx.closePath();
      ctx.fill();

      // Sun / circle
      ctx.beginPath();
      ctx.arc(cx + 42, iconY - 38, 16, 0, Math.PI * 2);
      ctx.fill();

      // Main Text requested by user: "NANTI DI KASIH BANER"
      ctx.font = '900 44px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 14;

      ctx.fillText('NANTI DI KASIH', cx, cy + 30);
      ctx.fillText('BANER', cx, cy + 90);

      // Subtitle
      ctx.font = '600 20px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.shadowBlur = 0;
      ctx.fillText('[ FULL FOTO PLACEHOLDER ]', cx, cy + 160);

      ctx.font = '500 16px monospace';
      ctx.fillStyle = '#64748b';
      ctx.fillText('SIAP DIISI FOTO / DESAIN', cx, cy + 200);
    } else {
      // HORIZONTAL TOP BANNER (2048 x 512)
      // Photo Frame Icon
      const iconW = 150;
      const iconH = 105;
      const iconY = cy - 65;

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 4;
      this.roundRect(ctx, cx - iconW / 2, iconY - iconH / 2, iconW, iconH, 12);
      ctx.stroke();

      // Mountain / photo peaks
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(cx - iconW / 2 + 14, iconY + iconH / 2 - 8);
      ctx.lineTo(cx - 16, iconY - 12);
      ctx.lineTo(cx + 14, iconY + 16);
      ctx.lineTo(cx + 38, iconY);
      ctx.lineTo(cx + iconW / 2 - 14, iconY + iconH / 2 - 8);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx + 38, iconY - 26, 12, 0, Math.PI * 2);
      ctx.fill();

      // Main Text requested by user: "NANTI DI KASIH BANER"
      ctx.font = '900 72px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 18;
      ctx.fillText('NANTI DI KASIH BANER', cx, cy + 55);

      // Subtitle
      ctx.font = '600 24px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.shadowBlur = 0;
      ctx.fillText('[ FULL FOTO PLACEHOLDER ]', cx, cy + 125);

      ctx.font = '500 18px monospace';
      ctx.fillStyle = '#64748b';
      ctx.fillText('AREA BANNER ATAS • SIAP DIISI FOTO / DESAIN PENUH', cx, cy + 165);
    }

    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  // Rounded rectangle helper
  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}
