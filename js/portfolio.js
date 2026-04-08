/* ═══════════════════════════════════════
   portfolio.js — Dynamic Renderer
   Reads all data from localStorage via
   data.js and renders every section.
═══════════════════════════════════════ */

'use strict';

/* ── Typewriter ── */
let twIndex = 0, twChar = 0, twDeleting = false;
let twRoles = [];

function typewriterTick() {
  if (!twRoles.length) return;
  const el = document.getElementById('typewriter');
  if (!el) return;
  const word = twRoles[twIndex % twRoles.length];
  if (!twDeleting) {
    el.textContent = word.slice(0, ++twChar);
    if (twChar === word.length) { twDeleting = true; setTimeout(typewriterTick, 1600); return; }
    setTimeout(typewriterTick, 85);
  } else {
    el.textContent = word.slice(0, --twChar);
    if (twChar === 0) { twDeleting = false; twIndex++; setTimeout(typewriterTick, 400); return; }
    setTimeout(typewriterTick, 45);
  }
}

/* ── Social icon map ── */
const SOCIAL_ICONS = {
  github:    { icon: '🐙', label: 'GitHub' },
  linkedin:  { icon: '💼', label: 'LinkedIn' },
  twitter:   { icon: '𝕏',  label: 'Twitter' },
  instagram: { icon: '📸', label: 'Instagram' },
  youtube:   { icon: '▶',  label: 'YouTube' },
  dribbble:  { icon: '🎨', label: 'Dribbble' },
};

/* ══════════════════════════════
   RENDER HERO
══════════════════════════════ */
function renderHero(p) {
  // Name
  const nameEl = document.getElementById('heroName');
  if (nameEl) nameEl.textContent = p.name || 'Your Name';

  // Nav logo initials
  const navLogo = document.getElementById('navLogo');
  if (navLogo) navLogo.textContent = (p.name || 'Dev').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();

  // Footer name
  const footerName = document.getElementById('footerName');
  if (footerName) footerName.textContent = p.name || 'Portfolio';

  // Typewriter roles
  twRoles = p.roles && p.roles.length ? p.roles : ['Developer'];
  typewriterTick();

  // Bio
  const bioEl = document.getElementById('heroBio');
  if (bioEl) bioEl.textContent = p.bio || '';

  // Avatar
  setAvatar('heroAvatar', 'avatarInitials', 'avatarImg', p);
  setAvatar('aboutPhoto',  'aboutInitials',  'aboutImg',  p);

  // CV Button — always generates a fresh Word .doc from portfolio data
  ['cvBtn','aboutCvBtn'].forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.href = '#';
    btn.removeAttribute('download');
    btn.title = 'Download CV as Word Document';
    btn.addEventListener('click', e => {
      e.preventDefault();
      generateCvDoc();
    });
  });

  // Socials
  renderSocials('heroSocials', p.social);
  renderSocials('contactSocials', p.social);

  // Stats
  const statsEl = document.getElementById('heroStats');
  if (statsEl && p.stats) {
    statsEl.innerHTML = Object.entries(p.stats).map(([k,v]) => `
      <div class="stat-box reveal">
        <strong>${v}</strong>
        <span>${k.charAt(0).toUpperCase()+k.slice(1)}</span>
      </div>`).join('');
  }

  // About title + bio
  const aTitle = document.getElementById('aboutTitle');
  const aBio   = document.getElementById('aboutBio');
  if (aTitle) aTitle.textContent = p.title || '';
  if (aBio)   aBio.textContent   = p.bio || '';

  // Interests
  const interests = document.getElementById('aboutInterests');
  if (interests && p.interests && p.interests.length) {
    interests.innerHTML = p.interests.map(i => `<span class="interest-tag">${i}</span>`).join('');
  }

  // Contact items
  renderContactItems(p);

  // Page title
  document.title = (p.name || 'Portfolio') + ' — ' + (p.title || 'Developer');

  // Footer year
  const yr = document.getElementById('footerYear');
  if (yr) yr.textContent = new Date().getFullYear();
}

function setAvatar(wrapId, initialsId, imgId, p) {
  const wrap     = document.getElementById(wrapId);
  const initials = document.getElementById(initialsId);
  const img      = document.getElementById(imgId);
  if (!wrap) return;
  const text = (p.name || 'YN').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  if (initials) initials.textContent = text;
  if (img && p.photo) {
    img.src = p.photo;
    img.style.display = 'block';
    if (initials) initials.style.display = 'none';
  }
}

function renderSocials(containerId, social) {
  const el = document.getElementById(containerId);
  if (!el || !social) return;
  el.innerHTML = Object.entries(social)
    .filter(([,url]) => url)
    .map(([key, url]) => {
      const s = SOCIAL_ICONS[key] || { icon: '🔗', label: key };
      return `<a href="${url}" target="_blank" rel="noopener" class="social-icon" title="${s.label}">${s.icon}</a>`;
    }).join('');
}

function renderContactItems(p) {
  const el = document.getElementById('contactItems');
  if (!el) return;
  const items = [
    { icon:'📧', label:'Email',    value: p.email,    href:`mailto:${p.email}` },
    { icon:'📱', label:'Phone',    value: p.phone,    href:`tel:${p.phone}` },
    { icon:'📍', label:'Location', value: p.location, href:'#' },
  ].filter(i => i.value);
  el.innerHTML = items.map(i => `
    <a href="${i.href}" class="contact-item">
      <div class="contact-item-icon">${i.icon}</div>
      <div>
        <div class="contact-item-label">${i.label}</div>
        <div class="contact-item-value">${i.value}</div>
      </div>
    </a>`).join('');
}

/* ══════════════════════════════
   RENDER SKILLS
══════════════════════════════ */
function renderSkills(skills) {
  const el = document.getElementById('skillsWrapper');
  if (!el) return;
  const groups = {};
  skills.forEach(s => { (groups[s.category] = groups[s.category] || []).push(s); });

  const icons = { Frontend:'🎨', Backend:'⚙️', Tools:'🛠', Mobile:'📱', Database:'🗄', Other:'💡' };
  el.innerHTML = Object.entries(groups).map(([cat, items]) => `
    <div class="skill-group reveal">
      <div class="skill-group-title">${icons[cat]||'💡'} ${cat}</div>
      ${items.map(s => `
        <div class="skill-item">
          <div class="skill-meta">
            <span>${s.name}</span>
            <span class="skill-pct">${s.level}%</span>
          </div>
          <div class="skill-bar">
            <div class="skill-fill" data-level="${s.level}"></div>
          </div>
        </div>`).join('')}
    </div>`).join('');
}

function animateSkillBars() {
  document.querySelectorAll('.skill-fill').forEach(bar => {
    bar.style.width = bar.dataset.level + '%';
  });
}

/* ══════════════════════════════
   RENDER PROJECTS
══════════════════════════════ */
function renderProjects(projects, filter = 'all') {
  const el = document.getElementById('projectsGrid');
  if (!el) return;
  const filtered = filter === 'all' ? projects : projects.filter(p => p.category === filter);
  if (!filtered.length) {
    el.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text3)">
      <div style="font-size:3rem;margin-bottom:12px">🗂</div>
      <p>No projects in this category yet.</p></div>`;
    return;
  }
  el.innerHTML = filtered.map(p => `
    <div class="project-card reveal">
      <div class="project-thumb">
        ${p.image
          ? `<img src="${p.image}" alt="${p.title}" loading="lazy"/>`
          : `<div class="project-thumb-placeholder">💻</div>`}
        ${p.featured ? `<span class="project-featured-badge">⭐ Featured</span>` : ''}
      </div>
      <div class="project-body">
        <h4 class="project-title">${p.title}</h4>
        <p class="project-desc">${p.description}</p>
        <div class="project-tags">${(p.tags||[]).map(t=>`<span class="project-tag">${t}</span>`).join('')}</div>
        <div class="project-links">
          ${p.github ? `<a href="${p.github}" target="_blank" class="project-link">🐙 GitHub</a>` : ''}
          ${p.live   ? `<a href="${p.live}"   target="_blank" class="project-link">🚀 Live Demo</a>` : ''}
          ${!p.github && !p.live ? `<span class="project-link" style="opacity:0.4">No links yet</span>` : ''}
        </div>
      </div>
    </div>`).join('');
  attachRevealObserver();
}

/* ══════════════════════════════
   RENDER EXPERIENCE
══════════════════════════════ */
function renderExperience(experience) {
  const el = document.getElementById('experienceTimeline');
  if (!el) return;
  const icons = ['💼','🏢','🚀','⚡','🌟','🔧'];
  el.innerHTML = experience.map((e,i) => `
    <div class="timeline-item reveal">
      <div class="timeline-dot">${icons[i % icons.length]}</div>
      <div class="timeline-card">
        <div class="timeline-header">
          <span class="timeline-role">${e.role}</span>
          <span class="timeline-badge">${e.type || 'Full-time'}</span>
        </div>
        <div class="timeline-company">${e.company} · ${e.location || ''}</div>
        <div class="timeline-meta">📅 ${e.duration}</div>
        <ul class="timeline-bullets">
          ${(e.bullets||[]).map(b=>`<li>${b}</li>`).join('')}
        </ul>
      </div>
    </div>`).join('');
}

/* ══════════════════════════════
   RENDER EDUCATION
══════════════════════════════ */
function renderEducation(education) {
  const el = document.getElementById('educationGrid');
  if (!el) return;
  el.innerHTML = education.map(e => `
    <div class="edu-card reveal">
      <div class="edu-icon">${e.icon || '🎓'}</div>
      <div>
        <div class="edu-degree">${e.degree}</div>
        <div class="edu-institution">${e.institution}</div>
        <div class="edu-meta">📅 ${e.year}${e.grade ? ` &nbsp;·&nbsp; 🏆 ${e.grade}` : ''}</div>
      </div>
    </div>`).join('');
}

/* ══════════════════════════════
   RENDER TESTIMONIALS
══════════════════════════════ */
let testIndex = 0;
let testTimer;

function renderTestimonials(testimonials) {
  const slider = document.getElementById('testimonialsSlider');
  const dots   = document.getElementById('testimonialDots');
  if (!slider || !testimonials.length) return;

  slider.innerHTML = testimonials.map((t,i) => `
    <div class="testimonial-card ${i===0?'active':''}">
      <div class="test-quote">"</div>
      <p class="test-text">${t.quote}</p>
      <div class="test-author">
        <div class="test-avatar">
          ${t.avatar ? `<img src="${t.avatar}" alt="${t.name}"/>` : t.name[0].toUpperCase()}
        </div>
        <div>
          <div class="test-name">${t.name}</div>
          <div class="test-role">${t.role}</div>
          <div class="test-stars">${'★'.repeat(t.rating||5)}</div>
        </div>
      </div>
    </div>`).join('');

  if (dots) {
    dots.innerHTML = testimonials.map((_,i) => `
      <button class="t-dot ${i===0?'active':''}" onclick="goToTestimonial(${i})"></button>`).join('');
  }

  clearInterval(testTimer);
  testTimer = setInterval(() => goToTestimonial((testIndex+1) % testimonials.length), 5000);
}

function goToTestimonial(i) {
  const cards = document.querySelectorAll('.testimonial-card');
  const dots  = document.querySelectorAll('.t-dot');
  cards.forEach(c => c.classList.remove('active'));
  dots.forEach(d  => d.classList.remove('active'));
  if (cards[i]) cards[i].classList.add('active');
  if (dots[i])  dots[i].classList.add('active');
  testIndex = i;
}

/* ══════════════════════════════
   PROJECT FILTER TABS
══════════════════════════════ */
function initProjectTabs(projects) {
  document.querySelectorAll('.ftab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ftab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProjects(projects, btn.dataset.filter);
    });
  });
}

/* ══════════════════════════════
   GENERATE CV AS WORD .DOC
   Reads live data from localStorage,
   builds a styled HTML document, and
   saves it as .doc (Word-compatible).
══════════════════════════════ */
function generateCvDoc() {
  const data       = loadData() || {};
  const p          = data.profile    || {};
  const skills     = data.skills     || [];
  const experience = data.experience || [];
  const education  = data.education  || [];

  /* ── Combo 1 fixed palette — Navy & Gold ── */
  const NAVY   = '#1B2A4A';
  const GOLD   = '#B8962E';
  const LIGHT  = '#E8ECF4';
  const DARK   = '#2C2C2C';
  const MUTED  = '#666666';

  const name     = p.name     || 'Your Name';
  const title    = p.title    || '';
  const bio      = p.bio      || '';
  const email    = p.email    || '';
  const phone    = p.phone    || '';
  const location = p.location || '';
  const social   = p.social   || {};
  const fileName = name.replace(/\s+/g, '_') + '_CV.doc';

  /* ── helpers ── */
  const sectionTitle = label => `
    <div style="font-size:9.5pt;font-weight:700;text-transform:uppercase;
                letter-spacing:0.12em;color:${GOLD};
                border-bottom:1.5px solid ${GOLD};
                padding-bottom:5px;margin:22px 0 12px;">
      ${label}
    </div>`;

  /* ── skills: 2-column grid with progress bars ── */
  const skillGroups = {};
  skills.forEach(s => { (skillGroups[s.category] = skillGroups[s.category] || []).push(s); });

  const allSkills = skills.slice(); // flat list for 2-col grid
  const half      = Math.ceil(allSkills.length / 2);
  const leftSkills  = allSkills.slice(0, half);
  const rightSkills = allSkills.slice(half);

  const skillBarCell = list => list.map(sk => `
    <div style="margin-bottom:7px;">
      <div style="display:flex;justify-content:space-between;
                  font-size:9pt;margin-bottom:3px;color:${DARK};">
        <span>${sk.name}</span>
        <span style="color:${NAVY};font-weight:600;">${sk.level}%</span>
      </div>
      <div style="height:5px;background:${LIGHT};border-radius:3px;">
        <div style="height:5px;width:${sk.level}%;background:${NAVY};border-radius:3px;"></div>
      </div>
    </div>`).join('');

  const skillsHtml = `
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="width:50%;vertical-align:top;padding-right:18px;">
          ${skillBarCell(leftSkills)}
        </td>
        <td style="width:50%;vertical-align:top;padding-left:18px;
                   border-left:1px solid ${LIGHT};">
          ${skillBarCell(rightSkills)}
        </td>
      </tr>
    </table>`;

  /* ── experience ── */
  const expHtml = experience.map(e => `
    <div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid #F0F0F0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="vertical-align:top;">
            <div style="font-size:11pt;font-weight:700;color:${NAVY};">${e.role}</div>
            <div style="font-size:9.5pt;font-weight:600;color:${GOLD};margin:3px 0 2px;">
              ${e.company}${e.location ? ' &nbsp;·&nbsp; ' + e.location : ''}
            </div>
          </td>
          <td style="text-align:right;vertical-align:top;white-space:nowrap;">
            <span style="font-size:8.5pt;color:${NAVY};background:${LIGHT};
                         padding:2px 10px;border-radius:20px;">${e.duration || ''}</span>
            &nbsp;
            <span style="font-size:8pt;color:${GOLD};border:1px solid ${GOLD};
                         padding:2px 8px;border-radius:20px;">${e.type || 'Full-time'}</span>
          </td>
        </tr>
      </table>
      ${(e.bullets || []).length ? `
        <ul style="margin:8px 0 0 18px;padding:0;">
          ${e.bullets.map(b => `
            <li style="font-size:9.5pt;color:#555;margin-bottom:3px;line-height:1.7;">${b}</li>
          `).join('')}
        </ul>` : ''}
    </div>`).join('');

  /* ── education ── */
  const eduHtml = education.map(e => `
    <table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
      <tr>
        <td style="width:44px;vertical-align:middle;text-align:center;font-size:22pt;">
          ${e.icon || '🎓'}
        </td>
        <td style="vertical-align:middle;padding-left:12px;">
          <div style="font-size:10.5pt;font-weight:700;color:${NAVY};">${e.degree}</div>
          <div style="font-size:9.5pt;font-weight:600;color:${GOLD};margin:2px 0;">${e.institution}</div>
          <div style="font-size:8.5pt;color:${MUTED};">
            📅 ${e.year}${e.grade ? '&nbsp;&nbsp;·&nbsp;&nbsp;🏆 ' + e.grade : ''}
          </div>
        </td>
      </tr>
    </table>`).join('');

  /* ── social links ── */
  const socialItems = Object.entries(social)
    .filter(([, url]) => url)
    .map(([key, url]) =>
      `<span style="margin-right:18px;font-size:9pt;color:${MUTED};">
         <span style="font-weight:700;color:${NAVY};">${key.charAt(0).toUpperCase()+key.slice(1)}:</span>
         <a href="${url}" style="color:${GOLD};text-decoration:none;"> ${url}</a>
       </span>`
    ).join('');

  /* ══════════════════════════════════════
     FULL HTML DOCUMENT — Combo 1
  ══════════════════════════════════════ */
  const html = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8"/>
  <meta name="ProgId" content="Word.Document"/>
  <meta name="Generator" content="Microsoft Word 15"/>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page   { size: A4; margin: 1.8cm 2cm; }
    body    { font-family: Calibri, 'Segoe UI', Arial, sans-serif;
              color: ${DARK}; margin: 0; padding: 0; line-height: 1.4; }
    table   { border-collapse: collapse; width: 100%; }
    ul      { margin: 0; padding: 0 0 0 18px; }
    li      { margin-bottom: 3px; }
    a       { color: ${GOLD}; text-decoration: none; }
  </style>
</head>
<body>

<!-- ══ NAVY HEADER BLOCK ══ -->
<table style="width:100%;background:${NAVY};margin-bottom:0;">
  <tr>
    <td style="padding:28px 28px 20px;vertical-align:bottom;">
      <div style="font-size:26pt;font-weight:700;color:#FFFFFF;
                  letter-spacing:-0.5px;line-height:1.1;margin-bottom:2px;">
        ${name}
      </div>
      <!-- Gold divider line -->
      <div style="width:48px;height:3px;background:${GOLD};
                  margin:8px 0;border-radius:2px;"></div>
      <div style="font-size:11pt;color:#B8C8E8;font-weight:400;
                  letter-spacing:0.03em;">${title}</div>
    </td>
    <td style="padding:28px 28px 20px;text-align:right;vertical-align:bottom;
               white-space:nowrap;">
      ${email    ? `<div style="font-size:9pt;color:#B8C8E8;margin-bottom:5px;">📧 ${email}</div>` : ''}
      ${phone    ? `<div style="font-size:9pt;color:#B8C8E8;margin-bottom:5px;">📱 ${phone}</div>` : ''}
      ${location ? `<div style="font-size:9pt;color:#B8C8E8;">📍 ${location}</div>` : ''}
    </td>
  </tr>
</table>

<!-- ══ BODY ══ -->
<div style="padding:4px 0 0;">

  ${bio ? `
  ${sectionTitle('Professional Summary')}
  <p style="font-size:10pt;color:#444;line-height:1.8;margin:0 0 4px;">
    ${bio}
  </p>` : ''}

  ${skills.length ? `
  ${sectionTitle('Technical Skills')}
  ${skillsHtml}` : ''}

  ${experience.length ? `
  ${sectionTitle('Work Experience')}
  ${expHtml}` : ''}

  ${education.length ? `
  ${sectionTitle('Education')}
  ${eduHtml}` : ''}

  ${socialItems ? `
  ${sectionTitle('Links & Profiles')}
  <div style="padding:4px 0;">${socialItems}</div>` : ''}

</div>

<!-- ══ FOOTER ══ -->
<table style="width:100%;margin-top:20px;border-top:1px solid #EBEBEB;">
  <tr>
    <td style="padding-top:10px;font-size:8pt;color:#BBBBBB;">
      ${name} — Curriculum Vitae
    </td>
    <td style="padding-top:10px;text-align:right;font-size:8pt;color:#BBBBBB;">
      Generated on ${new Date().toLocaleDateString('en-IN', {day:'numeric', month:'long', year:'numeric'})}
    </td>
  </tr>
</table>

</body>
</html>`;

  /* ── trigger download ── */
  const blob = new Blob(['\ufeff' + html], { type: 'application/msword;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('📄 ' + fileName + ' downloaded!');
}

/* ══════════════════════════════
   TOAST
══════════════════════════════ */
let _toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ══════════════════════════════
   CONTACT FORM — Smart prefill
   ① Remembers returning visitors
   ② Subject dropdown with templates
   ③ Message starter per subject
   ④ mailto: for sending (no server)
══════════════════════════════ */

/* ── Message starter templates per subject ── */
const CF_TEMPLATES = {
  'Project Inquiry': [
    `Hi, I came across your portfolio and I'm interested in discussing a project with you.`,
    ``,
    `Project Type  : (Web / Mobile / Design / Other)`,
    `Description   : `,
    `Timeline      : `,
    `Budget Range  : `,
    ``,
    `Please let me know if you're available for a quick call to discuss further.`,
  ].join('\n'),

  'Freelance Collaboration': [
    `Hi, I'd love to explore a freelance collaboration opportunity with you.`,
    ``,
    `What I Need   : `,
    `Project Scope : `,
    `Duration      : `,
    `Start Date    : `,
    ``,
    `Looking forward to hearing your thoughts. Let's create something great together!`,
  ].join('\n'),

  'Job Opportunity': [
    `Hi, I came across your portfolio and I'm impressed with your work.`,
    ``,
    `Role          : `,
    `Company       : `,
    `Location      : (On-site / Remote / Hybrid)`,
    `Employment    : (Full-time / Part-time / Contract)`,
    ``,
    `I'd love to have a conversation about this opportunity. Are you currently open to new roles?`,
  ].join('\n'),

  'Feedback on Portfolio': [
    `Hi, I just visited your portfolio and wanted to share some feedback.`,
    ``,
    `What I liked  : `,
    `Suggestions   : `,
    ``,
    `Keep up the great work — your portfolio really stood out!`,
  ].join('\n'),

  'General Question': [
    `Hi, I have a question I'd like to ask you.`,
    ``,
    `My question   : `,
    ``,
    `Thanks for taking the time to read this. Looking forward to your reply!`,
  ].join('\n'),
};

/* ── Handle subject dropdown change ── */
function handleSubjectChange(value) {
  const otherWrap = document.getElementById('cfSubjectOtherWrap');
  const msgEl     = document.getElementById('cfMessage');
  const hintEl    = document.getElementById('msgHint');

  // Show/hide custom subject input
  if (otherWrap) otherWrap.style.display = (value === 'other') ? '' : 'none';

  // Inject message template (only if message is empty or was a previous template)
  if (value && value !== 'other' && CF_TEMPLATES[value]) {
    const current = msgEl.value.trim();
    const isTemplate = Object.values(CF_TEMPLATES).some(t => t === current);
    if (!current || isTemplate) {
      msgEl.value = CF_TEMPLATES[value];
      if (hintEl) {
        hintEl.textContent = '✏️ Starter template loaded — edit as needed';
        hintEl.style.color = 'var(--primary)';
      }
    }
  } else if (!value) {
    // Reset hint when no subject chosen
    if (hintEl) hintEl.textContent = '';
    const current = msgEl.value.trim();
    const isTemplate = Object.values(CF_TEMPLATES).some(t => t === current);
    if (isTemplate) msgEl.value = '';
  }
}

/* ── Restore saved visitor data on load ── */
function initContactPrefill() {
  try {
    const saved = JSON.parse(localStorage.getItem('cf_visitor') || '{}');
    if (saved.name)  { const el = document.getElementById('cfName');  if (el) el.value = saved.name; }
    if (saved.email) { const el = document.getElementById('cfEmail'); if (el) el.value = saved.email; }

    // Show a subtle welcome-back hint if data was restored
    if (saved.name || saved.email) {
      const msg = document.getElementById('formMsg');
      if (msg) {
        showFormMsg(msg, `👋 Welcome back, ${saved.name || 'there'}! Your details have been restored.`, 'info');
        setTimeout(() => { if (msg.className.includes('info')) { msg.textContent = ''; msg.className = 'form-msg'; } }, 5000);
      }
    }
  } catch (_) {}
}

/* ── Main contact form handler ── */
function handleContactForm(e) {
  e.preventDefault();

  const btn  = document.getElementById('cfBtnText');
  const msg  = document.getElementById('formMsg');
  const data = loadData() || {};
  const p    = data.profile || {};

  // ── Collect form values ──
  const senderName  = document.getElementById('cfName').value.trim();
  const senderEmail = document.getElementById('cfEmail').value.trim();
  const remember    = document.getElementById('cfRemember')?.checked ?? true;

  // Resolve subject: dropdown value or custom "Other" input
  const subjectSel  = document.getElementById('cfSubject').value;
  const subjectOther = document.getElementById('cfSubjectOther')?.value.trim() || '';
  const subject = subjectSel === 'other'
    ? (subjectOther || 'New Message from Portfolio')
    : (subjectSel   || 'New Project Inquiry from Portfolio');

  const message = document.getElementById('cfMessage').value.trim();

  // ── Validate required fields ──
  if (!senderName) {
    showFormMsg(msg, '⚠️ Please enter your name.', 'error');
    document.getElementById('cfName').focus();
    return;
  }
  if (!senderEmail || !senderEmail.includes('@')) {
    showFormMsg(msg, '⚠️ Please enter a valid email address.', 'error');
    document.getElementById('cfEmail').focus();
    return;
  }
  if (!message) {
    showFormMsg(msg, '⚠️ Please write a message before sending.', 'error');
    document.getElementById('cfMessage').focus();
    return;
  }

  // ── Save visitor details if "Remember me" is checked ──
  if (remember) {
    try { localStorage.setItem('cf_visitor', JSON.stringify({ name: senderName, email: senderEmail })); } catch (_) {}
  } else {
    try { localStorage.removeItem('cf_visitor'); } catch (_) {}
  }

  // ── Build well-formatted email body ──
  // Use \r\n (CRLF) — required by Outlook and most Windows email clients.
  // Use plain ASCII separators (---) instead of Unicode (━━━) to keep the
  // encoded URL short — Unicode box chars inflate to 9 chars each when encoded.
  const ownerName  = p.name  || 'there';
  const ownerEmail = p.email || '';
  const today      = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const SEP = '----------------------------------------';
  const lines = [
    `Hi ${ownerName},`,
    ``,
    `You have a new message from your portfolio website.`,
    ``,
    SEP,
    `  SENDER DETAILS`,
    SEP,
    `  Name    : ${senderName}`,
    `  Email   : ${senderEmail}`,
    `  Subject : ${subject}`,
    `  Date    : ${today}`,
    SEP,
    `  MESSAGE`,
    SEP,
    ``,
    message,
    ``,
    SEP,
    ``,
    `To reply, write directly to: ${senderEmail}`,
    ``,
    `-- Sent via your Portfolio Contact Form`,
  ];
  const emailBody = lines.join('\r\n');

  // ── Build mailto URL ──
  const mailtoUrl = `mailto:${ownerEmail}?subject=${encodeURIComponent(`[Portfolio] ${subject}`)}&body=${encodeURIComponent(emailBody)}`;

  // ── Loading state ──
  if (btn) btn.textContent = 'Opening email app… ✈️';

  // ── Trigger mailto via hidden <a> click ──
  // More reliable than window.location.href — avoids page navigation
  // which causes some email clients (Outlook) to drop the body parameter.
  const link = document.createElement('a');
  link.href = mailtoUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // ── Post-click feedback ──
  setTimeout(() => {
    if (btn) btn.textContent = 'Send Message 🚀';

    showFormMsg(
      msg,
      `✅ Your email app should have opened with the message ready. Just hit Send there — or email directly at ${ownerEmail || 'the address above'}.`,
      'success'
    );

    // Reset form but keep name/email if "remember" was checked
    document.getElementById('cfSubject').value = '';
    document.getElementById('cfMessage').value = '';
    const hintEl = document.getElementById('msgHint');
    if (hintEl) hintEl.textContent = '';
    const otherWrap = document.getElementById('cfSubjectOtherWrap');
    if (otherWrap) otherWrap.style.display = 'none';
    if (!remember) {
      document.getElementById('cfName').value  = '';
      document.getElementById('cfEmail').value = '';
    }

    setTimeout(() => {
      msg.textContent = '';
      msg.className   = 'form-msg';
    }, 10000);
  }, 800);
}

/* helper — set form message with type class */
function showFormMsg(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.className   = `form-msg ${type}`;
}

/* ══════════════════════════════
   NAVBAR ACTIVE ON SCROLL
══════════════════════════════ */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => io.observe(s));
}

/* ══════════════════════════════
   REVEAL ON SCROLL (IntersectionObserver)
══════════════════════════════ */
function attachRevealObserver() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
          // Animate skill bars when skills section reveals
          if (entry.target.classList.contains('skill-group')) animateSkillBars();
        }, i * 80);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal:not(.visible)').forEach(el => io.observe(el));
}

/* ══════════════════════════════
   CURSOR GLOW
══════════════════════════════ */
function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow || window.matchMedia('(hover: none)').matches) return;
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
    glow.style.opacity = '1';
  });
  document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
}

/* ══════════════════════════════
   NAVBAR SCROLL EFFECT
══════════════════════════════ */
function initNavScroll() {
  const nav   = document.getElementById('navbar');
  const btnUp = document.getElementById('backTop');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
    btnUp.classList.toggle('visible', window.scrollY > 400);
  });
}

/* ══════════════════════════════
   HAMBURGER MENU
══════════════════════════════ */
function closeMobileMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
}

document.getElementById('hamburger').addEventListener('click', function() {
  this.classList.toggle('open');
  document.getElementById('mobileMenu').classList.toggle('open');
});

/* ══════════════════════════════
   MODE TOGGLE
══════════════════════════════ */
function handleModeToggle() {
  const mode = toggleMode(); // from data.js
  const btn  = document.getElementById('modeToggle');
  if (btn) btn.textContent = mode === 'dark' ? '🌙' : '☀️';
}

/* ══════════════════════════════
   ANIMATION STYLE APPLIER
══════════════════════════════ */
function applyAnimStyle(style) {
  document.body.dataset.anim = style || 'smooth';
}

/* ══════════════════════════════
   INIT
══════════════════════════════ */
async function init() {
  const data = await initData();

  // Apply theme first (CSS variables)
  applyTheme(data.theme);
  applyAnimStyle(data.theme && data.theme.animationStyle);

  // Sync mode toggle icon
  const modeBtn = document.getElementById('modeToggle');
  const curMode = localStorage.getItem('pf_mode') || (data.theme && data.theme.defaultMode) || 'dark';
  document.body.dataset.mode = curMode;
  if (modeBtn) modeBtn.textContent = curMode === 'dark' ? '🌙' : '☀️';

  // Render sections
  if (data.profile)      renderHero(data.profile);
  if (data.skills)       renderSkills(data.skills);
  if (data.projects)     { renderProjects(data.projects); initProjectTabs(data.projects); }
  if (data.experience)   renderExperience(data.experience);
  if (data.education)    renderEducation(data.education);
  if (data.testimonials) renderTestimonials(data.testimonials);

  // Hero layout from theme
  const heroLayout = data.theme && data.theme.heroLayout;
  if (heroLayout === 'centered') {
    const hero = document.querySelector('.hero');
    if (hero) hero.style.flexDirection = 'column';
  }

  // Init behaviors
  initNavScroll();
  initScrollSpy();
  initCursorGlow();
  attachRevealObserver();
  initContactPrefill();

  // Observe initial reveal elements
  setTimeout(attachRevealObserver, 300);
}

init();
