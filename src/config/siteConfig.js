/**
 * siteConfig.js — Centralized configuration for the entire site.
 *
 * Modify these values to adjust arch dimensions, road layout,
 * pole positions, lighting colors, and more.
 */

export const siteConfig = {
  // ========================
  // ARCH DIMENSIONS
  // ========================
  arch: {
    height: 7.5,          // Height of the arch apex (meters)
    width: 8.0,           // Span width across the road (meters)
    thickness: 0.12,      // Tube thickness of the main arch frame
    innerOffset: 0.5,     // Offset of the inner arch from outer
    decorPanelCount: 8,   // Number of decorative panels per arch half
    poleHeight: 7.5,      // Height of the support poles
    poleRadius: 0.12,     // Radius of the support poles
    baseRadius: 0.25,     // Radius of the pole base
    baseHeight: 0.4,      // Height of the pole base
    lanternSize: 0.35,    // Size of the central lantern
    finialHeight: 0.5,    // Height of the top finial
    capRadius: 0.18,      // Radius of the pole cap
  },

  // ========================
  // GATE DIMENSIONS
  // ========================
  gate: {
    height: 9.0,          // Gate arch height (taller than regular arches)
    width: 9.0,           // Gate span width
    poleHeight: 9.0,
    thickness: 0.15,
    decorPanelCount: 12,
  },

  // ========================
  // ROAD SYSTEM
  // ========================
  road: {
    width: 7.0,           // Road width (meters)
    surfaceColor: 0x363d48, // Rich dark asphalt grey (not pitch black)
    curbHeight: 0.15,
    curbWidth: 0.3,
    sidewalkWidth: 1.5,
  },

  // ========================
  // ROUNDABOUT
  // ========================
  roundabout: {
    center: { x: 0, z: 0 },      // Center position
    outerRadius: 5.5,              // Outer radius of roundabout
    innerRadius: 3.0,              // Inner island radius
    archCount: 6,                  // Number of arches around roundabout
  },

  // ========================
  // LIGHTING
  // ========================
  lighting: {
    decorativeColor: 0xffbe3b,     // Default: Kuning Hangat / Warm Gold
    colorPresets: [
      { id: 'kuning', name: 'Kuning Hangat', hex: 0xffbe3b, icon: '🟡', css: '#ffbe3b' },
      { id: 'putih', name: 'Putih Bersih', hex: 0xffffff, icon: '⚪', css: '#ffffff' },
      { id: 'hijau', name: 'Hijau Islami', hex: 0x22c55e, icon: '🟢', css: '#22c55e' },
      { id: 'biru', name: 'Biru Langit', hex: 0x00d2ff, icon: '🔵', css: '#00d2ff' },
      { id: 'amber', name: 'Jingga Amber', hex: 0xff7700, icon: '🟠', css: '#ff7700' },
      { id: 'ungu', name: 'Ungu Magis', hex: 0xc084fc, icon: '🟣', css: '#c084fc' },
    ],
    warmWhite: 0xffeedd,           // Warm white LED color
    warmWhiteIntensity: 2.2,       // LED intensity at night
    ambientDay: 0xd8e8f8,          // Ambient light color during day
    ambientNight: 0x3a4d72,        // Ambient light color at night
    sunColor: 0xfff5e0,            // Sun light color
    sunIntensityDay: 2.0,
    moonColor: 0xadc8f0,           // Moonlight cool silver blue
    sunIntensityNight: 1.4,        // Moonlight intensity (balanced & pleasant)
    groundLightIntensity: 0.5,     // Light cast on road from arches
    lanternIntensity: 2.4,         // Point light intensity along road
    lanternDistance: 12.0,         // Lantern light reach
    glowOpacity: 0.45,             // Soft LED glow sprite opacity
    glowSize: 0.8,                 // LED glow sprite size
  },

  // ========================
  // MATERIALS
  // ========================
  materials: {
    bambooColor: 0xd4a853,          // Natural golden-yellow bamboo
    bambooDarkColor: 0x8f6a2a,      // Bamboo node dark tone
    metalColor: 0x4a3f2f,           // Arch metal - dark bronze
    metalRoughness: 0.35,
    metalMetalness: 0.85,
    poleColor: 0x3d3428,            // Pole metal color
    goldAccent: 0xf5c342,           // Rich gold decorative accents
    goldRoughness: 0.25,
    goldMetalness: 0.9,
    fenceColorGreen: 0x2e8b57,      // Mosque fence - green
    fenceColorBlue: 0x3a7cbf,       // Mosque fence - blue accent
    mosqueBuildingColor: 0xf0e6d6,  // Mosque wall cream/beige
    mosqueDomeColor: 0xb5c0cc,      // Mosque dome silver/grey metallic
    mosqueRoofColor: 0x2e6aa8,      // Mosque roof rich blue
  },

  // ========================
  // CAMERA PRESETS
  // ========================
  camera: {
    overview: {
      position: { x: 40, y: 55, z: 40 },
      target: { x: 0, y: 0, z: -5 },
    },
    approach: {
      position: { x: 3, y: 3, z: 45 },
      target: { x: 0, y: 3, z: -10 },
    },
    gate: {
      position: { x: 4.5, y: 3.2, z: -46.0 },
      target: { x: 0, y: 3.8, z: -35.0 },
    },
    roundabout: {
      position: { x: 5.8, y: 2.8, z: 5.8 },
      target: { x: 0, y: 1.1, z: 0 },
    },
    mosque: {
      position: { x: -2.0, y: 3.2, z: -13.0 },
      target: { x: -16.0, y: 3.8, z: -20.0 },
    },
    bridge: {
      position: { x: 2.2, y: 2.2, z: 36.0 },
      target: { x: 0, y: 1.0, z: 49.0 },
    },
    transitionDuration: 2.0,        // Seconds for camera transition
  },

  // ========================
  // SITE LAYOUT COORDINATES
  // ========================
  // Based on the reference map:
  //  - Mosque is to the WEST (negative X)
  //  - Main road runs NORTH-SOUTH (along Z axis)
  //  - East road branches to the right (positive X)
  //  - Roundabout at the intersection
  //  - Bridge at the south end
  //  - North gate and south gate on main road

  layout: {
    mosque: {
      position: { x: -22, y: 0, z: -20 },
      rotation: 0,                    // Facing east (toward road)
      width: 18,
      depth: 16,
    },

    fence: {
      // Fence runs along the east side of the mosque compound
      segments: [
        // East fence (along the road)
        { start: { x: -12, z: -25 }, end: { x: -12, z: -5 } },
        // South fence
        { start: { x: -12, z: -5 }, end: { x: -12, z: 0 } },
      ],
      height: 1.6,
      postSpacing: 3.0,
    },

    // Road paths defined as arrays of points
    roads: {
      // Main road: North-South
      mainRoad: [
        { x: 0, z: -40 },   // North end (gate)
        { x: 0, z: -25 },   // North section
        { x: 0, z: -10 },   // Approaching roundabout
        { x: 0, z: 0 },     // Roundabout center
        { x: 0, z: 10 },    // South of roundabout
        { x: 0, z: 25 },    // South section
        { x: 0, z: 44 },    // North bridge approach
        { x: 0, z: 56 },    // South bridge exit
        { x: 0, z: 75 },    // Countryside road continuation
      ],
      // East road: branches from roundabout to the east
      eastRoad: [
        { x: 0, z: 0 },     // Roundabout center
        { x: 10, z: 0 },
        { x: 20, z: 0 },
        { x: 42, z: 0 },    // East end
      ],
    },

    // Pole positions along roads
    poles: {
      mainRoad: [
        { z: -35, type: 'gate' },       // North gate
        { z: -30, type: 'arch' },       // Arch 5
        { z: -25, type: 'arch' },       // Arch 4
        { z: -20, type: 'arch' },       // Arch 3
        { z: -15, type: 'arch' },       // Arch 2
        { z: -10, type: 'arch' },       // Arch 1
        // roundabout area skipped
        { z: 10, type: 'arch' },        // Arch 1
        { z: 15, type: 'arch' },        // Arch 2
        { z: 20, type: 'arch' },        // Arch 3
        { z: 25, type: 'arch' },        // Arch 4
        { z: 30, type: 'arch' },        // Arch 5
        { z: 35, type: 'gate' },        // South gate
      ],
      eastRoad: [
        { x: 8, type: 'arch' },         // Arch 1
        { x: 14, type: 'arch' },        // Arch 2
        { x: 20, type: 'arch' },        // Arch 3
        { x: 26, type: 'arch' },        // Arch 4
        { x: 32, type: 'arch' },        // Arch 5
        { x: 38, type: 'gate' },        // East gate
      ],
    },
  },

  // ========================
  // ENVIRONMENT
  // ========================
  environment: {
    groundSize: 220,
    groundColor: 0x223f2b,            // Rich deep green night grass
    skyColorDay: 0x87CEEB,
    skyColorNight: 0x0c1b38,           // Deep royal twilight blue
    fogNear: 100,
    fogFar: 300,
    treeCount: 30,                     // Simplified trees
  },

  // ========================
  // STATE
  // ========================
  nightMode: true,                     // Start in night mode (hero scene)
  lightsOn: true,
  labelsVisible: false,
};
