/**
 * CameraManager.js — Smooth camera transitions between preset viewpoints.
 */

import * as THREE from 'three';

export class CameraManager {
  constructor(camera, controls, config) {
    this.camera = camera;
    this.controls = controls;
    this.config = config;
    this.isTransitioning = false;
    this.transitionProgress = 0;
    this.startPos = new THREE.Vector3();
    this.endPos = new THREE.Vector3();
    this.startTarget = new THREE.Vector3();
    this.endTarget = new THREE.Vector3();
    this.currentPreset = 'overview';

    // Start animation loop for transitions
    this.animate = this.animate.bind(this);
    this.lastTime = performance.now();
    requestAnimationFrame(this.animate);
  }

  animate(now) {
    requestAnimationFrame(this.animate);
    const delta = (now - this.lastTime) / 1000;
    this.lastTime = now;

    if (this.isTransitioning) {
      const duration = this.config.camera.transitionDuration;
      this.transitionProgress += delta / duration;

      if (this.transitionProgress >= 1) {
        this.transitionProgress = 1;
        this.isTransitioning = false;
      }

      // Smooth easing (ease-in-out cubic)
      const t = this.easeInOutCubic(this.transitionProgress);

      // Interpolate camera position
      this.camera.position.lerpVectors(this.startPos, this.endPos, t);

      // Interpolate target
      const currentTarget = new THREE.Vector3();
      currentTarget.lerpVectors(this.startTarget, this.endTarget, t);
      this.controls.target.copy(currentTarget);
      this.controls.update();
    }
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * Transition to a named camera preset.
   */
  goToPreset(presetName) {
    const preset = this.config.camera[presetName];
    if (!preset) return;

    this.currentPreset = presetName;

    // Store start
    this.startPos.copy(this.camera.position);
    this.startTarget.copy(this.controls.target);

    // Set end
    this.endPos.set(preset.position.x, preset.position.y, preset.position.z);
    this.endTarget.set(preset.target.x, preset.target.y, preset.target.z);

    // Start transition
    this.transitionProgress = 0;
    this.isTransitioning = true;
  }

  /**
   * Reset to overview.
   */
  reset() {
    this.goToPreset('overview');
  }
}
