/**
 * Lighting.js — Scene lighting for day and night modes,
 * plus management of all decorative LED lights and architectural illumination.
 */

import * as THREE from 'three';

export class LightingManager {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.isNight = config.nightMode;
    this.decorativeLights = [];
    this.glowSprites = [];
    this.emissiveMeshes = [];
    this.architecturalLights = [];
    this.environment = null;
    this.time = 0;

    // Color Management for Roadside Decorative Lights
    this.colorPresets = this.config.lighting.colorPresets || [
      { id: 'kuning', name: 'Kuning Hangat', hex: 0xffbe3b, icon: '🟡', css: '#ffbe3b' },
      { id: 'putih', name: 'Putih Bersih', hex: 0xffffff, icon: '⚪', css: '#ffffff' },
      { id: 'hijau', name: 'Hijau Islami', hex: 0x22c55e, icon: '🟢', css: '#22c55e' },
      { id: 'biru', name: 'Biru Langit', hex: 0x00d2ff, icon: '🔵', css: '#00d2ff' },
      { id: 'amber', name: 'Jingga Amber', hex: 0xff7700, icon: '🟠', css: '#ff7700' },
      { id: 'ungu', name: 'Ungu Magis', hex: 0xc084fc, icon: '🟣', css: '#c084fc' },
    ];
    this.currentColorIndex = 0;
    this.currentDecorativeColor = new THREE.Color(this.colorPresets[0].hex);
  }

  setup() {
    this.createAmbientLight();
    this.createDirectionalLight();
    this.createHemisphereLight();
    this.createMosqueArchitecturalLights();
    this.createRoundaboutLighting();
  }

  createAmbientLight() {
    this.ambient = new THREE.AmbientLight(
      this.isNight ? 0x3d527a : this.config.lighting.ambientDay,
      this.isNight ? 1.2 : 0.6
    );
    this.scene.add(this.ambient);
  }

  createDirectionalLight() {
    // Sun during day / Moonlight at night
    this.sun = new THREE.DirectionalLight(
      this.isNight ? 0xadc8f2 : this.config.lighting.sunColor,
      this.isNight ? 1.3 : this.config.lighting.sunIntensityDay
    );
    this.sun.position.set(35, 60, 25);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.width = 2048;
    this.sun.shadow.mapSize.height = 2048;
    this.sun.shadow.camera.near = 1;
    this.sun.shadow.camera.far = 140;
    this.sun.shadow.camera.left = -70;
    this.sun.shadow.camera.right = 70;
    this.sun.shadow.camera.top = 70;
    this.sun.shadow.camera.bottom = -70;
    this.sun.shadow.bias = -0.001;
    this.scene.add(this.sun);
  }

  createHemisphereLight() {
    this.hemisphere = new THREE.HemisphereLight(
      this.isNight ? 0x486b9e : 0x87CEEB,
      this.isNight ? 0x223626 : 0x3a5a3a,
      this.isNight ? 1.1 : 0.4
    );
    this.scene.add(this.hemisphere);
  }

  /**
   * Architectural floodlights & spotlights for Mosque Al-Muhajirin.
   * Elegant, tasteful illumination without harsh glare.
   */
  createMosqueArchitecturalLights() {
    const mosquePos = this.config.layout.mosque.position;

    // 1. Warm facade wash light (illuminates front entrance and veranda facing East)
    const facadeSpot = new THREE.SpotLight(0xffe0a8, 3.2, 35, Math.PI / 3.2, 0.5, 1.2);
    facadeSpot.position.set(mosquePos.x + 14, 3.5, mosquePos.z);
    facadeSpot.target.position.set(mosquePos.x + 7, 3.5, mosquePos.z);
    this.scene.add(facadeSpot.target);
    this.scene.add(facadeSpot);
    this.architecturalLights.push(facadeSpot);

    // 2. Dome architectural spotlight (highlights bell dome & crescent)
    const domeSpot = new THREE.SpotLight(0xcedeff, 2.6, 32, Math.PI / 4, 0.45, 1.2);
    domeSpot.position.set(mosquePos.x + 10, 4, mosquePos.z + 5);
    domeSpot.target.position.set(mosquePos.x - 2.5, 9.5, mosquePos.z - 0.5);
    this.scene.add(domeSpot.target);
    this.scene.add(domeSpot);
    this.architecturalLights.push(domeSpot);

    // 3. Veranda warm soft floodlight
    const verandaPoint = new THREE.PointLight(0xffbe6b, 2.0, 16, 1.2);
    verandaPoint.position.set(mosquePos.x + 6, 3.5, mosquePos.z);
    this.scene.add(verandaPoint);
    this.architecturalLights.push(verandaPoint);

    // 4. Courtyard ambient ground fill
    const courtyardPoint = new THREE.PointLight(0xffdfa0, 1.5, 20, 1.2);
    courtyardPoint.position.set(mosquePos.x + 11, 2.5, mosquePos.z);
    this.scene.add(courtyardPoint);
    this.architecturalLights.push(courtyardPoint);

    // Initial visibility matches nightMode
    this.architecturalLights.forEach(l => {
      l.visible = this.isNight;
    });
  }

  /**
   * Lighting for the roundabout monument & island.
   */
  createRoundaboutLighting() {
    const center = this.config.roundabout.center;

    // Primary warm spotlight illuminating the 3-tier tire monument from south-east
    const rbSpot1 = new THREE.SpotLight(0xfff1d6, 2.4, 16, Math.PI / 3.2, 0.45, 1.2);
    rbSpot1.position.set(center.x + 3.8, 5.5, center.z + 3.8);
    rbSpot1.target.position.set(center.x, 1.0, center.z);
    this.scene.add(rbSpot1.target);
    this.scene.add(rbSpot1);
    this.architecturalLights.push(rbSpot1);

    // Secondary fill spotlight from north-west to highlight red-white chevron details from both sides
    const rbSpot2 = new THREE.SpotLight(0xffeed6, 1.6, 15, Math.PI / 3.5, 0.5, 1.2);
    rbSpot2.position.set(center.x - 3.5, 5.0, center.z - 3.5);
    rbSpot2.target.position.set(center.x, 1.0, center.z);
    this.scene.add(rbSpot2.target);
    this.scene.add(rbSpot2);
    this.architecturalLights.push(rbSpot2);

    // Island ground fill
    const rbPoint = new THREE.PointLight(0xffd599, 1.4, 10, 1.2);
    rbPoint.position.set(center.x, 2.5, center.z);
    this.scene.add(rbPoint);
    this.architecturalLights.push(rbPoint);
  }

  registerDecorativeLight(pointLight) {
    this.decorativeLights.push(pointLight);
    pointLight.visible = this.isNight;
  }

  registerGlowSprite(sprite) {
    this.glowSprites.push(sprite);
    sprite.visible = this.isNight;
  }

  registerEmissiveMesh(mesh) {
    this.emissiveMeshes.push(mesh);
  }

  /**
   * Set the color for all roadside decorative lights (LEDs, PointLights, Glow halos)
   */
  setDecorativeLightColor(hex, name) {
    this.currentDecorativeColor.set(hex);

    // Update roadside point lights
    this.decorativeLights.forEach(light => {
      if (light.userData.isRoadsideLight) {
        light.color.set(hex);
      }
    });

    // Update glow sprites
    this.glowSprites.forEach(sprite => {
      if (sprite.userData.isRoadsideGlow) {
        sprite.material.color.set(hex);
      }
    });

    // Update emissive LED meshes
    this.emissiveMeshes.forEach(mesh => {
      if (mesh.userData.isRoadsideLED) {
        mesh.userData.ledColor.set(hex);
        if (this.isNight && mesh.material) {
          mesh.material.emissive.set(hex);
          mesh.material.color.set(hex);
        }
      }
    });

    return { hex, name };
  }

  /**
   * Cycle to the next color preset and return the active preset
   */
  cycleDecorativeLightColor() {
    this.currentColorIndex = (this.currentColorIndex + 1) % this.colorPresets.length;
    const preset = this.colorPresets[this.currentColorIndex];
    this.setDecorativeLightColor(preset.hex, preset.name);
    return preset;
  }

  /**
   * Set color by preset ID ('kuning', 'putih', 'hijau', etc.)
   */
  setDecorativeColorById(id) {
    const idx = this.colorPresets.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.currentColorIndex = idx;
      const preset = this.colorPresets[idx];
      this.setDecorativeLightColor(preset.hex, preset.name);
      return preset;
    }
    return null;
  }

  setNightMode(night) {
    this.isNight = night;

    // Ambient — comfortable, balanced fill
    this.ambient.color.set(night ? 0x3d527a : this.config.lighting.ambientDay);
    this.ambient.intensity = night ? 1.2 : 0.6;

    // Directional (Moonlight / Sunlight)
    this.sun.color.set(night ? 0xadc8f2 : this.config.lighting.sunColor);
    this.sun.intensity = night ? 1.3 : this.config.lighting.sunIntensityDay;

    // Hemisphere light
    this.hemisphere.color.set(night ? 0x486b9e : 0x87CEEB);
    this.hemisphere.groundColor.set(night ? 0x223626 : 0x3a5a3a);
    this.hemisphere.intensity = night ? 1.1 : 0.4;

    // Toggle architectural lights (mosque spotlights & roundabout monument)
    this.architecturalLights.forEach(l => {
      l.visible = night;
    });

    // Decorative string lights and glow halos
    this.decorativeLights.forEach(l => {
      l.visible = night;
    });
    this.glowSprites.forEach(s => {
      s.visible = night;
    });

    // Emissive materials: preserve individual vibrant colors, soft glow
    this.emissiveMeshes.forEach(m => {
      if (m.material) {
        if (night) {
          if (m.userData.ledColor) {
            m.material.emissive.copy(m.userData.ledColor);
          } else if (m.userData.originalEmissiveColor) {
            m.material.emissive.copy(m.userData.originalEmissiveColor);
          } else {
            m.material.emissive.set(0xffe4b5);
          }
          m.material.emissiveIntensity = m.userData.baseEmissiveIntensity || 2.2;
        } else {
          m.material.emissive.set(0x000000);
          m.material.emissiveIntensity = 0;
        }
      }
    });

    // Environment (sky, fog, ground, stars, moon)
    if (this.environment) {
      this.environment.setDayMode(!night);
    }
  }

  animateLightsSequentially(callback) {
    this.decorativeLights.forEach(l => { l.visible = false; });
    this.glowSprites.forEach(s => { s.visible = false; });

    const sorted = [...this.decorativeLights].sort((a, b) => a.position.z - b.position.z);
    const sortedSprites = [...this.glowSprites].sort((a, b) => a.position.z - b.position.z);

    let delay = 0;
    const step = 120;

    sorted.forEach((light, i) => {
      setTimeout(() => {
        light.visible = true;
        sortedSprites.forEach(s => {
          if (s.position.distanceTo(light.position) < 15) {
            s.visible = true;
          }
        });
      }, delay);
      delay += step;
    });

    if (callback) {
      setTimeout(callback, delay + 250);
    }
  }

  update(delta) {
    this.time += delta;

    if (this.isNight) {
      // Subtle organic breathing animation on decorative lights
      const pulse = 1.0 + Math.sin(this.time * 1.5) * 0.05;
      this.decorativeLights.forEach(l => {
        if (l.userData.baseIntensity) {
          l.intensity = l.userData.baseIntensity * pulse;
        }
      });

      // Subtle twinkling on glow sprites
      this.glowSprites.forEach((s, idx) => {
        if (s.userData.baseScale) {
          const tw = 1.0 + Math.sin(this.time * 2.5 + idx * 0.5) * 0.12;
          s.scale.set(s.userData.baseScale * tw, s.userData.baseScale * tw, 1);
        }
      });
    }
  }
}
