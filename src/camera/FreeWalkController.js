/**
 * FreeWalkController.js — Open World First-Person Exploration Controller.
 *
 * Features:
 *  - Full 360° Free Roam walking like an open world game (GTA / Genshin / Minecraft / Roblox).
 *  - Responsive Mobile Touch Controls:
 *      * Virtual Analog Joystick on the bottom-left for smooth 360° movement.
 *      * Dedicated Right-Screen touch drag area for smooth camera look / panning.
 *      * Mobile action buttons for Sprint (Lari) and Jump (Lompat).
 *  - Full Desktop Controls:
 *      * WASD / Arrow keys for movement.
 *      * Shift to sprint, Space to jump.
 *      * Mouse drag or Pointer Lock for looking around.
 *  - Open World Physics:
 *      * Eye-level camera (1.7m).
 *      * Subtle realistic head-bobbing while walking and running.
 *      * Ground step-up detection for curbs, roundabout island, and mosque terrace steps.
 *      * Jumping and smooth gravity.
 *      * World boundary limits to keep user within the environment.
 */

import * as THREE from 'three';

export class FreeWalkController {
  constructor(camera, controls, sceneManager, config) {
    this.camera = camera;
    this.orbitControls = controls;
    this.sceneManager = sceneManager;
    this.config = config;

    this.isActive = false;

    // Camera orientation
    this.yaw = 0;           // Horizontal rotation (radians)
    this.pitch = 0;         // Vertical rotation (radians, clamped)
    this.eyeHeight = 1.70;  // Standard eye level above ground (meters)
    this.currentGroundY = 0;

    // Movement physics
    this.position = new THREE.Vector3(0, 1.7, -25);
    this.velocity = new THREE.Vector3();
    this.verticalVelocity = 0;
    this.isGrounded = true;
    this.gravity = 14.0;
    this.jumpForce = 5.2;

    this.walkSpeed = 4.8;
    this.sprintSpeed = 9.2;
    this.isSprinting = false;

    // Head bobbing
    this.bobTimer = 0;
    this.bobAmount = 0.035;

    // Input state
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
      jump: false,
    };

    // Mobile touch state
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.joystickTouchId = null;
    this.lookTouchId = null;
    this.joystickCenter = { x: 0, y: 0 };
    this.joystickVector = { x: 0, y: 0 }; // [-1, 1]
    this.joystickMaxRadius = 45; // Pixels
    this.lastLookTouch = { x: 0, y: 0 };

    // Desktop mouse drag look state
    this.isMouseDown = false;
    this.lastMousePos = { x: 0, y: 0 };
    this.isPointerLocked = false;

    // Look sensitivity
    this.mouseSensitivity = 0.0024;
    this.touchSensitivity = 0.0038;

    // World boundary
    this.bounds = {
      minX: -65, maxX: 65,
      minZ: -70, maxZ: 70,
    };

    // Callback when exiting walk mode
    this.onExitCallback = null;

    // Bind event handlers
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handlePointerLockChange = this.handlePointerLockChange.bind(this);

    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);

    this.initDOM();
  }

  initDOM() {
    this.hudElement = document.getElementById('freewalk-hud');
    this.joystickBase = document.getElementById('joystick-base');
    this.joystickKnob = document.getElementById('joystick-knob');
    this.btnExit = document.getElementById('btn-exit-freewalk');
    this.btnMobileSprint = document.getElementById('btn-mobile-sprint');
    this.btnMobileJump = document.getElementById('btn-mobile-jump');

    if (this.btnExit) {
      this.btnExit.addEventListener('click', () => this.stopWalk());
    }

    if (this.btnMobileSprint) {
      this.btnMobileSprint.addEventListener('click', (e) => {
        e.stopPropagation();
        this.isSprinting = !this.isSprinting;
        this.btnMobileSprint.classList.toggle('active', this.isSprinting);
      });
    }

    if (this.btnMobileJump) {
      this.btnMobileJump.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.triggerJump();
      }, { passive: false });
      this.btnMobileJump.addEventListener('click', (e) => {
        e.stopPropagation();
        this.triggerJump();
      });
    }
  }

  /**
   * Start Open World Walk Mode.
   */
  startWalk(spawnPos = null) {
    if (this.isActive) return;
    this.isActive = true;

    // 1. Disable OrbitControls
    if (this.orbitControls) {
      this.orbitControls.enabled = false;
    }

    // 2. Set spawn position
    if (spawnPos) {
      this.position.copy(spawnPos);
    } else {
      // Default: Spawn on the main road in front of the mosque entrance facing the mosque
      this.position.set(0, 1.7, -20);
      this.yaw = -Math.PI / 2; // Look west toward mosque
      this.pitch = 0.05;
    }

    this.currentGroundY = this.getGroundHeight(this.position.x, this.position.z);
    this.position.y = this.currentGroundY + this.eyeHeight;
    this.verticalVelocity = 0;
    this.isGrounded = true;
    this.velocity.set(0, 0, 0);

    // 3. Attach event listeners
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('pointerlockchange', this.handlePointerLockChange);

    // Touch events on window / canvas
    window.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    window.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    window.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    window.addEventListener('touchcancel', this.handleTouchEnd, { passive: false });

    // 4. Update UI
    document.body.classList.add('freewalk-active');
    if (this.hudElement) {
      this.hudElement.classList.remove('hidden');
    }

    this.updateCameraTransform();
  }

  /**
   * Exit Walk Mode and return to Orbit Camera.
   */
  stopWalk() {
    if (!this.isActive) return;
    this.isActive = false;

    // 1. Remove event listeners
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('pointerlockchange', this.handlePointerLockChange);

    window.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('touchend', this.handleTouchEnd);
    window.removeEventListener('touchcancel', this.handleTouchEnd);

    if (document.pointerLockElement) {
      document.exitPointerLock();
    }

    // Reset inputs
    Object.keys(this.keys).forEach(k => { this.keys[k] = false; });
    this.resetJoystick();
    this.isSprinting = false;
    if (this.btnMobileSprint) this.btnMobileSprint.classList.remove('active');

    // 2. Re-enable OrbitControls cleanly
    if (this.orbitControls) {
      // Calculate a target in front of the current camera look direction
      const forward = new THREE.Vector3(
        -Math.sin(this.yaw) * Math.cos(this.pitch),
        Math.sin(this.pitch),
        -Math.cos(this.yaw) * Math.cos(this.pitch)
      ).normalize();

      const lookTarget = this.camera.position.clone().add(forward.multiplyScalar(8.0));
      this.orbitControls.target.copy(lookTarget);
      this.orbitControls.enabled = true;
      this.orbitControls.update();
    }

    // 3. Update UI
    document.body.classList.remove('freewalk-active');
    if (this.hudElement) {
      this.hudElement.classList.add('hidden');
    }

    if (this.onExitCallback) {
      this.onExitCallback();
    }
  }

  triggerJump() {
    if (this.isGrounded) {
      this.verticalVelocity = this.jumpForce;
      this.isGrounded = false;
    }
  }

  // ==========================================
  // INPUT HANDLERS (DESKTOP)
  // ==========================================
  handleKeyDown(e) {
    if (!this.isActive) return;
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.sprint = true;
        break;
      case 'Space':
        e.preventDefault();
        this.triggerJump();
        break;
      case 'Escape':
        this.stopWalk();
        break;
    }
  }

  handleKeyUp(e) {
    if (!this.isActive) return;
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.sprint = false;
        break;
    }
  }

  handleMouseDown(e) {
    if (!this.isActive) return;
    // Ignore clicks on HUD buttons
    if (e.target.closest('#freewalk-hud') && !e.target.closest('.mobile-touch-zone')) {
      return;
    }

    this.isMouseDown = true;
    this.lastMousePos.x = e.clientX;
    this.lastMousePos.y = e.clientY;
  }

  handleMouseMove(e) {
    if (!this.isActive) return;

    if (this.isPointerLocked) {
      const movementX = e.movementX || 0;
      const movementY = e.movementY || 0;
      this.yaw -= movementX * this.mouseSensitivity;
      this.pitch -= movementY * this.mouseSensitivity;
      this.clampPitch();
    } else if (this.isMouseDown) {
      const dx = e.clientX - this.lastMousePos.x;
      const dy = e.clientY - this.lastMousePos.y;
      this.yaw -= dx * this.mouseSensitivity;
      this.pitch -= dy * this.mouseSensitivity;
      this.clampPitch();
      this.lastMousePos.x = e.clientX;
      this.lastMousePos.y = e.clientY;
    }
  }

  handleMouseUp() {
    this.isMouseDown = false;
  }

  handlePointerLockChange() {
    this.isPointerLocked = document.pointerLockElement === this.sceneManager.canvas;
  }

  clampPitch() {
    const maxPitch = Math.PI / 2.2; // ~81 degrees
    this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));
  }

  // ==========================================
  // INPUT HANDLERS (MOBILE TOUCH)
  // ==========================================
  handleTouchStart(e) {
    if (!this.isActive) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const screenWidth = window.innerWidth;

      // Ignore touches on exit/action buttons
      if (touch.target.closest('.btn-exit-freewalk') || touch.target.closest('.mobile-action-btn')) {
        continue;
      }

      // Left half of screen: Virtual Joystick
      if (touch.clientX < screenWidth * 0.45 && this.joystickTouchId === null) {
        this.joystickTouchId = touch.identifier;
        this.setupJoystickPosition(touch.clientX, touch.clientY);
        e.preventDefault();
      }
      // Right half of screen: Camera Look
      else if (touch.clientX >= screenWidth * 0.45 && this.lookTouchId === null) {
        this.lookTouchId = touch.identifier;
        this.lastLookTouch.x = touch.clientX;
        this.lastLookTouch.y = touch.clientY;
        e.preventDefault();
      }
    }
  }

  handleTouchMove(e) {
    if (!this.isActive) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      // 1. Process Joystick Touch
      if (touch.identifier === this.joystickTouchId) {
        e.preventDefault();
        const dx = touch.clientX - this.joystickCenter.x;
        const dy = touch.clientY - this.joystickCenter.y;
        const dist = Math.hypot(dx, dy);
        const maxR = this.joystickMaxRadius;

        const clampedDist = Math.min(dist, maxR);
        const angle = Math.atan2(dy, dx);

        const knobX = Math.cos(angle) * clampedDist;
        const knobY = Math.sin(angle) * clampedDist;

        if (this.joystickKnob) {
          this.joystickKnob.style.transform = `translate(${knobX}px, ${knobY}px)`;
        }

        // Normalized vector: X is strafe, Y is forward (inverted since -Y on screen is up/forward)
        this.joystickVector.x = knobX / maxR;
        this.joystickVector.y = -knobY / maxR;

        // Auto-sprint if pushed near maximum radius
        if (dist > maxR * 0.85) {
          this.keys.sprint = true;
        } else if (!this.btnMobileSprint?.classList.contains('active')) {
          this.keys.sprint = false;
        }
      }

      // 2. Process Camera Look Touch
      if (touch.identifier === this.lookTouchId) {
        e.preventDefault();
        const dx = touch.clientX - this.lastLookTouch.x;
        const dy = touch.clientY - this.lastLookTouch.y;

        this.yaw -= dx * this.touchSensitivity;
        this.pitch -= dy * this.touchSensitivity;
        this.clampPitch();

        this.lastLookTouch.x = touch.clientX;
        this.lastLookTouch.y = touch.clientY;
      }
    }
  }

  handleTouchEnd(e) {
    if (!this.isActive) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      if (touch.identifier === this.joystickTouchId) {
        this.joystickTouchId = null;
        this.resetJoystick();
      }

      if (touch.identifier === this.lookTouchId) {
        this.lookTouchId = null;
      }
    }
  }

  setupJoystickPosition(x, y) {
    if (!this.joystickBase) return;
    const rect = this.joystickBase.getBoundingClientRect();
    this.joystickCenter = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }

  resetJoystick() {
    this.joystickVector.x = 0;
    this.joystickVector.y = 0;
    if (this.joystickKnob) {
      this.joystickKnob.style.transform = 'translate(0px, 0px)';
    }
    if (!this.btnMobileSprint?.classList.contains('active')) {
      this.keys.sprint = false;
    }
  }

  // ==========================================
  // TERRAIN HEIGHT / STEP-UP DETECTION
  // ==========================================
  getGroundHeight(x, z) {
    // 1. Roundabout island mound (Center at 0, 0, radius ~3.0m)
    const rbDist = Math.hypot(x, z);
    if (rbDist < 3.1) {
      return 0.22;
    }

    // 2. Mosque elevated terrace and plinth
    // Mosque layout: center ~ (-22, -20). Plinth from x = -30.5 to -14.5, z = -30 to -10.
    if (x <= -14.5 && x >= -31.0 && z >= -30.0 && z <= -10.0) {
      return 0.45; // Plinth height
    }

    // 3. Mosque front perimeter steps (x = -12.8 to -14.5)
    if (x < -12.8 && x > -14.5 && z >= -30.5 && z <= -9.5) {
      return 0.22; // Step height
    }

    // 4. Concrete drainage ditch lip and roadside curbs (x = ±3.8, x = -7.15)
    if (Math.abs(Math.abs(x) - 3.8) < 0.2) {
      return 0.15; // Curb height
    }
    if (Math.abs(x + 7.15) < 0.2) {
      return 0.14; // Ditch lip
    }

    // 5. Timber Bridge Deck over River (z = 43.5 to 56.5, |x| <= 3.2)
    if (z >= 43.5 && z <= 56.5 && Math.abs(x) <= 3.2) {
      return 0.08; // Solid wooden bridge deck
    }

    // 6. River valley terrain depth (if walking off the bridge into riverbanks)
    const riverPt = [
      { x: -65, z: 10 }, { x: -45, z: 22 }, { x: -25, z: 36 },
      { x: -12, z: 44 }, { x: 0, z: 50 }, { x: 14, z: 56 },
      { x: 28, z: 63 }, { x: 60, z: 76 }
    ];
    let minRDist = Infinity;
    for (let i = 0; i < riverPt.length; i++) {
      const d = Math.hypot(x - riverPt[i].x, z - riverPt[i].z);
      if (d < minRDist) minRDist = d;
    }
    if (minRDist < 8.0) {
      return -2.2 * Math.cos((minRDist / 8.0) * Math.PI * 0.5) - 0.05;
    }

    // Default ground level
    return 0.0;
  }

  // ==========================================
  // FRAME UPDATE LOOP
  // ==========================================
  update(delta) {
    if (!this.isActive) return;

    // Limit delta to prevent glitching on lag spikes
    delta = Math.min(delta, 0.1);

    // 1. Compute movement direction from keyboard and joystick
    let moveForward = 0;
    let moveStrafe = 0;

    // Keyboard inputs
    if (this.keys.forward) moveForward += 1;
    if (this.keys.backward) moveForward -= 1;
    if (this.keys.right) moveStrafe += 1;
    if (this.keys.left) moveStrafe -= 1;

    // Joystick inputs (additive)
    moveForward += this.joystickVector.y;
    moveStrafe += this.joystickVector.x;

    // Determine current speed (walk vs sprint)
    const isSprint = this.keys.sprint || this.isSprinting;
    const currentSpeed = isSprint ? this.sprintSpeed : this.walkSpeed;

    // Normalize movement vector so diagonal isn't faster
    const inputLen = Math.hypot(moveForward, moveStrafe);
    if (inputLen > 1) {
      moveForward /= inputLen;
      moveStrafe /= inputLen;
    }

    // 2. Convert input to world velocity based on camera yaw
    const forwardVec = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const rightVec = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    const targetVelocity = new THREE.Vector3()
      .addScaledVector(forwardVec, moveForward * currentSpeed)
      .addScaledVector(rightVec, moveStrafe * currentSpeed);

    // Smooth horizontal acceleration & deceleration (friction)
    this.velocity.lerp(targetVelocity, delta * 12);

    // 3. Apply horizontal movement
    this.position.x += this.velocity.x * delta;
    this.position.z += this.velocity.z * delta;

    // Clamp to map boundaries
    this.position.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, this.position.x));
    this.position.z = Math.max(this.bounds.minZ, Math.min(this.bounds.maxZ, this.position.z));

    // 4. Vertical physics (Gravity, Jumping & Smooth Step-Up)
    const targetGroundY = this.getGroundHeight(this.position.x, this.position.z);

    // Smoothly step up/down curbs and steps
    this.currentGroundY = THREE.MathUtils.lerp(this.currentGroundY, targetGroundY, delta * 14);

    const floorY = this.currentGroundY + this.eyeHeight;

    if (!this.isGrounded) {
      this.verticalVelocity -= this.gravity * delta;
      this.position.y += this.verticalVelocity * delta;

      if (this.position.y <= floorY) {
        this.position.y = floorY;
        this.verticalVelocity = 0;
        this.isGrounded = true;
      }
    } else {
      this.position.y = floorY;
    }

    // 5. Head Bobbing (Subtle cinematic gait)
    const isMoving = this.velocity.lengthSq() > 0.05 && this.isGrounded;
    let bobOffsetY = 0;

    if (isMoving) {
      const bobFreq = isSprint ? 14 : 10;
      this.bobTimer += delta * bobFreq;
      bobOffsetY = Math.sin(this.bobTimer) * (isSprint ? this.bobAmount * 1.4 : this.bobAmount);
    } else {
      this.bobTimer = 0;
    }

    // 6. Update Camera position and view
    this.updateCameraTransform(bobOffsetY);
  }

  updateCameraTransform(bobOffsetY = 0) {
    this.camera.position.set(
      this.position.x,
      this.position.y + bobOffsetY,
      this.position.z
    );

    // Look vector from yaw & pitch
    const lookTarget = new THREE.Vector3(
      this.position.x - Math.sin(this.yaw) * Math.cos(this.pitch) * 10,
      this.position.y + bobOffsetY + Math.sin(this.pitch) * 10,
      this.position.z - Math.cos(this.yaw) * Math.cos(this.pitch) * 10
    );

    this.camera.lookAt(lookTarget);
  }
}
