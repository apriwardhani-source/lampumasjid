/**
 * PhotoModeController.js — Dedicated Photography / Camera Mode for Masjid Al-Muhajirin.
 *
 * Features:
 *  - 100% Pure Clean Viewfinder: No icons, watermarks, or ornaments when capturing.
 *  - High-Resolution Screenshot Capture directly from Three.js WebGL canvas.
 *  - Realistic DSLR Camera Shutter flash animation and Web Audio click sound.
 *  - Rule-of-Thirds (3x3) photography composition grid guide.
 *  - Clean View toggle: Hide all controls completely for manual device screenshots.
 *  - Integrated Day / Night switch for finding the ideal lighting.
 *  - Auto-download PNG image with timestamp filename.
 */

export class PhotoModeController {
  constructor({ sceneManager, cameraManager, lightingManager, config }) {
    this.sceneManager = sceneManager;
    this.cameraManager = cameraManager;
    this.lightingManager = lightingManager;
    this.config = config;

    this.isActive = false;
    this.isUiHidden = false;
    this.isGridActive = false;

    this.initDOM();
  }

  initDOM() {
    this.hud = document.getElementById('photo-mode-hud');
    this.topBar = document.getElementById('photo-top-bar');
    this.bottomBar = document.getElementById('photo-bottom-bar');
    this.gridGuide = document.getElementById('photo-grid-guide');
    this.flashEl = document.getElementById('photo-shutter-flash');
    this.toastEl = document.getElementById('photo-toast');
    this.toastText = document.getElementById('photo-toast-text');
    this.restoreHint = document.getElementById('photo-restore-hint');

    this.btnShutter = document.getElementById('btn-photo-shutter');
    this.btnGrid = document.getElementById('btn-photo-grid');
    this.btnDayNight = document.getElementById('btn-photo-daynight');
    this.dayNightIcon = document.getElementById('photo-daynight-icon');
    this.btnHideUI = document.getElementById('btn-photo-hide-ui');
    this.btnExit = document.getElementById('btn-exit-photo');

    // Bind event listeners
    if (this.btnShutter) {
      this.btnShutter.addEventListener('click', () => this.takePhoto());
    }

    if (this.btnGrid) {
      this.btnGrid.addEventListener('click', () => this.toggleGrid());
    }

    if (this.btnDayNight) {
      this.btnDayNight.addEventListener('click', () => this.toggleDayNight());
    }

    if (this.btnHideUI) {
      this.btnHideUI.addEventListener('click', () => this.toggleCleanView());
    }

    if (this.btnExit) {
      this.btnExit.addEventListener('click', () => this.stop());
    }

    // Tap/Click on canvas restores UI if it was hidden
    if (this.sceneManager && this.sceneManager.canvas) {
      this.sceneManager.canvas.addEventListener('click', () => {
        if (this.isActive && this.isUiHidden) {
          this.toggleCleanView();
        }
      });
    }

    // Keyboard shortcuts
    window.addEventListener('keydown', e => {
      if (!this.isActive) return;

      if (e.key === 'Escape') {
        this.stop();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.takePhoto();
      } else if (e.key === 'g' || e.key === 'G') {
        this.toggleGrid();
      } else if (e.key === 'h' || e.key === 'H') {
        this.toggleCleanView();
      }
    });
  }

  start() {
    this.isActive = true;
    this.isUiHidden = false;

    // Enable OrbitControls for photographer framing
    if (this.sceneManager && this.sceneManager.controls) {
      this.sceneManager.controls.enabled = true;
    }

    document.body.classList.add('photo-mode-active');
    if (this.hud) {
      this.hud.classList.remove('hidden');
    }

    // Update day/night icon
    if (this.dayNightIcon) {
      this.dayNightIcon.textContent = this.config.nightMode ? '☀️' : '🌙';
    }

    // Reset toolbar states
    if (this.topBar) this.topBar.classList.remove('hidden');
    if (this.bottomBar) this.bottomBar.classList.remove('hidden');
  }

  stop() {
    if (!this.isActive) return;
    this.isActive = false;

    document.body.classList.remove('photo-mode-active');
    if (this.hud) {
      this.hud.classList.add('hidden');
    }
    if (this.gridGuide) {
      this.gridGuide.classList.add('hidden');
      this.isGridActive = false;
      if (this.btnGrid) this.btnGrid.classList.remove('active');
    }

    // Sync active preset in main UI
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    const btnOverview = document.querySelector('.preset-btn[data-preset="overview"]');
    if (btnOverview) btnOverview.classList.add('active');
  }

  async takePhoto() {
    if (!this.isActive || this._isTakingPhoto) return;
    this._isTakingPhoto = true;

    // 1. Completely hide ALL UI elements and guides before capture
    if (this.hud) {
      this.hud.style.opacity = '0';
      this.hud.style.pointerEvents = 'none';
    }

    // Wait a brief tick for the browser DOM to repaint cleanly
    await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 60)));

    try {
      // 2. Render fresh pristine frame and capture image from WebGL canvas
      const dataUrl = this.sceneManager.captureScreenshot();

      // 3. Play realistic camera shutter sound
      this.playShutterSound();

      // 4. Trigger shutter flash visual
      if (this.flashEl) {
        this.flashEl.classList.add('flash');
        setTimeout(() => {
          this.flashEl.classList.remove('flash');
        }, 360);
      }

      // 5. Auto download high-res PNG image
      const now = new Date();
      const pad = n => n.toString().padStart(2, '0');
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const filename = `Masjid-Al-Muhajirin-${timestamp}.png`;

      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // 6. Show notification toast
      this.showToast('📸 Foto resolusi tinggi berhasil disimpan!');
    } catch (err) {
      console.error('Failed to capture photo:', err);
      this.showToast('⚠️ Gagal mengambil foto: ' + err.message);
    } finally {
      // 7. Restore HUD after short delay
      setTimeout(() => {
        if (this.hud && !this.isUiHidden) {
          this.hud.style.opacity = '1';
          this.hud.style.pointerEvents = 'auto';
        }
        this._isTakingPhoto = false;
      }, 350);
    }
  }

  toggleGrid() {
    this.isGridActive = !this.isGridActive;
    if (this.gridGuide) {
      if (this.isGridActive) {
        this.gridGuide.classList.remove('hidden');
      } else {
        this.gridGuide.classList.add('hidden');
      }
    }
    if (this.btnGrid) {
      this.btnGrid.classList.toggle('active', this.isGridActive);
    }
  }

  toggleCleanView() {
    this.isUiHidden = !this.isUiHidden;

    if (this.topBar) this.topBar.classList.toggle('hidden', this.isUiHidden);
    if (this.bottomBar) this.bottomBar.classList.toggle('hidden', this.isUiHidden);

    if (this.isUiHidden) {
      // Show brief hint on how to restore
      if (this.restoreHint) {
        this.restoreHint.classList.remove('hidden');
        if (this._hintTimeout) clearTimeout(this._hintTimeout);
        this._hintTimeout = setTimeout(() => {
          this.restoreHint.classList.add('hidden');
        }, 2600);
      }
    } else {
      if (this.restoreHint) this.restoreHint.classList.add('hidden');
    }
  }

  toggleDayNight() {
    this.config.nightMode = !this.config.nightMode;
    this.lightingManager.setNightMode(this.config.nightMode);

    if (this.dayNightIcon) {
      this.dayNightIcon.textContent = this.config.nightMode ? '☀️' : '🌙';
    }

    // Sync main day/night button icon if present
    const mainIcon = document.getElementById('day-night-icon');
    if (mainIcon) {
      mainIcon.textContent = this.config.nightMode ? '☀️' : '🌙';
    }

    if (this.sceneManager && this.sceneManager.renderer) {
      this.sceneManager.renderer.toneMappingExposure = this.config.nightMode ? 1.15 : 1.1;
    }

    this.showToast(this.config.nightMode ? '🌙 Mode Malam Aktif' : '☀️ Mode Siang Aktif');
  }

  showToast(message) {
    if (!this.toastEl || !this.toastText) return;
    this.toastText.textContent = message;
    this.toastEl.classList.remove('hidden');
    this.toastEl.classList.add('show');

    if (this._toastTimeout) clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      this.toastEl.classList.remove('show');
      setTimeout(() => this.toastEl.classList.add('hidden'), 350);
    }, 2400);
  }

  playShutterSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Shutter click part 1
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);

      // Shutter click part 2 (mechanical mirror return)
      setTimeout(() => {
        try {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(620, ctx.currentTime);
          osc2.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.05);
          gain2.gain.setValueAtTime(0.35, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.07);
        } catch (e) {}
      }, 70);
    } catch (e) {}
  }
}
