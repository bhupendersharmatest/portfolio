/* ═══════════════════════════════════════
   admin.js — Admin Panel Logic
   All CRUD, auth, theme, import/export
═══════════════════════════════════════ */

'use strict';

let editingId = null; // tracks which item is being edited

/* ══════════════════════════════
   AUTH
══════════════════════════════ */
function handleLogin(e) {
  e.preventDefault();
  const btn  = document.getElementById('loginBtn');
  const err  = document.getElementById('loginError');
  const pass = document.getElementById('loginPass').value;
  btn.textContent = 'Verifying…';
  btn.disabled = true;

  initAuth();
  const ok = verifyPassword(pass);
  btn.textContent = 'Login →';
  btn.disabled = false;

  if (ok) {
    setSession();
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminApp').style.display = 'flex';
    adminInit();
  } else {
    err.textContent = '❌ Wrong password. Default is admin123';
    document.getElementById('loginPass').value = '';
  }
}

function handleLogout() {
  clearSession();
  document.getElementById('adminApp').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('loginError').textContent = '';
}

function togglePassVis() {
  const inp = document.getElementById('loginPass');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

/* ══════════════════════════════
   INIT
══════════════════════════════ */
async function adminInit() {
  const data = await initData();
  applyTheme(data.theme);
  loadProfilePanel(data.profile || {});
  loadContactPanel(data.profile || {});
  loadThemePanel(data.theme || {});
  renderSkillsList(data.skills || []);
  renderProjectsList(data.projects || []);
  renderExperienceList(data.experience || []);
  renderEducationList(data.education || []);
  renderTestimonialsList(data.testimonials || []);
  initThemeLivePreview();
}

/* ══════════════════════════════
   SECTION SWITCHER
══════════════════════════════ */
function switchSection(name, btn) {
  document.querySelectorAll('.panel').forEach(p => p.style.display = 'none');
  document.querySelectorAll('.snav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + name).style.display = 'block';
  btn.classList.add('active');
}

/* ══════════════════════════════
   TOAST
══════════════════════════════ */
let toastTimer;
function adminToast(msg, type = 'success') {
  const t = document.getElementById('adminToast');
  t.textContent = msg;
  t.style.borderLeftColor = type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--accent)';
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ══════════════════════════════
   PROFILE PANEL
══════════════════════════════ */
function loadProfilePanel(p) {
  v('pf-name',        p.name || '');
  v('pf-title',       p.title || '');
  v('pf-bio',         p.bio || '');
  v('pf-photo',       p.photo || '');
  v('pf-roles',       (p.roles || []).join('\n'));
  v('pf-interests',   (p.interests || []).join(', '));
  v('pf-github',      (p.social || {}).github || '');
  v('pf-linkedin',    (p.social || {}).linkedin || '');
  v('pf-twitter',     (p.social || {}).twitter || '');
  v('pf-instagram',   (p.social || {}).instagram || '');
  v('pf-stat-projects', (p.stats || {}).projects || '');
  v('pf-stat-experience',(p.stats || {}).experience || '');
  v('pf-stat-clients', (p.stats || {}).clients || '');

  // Show CV status
  const cvStatus = document.getElementById('cvStatus');
  if (p.cv) {
    if (p.cv.startsWith('data:')) {
      v('pf-cv', '');
      if (cvStatus) { cvStatus.textContent = '✅ File uploaded and stored'; cvStatus.className = 'cv-status success'; }
    } else {
      v('pf-cv', p.cv);
      if (cvStatus) { cvStatus.textContent = '🔗 External URL set'; cvStatus.className = 'cv-status info'; }
    }
  } else {
    v('pf-cv', '');
    if (cvStatus) { cvStatus.textContent = ''; cvStatus.className = 'cv-status'; }
  }
}

function saveProfilePanel() {
  const data = loadData() || {};
  const urlVal = g('pf-cv').trim();
  // If the text field has a URL, use it; otherwise keep the existing cv value
  // (which might be a base64 data URL uploaded via file picker)
  const existingCv = (data.profile || {}).cv || '';
  const cvValue = urlVal
    ? urlVal
    : (existingCv.startsWith('data:') ? existingCv : '');

  data.profile = {
    ...(data.profile || {}),
    name:      g('pf-name'),
    title:     g('pf-title'),
    bio:       g('pf-bio'),
    photo:     g('pf-photo'),
    cv:        cvValue,
    roles:     g('pf-roles').split('\n').map(s=>s.trim()).filter(Boolean),
    interests: g('pf-interests').split(',').map(s=>s.trim()).filter(Boolean),
    social: {
      github:    g('pf-github'),
      linkedin:  g('pf-linkedin'),
      twitter:   g('pf-twitter'),
      instagram: g('pf-instagram'),
    },
    stats: {
      projects:   g('pf-stat-projects'),
      experience: g('pf-stat-experience'),
      clients:    g('pf-stat-clients'),
    },
    email:    (data.profile || {}).email    || '',
    phone:    (data.profile || {}).phone    || '',
    location: (data.profile || {}).location || '',
  };
  saveData(data);
  adminToast('✅ Profile saved!');
}

/* ── CV file upload ── */
function handleCvUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const cvStatus = document.getElementById('cvStatus');
  const maxSize  = 5 * 1024 * 1024; // 5 MB limit

  if (file.size > maxSize) {
    cvStatus.textContent = '❌ File too large (max 5 MB). Use an external URL instead.';
    cvStatus.className = 'cv-status error';
    event.target.value = '';
    return;
  }

  cvStatus.textContent = '⏳ Reading file…';
  cvStatus.className = 'cv-status info';

  const reader = new FileReader();
  reader.onload = function(e) {
    // Store base64 data URL directly in profile.cv
    const data = loadData() || {};
    data.profile = data.profile || {};
    data.profile.cv = e.target.result;
    data.profile.cvFileName = file.name;
    saveData(data);

    v('pf-cv', ''); // clear the URL text field
    cvStatus.textContent = `✅ "${file.name}" uploaded (${(file.size/1024).toFixed(1)} KB) — click Save Profile to confirm`;
    cvStatus.className = 'cv-status success';
  };
  reader.onerror = function() {
    cvStatus.textContent = '❌ Failed to read file. Try again.';
    cvStatus.className = 'cv-status error';
  };
  reader.readAsDataURL(file);
  event.target.value = ''; // reset input so same file can be re-selected
}

/* ── Clear CV ── */
function clearCv() {
  const data = loadData() || {};
  if (data.profile) { data.profile.cv = ''; data.profile.cvFileName = ''; }
  saveData(data);
  v('pf-cv', '');
  const cvStatus = document.getElementById('cvStatus');
  if (cvStatus) { cvStatus.textContent = '🗑 CV removed.'; cvStatus.className = 'cv-status info'; }
  setTimeout(() => { if (cvStatus) { cvStatus.textContent = ''; cvStatus.className = 'cv-status'; } }, 3000);
}

/* ══════════════════════════════
   CONTACT PANEL
══════════════════════════════ */
function loadContactPanel(p) {
  v('ct-email',    p.email    || '');
  v('ct-phone',    p.phone    || '');
  v('ct-location', p.location || '');

  // Load EmailJS keys
  const data = loadData() || {};
  const ej   = data.emailjs || {};
  v('ej-public-key',  ej.publicKey  || '');
  v('ej-service-id',  ej.serviceId  || '');
  v('ej-template-id', ej.templateId || '');
  updateEjStatus(ej);
}

function updateEjStatus(ej) {
  const dot  = document.getElementById('ejDot');
  const text = document.getElementById('ejStatusText');
  if (!dot || !text) return;
  const configured = ej && ej.publicKey && ej.serviceId && ej.templateId;
  dot.className  = 'ej-dot' + (configured ? ' active' : '');
  text.textContent = configured ? 'Connected ✓' : 'Not configured';
}

function saveContactPanel() {
  const data = loadData() || {};
  data.profile = {
    ...(data.profile || {}),
    email:    g('ct-email'),
    phone:    g('ct-phone'),
    location: g('ct-location'),
  };
  // Save EmailJS keys
  data.emailjs = {
    publicKey:  g('ej-public-key').trim(),
    serviceId:  g('ej-service-id').trim(),
    templateId: g('ej-template-id').trim(),
  };
  saveData(data);
  updateEjStatus(data.emailjs);
  adminToast('✅ Contact info & EmailJS keys saved!');
}

async function testEmailJS() {
  const data = loadData() || {};
  const ej   = data.emailjs || {};
  const msg  = document.getElementById('ejTestMsg');

  if (!ej.publicKey || !ej.serviceId || !ej.templateId) {
    msg.textContent = '⚠️ Please fill in all 3 EmailJS fields and save first.';
    msg.className = 'ej-test-msg error';
    return;
  }

  msg.textContent = '⏳ Sending test email…';
  msg.className = 'ej-test-msg info';

  try {
    emailjs.init(ej.publicKey);
    await emailjs.send(ej.serviceId, ej.templateId, {
      from_name:  'Test — Portfolio Admin',
      from_email: (data.profile || {}).email || 'test@portfolio.com',
      subject:    '✅ EmailJS Test — Contact Form is Working!',
      message:    'This is a test message sent from your Portfolio Admin Panel. Your contact form is now fully connected!',
      to_name:    (data.profile || {}).name || 'Portfolio Owner',
    });
    msg.textContent = '🎉 Test email sent! Check your inbox.';
    msg.className = 'ej-test-msg success';
  } catch(err) {
    msg.textContent = '❌ Failed: ' + (err.text || err.message || JSON.stringify(err));
    msg.className = 'ej-test-msg error';
  }
}

/* ══════════════════════════════
   SKILLS
══════════════════════════════ */
function renderSkillsList(skills) {
  const el = document.getElementById('skillsList');
  if (!el) return;
  if (!skills.length) { el.innerHTML = '<p style="color:var(--text3);padding:20px">No skills added yet. Click + Add Skill.</p>'; return; }
  el.innerHTML = skills.map(s => `
    <div class="item-card">
      <div class="item-icon">💡</div>
      <div class="item-info">
        <div class="item-name">${s.name}</div>
        <div class="item-meta">${s.category} &nbsp;·&nbsp; ${s.level}%</div>
        <div class="skill-bar-mini"><div class="skill-fill-mini" style="width:${s.level}%"></div></div>
      </div>
      <div class="item-actions">
        <button class="btn-edit" onclick="openSkillModal('${s.id}')">✏ Edit</button>
        <button class="btn-del"  onclick="deleteItem('skills','${s.id}')">🗑 Delete</button>
      </div>
    </div>`).join('');
}

function openSkillModal(id = null) {
  editingId = id;
  document.getElementById('skillModalTitle').textContent = id ? 'Edit Skill' : 'Add Skill';
  if (id) {
    const sk = (getSkills()).find(s => s.id === id);
    if (sk) {
      v('sk-name', sk.name); v('sk-category', sk.category);
      v('sk-level', sk.level);
      document.getElementById('skLevelVal').textContent = sk.level;
    }
  } else {
    v('sk-name',''); v('sk-category','Frontend'); v('sk-level',80);
    document.getElementById('skLevelVal').textContent = 80;
  }
  openModal('skillModal');
}

function saveSkill() {
  const skills = getSkills();
  const item = {
    id:       editingId || genId('s'),
    name:     g('sk-name').trim(),
    category: g('sk-category'),
    level:    parseInt(g('sk-level')),
  };
  if (!item.name) { adminToast('⚠️ Skill name is required', 'error'); return; }
  if (editingId) {
    const i = skills.findIndex(s => s.id === editingId);
    if (i > -1) skills[i] = item;
  } else {
    skills.push(item);
  }
  saveSkills(skills);
  renderSkillsList(skills);
  closeModal('skillModal');
  adminToast(editingId ? '✅ Skill updated!' : '✅ Skill added!');
}

/* ══════════════════════════════
   PROJECTS
══════════════════════════════ */
function renderProjectsList(projects) {
  const el = document.getElementById('projectsList');
  if (!el) return;
  if (!projects.length) { el.innerHTML = '<p style="color:var(--text3);padding:20px">No projects added yet. Click + Add Project.</p>'; return; }
  el.innerHTML = projects.map(p => `
    <div class="item-card">
      <div class="item-icon">💻</div>
      <div class="item-info">
        <div class="item-name">${p.title} ${p.featured ? '⭐' : ''}</div>
        <div class="item-meta">${p.category} &nbsp;·&nbsp; ${(p.tags||[]).join(', ')}</div>
      </div>
      <div class="item-actions">
        <button class="btn-edit" onclick="openProjectModal('${p.id}')">✏ Edit</button>
        <button class="btn-del"  onclick="deleteItem('projects','${p.id}')">🗑 Delete</button>
      </div>
    </div>`).join('');
}

function openProjectModal(id = null) {
  editingId = id;
  document.getElementById('projectModalTitle').textContent = id ? 'Edit Project' : 'Add Project';
  if (id) {
    const p = getProjects().find(x => x.id === id);
    if (p) {
      v('pr-title', p.title); v('pr-desc', p.description); v('pr-image', p.image || '');
      v('pr-category', p.category); v('pr-featured', String(p.featured || false));
      v('pr-tags', (p.tags||[]).join(', ')); v('pr-github', p.github||''); v('pr-live', p.live||'');
    }
  } else {
    ['pr-title','pr-desc','pr-image','pr-tags','pr-github','pr-live'].forEach(id => v(id,''));
    v('pr-category','web'); v('pr-featured','false');
  }
  openModal('projectModal');
}

function saveProject() {
  const projects = getProjects();
  const item = {
    id:          editingId || genId('p'),
    title:       g('pr-title').trim(),
    description: g('pr-desc').trim(),
    image:       g('pr-image').trim(),
    category:    g('pr-category'),
    featured:    g('pr-featured') === 'true',
    tags:        g('pr-tags').split(',').map(s=>s.trim()).filter(Boolean),
    github:      g('pr-github').trim(),
    live:        g('pr-live').trim(),
  };
  if (!item.title) { adminToast('⚠️ Project title required', 'error'); return; }
  if (editingId) {
    const i = projects.findIndex(p => p.id === editingId);
    if (i > -1) projects[i] = item;
  } else {
    projects.push(item);
  }
  saveProjects(projects);
  renderProjectsList(projects);
  closeModal('projectModal');
  adminToast(editingId ? '✅ Project updated!' : '✅ Project added!');
}

/* ══════════════════════════════
   EXPERIENCE
══════════════════════════════ */
function renderExperienceList(experience) {
  const el = document.getElementById('experienceList');
  if (!el) return;
  if (!experience.length) { el.innerHTML = '<p style="color:var(--text3);padding:20px">No experience added yet.</p>'; return; }
  el.innerHTML = experience.map(e => `
    <div class="item-card">
      <div class="item-icon">🏢</div>
      <div class="item-info">
        <div class="item-name">${e.role}</div>
        <div class="item-meta">${e.company} &nbsp;·&nbsp; ${e.duration}</div>
      </div>
      <div class="item-actions">
        <button class="btn-edit" onclick="openExpModal('${e.id}')">✏ Edit</button>
        <button class="btn-del"  onclick="deleteItem('experience','${e.id}')">🗑 Delete</button>
      </div>
    </div>`).join('');
}

function openExpModal(id = null) {
  editingId = id;
  document.getElementById('expModalTitle').textContent = id ? 'Edit Experience' : 'Add Experience';
  if (id) {
    const e = getExperience().find(x => x.id === id);
    if (e) {
      v('ex-company', e.company); v('ex-role', e.role); v('ex-duration', e.duration);
      v('ex-location', e.location||''); v('ex-type', e.type||'Full-time');
      v('ex-bullets', (e.bullets||[]).join('\n'));
    }
  } else {
    ['ex-company','ex-role','ex-duration','ex-location','ex-bullets'].forEach(id => v(id,''));
    v('ex-type','Full-time');
  }
  openModal('expModal');
}

function saveExperience() {
  const experience = getExperience();
  const item = {
    id:       editingId || genId('e'),
    company:  g('ex-company').trim(),
    role:     g('ex-role').trim(),
    duration: g('ex-duration').trim(),
    location: g('ex-location').trim(),
    type:     g('ex-type'),
    bullets:  g('ex-bullets').split('\n').map(s=>s.trim()).filter(Boolean),
  };
  if (!item.role || !item.company) { adminToast('⚠️ Role & Company required', 'error'); return; }
  if (editingId) {
    const i = experience.findIndex(e => e.id === editingId);
    if (i > -1) experience[i] = item;
  } else {
    experience.push(item);
  }
  saveSection('experience', experience);
  renderExperienceList(experience);
  closeModal('expModal');
  adminToast(editingId ? '✅ Experience updated!' : '✅ Experience added!');
}

/* ══════════════════════════════
   EDUCATION
══════════════════════════════ */
function renderEducationList(education) {
  const el = document.getElementById('educationList');
  if (!el) return;
  if (!education.length) { el.innerHTML = '<p style="color:var(--text3);padding:20px">No education added yet.</p>'; return; }
  el.innerHTML = education.map(e => `
    <div class="item-card">
      <div class="item-icon">${e.icon||'🎓'}</div>
      <div class="item-info">
        <div class="item-name">${e.degree}</div>
        <div class="item-meta">${e.institution} &nbsp;·&nbsp; ${e.year}</div>
      </div>
      <div class="item-actions">
        <button class="btn-edit" onclick="openEduModal('${e.id}')">✏ Edit</button>
        <button class="btn-del"  onclick="deleteItem('education','${e.id}')">🗑 Delete</button>
      </div>
    </div>`).join('');
}

function openEduModal(id = null) {
  editingId = id;
  document.getElementById('eduModalTitle').textContent = id ? 'Edit Education' : 'Add Education';
  if (id) {
    const e = getEducation().find(x => x.id === id);
    if (e) { v('ed-institution',e.institution); v('ed-degree',e.degree); v('ed-year',e.year); v('ed-grade',e.grade||''); v('ed-icon',e.icon||'🎓'); }
  } else {
    ['ed-institution','ed-degree','ed-year','ed-grade'].forEach(id=>v(id,''));
    v('ed-icon','🎓');
  }
  openModal('eduModal');
}

function saveEducation() {
  const education = getEducation();
  const item = {
    id:          editingId || genId('ed'),
    institution: g('ed-institution').trim(),
    degree:      g('ed-degree').trim(),
    year:        g('ed-year').trim(),
    grade:       g('ed-grade').trim(),
    icon:        g('ed-icon').trim() || '🎓',
  };
  if (!item.institution || !item.degree) { adminToast('⚠️ Institution & Degree required', 'error'); return; }
  if (editingId) {
    const i = education.findIndex(e => e.id === editingId);
    if (i > -1) education[i] = item;
  } else {
    education.push(item);
  }
  saveSection('education', education);
  renderEducationList(education);
  closeModal('eduModal');
  adminToast(editingId ? '✅ Education updated!' : '✅ Education added!');
}

/* ══════════════════════════════
   TESTIMONIALS
══════════════════════════════ */
function renderTestimonialsList(testimonials) {
  const el = document.getElementById('testimonialsList');
  if (!el) return;
  if (!testimonials.length) { el.innerHTML = '<p style="color:var(--text3);padding:20px">No testimonials added yet.</p>'; return; }
  el.innerHTML = testimonials.map(t => `
    <div class="item-card">
      <div class="item-icon">💬</div>
      <div class="item-info">
        <div class="item-name">${t.name} — ${t.role}</div>
        <div class="item-meta">${t.quote.slice(0,80)}${t.quote.length>80?'…':''}</div>
      </div>
      <div class="item-actions">
        <button class="btn-edit" onclick="openTestModal('${t.id}')">✏ Edit</button>
        <button class="btn-del"  onclick="deleteItem('testimonials','${t.id}')">🗑 Delete</button>
      </div>
    </div>`).join('');
}

function openTestModal(id = null) {
  editingId = id;
  document.getElementById('testModalTitle').textContent = id ? 'Edit Testimonial' : 'Add Testimonial';
  if (id) {
    const t = getTestimonials().find(x => x.id === id);
    if (t) { v('tm-name',t.name); v('tm-role',t.role); v('tm-avatar',t.avatar||''); v('tm-quote',t.quote); v('tm-rating',t.rating||5); document.getElementById('tmRatingVal').textContent = t.rating||5; }
  } else {
    ['tm-name','tm-role','tm-avatar','tm-quote'].forEach(id=>v(id,''));
    v('tm-rating',5); document.getElementById('tmRatingVal').textContent=5;
  }
  openModal('testModal');
}

function saveTestimonial() {
  const testimonials = getTestimonials();
  const item = {
    id:     editingId || genId('t'),
    name:   g('tm-name').trim(),
    role:   g('tm-role').trim(),
    avatar: g('tm-avatar').trim(),
    quote:  g('tm-quote').trim(),
    rating: parseInt(g('tm-rating')),
  };
  if (!item.name || !item.quote) { adminToast('⚠️ Name & Quote required', 'error'); return; }
  if (editingId) {
    const i = testimonials.findIndex(t => t.id === editingId);
    if (i > -1) testimonials[i] = item;
  } else {
    testimonials.push(item);
  }
  saveSection('testimonials', testimonials);
  renderTestimonialsList(testimonials);
  closeModal('testModal');
  adminToast(editingId ? '✅ Testimonial updated!' : '✅ Testimonial added!');
}

/* ══════════════════════════════
   DELETE
══════════════════════════════ */
function deleteItem(section, id) {
  if (!confirm('Are you sure you want to delete this item?')) return;
  const data = loadData() || {};
  data[section] = (data[section] || []).filter(item => item.id !== id);
  saveData(data);
  if (section === 'skills')       renderSkillsList(data[section]);
  if (section === 'projects')     renderProjectsList(data[section]);
  if (section === 'experience')   renderExperienceList(data[section]);
  if (section === 'education')    renderEducationList(data[section]);
  if (section === 'testimonials') renderTestimonialsList(data[section]);
  adminToast('🗑 Deleted successfully');
}

/* ══════════════════════════════
   THEME PANEL
══════════════════════════════ */
function loadThemePanel(t) {
  if (!t) return;
  v('th-primary',     t.primaryColor || '#7C5CFC');
  v('th-primary-hex', t.primaryColor || '#7C5CFC');
  v('th-accent',      t.accentColor  || '#00D4AA');
  v('th-accent-hex',  t.accentColor  || '#00D4AA');
  v('th-bg',          t.bgColor      || '#0A0A14');
  v('th-bg-hex',      t.bgColor      || '#0A0A14');
  v('th-font',        t.fontFamily   || 'Inter');
  v('th-mode',        t.defaultMode  || 'dark');
  v('th-anim',        t.animationStyle || 'smooth');
  v('th-hero',        t.heroLayout   || 'split');
  updateMiniPreview();
}

function saveThemePanel() {
  const theme = {
    primaryColor:   g('th-primary'),
    accentColor:    g('th-accent'),
    bgColor:        g('th-bg'),
    fontFamily:     g('th-font'),
    defaultMode:    g('th-mode'),
    animationStyle: g('th-anim'),
    heroLayout:     g('th-hero'),
  };
  saveTheme(theme);
  applyTheme(theme);
  adminToast('🎨 Theme saved! Changes applied instantly.');
}

function applyPreset(primary, accent, bg) {
  v('th-primary',     primary); v('th-primary-hex', primary);
  v('th-accent',      accent);  v('th-accent-hex',  accent);
  v('th-bg',          bg);      v('th-bg-hex',      bg);
  updateMiniPreview();
}

function resetThemeDefaults() {
  applyPreset('#7C5CFC','#00D4AA','#0A0A14');
}

function initThemeLivePreview() {
  // Sync color pickers ↔ hex inputs
  [['th-primary','th-primary-hex'], ['th-accent','th-accent-hex'], ['th-bg','th-bg-hex']].forEach(([pickId, hexId]) => {
    document.getElementById(pickId).addEventListener('input', e => {
      v(hexId, e.target.value);
      updateMiniPreview();
    });
    document.getElementById(hexId).addEventListener('input', e => {
      const val = e.target.value;
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) { v(pickId, val); updateMiniPreview(); }
    });
  });
  document.getElementById('th-font').addEventListener('change', updateMiniPreview);
  document.getElementById('th-mode').addEventListener('change', updateMiniPreview);
}

function updateMiniPreview() {
  const primary = g('th-primary');
  const accent  = g('th-accent');
  const bg      = g('th-bg');
  const preview = document.getElementById('themePreview');
  if (!preview) return;
  preview.style.background = bg;
  preview.querySelector('.tp-bar').style.background = `linear-gradient(90deg, ${primary}, ${accent})`;
  preview.querySelector('.tp-avatar').style.background = `linear-gradient(135deg, ${primary}, ${accent})`;
  preview.querySelector('.tp-name').style.background = primary;
  preview.querySelectorAll('.tp-btn').forEach(b => { b.style.background = primary; });
  preview.querySelector('.tp-btn-out').style.background = 'transparent';
  preview.querySelector('.tp-btn-out').style.border = `1px solid ${primary}`;
}

/* ══════════════════════════════
   SECURITY / PASSWORD
══════════════════════════════ */
function savePassword() {
  const p1  = g('sec-pass1');
  const p2  = g('sec-pass2');
  const msg = document.getElementById('secMsg');
  if (!p1)          { msg.textContent = '⚠️ Enter a new password'; msg.className='sec-msg error'; return; }
  if (p1.length < 6){ msg.textContent = '⚠️ Minimum 6 characters'; msg.className='sec-msg error'; return; }
  if (p1 !== p2)    { msg.textContent = '❌ Passwords do not match'; msg.className='sec-msg error'; return; }
  changePassword(p1);
  msg.textContent = '✅ Password updated! Use it on next login.';
  msg.className = 'sec-msg success';
  v('sec-pass1',''); v('sec-pass2','');
  setTimeout(() => msg.textContent = '', 5000);
}

/* ══════════════════════════════
   IMPORT
══════════════════════════════ */
async function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  try {
    await importData(file);
    const data = loadData();
    loadProfilePanel(data.profile || {});
    loadContactPanel(data.profile || {});
    loadThemePanel(data.theme || {});
    renderSkillsList(data.skills || []);
    renderProjectsList(data.projects || []);
    renderExperienceList(data.experience || []);
    renderEducationList(data.education || []);
    renderTestimonialsList(data.testimonials || []);
    applyTheme(data.theme);
    adminToast('📥 Data imported successfully!');
  } catch(err) {
    adminToast('❌ Import failed: ' + err.message, 'error');
  }
  event.target.value = '';
}

/* ══════════════════════════════
   MODAL HELPERS
══════════════════════════════ */
function openModal(id)  { document.getElementById(id).classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeModal(id) { document.getElementById(id).classList.remove('open'); document.body.style.overflow = ''; editingId = null; }

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

// Escape key closes modals
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
});

/* ══════════════════════════════
   SHORTCUTS
══════════════════════════════ */
function g(id) { const el = document.getElementById(id); return el ? el.value : ''; }
function v(id, val) { const el = document.getElementById(id); if (el) el.value = val; }

/* ══════════════════════════════
   AUTO-LOGIN if session exists
══════════════════════════════ */
(() => {
  initAuth();
  if (isLoggedIn()) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminApp').style.display = 'flex';
    adminInit();
  }
})();
