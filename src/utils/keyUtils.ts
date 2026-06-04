/**
 * EmpresaIQ License Key System
 *
 * Key format: EIQ-XXXXXX-YYYYYY
 *   XXXXXX — 6-char random base-36 uppercase
 *   YYYYYY — 6-char checksum (MurmurHash2 variant of XXXXXX + SECRET)
 *
 * Validation is purely algorithmic — no database required.
 * Admin generates keys via the /admin page and distributes them manually.
 */

const MASTER_SECRET = 'EIQ_MST_2026_k7p3';
export const ADMIN_KEY = 'ADMIN-EIQ-2026';

// ── Hash function ─────────────────────────────────────────────────────────────

function murmur32(str: string): number {
  let h = 0x9747b28c;
  for (let i = 0; i < str.length; i++) {
    let k = str.charCodeAt(i);
    k = Math.imul(k, 0xcc9e2d51);
    k = (k << 15) | (k >>> 17);
    k = Math.imul(k, 0x1b873593);
    h ^= k;
    h = (h << 13) | (h >>> 19);
    h = (Math.imul(h, 5) + 0xe6546b64) | 0;
  }
  h ^= str.length;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0; // unsigned 32-bit
}

function checksum(random: string): string {
  const n = murmur32(random + MASTER_SECRET);
  return n.toString(36).toUpperCase().padStart(6, '0').slice(0, 6);
}

// ── Key Generation & Validation ───────────────────────────────────────────────

export function generateKey(): string {
  const bytes = new Uint32Array(1);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(bytes);
  } else {
    bytes[0] = Math.floor(Math.random() * 0xffffffff);
  }
  const random = bytes[0].toString(36).toUpperCase().padStart(6, '0').slice(0, 6);
  return `EIQ-${random}-${checksum(random)}`;
}

/** Returns true for valid EIQ keys and the legacy EMPRESAIQ2026 code */
export function validateKey(key: string): boolean {
  if (!key) return false;
  const k = key.trim().toUpperCase();
  // Legacy access code (backwards-compatible)
  if (k === 'EMPRESAIQ2026') return true;
  const m = k.match(/^EIQ-([A-Z0-9]{6})-([A-Z0-9]{6})$/);
  if (!m) return false;
  return checksum(m[1]) === m[2];
}

export function validateAdminKey(key: string): boolean {
  return key.trim() === ADMIN_KEY;
}

// ── localStorage Keys ─────────────────────────────────────────────────────────

export const LS_USER_KEY = 'empresaiq_user_key';
export const LS_USER_NAME = 'empresaiq_user_name';
export const LS_ADMIN_KEYS = 'empresaiq_admin_generated_keys';
export const LS_CURSO_PROGRESS = 'empresaiq_curso_progress';

// ── Auth Helpers ──────────────────────────────────────────────────────────────

export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return validateKey(localStorage.getItem(LS_USER_KEY) || '');
}

export function getUserKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(LS_USER_KEY) || '';
}

export function getUserName(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(LS_USER_NAME) || '';
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LS_USER_KEY);
  localStorage.removeItem(LS_USER_NAME);
}

// ── Admin Key Store ───────────────────────────────────────────────────────────

export interface GeneratedKeyRecord {
  key: string;
  label: string;
  createdAt: string; // ISO string
  revoked: boolean;
}

export function getAdminKeys(): GeneratedKeyRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(LS_ADMIN_KEYS) || '[]');
  } catch {
    return [];
  }
}

export function saveAdminKey(record: GeneratedKeyRecord): void {
  const keys = getAdminKeys();
  keys.unshift(record); // newest first
  localStorage.setItem(LS_ADMIN_KEYS, JSON.stringify(keys));
}

export function revokeAdminKey(key: string): void {
  const keys = getAdminKeys().map(r => r.key === key ? { ...r, revoked: true } : r);
  localStorage.setItem(LS_ADMIN_KEYS, JSON.stringify(keys));
}

export function deleteAdminKey(key: string): void {
  const keys = getAdminKeys().filter(r => r.key !== key);
  localStorage.setItem(LS_ADMIN_KEYS, JSON.stringify(keys));
}

// ── Course Progress ───────────────────────────────────────────────────────────

export function getCourseProgress(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(LS_CURSO_PROGRESS) || '[]');
  } catch {
    return [];
  }
}

export function markLessonComplete(slug: string): void {
  const progress = getCourseProgress();
  if (!progress.includes(slug)) {
    progress.push(slug);
    localStorage.setItem(LS_CURSO_PROGRESS, JSON.stringify(progress));
  }
}

export function isLessonComplete(slug: string): boolean {
  return getCourseProgress().includes(slug);
}
