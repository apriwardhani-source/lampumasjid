/**
 * RoadSystem.js — Procedurally creates road surfaces, roadside shoulders,
 * concrete drainage ditch, and paved mosque courtyard.
 *
 * Implements authentic rural Kalimantan Selatan road profile:
 *  - Asphalt road surface & concrete curbs.
 *  - Wide unpaved grassy shoulder (bahu jalan rumput/tanah) between road and fence.
 *  - Concrete drainage ditch (parit beton saluran air) running along the base of the green fence.
 *  - Paved courtyard (halaman konblok paving) inside the mosque compound.
 */

import * as THREE from 'three';

export class RoadSystem {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
  }

  build() {
    const roadCfg = this.config.road;
    const layout = this.config.layout;

    // 1. Main road (north-south)
    this.createRoadSegment(layout.roads.mainRoad, roadCfg.width, 'main-road');

    // 2. East road
    this.createRoadSegment(layout.roads.eastRoad, roadCfg.width, 'east-road');

    // 3. Wide unpaved shoulder, drainage ditch, and mosque courtyard paving
    this.createRoadsideShoulderAndDitch();
  }

  createRoadSegment(path, width, name) {
    const roadCfg = this.config.road;

    for (let i = 0; i < path.length - 1; i++) {
      const start = path[i];
      const end = path[i + 1];

      // Skip road asphalt and curbs on the bridge span (z = 44 to 56) since BridgeRiverSystem builds the wooden bridge deck!
      if (start.z >= 43 && end.z <= 57 && name === 'main-road') {
        continue;
      }

      const dx = end.x - start.x;
      const dz = end.z - start.z;
      const length = Math.sqrt(dx * dx + dz * dz);
      const angle = Math.atan2(dx, dz);

      const cx = (start.x + end.x) / 2;
      const cz = (start.z + end.z) / 2;

      // Road surface
      const roadGeo = new THREE.PlaneGeometry(width, length);
      const roadMat = new THREE.MeshStandardMaterial({
        color: roadCfg.surfaceColor,
        roughness: 0.85,
        metalness: 0.0,
      });
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.rotation.z = -angle;
      road.position.set(cx, 0.01, cz);
      road.receiveShadow = true;
      road.name = name;
      this.scene.add(road);

      // Curbs on both sides
      this.createCurb(start, end, width, length, angle, roadCfg);
    }
  }

  createCurb(start, end, width, length, angle, roadCfg) {
    const cx = (start.x + end.x) / 2;
    const cz = (start.z + end.z) / 2;

    const curbMat = new THREE.MeshStandardMaterial({
      color: 0x727b87,
      roughness: 0.7,
    });

    [-1, 1].forEach(side => {
      const offsetX = Math.cos(angle) * (width / 2 + roadCfg.curbWidth / 2) * side;
      const offsetZ = -Math.sin(angle) * (width / 2 + roadCfg.curbWidth / 2) * side;

      const curbGeo = new THREE.BoxGeometry(roadCfg.curbWidth, roadCfg.curbHeight, length);
      const curb = new THREE.Mesh(curbGeo, curbMat);
      curb.rotation.y = angle;
      curb.position.set(cx + offsetX, roadCfg.curbHeight / 2, cz + offsetZ);
      curb.receiveShadow = true;
      curb.castShadow = true;
      this.scene.add(curb);
    });
  }

  /**
   * Creates the wide roadside shoulder strip, the authentic concrete drainage ditch,
   * and the paved mosque courtyard behind the fence.
   */
  createRoadsideShoulderAndDitch() {
    const roadHalfW = this.config.road.width / 2; // 3.5m
    const curbW = this.config.road.curbWidth;     // 0.3m
    const roadCurbOuterX = -(roadHalfW + curbW);  // -3.8m
    const fenceX = -7.8;                          // Mosque fence line
    const ditchOuterX = -7.05;                    // Outer lip of ditch
    const shoulderWidth = Math.abs(roadCurbOuterX - ditchOuterX); // ~3.25m
    const shoulderCenterX = (roadCurbOuterX + ditchOuterX) / 2;   // -5.425m

    // ============================================================
    // A. WIDE UNPAVED ROADSIDE SHOULDER (BAHU JALAN RUMPUT & TANAH)
    // ============================================================
    const shoulderGeo = new THREE.PlaneGeometry(shoulderWidth, 84);
    const shoulderMat = new THREE.MeshStandardMaterial({
      map: this.createShoulderTexture(),
      roughness: 0.95,
      metalness: 0.0,
    });
    const shoulder = new THREE.Mesh(shoulderGeo, shoulderMat);
    shoulder.rotation.x = -Math.PI / 2;
    shoulder.position.set(shoulderCenterX, 0.02, 0);
    shoulder.receiveShadow = true;
    shoulder.name = 'roadside-grass-shoulder';
    this.scene.add(shoulder);

    // ============================================================
    // B. CONCRETE DRAINAGE DITCH (PARIT SALURAN AIR SEMEN)
    // ============================================================
    const ditchMat = new THREE.MeshStandardMaterial({
      color: 0x9ca3af, // Weathered light gray concrete
      roughness: 0.75,
      metalness: 0.05,
    });

    const dampDitchMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Damp channel invert
      roughness: 0.35,
      metalness: 0.1,
    });

    const ditchGroup = new THREE.Group();
    ditchGroup.name = 'concrete-drainage-ditch';

    // 1. Outer concrete lip along grass shoulder
    const outerLipGeo = new THREE.BoxGeometry(0.16, 0.14, 84);
    const outerLip = new THREE.Mesh(outerLipGeo, ditchMat);
    outerLip.position.set(ditchOuterX, 0.07, 0);
    outerLip.receiveShadow = true;
    outerLip.castShadow = true;
    ditchGroup.add(outerLip);

    // 2. Recessed concrete drainage channel floor
    const channelFloorGeo = new THREE.BoxGeometry(0.56, 0.05, 84);
    const channelFloor = new THREE.Mesh(channelFloorGeo, dampDitchMat);
    channelFloor.position.set(-7.42, 0.015, 0);
    channelFloor.receiveShadow = true;
    ditchGroup.add(channelFloor);

    // 3. Inner retaining foundation wall under the fence plinth
    const innerWallGeo = new THREE.BoxGeometry(0.20, 0.22, 84);
    const innerWall = new THREE.Mesh(innerWallGeo, ditchMat);
    innerWall.position.set(-7.75, 0.11, 0);
    innerWall.receiveShadow = true;
    innerWall.castShadow = true;
    ditchGroup.add(innerWall);

    this.scene.add(ditchGroup);

    // ============================================================
    // C. MOSQUE COURTYARD PAVING (HALAMAN KONBLOK/PAVING MASJID)
    // ============================================================
    // Behind fence (x = -7.8 to -13.6), spanning north-south in front of mosque
    const courtyardW = 5.8;
    const courtyardL = 36.0;
    const courtyardGeo = new THREE.PlaneGeometry(courtyardW, courtyardL);
    const courtyardMat = new THREE.MeshStandardMaterial({
      map: this.createCourtyardPavingTexture(),
      roughness: 0.8,
      metalness: 0.05,
    });
    const courtyard = new THREE.Mesh(courtyardGeo, courtyardMat);
    courtyard.rotation.x = -Math.PI / 2;
    courtyard.position.set(-7.8 - courtyardW / 2, 0.025, -20.0);
    courtyard.receiveShadow = true;
    courtyard.name = 'mosque-courtyard-paving';
    this.scene.add(courtyard);

    // ============================================================
    // D. SCATTERED 3D ROADSIDE WEEDS & GRASS TUFTS
    // ============================================================
    this.createRoadsideGrassTufts(shoulderCenterX, shoulderWidth);
  }

  /**
   * Procedural texture for the wide roadside shoulder:
   * Dry tropical grass, warm laterite earth, light gravel, and tire dust.
   */
  createShoulderTexture() {
    const w = 512;
    const h = 2048;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    // Base earth gradient: lighter dusty dirt near road, more grass towards ditch
    const bg = ctx.createLinearGradient(0, 0, w, 0);
    bg.addColorStop(0, '#756653');   // Road edge dust & gravel
    bg.addColorStop(0.3, '#6e614d'); // Compacted dirt path
    bg.addColorStop(0.7, '#5b6343'); // Patchy grass
    bg.addColorStop(1, '#4e5938');   // Green grass near drainage ditch
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Gravel and sand specks
    for (let i = 0; i < 2000; i++) {
      const gx = Math.random() * w;
      const gy = Math.random() * h;
      const r = Math.random() * 2.5 + 1;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(165, 155, 140, 0.35)' : 'rgba(60, 50, 40, 0.35)';
      ctx.beginPath();
      ctx.arc(gx, gy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Patches of dry grass
    for (let i = 0; i < 250; i++) {
      const px = Math.random() * w;
      const py = Math.random() * h;
      const pr = Math.random() * 24 + 10;
      const gGrad = ctx.createRadialGradient(px, py, 0, px, py, pr);
      gGrad.addColorStop(0, 'rgba(78, 102, 54, 0.45)');
      gGrad.addColorStop(1, 'rgba(78, 102, 54, 0.0)');
      ctx.fillStyle = gGrad;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 4);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  /**
   * Procedural texture for interlocking paving block courtyard:
   */
  createCourtyardPavingTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Warm sandstone paver base
    ctx.fillStyle = '#cfc5b4';
    ctx.fillRect(0, 0, size, size);

    // Grid of paving blocks
    const cols = 16;
    const rows = 16;
    const cellW = size / cols;
    const cellH = size / rows;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const x = c * cellW;
        const y = r * cellH;

        // Slight individual tile color variation
        const tone = Math.floor(Math.random() * 16 - 8);
        ctx.fillStyle = `rgb(${207 + tone}, ${197 + tone}, ${180 + tone})`;
        ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);

        // Grout lines
        ctx.strokeStyle = '#9e9282';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, cellW, cellH);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 16);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  /**
   * Adds scattered 3D grass tufts in the roadside shoulder.
   */
  createRoadsideGrassTufts(shoulderCenterX, shoulderWidth) {
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x5a783d,
      roughness: 0.9,
    });

    const tuftCount = 36;
    for (let i = 0; i < tuftCount; i++) {
      const z = (Math.random() - 0.5) * 75;
      const x = shoulderCenterX + (Math.random() - 0.5) * (shoulderWidth * 0.7);

      const bladeGeo = new THREE.ConeGeometry(0.05, 0.18 + Math.random() * 0.12, 4);
      const blade = new THREE.Mesh(bladeGeo, grassMat);
      blade.position.set(x, 0.08, z);
      blade.rotation.x = (Math.random() - 0.5) * 0.35;
      blade.rotation.z = (Math.random() - 0.5) * 0.35;
      this.scene.add(blade);
    }
  }
}
