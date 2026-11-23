/**
 * frameEngine.ts
 * Core frame-sequence playback engine.
 * - Sliding window of decoded ImageBitmaps
 * - Progressive loading by proximity
 * - Cover-draw with crop and focal point
 */

import { CROP_BOTTOM, FRAME_WINDOW, MAX_CONCURRENT_FETCHES, DPR_CAP, DPR_CAP_MOBILE, MOBILE_BREAKPOINT } from '../config';

export interface FrameManifest {
  seq1: SeqInfo;
  seq2: SeqInfo;
}

export interface SeqInfo {
  count: number;
  width: number;
  height: number;
  folder: string;
  folderSm: string;
  topColors: string[];    // hex per frame
  bottomColors: string[]; // hex per frame
}

type FrameState = 'pending' | 'loading' | 'ready' | 'error';

interface FrameEntry {
  state: FrameState;
  bitmap: ImageBitmap | null;
}

export class FrameEngine {
  private frames: FrameEntry[];
  private count: number;
  private folder: string;
  private folderSm: string;
  private useSm: boolean;
  private concurrentSlots = 0;
  private pendingQueue: number[] = [];
  private onProgress: ((loaded: number, total: number) => void) | null = null;
  private loadedCount = 0;

  constructor(seq: SeqInfo, onProgress?: (loaded: number, total: number) => void) {
    this.count = seq.count;
    this.folder = seq.folder;
    this.folderSm = seq.folderSm;
    this.useSm = window.innerWidth < MOBILE_BREAKPOINT ||
                 (('deviceMemory' in navigator) && (navigator as Navigator & {deviceMemory?: number}).deviceMemory! <= 4);
    this.frames = Array.from({ length: seq.count }, () => ({ state: 'pending' as FrameState, bitmap: null }));
    this.onProgress = onProgress || null;
  }

  private framePath(idx: number): string {
    const num = String(idx + 1).padStart(4, '0');
    const base = this.useSm ? this.folderSm : this.folder;
    return `${base}/${num}.webp`;
  }

  private async fetchFrame(idx: number): Promise<void> {
    if (this.frames[idx].state !== 'pending') return;
    this.frames[idx].state = 'loading';
    this.concurrentSlots++;
    try {
      const res = await fetch(this.framePath(idx));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const bitmap = await createImageBitmap(blob);
      this.frames[idx].bitmap = bitmap;
      this.frames[idx].state = 'ready';
      this.loadedCount++;
      this.onProgress?.(this.loadedCount, this.count);
    } catch {
      this.frames[idx].state = 'error';
    } finally {
      this.concurrentSlots--;
      this.drainQueue();
    }
  }

  private drainQueue() {
    while (this.concurrentSlots < MAX_CONCURRENT_FETCHES && this.pendingQueue.length > 0) {
      const next = this.pendingQueue.shift()!;
      if (this.frames[next]?.state === 'pending') {
        this.fetchFrame(next);
      }
    }
  }

  /** Request loading of frames around a center index, biased by direction */
  requestWindow(center: number, direction: number = 0) {
    const windowSize = FRAME_WINDOW;
    // Build ordered list by proximity, biased in scroll direction
    const indices: number[] = [];
    for (let d = 0; d <= windowSize; d++) {
      const fwd = center + d * (direction >= 0 ? 1 : -1);
      const bwd = center - d * (direction >= 0 ? 1 : -1);
      if (fwd >= 0 && fwd < this.count && !indices.includes(fwd)) indices.push(fwd);
      if (bwd >= 0 && bwd < this.count && !indices.includes(bwd)) indices.push(bwd);
    }

    // Evict bitmaps outside window
    const windowSet = new Set(indices);
    for (let i = 0; i < this.count; i++) {
      if (!windowSet.has(i) && this.frames[i].bitmap) {
        this.frames[i].bitmap!.close();
        this.frames[i].bitmap = null;
        this.frames[i].state = 'pending';
      }
    }

    // Queue missing frames
    this.pendingQueue = [];
    for (const idx of indices) {
      if (this.frames[idx].state === 'pending') {
        this.pendingQueue.push(idx);
      }
    }
    this.drainQueue();
  }

  /** Get the nearest ready bitmap to index */
  getNearestBitmap(idx: number): { bitmap: ImageBitmap; index: number } | null {
    if (this.frames[idx]?.state === 'ready' && this.frames[idx].bitmap) {
      return { bitmap: this.frames[idx].bitmap!, index: idx };
    }
    for (let d = 1; d < this.count; d++) {
      const a = idx - d, b = idx + d;
      if (a >= 0 && this.frames[a]?.state === 'ready' && this.frames[a].bitmap)
        return { bitmap: this.frames[a].bitmap!, index: a };
      if (b < this.count && this.frames[b]?.state === 'ready' && this.frames[b].bitmap)
        return { bitmap: this.frames[b].bitmap!, index: b };
    }
    return null;
  }

  getLoadedCount() { return this.loadedCount; }
  getTotalCount() { return this.count; }

  destroy() {
    for (const f of this.frames) {
      if (f.bitmap) { f.bitmap.close(); f.bitmap = null; }
    }
    this.pendingQueue = [];
  }
}

/** Draw a frame with cover-fit, focal point and bottom crop */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  bitmap: ImageBitmap,
  canvasW: number,
  canvasH: number,
  focalX = 0.5,
  focalY = 0.5,
  cropBottom = CROP_BOTTOM,
  portraitFit = false,
  topColor?: string,
  bottomColor?: string,
) {
  const srcW = bitmap.width;
  const srcH = bitmap.height;
  const srcCropH = Math.round(srcH * (1 - cropBottom));

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (portraitFit && topColor && bottomColor) {
    // Fit by width, fill top/bottom with gradient from edge colors
    const scale = canvasW / srcW;
    const drawH = srcCropH * scale;
    const y = (canvasH - drawH) / 2;

    if (y > 0) {
      // Top fill
      const topGrad = ctx.createLinearGradient(0, 0, 0, y + 20);
      topGrad.addColorStop(0, topColor);
      topGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, canvasW, y + 20);

      // Bottom fill
      const botGrad = ctx.createLinearGradient(0, canvasH, 0, canvasH - y - 20);
      botGrad.addColorStop(0, bottomColor);
      botGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = botGrad;
      ctx.fillRect(0, canvasH - y - 20, canvasW, y + 20);
    }

    ctx.drawImage(bitmap, 0, 0, srcW, srcCropH, 0, y, canvasW, drawH);
    return;
  }

  // Cover fit with focal point
  const scale = Math.max(canvasW / srcW, canvasH / srcCropH);
  const drawW = srcW * scale;
  const drawH = srcCropH * scale;

  const extraX = drawW - canvasW;
  const extraY = drawH - canvasH;

  const x = -extraX * focalX;
  const y = -extraY * focalY;

  ctx.drawImage(bitmap, 0, 0, srcW, srcCropH, x, y, drawW, drawH);
}

export function getDPR(): number {
  const mobile = window.innerWidth < MOBILE_BREAKPOINT;
  const cap = mobile ? DPR_CAP_MOBILE : DPR_CAP;
  return Math.min(window.devicePixelRatio || 1, cap);
}
