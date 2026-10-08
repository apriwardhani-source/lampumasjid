import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export class SceneManager {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.clock = new THREE.Clock();

    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.initPostProcessing();
    this.initControls();
    this.handleResize();
  }

  getOptimalPixelRatio() {
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768;
    return isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2.0);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(this.getOptimalPixelRatio());
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  initScene() {
    this.scene = new THREE.Scene();
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.5,
      500
    );
    this.camera.position.set(40, 55, 40);
    this.camera.lookAt(0, 0, -5);
  }

  initPostProcessing() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.composer = new EffectComposer(this.renderer);
    
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // Half-resolution bloom for 4x faster fill-rate and softer, smoother glow
    const bloomW = Math.max(256, Math.floor(width / 2));
    const bloomH = Math.max(256, Math.floor(height / 2));
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(bloomW, bloomH),
      0.42,  // Soft bloom strength (gentle glow)
      0.35,  // bloom radius
      0.75   // bloom threshold (only bright LEDs glow softly)
    );
    this.composer.addPass(this.bloomPass);

    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 140;
    this.controls.maxPolarAngle = Math.PI * 0.48;
    this.controls.target.set(0, 0, -5);
    this.controls.update();
  }

  handleResize() {
    window.addEventListener('resize', () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setPixelRatio(this.getOptimalPixelRatio());
      this.renderer.setSize(w, h);
      if (this.composer) {
        this.composer.setSize(w, h);
      }
      if (this.bloomPass) {
        this.bloomPass.resolution.set(Math.max(256, Math.floor(w / 2)), Math.max(256, Math.floor(h / 2)));
      }
    });
  }

  startRenderLoop(updateCallback) {
    const animate = () => {
      requestAnimationFrame(animate);
      this.controls.update();
      if (updateCallback) updateCallback();
      if (this.composer) {
        this.composer.render();
      } else {
        this.renderer.render(this.scene, this.camera);
      }
    };
    animate();
  }
}
