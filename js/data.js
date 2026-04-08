/* ═══════════════════════════════════════
   data.js — Portfolio Data Layer
   All read/write operations go through
   this module. Portfolio & Admin both
   import from here.
═══════════════════════════════════════ */

const DB_KEY   = 'pf_data';
const AUTH_KEY = 'pf_auth';
const PASS_KEY = 'pf_pass';

/* ── Default password stored as base64 ── */
const DEFAULT_PASS_ENCODED = btoa('admin123');

/* ─────────────────────────────────────────
   Simple encoding — works on file:// too
   (crypto.subtle requires HTTPS/localhost)
───────────────────────────────────────── */
function encodePassword(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

/* ─────────────────────────────────────────
   LOAD — returns full data object
───────────────────────────────────────── */
function loadData() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return null;
}

/* ─────────────────────────────────────────
   SAVE — writes full data object
───────────────────────────────────────── */
function saveData(data) {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
}

/* ─────────────────────────────────────────
   INIT — loads default-data.json if no
   data exists in localStorage yet
───────────────────────────────────────── */
async function initData() {
  if (loadData()) return loadData();
  try {
    const res  = await fetch('./assets/default-data.json');
    const def  = await res.json();
    saveData(def);
    return def;
  } catch(e) {
    console.warn('Could not load default-data.json', e);
    return {};
  }
}

/* ─────────────────────────────────────────
   SECTION GETTERS
───────────────────────────────────────── */
function getProfile()      { return (loadData() || {}).profile      || {}; }
function getSkills()       { return (loadData() || {}).skills       || []; }
function getProjects()     { return (loadData() || {}).projects     || []; }
function getExperience()   { return (loadData() || {}).experience   || []; }
function getEducation()    { return (loadData() || {}).education    || []; }
function getTestimonials() { return (loadData() || {}).testimonials || []; }
function getTheme()        { return (loadData() || {}).theme        || defaultTheme(); }

function defaultTheme() {
  return {
    primaryColor: '#7C5CFC',
    accentColor:  '#00D4AA',
    bgColor:      '#0A0A14',
    fontFamily:   'Inter',
    defaultMode:  'dark',
    animationStyle:'smooth',
    heroLayout:   'split'
  };
}

/* ─────────────────────────────────────────
   SECTION SAVERS
───────────────────────────────────────── */
function saveSection(key, value) {
  const data = loadData() || {};
  data[key] = value;
  saveData(data);
}

function saveProfile(p)      { saveSection('profile', p); }
function saveSkills(s)       { saveSection('skills', s); }
function saveProjects(p)     { saveSection('projects', p); }
function saveExperience(e)   { saveSection('experience', e); }
function saveEducation(e)    { saveSection('education', e); }
function saveTestimonials(t) { saveSection('testimonials', t); }
function saveTheme(t)        { saveSection('theme', t); }

/* ─────────────────────────────────────────
   ID GENERATOR
───────────────────────────────────────── */
function genId(prefix = 'id') {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);
}

/* ─────────────────────────────────────────
   EXPORT — download data.json
───────────────────────────────────────── */
function exportData() {
  const data = loadData() || {};
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'portfolio-data.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ─────────────────────────────────────────
   IMPORT — load from JSON file
───────────────────────────────────────── */
function importData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        saveData(parsed);
        resolve(parsed);
      } catch(err) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('File read error'));
    reader.readAsText(file);
  });
}

/* ─────────────────────────────────────────
   RESET — restore defaults
───────────────────────────────────────── */
async function resetData() {
  localStorage.removeItem(DB_KEY);
  return await initData();
}

/* ─────────────────────────────────────────
   AUTH — fully synchronous, file:// safe
───────────────────────────────────────── */
function initAuth() {
  const stored = localStorage.getItem(PASS_KEY);
  // If nothing stored, or if it looks like a SHA-256 hex hash (64 chars)
  // from the old broken version — reset to the base64 default
  if (!stored || stored.length === 64) {
    localStorage.setItem(PASS_KEY, DEFAULT_PASS_ENCODED);
  }
}

function verifyPassword(input) {
  return encodePassword(input) === localStorage.getItem(PASS_KEY);
}

function changePassword(newPass) {
  localStorage.setItem(PASS_KEY, encodePassword(newPass));
}

function setSession()    { sessionStorage.setItem(AUTH_KEY, '1'); }
function clearSession()  { sessionStorage.removeItem(AUTH_KEY); }
function isLoggedIn()    { return sessionStorage.getItem(AUTH_KEY) === '1'; }

/* ─────────────────────────────────────────
   THEME APPLIER — call on any page to
   inject CSS variables from saved theme
───────────────────────────────────────── */
function applyTheme(theme) {
  const t = theme || getTheme();
  const root = document.documentElement;
  root.style.setProperty('--primary',    t.primaryColor || '#7C5CFC');
  root.style.setProperty('--accent',     t.accentColor  || '#00D4AA');
  root.style.setProperty('--bg',         t.bgColor      || '#0A0A14');

  // Font family
  const fontMap = {
    'Inter':        "'Inter', sans-serif",
    'Poppins':      "'Poppins', sans-serif",
    'Space Grotesk':"'Space Grotesk', sans-serif",
    'Fira Code':    "'Fira Code', monospace",
    'Raleway':      "'Raleway', sans-serif"
  };
  root.style.setProperty('--font', fontMap[t.fontFamily] || fontMap['Inter']);

  // Dark/Light mode
  const mode = localStorage.getItem('pf_mode') || t.defaultMode || 'dark';
  document.body.dataset.mode = mode;

  // Load font from Google Fonts dynamically
  loadGoogleFont(t.fontFamily || 'Inter');
}

function loadGoogleFont(name) {
  const id = 'gf-' + name.replace(/\s/g, '-');
  if (document.getElementById(id)) return;
  const fontUrls = {
    'Inter':         'Inter:wght@300;400;500;600;700;800',
    'Poppins':       'Poppins:wght@300;400;500;600;700;800',
    'Space Grotesk': 'Space+Grotesk:wght@300;400;500;600;700',
    'Fira Code':     'Fira+Code:wght@300;400;500;600;700',
    'Raleway':       'Raleway:wght@300;400;500;600;700;800'
  };
  const url = fontUrls[name];
  if (!url) return;
  const link = document.createElement('link');
  link.id   = id;
  link.rel  = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${url}&display=swap`;
  document.head.appendChild(link);
}

function toggleMode() {
  const current = document.body.dataset.mode || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.body.dataset.mode = next;
  localStorage.setItem('pf_mode', next);
  return next;
}
