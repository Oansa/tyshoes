// ─────────────────────────────────────────────
// Config — tune these without touching components
// ─────────────────────────────────────────────

/** Remove watermark: crops bottom fraction of each frame at draw time */
export const CROP_BOTTOM = 0.08;

/** Hero sequence scroll height in vh */
export const HERO_SCROLL_VH = 600;

/** Collection sequence scroll height in vh */
export const COLLECTION_SCROLL_VH = 600;

/** Frame smoothing lerp factor (0 = instant, 1 = never moves) */
export const FRAME_LERP = 0.12;

/** Sliding window radius around current frame (kept decoded) */
export const FRAME_WINDOW = 40;

/** Max concurrent frame fetch requests */
export const MAX_CONCURRENT_FETCHES = 6;

/** DevicePixelRatio cap (desktop) */
export const DPR_CAP = 2;

/** DevicePixelRatio cap (mobile) */
export const DPR_CAP_MOBILE = 1.5;

/** Mobile viewport breakpoint in px */
export const MOBILE_BREAKPOINT = 768;

/** % of hero frames that must load before dismissing the loader */
export const LOADER_THRESHOLD = 0.25;

/** Start preloading sequence 2 when hero progress exceeds this */
export const SEQ2_PRELOAD_TRIGGER = 0.75;

/** Canvas focal point (0–1 in both axes) */
export const FOCAL_X = 0.5;
export const FOCAL_Y = 0.5;

/** Show or hide the floating nav */
export const SHOW_NAV = true;
