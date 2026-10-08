/**
 * Controls.js — UI event handlers for all interactive controls.
 */

export class UIControls {
  constructor({ cameraManager, cinematicController, freeWalkController, photoModeController, lightingManager, archSystem, gateSystem, roundabout, sceneManager, config }) {
    this.cameraManager = cameraManager;
    this.cinematicController = cinematicController;
    this.freeWalkController = freeWalkController;
    this.photoModeController = photoModeController;
    this.lightingManager = lightingManager;
    this.archSystem = archSystem;
    this.gateSystem = gateSystem;
    this.roundabout = roundabout;
    this.sceneManager = sceneManager;
    this.config = config;

    this.setupDayNight();
    this.setupCameraPresets();
    this.setupSideControls();
    this.setupColorControls();
    this.setupFullscreen();
    this.setupInfoPanel();
    this.setupCinematic();
    this.setupFreeWalk();
  }

  setupDayNight() {
    const btn = document.getElementById('btn-day-night');
    const icon = document.getElementById('day-night-icon');

    btn.addEventListener('click', () => {
      this.config.nightMode = !this.config.nightMode;
      this.lightingManager.setNightMode(this.config.nightMode);
      icon.textContent = this.config.nightMode ? '☀️' : '🌙';

      // Update renderer exposure
      if (this.sceneManager && this.sceneManager.renderer) {
        this.sceneManager.renderer.toneMappingExposure = this.config.nightMode ? 1.15 : 1.1;
      }
    });
  }

  setupCameraPresets() {
    const buttons = document.querySelectorAll('.preset-btn:not(.btn-cinematic):not(.btn-freewalk):not(.btn-photo-mode)');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.cinematicController && this.cinematicController.isActive) {
          this.cinematicController.stop();
        }
        if (this.freeWalkController && this.freeWalkController.isActive) {
          this.freeWalkController.stopWalk();
        }
        if (this.photoModeController && this.photoModeController.isActive) {
          this.photoModeController.stop();
        }
        const preset = btn.dataset.preset;
        this.cameraManager.goToPreset(preset);

        // Update active state
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    const btnCinematic = document.getElementById('btn-cinematic');
    if (btnCinematic) {
      btnCinematic.addEventListener('click', () => {
        if (this.freeWalkController && this.freeWalkController.isActive) {
          this.freeWalkController.stopWalk();
        }
        if (this.photoModeController && this.photoModeController.isActive) {
          this.photoModeController.stop();
        }
        if (this.cinematicController) {
          this.cinematicController.start();
        }
      });
    }

    const btnFreewalk = document.getElementById('btn-freewalk');
    if (btnFreewalk) {
      btnFreewalk.addEventListener('click', () => {
        if (this.cinematicController && this.cinematicController.isActive) {
          this.cinematicController.stop();
        }
        if (this.photoModeController && this.photoModeController.isActive) {
          this.photoModeController.stop();
        }
        if (this.freeWalkController) {
          this.freeWalkController.startWalk();
        }
      });
    }

    const btnPhotoMode = document.getElementById('btn-photo-mode');
    if (btnPhotoMode) {
      btnPhotoMode.addEventListener('click', () => {
        if (this.cinematicController && this.cinematicController.isActive) {
          this.cinematicController.stop();
        }
        if (this.freeWalkController && this.freeWalkController.isActive) {
          this.freeWalkController.stopWalk();
        }
        if (this.photoModeController) {
          this.photoModeController.start();
        }
      });
    }

    // Global keyboard shortcut: 'p' opens Photo Mode
    window.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'p' || e.key === 'P') {
        if (!this.photoModeController?.isActive && !this.cinematicController?.isActive) {
          if (btnPhotoMode) btnPhotoMode.click();
        }
      }
    });
  }

  setupFreeWalk() {
    if (!this.freeWalkController) return;

    this.freeWalkController.onExitCallback = () => {
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      const btnOverview = document.querySelector('.preset-btn[data-preset="overview"]');
      if (btnOverview) btnOverview.classList.add('active');
    };
  }

  setupCinematic() {
    if (!this.cinematicController) return;

    this.cinematicController.bindUI({
      overlay: document.getElementById('cinematic-overlay'),
      btnExit: document.getElementById('cinematic-btn-exit'),
    });
  }

  setupSideControls() {
    // Reset camera
    document.getElementById('btn-reset-camera').addEventListener('click', () => {
      this.cameraManager.reset();
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('[data-preset="overview"]').classList.add('active');
    });

    // Toggle lights
    document.getElementById('btn-toggle-lights').addEventListener('click', () => {
      this.config.lightsOn = !this.config.lightsOn;
      this.lightingManager.decorativeLights.forEach(l => {
        l.visible = this.config.lightsOn && this.config.nightMode;
      });
      this.lightingManager.glowSprites.forEach(s => {
        s.visible = this.config.lightsOn && this.config.nightMode;
      });
    });

    // Animate lights
    document.getElementById('btn-animate-lights').addEventListener('click', () => {
      if (this.config.nightMode) {
        this.lightingManager.animateLightsSequentially();
      }
    });

    // Toggle labels (info)
    document.getElementById('btn-toggle-labels').addEventListener('click', () => {
      this.config.labelsVisible = !this.config.labelsVisible;
      const panel = document.getElementById('info-panel');
      if (this.config.labelsVisible) {
        panel.classList.remove('hidden');
        document.getElementById('info-title').textContent = 'Instalasi Lampu Hias';
        document.getElementById('info-desc').textContent =
          'Proyek pemasangan lampu hias dekoratif di sepanjang jalan Masjid Al-Muhajirin, ' +
          'Desa Karang Rejo, Dusun Banjar Sari, Kec. Jorong, Kab. Tanah Laut. ' +
          'Lampu kanan-kiri jalan dengan warna yang dapat diubah sesuai selera.';
      } else {
        panel.classList.add('hidden');
      }
    });
  }

  setupColorControls() {
    const btnColor = document.getElementById('btn-light-color');
    const chips = document.querySelectorAll('.color-chip');

    // 1. Cycle color button
    if (btnColor) {
      btnColor.addEventListener('click', () => {
        const preset = this.lightingManager.cycleDecorativeLightColor();
        this.updateColorActiveState(preset.id);
        this.showColorToast(preset);
      });
    }

    // 2. Direct color chips
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const colorId = chip.dataset.color;
        const preset = this.lightingManager.setDecorativeColorById(colorId);
        if (preset) {
          this.updateColorActiveState(preset.id);
          this.showColorToast(preset);
        }
      });
    });
  }

  updateColorActiveState(activeId) {
    const chips = document.querySelectorAll('.color-chip');
    chips.forEach(chip => {
      if (chip.dataset.color === activeId) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    const btnColor = document.getElementById('btn-light-color');
    const activePreset = this.lightingManager.colorPresets.find(p => p.id === activeId);
    if (btnColor && activePreset) {
      btnColor.textContent = activePreset.icon || '🎨';
    }
  }

  showColorToast(preset) {
    const toast = document.getElementById('color-toast');
    const toastIcon = document.getElementById('color-toast-icon');
    const toastText = document.getElementById('color-toast-text');

    if (!toast || !preset) return;

    toastIcon.textContent = preset.icon || '💡';
    toastText.textContent = `Warna Lampu: ${preset.name}`;

    toast.classList.remove('hidden');
    toast.classList.add('show');

    if (this._toastTimeout) clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.classList.add('hidden'), 400);
    }, 2200);
  }

  setupFullscreen() {
    document.getElementById('btn-fullscreen').addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });
  }

  setupInfoPanel() {
    document.getElementById('btn-close-info').addEventListener('click', () => {
      document.getElementById('info-panel').classList.add('hidden');
      this.config.labelsVisible = false;
    });
  }
}
