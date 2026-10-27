const API_URL = 'http://localhost:3000/graphql';
const state = { token: localStorage.getItem('pm_token'), user: JSON.parse(localStorage.getItem('pm_user') || 'null'), page: 1, limit: 8, projects: [], count: 0, selected: null };

const $ = (id) => document.getElementById(id);

async function graphql(query, variables = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const response = await fetch(API_URL, { method: 'POST', headers, body: JSON.stringify({ query, variables }) });
  const body = await response.json();
  if (body.errors?.length) throw new Error(body.errors[0].message || 'API-fejl');
  return body.data;
}

function saveSession(payload) {
  state.token = payload.accessToken;
  state.user = payload.user;
  localStorage.setItem('pm_token', state.token);
  localStorage.setItem('pm_user', JSON.stringify(state.user));
}

function clearSession() {
  state.token = null; state.user = null;
  localStorage.removeItem('pm_token'); localStorage.removeItem('pm_user');
}

function showApp() {
  $('loginView').classList.add('hidden'); $('appView').classList.remove('hidden');
  const email = state.user?.email || '-';
  $('userEmail').textContent = email;
  $('topUser').textContent = email;
  $('userTenant').textContent = `Tenant: ${state.user?.tenantId || '-'}`;
  $('userAvatar').textContent = email.charAt(0).toUpperCase();
  loadProjects();
}

function showLogin() { $('appView').classList.add('hidden'); $('loginView').classList.remove('hidden'); }

$('togglePassword').addEventListener('click', () => {
  const input = $('password'); input.type = input.type === 'password' ? 'text' : 'password'; $('togglePassword').textContent = input.type === 'password' ? 'Vis' : 'Skjul';
});

$('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault(); $('loginError').classList.add('hidden');
  try {
    const data = await graphql(`mutation Login($input: LoginInput!) { login(input: $input) { accessToken user { id email tenantId } } }`, { input: { email: $('email').value.trim(), password: $('password').value } });
    saveSession(data.login); showApp();
  } catch (error) { $('loginError').textContent = error.message; $('loginError').classList.remove('hidden'); }
});

$('logoutBtn').addEventListener('click', () => { clearSession(); state.selected = null; showLogin(); });
$('search').addEventListener('input', () => { state.page = 1; loadProjects(); });
$('statusFilter').addEventListener('change', () => { state.page = 1; loadProjects(); });
$('priorityFilter').addEventListener('change', () => { state.page = 1; loadProjects(); });
$('prevPage').addEventListener('click', () => { if (state.page > 1) { state.page--; loadProjects(); } });
$('nextPage').addEventListener('click', () => { if (state.page * state.limit < state.count) { state.page++; loadProjects(); } });
$('newProjectBtn').addEventListener('click', () => openProjectModal());
$('closeModal').addEventListener('click', closeModal);
$('modal').addEventListener('click', (e) => { if (e.target === $('modal')) closeModal(); });

async function loadProjects() {
  try {
    const data = await graphql(`query Projects($limit:Int,$skip:Int,$status:ProjectStatus,$priority:ProjectPriority,$search:String){ projects(limit:$limit,skip:$skip,status:$status,priority:$priority,search:$search){ count data { id tenantId title description status priority createdAt updatedAt phases { id projectId title order status createdAt updatedAt } } } }`, {
      limit: state.limit, skip: (state.page - 1) * state.limit, status: $('statusFilter').value || null, priority: $('priorityFilter').value || null, search: $('search').value.trim() || null
    });
    state.projects = data.projects.data; state.count = data.projects.count;
    renderStats(); renderProjects();
    if (state.selected) {
      const selected = state.projects.find(p => p.id === state.selected.id);
      if (selected) { state.selected = selected; renderDetails(selected); }
    }
  } catch (error) {
    if (/token|auth|credentials|expired|invalid/i.test(error.message)) { clearSession(); showLogin(); $('loginError').textContent = 'Din login er udløbet. Log ind igen.'; $('loginError').classList.remove('hidden'); }
    else console.error(error);
  }
}

function renderStats() {
  $('totalCount').textContent = state.count;
  $('activeCount').textContent = state.projects.filter(p => p.status === 'IN_PROGRESS').length;
  $('highCount').textContent = state.projects.filter(p => p.priority === 'HIGH').length;
  $('pageInfo').textContent = `Side ${state.page}`;
  $('prevPage').disabled = state.page === 1; $('nextPage').disabled = state.page * state.limit >= state.count;
}

function statusLabel(value) { return ({ PLANNED:'Planlagt', IN_PROGRESS:'I gang', DONE:'Færdig', CANCELLED:'Annulleret', PENDING:'Afventer' }[value] || value); }
function priorityLabel(value) { return ({ LOW:'Lav', MEDIUM:'Mellem', HIGH:'Høj' }[value] || value); }
function badge(value) { const cls = value.toLowerCase().replace('_','-'); return `<span class="badge ${cls}">${statusLabel(value)}</span>`; }
function priorityBadge(value) { return `<span class="badge ${value.toLowerCase()}">${priorityLabel(value)}</span>`; }
function date(value) { return new Date(value).toLocaleDateString('da-DK'); }

function renderProjects() {
  $('projectList').innerHTML = state.projects.map(project => `<article class="project-card ${state.selected?.id === project.id ? 'selected' : ''}" data-id="${project.id}">
    <div><h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.description || 'Ingen beskrivelse')}</p><div class="badges">${badge(project.status)}${priorityBadge(project.priority)}</div><div class="meta">${project.phases.length} faser · Opdateret ${date(project.updatedAt)}</div></div>
    <div class="card-actions"><button class="icon-btn" data-action="open">◉</button><button class="icon-btn" data-action="edit">✎</button><button class="icon-btn danger" data-action="delete">⌫</button></div>
  </article>`).join('') || '<div class="empty"><p>Ingen projekter fundet.</p></div>';
  document.querySelectorAll('.project-card').forEach(card => card.addEventListener('click', (e) => { const action = e.target.closest('button')?.dataset.action; const project = state.projects.find(p => p.id === card.dataset.id); if (!project) return; if (action === 'edit') return openProjectModal(project); if (action === 'delete') return archiveProject(project); state.selected = project; renderProjects(); renderDetails(project); }));
}

function renderDetails(project) {
  $('detailsEmpty').classList.add('hidden'); $('details').classList.remove('hidden');
  $('details').innerHTML = `<div class="detail-head"><div><p class="eyebrow">PROJECT</p><h2>${escapeHtml(project.title)}</h2><p class="muted">${escapeHtml(project.description || '')}</p></div><div class="detail-actions"><button class="primary" id="editDetail">Rediger</button><button class="danger-btn" id="deleteDetail">Arkivér</button></div></div>
  <div class="info-grid"><div><small>Status</small><strong>${statusLabel(project.status)}</strong></div><div><small>Prioritet</small><strong>${priorityLabel(project.priority)}</strong></div><div><small>Oprettet</small><strong>${date(project.createdAt)}</strong></div><div><small>Antal faser</small><strong>${project.phases.length}</strong></div></div>
  <div class="description">${escapeHtml(project.description || 'Ingen beskrivelse.')}</div>
  <div class="phases-head"><h3>Faser (${project.phases.length})</h3><button class="primary" id="newPhase">＋ Opret fase</button></div>
  <table class="phase-table"><thead><tr><th>#</th><th>Titel</th><th>Status</th><th>Handlinger</th></tr></thead><tbody>${project.phases.map(phase => `<tr><td>${phase.order}</td><td><strong>${escapeHtml(phase.title)}</strong></td><td>${badge(phase.status)}</td><td><button class="icon-btn" data-phase-edit="${phase.id}">✎</button> <button class="icon-btn danger" data-phase-delete="${phase.id}">⌫</button></td></tr>`).join('') || '<tr><td colspan="4">Ingen faser endnu.</td></tr>'}</tbody></table>`;
  $('editDetail').onclick = () => openProjectModal(project); $('deleteDetail').onclick = () => archiveProject(project); $('newPhase').onclick = () => openPhaseModal(project);
  document.querySelectorAll('[data-phase-edit]').forEach(btn => btn.onclick = () => openPhaseModal(project, project.phases.find(p => p.id === btn.dataset.phaseEdit)));
  document.querySelectorAll('[data-phase-delete]').forEach(btn => btn.onclick = () => archivePhase(btn.dataset.phaseDelete));
}

function openProjectModal(project = null) {
  $('modalTitle').textContent = project ? 'Rediger projekt' : 'Opret projekt';
  $('entityForm').innerHTML = `<label>Titel<input id="formTitle" required maxlength="120" value="${escapeAttr(project?.title || '')}"></label><label>Beskrivelse<textarea id="formDescription" maxlength="1000">${escapeHtml(project?.description || '')}</textarea></label><label>Status<select id="formStatus"><option>PLANNED</option><option>IN_PROGRESS</option><option>DONE</option><option>CANCELLED</option></select></label><label>Prioritet<select id="formPriority"><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select></label><div class="form-actions"><button type="button" class="secondary" id="cancelForm">Annuller</button><button class="primary" type="submit">${project ? 'Gem ændringer' : 'Opret projekt'}</button></div>`;
  $('formStatus').value = project?.status || 'PLANNED'; $('formPriority').value = project?.priority || 'MEDIUM'; $('entityForm').onsubmit = (e) => { e.preventDefault(); saveProject(project); }; $('cancelForm').onclick = closeModal; $('modal').classList.remove('hidden');
}

async function saveProject(project) { try { if (project) await graphql(`mutation Update($input:UpdateProjectInput!){ updateProject(input:$input) }`, { input:{ id:project.id,title:$('formTitle').value,description:$('formDescription').value,status:$('formStatus').value,priority:$('formPriority').value } }); else await graphql(`mutation Create($input:CreateProjectInput!){ createProject(input:$input) }`, { input:{ title:$('formTitle').value,description:$('formDescription').value,status:$('formStatus').value,priority:$('formPriority').value } }); closeModal(); await loadProjects(); } catch(e){ alert(e.message); } }

function openPhaseModal(project, phase = null) { $('modalTitle').textContent = phase ? 'Rediger fase' : 'Opret fase'; $('entityForm').innerHTML = `<label>Titel<input id="formTitle" required maxlength="120" value="${escapeAttr(phase?.title || '')}"></label><label>Rækkefølge<input id="formOrder" type="number" min="0" required value="${phase?.order ?? 0}"></label><label>Status<select id="formStatus"><option>PENDING</option><option>IN_PROGRESS</option><option>DONE</option></select></label><div class="form-actions"><button type="button" class="secondary" id="cancelForm">Annuller</button><button class="primary" type="submit">${phase ? 'Gem ændringer' : 'Opret fase'}</button></div>`; $('formStatus').value=phase?.status||'PENDING'; $('entityForm').onsubmit=e=>{e.preventDefault();savePhase(project,phase)}; $('cancelForm').onclick=closeModal; $('modal').classList.remove('hidden'); }

async function savePhase(project, phase) { try { if(phase) await graphql(`mutation Update($input:UpdatePhaseInput!){ updatePhase(input:$input) }`,{input:{id:phase.id,title:$('formTitle').value,order:Number($('formOrder').value),status:$('formStatus').value}}); else await graphql(`mutation Create($input:CreatePhaseInput!){ createPhase(input:$input) }`,{input:{projectId:project.id,title:$('formTitle').value,order:Number($('formOrder').value),status:$('formStatus').value}}); closeModal(); await loadProjects(); const fresh=state.projects.find(p=>p.id===project.id); if(fresh){state.selected=fresh;renderDetails(fresh)} } catch(e){alert(e.message)} }

async function archiveProject(project){ if(!confirm(`Arkivér projektet "${project.title}"?`)) return; try{await graphql(`mutation Delete($id:ID!){ deleteProject(id:$id) }`,{id:project.id});state.selected=null;await loadProjects();$('details').classList.add('hidden');$('detailsEmpty').classList.remove('hidden')}catch(e){alert(e.message)} }
async function archivePhase(id){ if(!confirm('Arkivér denne fase?')) return; try{await graphql(`mutation Delete($id:ID!){ deletePhase(id:$id) }`,{id});await loadProjects();const fresh=state.projects.find(p=>p.id===state.selected?.id);if(fresh){state.selected=fresh;renderDetails(fresh)}}catch(e){alert(e.message)} }
function closeModal(){ $('modal').classList.add('hidden'); }
function escapeHtml(value){return String(value??'').replace(/[&<>\"\']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;','\'':'&#39;'}[c]))}
function escapeAttr(value){return escapeHtml(value).replace(/'/g,'&#39;')}

if (state.token && state.user) showApp(); else showLogin();
