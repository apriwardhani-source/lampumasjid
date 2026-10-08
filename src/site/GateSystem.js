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
    const topBannerTex = this.generatePlaceholderBannerTexture(2048, 512, false);
    const sideBannerTex = this.generatePlaceholderBannerTexture(512, 1536, true);

    // 3. Banner materials (frontlit flex vinyl)
    const bannerTopMat = new THREE.MeshStandardMaterial({
      map: topBannerTex,
      roughness: 0.38,
      metalness: 0.02,
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
    const halfWidth = 4.3;       // Centerline of columns (span ~8.6m across 7m road)
    const colWidth = 0.85;       // Column outer width (X)
    const colDepth = 0.70;       // Column outer depth (Z)
    const clearanceY = 4.8;      // Headroom clearance under top banner
    const bannerHeight = 1.6;    // Top banner height (from y = 4.8 to 6.4)
    const topGirderY = clearanceY + bannerHeight; // 6.4m
    const roofApexY = 7.3;       // Apex of decorative taso pitched truss

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
      plate.position.set(colX, 0.42, 0);
      group.add(plate);

      // 4 Vertical Taso C-channel Chords per column tower
      const postRadius = 0.045;
      const postH = topGirderY - 0.4;
      const cornerOffsets = [
        { dx: -colWidth / 2 + 0.05, dz: -colDepth / 2 + 0.05 },
        { dx: colWidth / 2 - 0.05, dz: -colDepth / 2 + 0.05 },
        { dx: -colWidth / 2 + 0.05, dz: colDepth / 2 - 0.05 },
        { dx: colWidth / 2 - 0.05, dz: colDepth / 2 - 0.05 },
      ];

      cornerOffsets.forEach(pt => {
        const chordGeo = new THREE.BoxGeometry(postRadius * 2, postH, postRadius * 2);
        const chord = new THREE.Mesh(chordGeo, mats.taso);
        chord.position.set(colX + pt.dx, 0.4 + postH / 2, pt.dz);
        chord.castShadow = true;
        group.add(chord);
      });

      // Horizontal taso battens (reng / C-channel rings) every 0.6m
      const rings = Math.floor(postH / 0.6);
      for (let r = 1; r <= rings; r++) {
        const ry = 0.4 + r * 0.6;
        if (ry > topGirderY) break;

        // Front & Back ring ties
        [-1, 1].forEach(signZ => {
          const tieGeo = new THREE.BoxGeometry(colWidth, 0.05, 0.035);
          const tie = new THREE.Mesh(tieGeo, mats.taso);
          tie.position.set(colX, ry, signZ * (colDepth / 2 - 0.03));
          group.add(tie);
        });

        // Left & Right ring ties
        [-1, 1].forEach(signX => {
          const tieGeo = new THREE.BoxGeometry(0.035, 0.05, colDepth);
          const tie = new THREE.Mesh(tieGeo, mats.taso);
          tie.position.set(colX + signX * (colWidth / 2 - 0.03), ry, 0);
          group.add(tie);
        });
      }

      // Diagonal Taso Webbing on Column Inner Faces (facing road)
      for (let r = 0; r < rings - 1; r++) {
        const y1 = 0.4 + r * 0.6;
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

    // ============================================================
    // 2. OVERHEAD GIRDER / LINTEL TRUSS (TASO BAJA RINGAN)
    // ============================================================
    const spanWidth = halfWidth * 2 + colWidth;

    // Lower Horizontal Chords (y = clearanceY)
    [-1, 1].forEach(signZ => {
      const chordGeo = new THREE.BoxGeometry(spanWidth, 0.075, 0.075);
      const chord = new THREE.Mesh(chordGeo, mats.taso);
      chord.position.set(0, clearanceY, signZ * (colDepth / 2 - 0.05));
      chord.castShadow = true;
      group.add(chord);
    });

    // Upper Horizontal Chords (y = topGirderY)
    [-1, 1].forEach(signZ => {
      const chordGeo = new THREE.BoxGeometry(spanWidth, 0.075, 0.075);
      const chord = new THREE.Mesh(chordGeo, mats.taso);
      chord.position.set(0, topGirderY, signZ * (colDepth / 2 - 0.05));
      chord.castShadow = true;
      group.add(chord);
    });

    // Vertical Taso Studs across girder every 0.9m
    const studCount = Math.floor(spanWidth / 0.9);
    for (let i = 0; i <= studCount; i++) {
      const sx = -spanWidth / 2 + i * (spanWidth / studCount);
      [-1, 1].forEach(signZ => {
        const studGeo = new THREE.BoxGeometry(0.05, bannerHeight, 0.05);
        const stud = new THREE.Mesh(studGeo, mats.taso);
        stud.position.set(sx, clearanceY + bannerHeight / 2, signZ * (colDepth / 2 - 0.05));
        group.add(stud);
      });

      // Cross spacer between front and back chords
      const spacerGeo = new THREE.BoxGeometry(0.04, 0.04, colDepth - 0.1);
      const spacer1 = new THREE.Mesh(spacerGeo, mats.taso);
      spacer1.position.set(sx, clearanceY, 0);
      group.add(spacer1);

      const spacer2 = new THREE.Mesh(spacerGeo, mats.taso);
      spacer2.position.set(sx, topGirderY, 0);
      group.add(spacer2);
    }

    // ============================================================
    // 3. DECORATIVE PITCHED CROWN / GABLE TRUSS (TASO ROOF FRAME)
    // ============================================================
    const apexX = 0;
    const apexY = roofApexY;
    const rafterLen = Math.hypot(spanWidth / 2, apexY - topGirderY);
    const rafterAngle = Math.atan2(apexY - topGirderY, spanWidth / 2);

    [-1, 1].forEach(signZ => {
      const zPos = signZ * (colDepth / 2 - 0.05);

      // Left rafter
      const rLeftGeo = new THREE.BoxGeometry(rafterLen, 0.06, 0.06);
      const rLeft = new THREE.Mesh(rLeftGeo, mats.taso);
      rLeft.position.set(-spanWidth / 4, (topGirderY + apexY) / 2, zPos);
      rLeft.rotation.z = rafterAngle;
      group.add(rLeft);

      // Right rafter
      const rRightGeo = new THREE.BoxGeometry(rafterLen, 0.06, 0.06);
      const rRight = new THREE.Mesh(rRightGeo, mats.taso);
      rRight.position.set(spanWidth / 4, (topGirderY + apexY) / 2, zPos);
      rRight.rotation.z = -rafterAngle;
      group.add(rRight);

      // Center king post
      const kingGeo = new THREE.BoxGeometry(0.06, apexY - topGirderY, 0.06);
      const king = new THREE.Mesh(kingGeo, mats.taso);
      king.position.set(0, (topGirderY + apexY) / 2, zPos);
      group.add(king);

      // Web struts inside gable
      [-0.5, 0.5].forEach(frac => {
        const wx = (spanWidth / 2) * frac;
        const wy = topGirderY + (apexY - topGirderY) * (1 - Math.abs(frac));
        const strutGeo = new THREE.BoxGeometry(0.045, wy - topGirderY, 0.045);
        const strut = new THREE.Mesh(strutGeo, mats.taso);
        strut.position.set(wx, (topGirderY + wy) / 2, zPos);
        group.add(strut);
      });
    });

    // Ridge bar connecting front and back apex
    const ridgeGeo = new THREE.BoxGeometry(0.07, 0.07, colDepth);
    const ridge = new THREE.Mesh(ridgeGeo, mats.taso);
    ridge.position.set(0, apexY, 0);
    group.add(ridge);

    // ============================================================
    // 4. BANNER CLADDING: "NANTI DI KASIH BANER" PLACEHOLDERS
    // ============================================================
    const bannerTopW = spanWidth - 0.05;
    const bannerTopH = bannerHeight;
    const topBannerCenterY = clearanceY + bannerHeight / 2;
    const zOffset = colDepth / 2 + 0.015;

    // A. TOP BANNER (FRONT — Facing +Z)
    const topBannerFrontGeo = new THREE.PlaneGeometry(bannerTopW, bannerTopH);
    const topBannerFront = new THREE.Mesh(topBannerFrontGeo, mats.bannerTop);
    topBannerFront.position.set(0, topBannerCenterY, zOffset);
    group.add(topBannerFront);

    // B. TOP BANNER (BACK — Facing -Z)
    const topBannerBackGeo = new THREE.PlaneGeometry(bannerTopW, bannerTopH);
    const topBannerBack = new THREE.Mesh(topBannerBackGeo, mats.bannerTop);
    topBannerBack.position.set(0, topBannerCenterY, -zOffset);
    topBannerBack.rotation.y = Math.PI;
    group.add(topBannerBack);

    // Top banner taso edge frames (holding banner taut)
    [-1, 1].forEach(signZ => {
      const zFrame = signZ * (zOffset + 0.015);

      // Horizontal frame bars (top & bottom)
      [topBannerCenterY - bannerTopH / 2, topBannerCenterY + bannerTopH / 2].forEach(fy => {
        const frameGeo = new THREE.BoxGeometry(bannerTopW + 0.08, 0.04, 0.03);
        const frame = new THREE.Mesh(frameGeo, mats.tasoDark);
        frame.position.set(0, fy, zFrame);
        group.add(frame);
      });

      // Vertical side frame bars
      [-bannerTopW / 2, bannerTopW / 2].forEach(fx => {
        const frameGeo = new THREE.BoxGeometry(0.04, bannerTopH + 0.04, 0.03);
        const frame = new THREE.Mesh(frameGeo, mats.tasoDark);
        frame.position.set(fx, topBannerCenterY, zFrame);
        group.add(frame);
      });
    });

    // C. SIDE BANNERS (LEFT & RIGHT COLUMNS)
    const sideBannerW = colWidth - 0.05;
    const sideBannerH = clearanceY - 0.45; // From concrete foot (y=0.42) up to lintel (y=4.8)
    const sideBannerCenterY = 0.42 + sideBannerH / 2;

    [-1, 1].forEach(side => {
      const colX = side * halfWidth;

      // Front Face Banner
      const sFrontGeo = new THREE.PlaneGeometry(sideBannerW, sideBannerH);
      const sFront = new THREE.Mesh(sFrontGeo, mats.bannerSide);
      sFront.position.set(colX, sideBannerCenterY, zOffset);
      group.add(sFront);

      // Back Face Banner
      const sBackGeo = new THREE.PlaneGeometry(sideBannerW, sideBannerH);
      const sBack = new THREE.Mesh(sBackGeo, mats.bannerSide);
      sBack.position.set(colX, sideBannerCenterY, -zOffset);
      sBack.rotation.y = Math.PI;
      group.add(sBack);

      // Outer Side Face Banner (Facing outward away from road)
      const outerX = colX + side * (colWidth / 2 + 0.015);
      const sOuterGeo = new THREE.PlaneGeometry(colDepth - 0.05, sideBannerH);
      const sOuter = new THREE.Mesh(sOuterGeo, mats.bannerSide);
      sOuter.position.set(outerX, sideBannerCenterY, 0);
      sOuter.rotation.y = side * Math.PI / 2;
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
