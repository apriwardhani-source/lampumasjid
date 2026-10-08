/**
 * CinematicController.js — Autonomous Cinematic Camera Tour for Masjid Al-Muhajirin.
 *
 * Features:
 *  - 6 Choreographed cinematic chapters with smooth spline interpolation
 *  - Anamorphic 21:9 letterbox black bars
 *  - Live on-screen chapter title & description cards
 *  - REC status badge and runtime counter
 *  - Media controls (Play/Pause, Next/Prev Chapter, Exit)
 *  - Smooth handoff to/from OrbitControls
 */

import * as THREE from 'three';

export class CinematicController {
  constructor(camera, controls, sceneManager, config) {
    this.camera = camera;
    this.controls = controls;
    this.sceneManager = sceneManager;
    this.config = config;

    this.isActive = false;
    this.isPaused = false;
    this.playbackSpeed = 1.0;
    this.elapsedTime = 0;
    this.currentChapterIndex = 0;

    // Define the 6 Cinematic Chapters
    this.chapters = [
      {
        id: 'gate',
        title: 'Gerbang Masuk Utama',
        subtitle: 'Rangka Taso Baja Ringan (Placeholder Banner)',
        duration: 7.0,
        path: [
          { pos: { x: 2.5, y: 2.8, z: -47.0 }, target: { x: 0, y: 4.2, z: -35.0 } },
          { pos: { x: 1.0, y: 2.5, z: -39.0 }, target: { x: 0, y: 3.8, z: -35.0 } },
          { pos: { x: 0.0, y: 2.4, z: -32.0 }, target: { x: 0, y: 3.0, z: -20.0 } },
        ],
      },
      {
        id: 'bamboo-arches',
        title: 'Lampu Kanan-Kiri Jalan',
        subtitle: 'Tiang Bambu & Untaian Lampu Hias Tepi Jalan',
        duration: 7.5,
        path: [
          { pos: { x: 0.2, y: 2.3, z: -30.0 }, target: { x: 0, y: 2.8, z: -15.0 } },
          { pos: { x: -0.6, y: 2.4, z: -21.0 }, target: { x: 0, y: 2.8, z: -10.0 } },
          { pos: { x: 0.4, y: 2.5, z: -12.0 }, target: { x: 0, y: 2.6, z: -2.0 } },
        ],
      },
      {
        id: 'roundabout',
        title: 'Tugu Bundaran 3 Ban',
        subtitle: 'Tumpukan 3 Ban Traktor Bercorak Merah-Putih Khas Banjar',
        duration: 7.0,
        path: [
          { pos: { x: 0.8, y: 2.2, z: 10.5 }, target: { x: 3.6, y: 1.2, z: 0 } },
          { pos: { x: 8.5, y: 2.8, z: 5.5 }, target: { x: 3.6, y: 1.2, z: 0 } },
          { pos: { x: 7.2, y: 2.5, z: -5.0 }, target: { x: 3.6, y: 1.2, z: 0 } },
        ],
      },
      {
        id: 'mosque-facade',
        title: 'Fasad Masjid Al-Muhajirin',
        subtitle: 'Serambi Pilar Lengkung & Plakat Kaligrafi Arab',
        duration: 8.0,
        path: [
          { pos: { x: -2.8, y: 3.0, z: -13.0 }, target: { x: -16.0, y: 3.6, z: -19.5 } },
          { pos: { x: -9.5, y: 3.2, z: -17.5 }, target: { x: -18.5, y: 4.0, z: -20.0 } },
          { pos: { x: -14.5, y: 3.5, z: -21.0 }, target: { x: -21.5, y: 5.5, z: -20.0 } },
        ],
      },
      {
        id: 'mosque-dome',
        title: 'Kubah Fluted & Area Layanan',
        subtitle: 'Kubah Seng Bergelombang, Menara Toa & Ambulans',
        duration: 7.5,
        path: [
          { pos: { x: -12.0, y: 6.8, z: -14.0 }, target: { x: -22.0, y: 9.5, z: -20.0 } },
          { pos: { x: -15.0, y: 5.5, z: -8.0 }, target: { x: -21.0, y: 5.0, z: -14.0 } },
          { pos: { x: -18.5, y: 4.2, z: -4.0 }, target: { x: -20.0, y: 3.0, z: -11.0 } },
        ],
      },
      {
        id: 'river-bridge',
        title: 'Jembatan Kayu & Sungai Desa',
        subtitle: 'Jembatan Papan Ulin dengan Ornamen HUT RI Merah-Putih',
        duration: 8.0,
        path: [
          { pos: { x: 3.2, y: 2.8, z: 36.0 }, target: { x: 0, y: 1.1, z: 49.0 } },
          { pos: { x: -2.8, y: 2.4, z: 44.0 }, target: { x: 0, y: 0.8, z: 51.0 } },
          { pos: { x: 0.0, y: 2.2, z: 54.0 }, target: { x: 0, y: 1.0, z: 62.0 } },
        ],
      },
      {
        id: 'aerial-panorama',
        title: 'Panorama Malam Udara',
        subtitle: 'Pemandangan Keseluruhan Desa Karang Rejo Bercahaya',
        duration: 8.5,
        path: [
          { pos: { x: 15.0, y: 32.0, z: 25.0 }, target: { x: -6.0, y: 1.0, z: -10.0 } },
          { pos: { x: 38.0, y: 46.0, z: 12.0 }, target: { x: -5.0, y: 1.0, z: -10.0 } },
          { pos: { x: 25.0, y: 42.0, z: -32.0 }, target: { x: -4.0, y: 1.0, z: -12.0 } },
        ],
      },
    ];

    // Compute total duration & prepare spline curves for each chapter
    this.totalDuration = this.chapters.reduce((sum, ch) => sum + ch.duration, 0);
    this.initCurves();

    // DOM UI elements (lazily bound)
    this.ui = null;
  }

  initCurves() {
    this.chapterCurves = this.chapters.map(ch => {
      const posPoints = ch.path.map(p => new THREE.Vector3(p.pos.x, p.pos.y, p.pos.z));
      const targetPoints = ch.path.map(p => new THREE.Vector3(p.target.x, p.target.y, p.target.z));

      return {
        posCurve: new THREE.CatmullRomCurve3(posPoints, false, 'catmullrom', 0.5),
        targetCurve: new THREE.CatmullRomCurve3(targetPoints, false, 'catmullrom', 0.5),
      };
    });
  }

  bindUI(elements) {
    this.ui = elements;

    if (this.ui.btnPlayPause) {
      this.ui.btnPlayPause.addEventListener('click', () => this.togglePlayPause());
    }
    if (this.ui.btnNext) {
      this.ui.btnNext.addEventListener('click', () => this.nextChapter());
    }
    if (this.ui.btnPrev) {
      this.ui.btnPrev.addEventListener('click', () => this.prevChapter());
    }
    if (this.ui.btnExit) {
      this.ui.btnExit.addEventListener('click', () => this.stop());
    }
    if (this.ui.btnSpeed) {
      this.ui.btnSpeed.addEventListener('click', () => this.cycleSpeed());
    }

    // Keyboard shortcuts
    window.addEventListener('keydown', e => {
      if (!this.isActive) return;
      if (e.key === 'Escape') {
        this.stop();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        this.togglePlayPause();
      } else if (e.key === 'ArrowRight') {
        this.nextChapter();
      } else if (e.key === 'ArrowLeft') {
        this.prevChapter();
      }
    });
  }

  start(startChapterIndex = 0) {
    this.isActive = true;
    this.isPaused = false;
    this.currentChapterIndex = startChapterIndex;
    this.chapterProgress = 0;
    this.elapsedTime = 0;

    // Disable OrbitControls during cinematic tour
    if (this.controls) {
      this.controls.enabled = false;
    }

    // Show cinematic letterbox & UI
    document.body.classList.add('cinematic-active');
    if (this.ui && this.ui.overlay) {
      this.ui.overlay.classList.add('visible');
    }

    this.updateChapterUI();
  }

  stop() {
    if (!this.isActive) return;
    this.isActive = false;
    this.isPaused = false;

    // Re-enable OrbitControls and sync target
    if (this.controls) {
      this.controls.enabled = true;
      this.controls.update();
    }

    // Hide cinematic UI
    document.body.classList.remove('cinematic-active');
    if (this.ui && this.ui.overlay) {
      this.ui.overlay.classList.remove('visible');
    }

    // Update preset button active state in main UI if available
    const activePreset = document.querySelector('.preset-btn.active');
    if (!activePreset) {
      const overviewBtn = document.querySelector('[data-preset="overview"]');
      if (overviewBtn) overviewBtn.classList.add('active');
    }
  }

  toggle() {
    if (this.isActive) {
      this.stop();
    } else {
      this.start();
    }
  }

  togglePlayPause() {
    this.isPaused = !this.isPaused;
    if (this.ui && this.ui.btnPlayPause) {
      this.ui.btnPlayPause.textContent = this.isPaused ? '▶' : '⏸';
      this.ui.btnPlayPause.title = this.isPaused ? 'Lanjutkan' : 'Jeda';
    }
  }

  nextChapter() {
    this.currentChapterIndex = (this.currentChapterIndex + 1) % this.chapters.length;
    this.chapterProgress = 0;
    this.updateChapterUI();
  }

  prevChapter() {
    this.currentChapterIndex = (this.currentChapterIndex - 1 + this.chapters.length) % this.chapters.length;
    this.chapterProgress = 0;
    this.updateChapterUI();
  }

  cycleSpeed() {
    const speeds = [1.0, 1.5, 2.0];
    const curIdx = speeds.indexOf(this.playbackSpeed);
    this.playbackSpeed = speeds[(curIdx + 1) % speeds.length];
    if (this.ui && this.ui.btnSpeed) {
      this.ui.btnSpeed.textContent = `${this.playbackSpeed}x`;
    }
  }

  update(delta) {
    if (!this.isActive || this.isPaused) return;

    // Apply speed multiplier
    const effectiveDelta = delta * this.playbackSpeed;
    this.elapsedTime += effectiveDelta;

    const chapter = this.chapters[this.currentChapterIndex];
    const curveSet = this.chapterCurves[this.currentChapterIndex];

    this.chapterProgress += effectiveDelta / chapter.duration;

    // Advance to next chapter when current one finishes
    if (this.chapterProgress >= 1.0) {
      this.chapterProgress = 0;
      this.currentChapterIndex = (this.currentChapterIndex + 1) % this.chapters.length;
      this.updateChapterUI();
    }

    // Smooth cubic easing across the chapter
    const t = this.smoothStep(this.chapterProgress);

    // Sample camera position and target from spline curves
    const camPos = curveSet.posCurve.getPoint(t);
    const targetPos = curveSet.targetCurve.getPoint(t);

    this.camera.position.copy(camPos);
    this.camera.lookAt(targetPos);

    if (this.controls) {
      this.controls.target.copy(targetPos);
    }

    // Update progress bar and timer
    this.updateProgressUI();
  }

  smoothStep(t) {
    // Hermite smoothstep for natural cinematic velocity
    return t * t * (3 - 2 * t);
  }

  updateChapterUI() {
    if (!this.ui) return;

    const ch = this.chapters[this.currentChapterIndex];
    const chNum = (this.currentChapterIndex + 1).toString().padStart(2, '0');
    const totalNum = this.chapters.length.toString().padStart(2, '0');

    if (this.ui.chapterNum) {
      this.ui.chapterNum.textContent = `SCENE ${chNum} / ${totalNum}`;
    }
    if (this.ui.chapterTitle) {
      this.ui.chapterTitle.textContent = ch.title;
    }
    if (this.ui.chapterSubtitle) {
      this.ui.chapterSubtitle.textContent = ch.subtitle;
    }
  }

  updateProgressUI() {
    if (!this.ui) return;

    // Calculate overall tour progress (0% - 100%)
    let accumulatedTime = 0;
    for (let i = 0; i < this.currentChapterIndex; i++) {
      accumulatedTime += this.chapters[i].duration;
    }
    accumulatedTime += this.chapterProgress * this.chapters[this.currentChapterIndex].duration;
    const overallProgress = Math.min(1.0, accumulatedTime / this.totalDuration);

    if (this.ui.progressFill) {
      this.ui.progressFill.style.width = `${(overallProgress * 100).toFixed(1)}%`;
    }

    if (this.ui.timer) {
      const mins = Math.floor(this.elapsedTime / 60).toString().padStart(2, '0');
      const secs = Math.floor(this.elapsedTime % 60).toString().padStart(2, '0');
      this.ui.timer.textContent = `${mins}:${secs}`;
    }
  }
}
