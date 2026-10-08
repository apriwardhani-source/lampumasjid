/**
 * main.js — Entry point for the 3D visualization.
 */

import { SceneManager } from './scene/SceneManager.js';
import { EnvironmentBuilder } from './scene/Environment.js';
import { LightingManager } from './scene/Lighting.js';
import { RoadSystem } from './site/RoadSystem.js';
import { MosqueFenceSystem } from './site/MosqueFence.js';
import { ArchSystem } from './site/ArchSystem.js';
import { RoundaboutSystem } from './site/Roundabout.js';
import { GateSystem } from './site/GateSystem.js';
import { MosqueBuilder } from './site/Mosque.js';
import { BridgeRiverSystem } from './site/BridgeRiverSystem.js';
import { CameraManager } from './camera/CameraManager.js';
import { CinematicController } from './camera/CinematicController.js';
import { FreeWalkController } from './camera/FreeWalkController.js';
import { PhotoModeController } from './camera/PhotoModeController.js';
import { UIControls } from './ui/Controls.js';
import { siteConfig } from './config/siteConfig.js';

class App {
  constructor() {
    this.loadingBar = document.getElementById('loading-bar');
    this.loadingText = document.getElementById('loading-text');
    this.loadingScreen = document.getElementById('loading-screen');
    this.uiOverlay = document.getElementById('ui-overlay');
    this.init();
  }

  async init() {
    try {
      this.updateLoading(5, 'Initializing renderer...');

      // Scene Manager (renderer, scene, camera)
      this.sceneManager = new SceneManager('three-canvas');

      this.updateLoading(10, 'Building environment...');

      // Environment (ground, sky, fog, trees)
      this.environment = new EnvironmentBuilder(this.sceneManager.scene, siteConfig);
      this.environment.build();

      this.updateLoading(20, 'Setting up lighting...');

      // Lighting Manager
      this.lightingManager = new LightingManager(this.sceneManager.scene, siteConfig);
      this.lightingManager.setup();
      // Connect environment for day/night sky transitions
      this.lightingManager.environment = this.environment;

      this.updateLoading(30, 'Constructing roads...');

      // Roads
      this.roadSystem = new RoadSystem(this.sceneManager.scene, siteConfig);
      this.roadSystem.build();

      this.updateLoading(40, 'Building mosque...');

      // Mosque — set lighting manager BEFORE build for glowing windows & lights
      this.mosque = new MosqueBuilder(this.sceneManager.scene, siteConfig);
      this.mosque.setLightingManager(this.lightingManager);
      this.mosque.build();

      this.updateLoading(50, 'Building fence...');

      // Fence
      this.fence = new MosqueFenceSystem(this.sceneManager.scene, siteConfig);
      this.fence.setLightingManager(this.lightingManager);
      this.fence.build();

      this.updateLoading(55, 'Building roundabout...');

      // Roundabout — set lighting manager BEFORE build
      this.roundabout = new RoundaboutSystem(this.sceneManager.scene, siteConfig);
      this.roundabout.setLightingManager(this.lightingManager);
      this.roundabout.build();

      this.updateLoading(60, 'Generating decorative arches...');

      // Arches — set lighting manager BEFORE build
      this.archSystem = new ArchSystem(this.sceneManager.scene, siteConfig);
      this.archSystem.setLightingManager(this.lightingManager);
      this.archSystem.build();

      this.updateLoading(80, 'Creating entrance gates...');

      // Gates — set lighting manager BEFORE build
      this.gateSystem = new GateSystem(this.sceneManager.scene, siteConfig);
      this.gateSystem.setLightingManager(this.lightingManager);
      this.gateSystem.build();

      this.updateLoading(85, 'Constructing river & bridge...');

      // River & Wooden Bridge — set lighting manager BEFORE build
      this.bridgeRiverSystem = new BridgeRiverSystem(this.sceneManager.scene, siteConfig);
      this.bridgeRiverSystem.setLightingManager(this.lightingManager);
      this.bridgeRiverSystem.build();

      this.updateLoading(90, 'Setting up cameras...');

      // Camera Manager
      this.cameraManager = new CameraManager(
        this.sceneManager.camera,
        this.sceneManager.controls,
        siteConfig
      );

      // Cinematic Tour Controller
      this.cinematicController = new CinematicController(
        this.sceneManager.camera,
        this.sceneManager.controls,
        this.sceneManager,
        siteConfig
      );

      // Free Walk Controller (Open World Free Roam Walking Mode)
      this.freeWalkController = new FreeWalkController(
        this.sceneManager.camera,
        this.sceneManager.controls,
        this.sceneManager,
        siteConfig
      );

      // Photo Mode Controller (Clean Photography & Screenshot Capture)
      this.photoModeController = new PhotoModeController({
        sceneManager: this.sceneManager,
        cameraManager: this.cameraManager,
        lightingManager: this.lightingManager,
        config: siteConfig,
      });

      this.updateLoading(95, 'Initializing controls...');

      // UI Controls
      this.uiControls = new UIControls({
        cameraManager: this.cameraManager,
        cinematicController: this.cinematicController,
        freeWalkController: this.freeWalkController,
        photoModeController: this.photoModeController,
        lightingManager: this.lightingManager,
        archSystem: this.archSystem,
        gateSystem: this.gateSystem,
        roundabout: this.roundabout,
        sceneManager: this.sceneManager,
        config: siteConfig,
      });

      // Detect touch screen devices
      if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        document.body.classList.add('touch-enabled');
      }

      // Apply initial night mode
      if (siteConfig.nightMode) {
        this.lightingManager.setNightMode(true);
        this.sceneManager.renderer.toneMappingExposure = 1.15;
      }

      this.updateLoading(100, 'Selesai!');

      // Hide loading, show UI
      setTimeout(() => {
        this.loadingScreen.classList.add('hidden');
        this.uiOverlay.classList.add('visible');
      }, 600);

      // Start render loop
      this.sceneManager.startRenderLoop(() => {
        const delta = this.sceneManager.clock.getDelta();
        this.lightingManager.update(delta);
        if (this.cinematicController) {
          this.cinematicController.update(delta);
        }
        if (this.freeWalkController) {
          this.freeWalkController.update(delta);
        }
        if (this.bridgeRiverSystem) {
          this.bridgeRiverSystem.update(delta);
        }
      });

    } catch (error) {
      console.error('Failed to initialize:', error);
      this.updateLoading(0, `Error: ${error.message}`);
    }
  }

  updateLoading(percent, text) {
    if (this.loadingBar) this.loadingBar.style.width = percent + '%';
    if (this.loadingText) this.loadingText.textContent = text;
  }
}

// Boot
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
