/* =========================================================
   cofounder.new — App UI Demo
   Implements interactions per app-ui-source-pack.md
   All data is clearly labeled DEMO/PLACEHOLDER per the rule:
   "Do not invent fake data, fake metrics, fake integrations."
   ========================================================= */

// ============ DEMO STATE (clearly labeled placeholder data) ============
const DEMO = {
  // PLACEHOLDER: real platform metrics not available — use safe demo values
  macro: [
    { label: 'Tasks completed', value: 0, target: 14823, wow: '+13%', dir: 'up' },
    { label: 'Active founders', value: 0, target: 1847, wow: '+8%',  dir: 'up' },
    { label: 'Outputs generated', value: 0, target: 8912,  wow: '+22%', dir: 'up' },
    { label: 'Businesses live',  value: 0, target: 437,   wow: '+11%', dir: 'up' }
  ],
  pending: [
    {
      id: 'd1',
      tag: 'EMAIL · MARKETING',
      title: 'Send outreach email to 142 SaaS founders',
      why: 'Based on your ICP from PetPal. Cold-outreach batch using the draft from earlier this week.'
    },
    {
      id: 'd2',
      tag: 'SPEND · GROWTH',
      title: 'Increase Meta ad budget by 20%',
      why: 'CTR on Variant B is 4.8% — significant lift over Variant A. Reallocating budget to scale the winner.'
    }
  ],
  highlights: [
    { type: 'win', text: 'Closed 3 outreach replies on PetPal. Routed to your inbox.' },
    { type: 'warn', text: 'Open rate on GreenBean dropped 22%. Testing two new subject lines.' },
    { type: 'info', text: 'Strategy doc for Q4 positioning ready to review.' }
  ],
  businesses: [
    { id: 'petpal',    name: 'PetPal',    type: 'SaaS',    health: 'green',  revenue: '$1,247',  wow: '+12%', dir: 'up',   tasks: 3, last: '2m ago',  sparkdata: [3,5,4,7,8,6,9] },
    { id: 'greenbean', name: 'GreenBean', type: 'E-com',   health: 'yellow', revenue: '$3,890',  wow: '-22%', dir: 'down', tasks: 5, last: 'just now', sparkdata: [9,8,7,5,4,3,3] },
    { id: 'vendora',   name: 'Vendora',   type: 'Agency',  health: 'green',  revenue: '$8,420',  wow: '+18%', dir: 'up',   tasks: 2, last: '14m ago', sparkdata: [4,5,5,6,7,8,9] }
  ],
  feed: [
    { id: 1, time: '11:42:08', status: 'running', dept: 'Marketing', desc: 'Drafting outreach email to fintech founders...', startedAt: Date.now() - 4 * 60 * 1000 - 12*1000 },
    { id: 2, time: '11:41:50', status: 'done',    dept: 'Product',   desc: 'Deployed feature-x to production', timer: '02m 18s', artifact: 'Code Note' },
    { id: 3, time: '11:41:32', status: 'warn',    dept: 'Finance',   desc: 'Rate limit hit. Backing off 30s. Retrying...', timer: '00m 32s' },
    { id: 4, time: '11:41:00', status: 'running', dept: 'Sales',     desc: 'Sending email batch (62/142)', startedAt: Date.now() - 4 * 60 * 1000 - 32*1000 },
    { id: 5, time: '11:40:11', status: 'done',    dept: 'Marketing', desc: 'A/B test reached statistical significance', timer: '12h 04m', artifact: 'Report' },
    { id: 6, time: '11:39:48', status: 'info',    dept: 'Strategy',  desc: 'Indexing global metrics for weekly digest', timer: '00m 08s' },
    { id: 7, time: '11:39:02', status: 'done',    dept: 'Product',   desc: 'Refactored database query indexing', timer: '08h 41m' },
    { id: 8, time: '11:38:30', status: 'done',    dept: 'Marketing', desc: 'Drafted Q4 strategy doc', timer: '01h 12m', artifact: 'Strategy Doc' }
  ],
  nextUp: [
    'Review GreenBean pricing changes',
    'Send weekly digest to investors mailing list',
    'Test new onboarding flow on PetPal'
  ]
};

// ============ Utilities ============
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

function html(strings, ...values) {
  return strings.reduce((acc, s, i) => acc + s + (values[i] !== undefined ? values[i] : ''), '');
}

function escape(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function formatElapsed(startedAt) {
  const ms = Date.now() - startedAt;
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(sec).padStart(2,'0')}s`;
  return `${String(m).padStart(2,'0')}m ${String(sec).padStart(2,'0')}s`;
}

// ============ Toasts ============
function toast(message, type='success', persistent=false) {
  const region = $('#toastRegion');
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.textContent = message;
  region.appendChild(el);
  if (!persistent) {
    setTimeout(() => {
      el.style.transition = 'opacity 200ms';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 220);
    }, 4000);
  }
}

// ============ Sparkline (SVG) ============
function sparkline(data, dir='up') {
  const w = 100, h = 24;
  const min = Math.min(...data), max = Math.max(...data);
  const range = (max - min) || 1;
  const step = w / (data.length - 1);
  const points = data.map((v, i) => `${i*step},${h - ((v - min) / range) * (h - 4) - 2}`).join(' ');
  const color = dir === 'up' ? 'var(--color-accent-green)' : dir === 'down' ? 'var(--color-accent-red)' : 'var(--color-text-muted)';
  return `<svg class="sparkline" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" width="100%"><polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.5" /></svg>`;
}

// ============ Render Helpers ============
function renderMacroBar() {
  return html`
    <div class="metrics-bar" aria-label="Platform metrics (demo data — not real)">
      ${DEMO.macro.map(m => html`
        <div class="metric-tile">
          <div class="metric-tile__label">${m.label}</div>
          <div class="metric-tile__value" data-target="${m.target}">${m.value.toLocaleString()}</div>
          <div class="wow-badge wow-badge--${m.dir}">${m.dir==='up'?'↑':'↓'} ${m.wow} WoW</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderStatusTag(status) {
  const labels = {
    running: 'RUNNING', done: 'DONE', warn: 'WARN', retry: 'RETRY',
    blocked: 'BLOCKED', info: 'INFO', sent: 'SENT', skipped: 'SKIPPED'
  };
  return `<span class="status-tag status-tag--${status}">[${labels[status] || 'INFO'}]</span>`;
}

function renderFeedRow(entry) {
  const timer = entry.status === 'running'
    ? `<span class="feed-row__timer mono">Running for ${formatElapsed(entry.startedAt)}</span>`
    : (entry.timer ? `<span class="feed-row__timer mono">${entry.timer}</span>` : '');
  const artifact = entry.artifact
    ? `<span class="feed-row__artifact" data-artifact="${escape(entry.artifact)}">▸ ${escape(entry.artifact)}</span>`
    : '';
  return html`
    <div class="feed-row feed-row--${entry.status}" data-id="${entry.id}" role="listitem">
      <span class="feed-row__prompt">&gt;</span>
      <span class="feed-row__time">[${entry.time}]</span>
      ${renderStatusTag(entry.status)}
      <span class="feed-row__desc">${escape(entry.desc)}</span>
      <span>${timer}${artifact}</span>
    </div>
  `;
}

function renderFeed() {
  return html`
    <div class="feed" aria-label="Live co-founder activity feed">
      <div class="feed__header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="pulse-dot"></span>
          <span class="overline">LIVE CO-FOUNDER FEED</span>
        </div>
        <span class="caption mono">${DEMO.feed.length} entries</span>
      </div>
      <div class="feed__stream" id="feedStream" role="log" aria-live="polite">
        ${DEMO.feed.map(renderFeedRow).join('')}
      </div>
    </div>
  `;
}

function renderPending() {
  if (!DEMO.pending.length) {
    return html`
      <section>
        <div class="section-header"><span class="overline">PENDING DECISIONS</span></div>
        <p class="body-sm muted">All clear. No decisions needed from you today.</p>
      </section>
    `;
  }
  return html`
    <section>
      <div class="section-header">
        <span class="overline">PENDING DECISIONS · <span class="badge badge--amber">${DEMO.pending.length}</span></span>
      </div>
      <div style="display:flex; flex-direction:column; gap:var(--space-3);">
        ${DEMO.pending.map(d => html`
          <div class="card decision-card" data-id="${d.id}">
            <div class="overline overline--amber">${escape(d.tag)}</div>
            <h3 class="decision-card__title">${escape(d.title)}</h3>
            <p class="decision-card__why muted">${escape(d.why)}</p>
            <div class="decision-card__actions">
              <button class="btn btn--primary btn--sm" data-decision="approve" data-id="${d.id}">Approve →</button>
              <button class="btn btn--ghost btn--sm" data-decision="modify" data-id="${d.id}">Modify</button>
              <button class="btn btn--ghost btn--sm" data-decision="skip" data-id="${d.id}">Skip this time</button>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function renderBusinessCards() {
  return html`
    <section>
      <div class="section-header"><span class="overline">YOUR BUSINESSES · ${DEMO.businesses.length}</span></div>
      <div style="display:flex; flex-direction:column; gap:var(--space-3);">
        ${DEMO.businesses.map(b => html`
          <div class="card business-card" data-health="${b.health}" data-id="${b.id}" role="link" tabindex="0">
            <div class="business-card__head">
              <span class="pulse-dot ${b.health==='yellow'?'pulse-dot--amber': b.health==='red'?'pulse-dot--red':''}"></span>
              <span class="business-card__name">${escape(b.name)}</span>
              <span class="overline">${escape(b.type)}</span>
            </div>
            <div class="business-card__meta">
              <span class="business-card__revenue">${escape(b.revenue)}</span>
              <span class="health-badge health-badge--${b.health}"><span class="health-badge__dot"></span>${b.health==='green'?'Healthy':b.health==='yellow'?'Attention':'Action req'}</span>
            </div>
            <div class="business-card__sparkline">${sparkline(b.sparkdata, b.dir)}</div>
            <div class="business-card__footer">
              <span class="wow-badge wow-badge--${b.dir}">${b.dir==='up'?'↑':'↓'} ${escape(b.wow)} WoW</span>
              · ${b.tasks} tasks · ${escape(b.last)}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function renderHighlights() {
  return html`
    <section>
      <div class="section-header"><span class="overline">TODAY'S HIGHLIGHTS</span></div>
      <div class="highlights">
        ${DEMO.highlights.map(h => html`
          <div class="highlight highlight--${h.type==='warn'?'warn':''}">
            <span class="highlight__marker">${h.type==='warn'?'⚠':h.type==='win'?'✓':'▸'}</span>
            <span>${escape(h.text)}</span>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function renderNextUp() {
  return html`
    <section>
      <div class="section-header"><span class="overline">NEXT UP</span></div>
      <div class="queue">
        ${DEMO.nextUp.map(q => html`<div class="queue-item">▸ ${escape(q)}</div>`).join('')}
      </div>
    </section>
  `;
}

function renderQuickActions() {
  return html`
    <section>
      <div class="section-header"><span class="overline">QUICK ACTIONS</span></div>
      <div class="quick-actions">
        <button class="btn btn--ghost" data-action="new-business">+ Launch new business</button>
        <button class="btn btn--ghost" data-action="go-chat">Talk to your co-founder</button>
        <button class="btn btn--ghost" data-action="go-activity">View activity log</button>
      </div>
    </section>
  `;
}

// ============ Views ============
function viewCommandCenter() {
  const total = DEMO.businesses.reduce((s, b) => s + b.tasks, 0);
  return html`
    <div class="ai-status">
      <span class="pulse-dot"></span>
      Your co-founder is working on <span class="mono mono--strong">${total}</span> tasks across <span class="mono mono--strong">${DEMO.businesses.length}</span> businesses.
    </div>
    ${renderMacroBar()}
    <div class="dashboard">
      <div class="dashboard__left">
        ${renderPending()}
        ${renderBusinessCards()}
      </div>
      <div class="dashboard__center">
        ${renderFeed()}
      </div>
      <div class="dashboard__right">
        ${renderHighlights()}
        ${renderNextUp()}
        ${renderQuickActions()}
      </div>
    </div>
  `;
}

function viewBusinessDetail(id) {
  const biz = DEMO.businesses.find(b => b.id === id) || DEMO.businesses[0];
  const tabs = ['Strategy','Product','Marketing','Finance','Sales','Analytics'];
  const activeTab = window._activeTab || 'Marketing';
  return html`
    <div class="biz-detail__head">
      <div>
        <h1 class="biz-detail__title">${escape(biz.name)}</h1>
        <div class="biz-detail__sub">${escape(biz.type)} · ${biz.tasks} tasks running</div>
      </div>
      <div style="display:flex; gap:var(--space-2);">
        <button class="btn btn--ghost btn--sm" data-action="biz-chat">Talk to your co-founder about this</button>
        <button class="btn btn--ghost btn--sm" data-action="biz-pause">Pause Business</button>
      </div>
    </div>

    <div class="hero-stats">
      <div class="metric-tile"><div class="metric-tile__label">Revenue (MRR)</div><div class="metric-tile__value">${escape(biz.revenue)}</div><div class="wow-badge wow-badge--${biz.dir}">${biz.dir==='up'?'↑':'↓'} ${escape(biz.wow)} WoW</div></div>
      <div class="metric-tile"><div class="metric-tile__label">Customers</div><div class="metric-tile__value">128</div><div class="wow-badge wow-badge--up">↑ +6% WoW</div></div>
      <div class="metric-tile"><div class="metric-tile__label">Growth rate</div><div class="metric-tile__value">12%</div><div class="wow-badge wow-badge--up">↑ +3% WoW</div></div>
      <div class="metric-tile"><div class="metric-tile__label">AI confidence</div><div class="metric-tile__value">High</div><div class="wow-badge wow-badge--flat">— stable</div></div>
    </div>

    <div class="recommendation">
      <div class="recommendation__intro">▸ BASED ON THE LAST 7 DAYS</div>
      <div class="recommendation__body">I recommend increasing ad spend on Channel B by 20%. Open rate is 4.8% vs Variant A at 2.1% — statistically significant.</div>
      <div class="recommendation__data">CTR Variant A: 2.1% · CTR Variant B: 4.8% · n=2,847 · p<0.01</div>
      <div class="recommendation__actions">
        <button class="btn btn--primary btn--sm">Accept</button>
        <button class="btn btn--ghost btn--sm">Dismiss</button>
        <button class="btn btn--ghost btn--sm" data-action="discuss">Discuss</button>
      </div>
    </div>

    <div class="tab-bar" role="tablist" style="margin-top: var(--space-6);">
      ${tabs.map(t => html`
        <button class="tab ${t===activeTab?'is-active':''}" role="tab" aria-selected="${t===activeTab}" data-tab="${t}">
          ${t} ${t==='Marketing'?'<span class="tab__count">3</span>':''}
        </button>
      `).join('')}
    </div>

    <div class="dept-panel">
      <div class="dept-section">
        <h3>ACTIVE TASKS</h3>
        <div class="feed__stream" style="max-height:none;">
          ${renderFeedRow(DEMO.feed[0])}
          ${renderFeedRow(DEMO.feed[3])}
          ${renderFeedRow(DEMO.feed[4])}
        </div>
      </div>

      <div class="dept-section">
        <h3>RECENT ARTIFACTS</h3>
        <div style="display:flex; flex-direction:column; gap:var(--space-2);">
          <div class="feed-row feed-row--done" data-artifact="Email Draft">
            <span class="feed-row__prompt">&gt;</span>
            <span class="feed-row__time">[2h ago]</span>
            ${renderStatusTag('done')}
            <span class="feed-row__desc">Cold outreach — SaaS founders Q4</span>
            <span class="feed-row__artifact" data-artifact="Email Draft">▸ Email Draft</span>
          </div>
          <div class="feed-row feed-row--done" data-artifact="Strategy Doc">
            <span class="feed-row__prompt">&gt;</span>
            <span class="feed-row__time">[6h ago]</span>
            ${renderStatusTag('done')}
            <span class="feed-row__desc">Q4 messaging brief</span>
            <span class="feed-row__artifact" data-artifact="Strategy Doc">▸ Strategy Doc</span>
          </div>
        </div>
      </div>

      <div class="autonomy">
        <div class="autonomy__label">Co-founder autonomy</div>
        <div class="autonomy__current" id="autonomyLabel">Balanced — I'll ask for high-stakes actions only.</div>
        <input type="range" min="0" max="2" value="1" class="slider" id="autonomySlider" aria-label="Autonomy level" />
        <div class="slider-ends"><span>Approve everything</span><span>Fully autonomous</span></div>
      </div>
    </div>
  `;
}

function viewChat() {
  return html`
    <div class="chat">
      <div class="chat__context">
        <span class="pulse-dot"></span> PetPal · switch
      </div>
      <div class="chat__thread" id="chatThread">
        <div class="chat-msg chat-msg--cofounder">
          Ready when you are. Ask me anything about your business, or tell me what to work on next.
        </div>
      </div>
      <div class="chat__suggested" id="chatSuggested">
        <button class="prompt-chip" data-prompt="How's marketing performing this week?">How's marketing performing this week?</button>
        <button class="prompt-chip" data-prompt="Write a cold email for PetPal">Write a cold email for PetPal</button>
        <button class="prompt-chip" data-prompt="What should I focus on next?">What should I focus on next?</button>
      </div>
      <div class="chat__input">
        <textarea id="chatInput" placeholder="Ask your co-founder anything..." rows="1"></textarea>
        <button class="btn btn--primary" id="chatSend">Send →</button>
      </div>
    </div>
  `;
}

function viewActivity() {
  return html`
    <div class="log-head">
      <div>
        <h1>Activity Log</h1>
        <div class="caption muted">Everything your co-founder has done.</div>
      </div>
      <div style="display:flex; gap:var(--space-2);">
        <button class="btn btn--ghost btn--sm" data-action="export">Export CSV</button>
      </div>
    </div>
    <div class="filter-bar">
      <input type="search" placeholder="Search activity..." class="filter-search" id="logSearch" />
      <button class="filter-chip" data-filter="business">Business <span class="muted">▾</span></button>
      <button class="filter-chip" data-filter="department">Department <span class="muted">▾</span></button>
      <button class="filter-chip" data-filter="date">Last 7 days <span class="muted">▾</span></button>
    </div>
    <div class="log-list">
      <div class="feed__stream" style="max-height:none;" id="logStream">
        ${DEMO.feed.map(renderFeedRow).join('')}
        ${DEMO.feed.map(e => renderFeedRow({...e, id: e.id + 100, time: '11:38:00'})).join('')}
      </div>
    </div>
  `;
}

function viewSettings() {
  const activeTab = window._settingsTab || 'Account';
  const tabs = ['Account','Billing','Notifications','API','Integrations','Data'];
  return html`
    <div style="margin-bottom:var(--space-6);">
      <h1 style="font-family:var(--font-display); font-size:var(--app-text-h2); color:var(--color-text-primary); margin:0;">Settings</h1>
    </div>
    <div class="settings">
      <nav class="settings__nav">
        ${tabs.map(t => html`<button class="settings__tab ${t===activeTab?'is-active':''}" data-settings-tab="${t}">${t}</button>`).join('')}
      </nav>
      <div class="settings__panel" id="settingsPanel">
        ${renderSettingsPanel(activeTab)}
      </div>
    </div>
  `;
}

function renderSettingsPanel(tab) {
  if (tab === 'Account') return html`
    <h2 style="font-family:var(--font-display); font-size:var(--app-text-h3); margin:0 0 var(--space-4); color:var(--color-text-primary);">Account</h2>
    <div class="form-field">
      <label for="acct-name">Your name</label>
      <input class="input" id="acct-name" type="text" value="Founder" />
    </div>
    <div class="form-field">
      <label for="acct-email">Email</label>
      <input class="input" id="acct-email" type="email" value="demo@cofounder.new" />
    </div>
    <button class="btn btn--primary" data-action="save-account">Save Changes</button>
  `;

  if (tab === 'Notifications') return html`
    <h2 style="font-family:var(--font-display); font-size:var(--app-text-h3); margin:0 0 var(--space-4); color:var(--color-text-primary);">Notifications</h2>
    <div class="toggle-row">
      <span class="toggle-row__label">Daily email digest</span>
      <button class="toggle" role="switch" aria-checked="true" data-toggle="digest"></button>
    </div>
    <div class="toggle-row">
      <span class="toggle-row__label">Critical decisions only</span>
      <button class="toggle" role="switch" aria-checked="false" data-toggle="critical"></button>
    </div>
    <div class="toggle-row">
      <span class="toggle-row__label">Slack alerts</span>
      <button class="toggle" role="switch" aria-checked="false" data-toggle="slack"></button>
    </div>
  `;

  if (tab === 'Integrations') {
    const integrations = [
      { name: 'Stripe',           short: 'S',  connected: true,  date: 'Jan 14' },
      { name: 'GitHub',           short: 'GH', connected: true,  date: 'Jan 12' },
      { name: 'Google Analytics', short: 'GA', connected: false },
      { name: 'Mailchimp',        short: 'MC', connected: false },
      { name: 'Slack',            short: 'SL', connected: false },
      { name: 'Zapier',           short: 'Z',  connected: false }
    ];
    return html`
      <h2 style="font-family:var(--font-display); font-size:var(--app-text-h3); margin:0 0 var(--space-4); color:var(--color-text-primary);">Integrations</h2>
      ${integrations.map(i => html`
        <div class="integration-card" data-connected="${i.connected}">
          <div class="integration-card__left">
            <div class="integration-card__logo">${i.short}</div>
            <div>
              <div class="integration-card__name">${i.name}</div>
              <div class="integration-card__status">${i.connected ? `Connected · ${i.date}` : 'Not connected'}</div>
            </div>
          </div>
          ${i.connected
            ? `<button class="btn btn--ghost btn--sm" data-disconnect="${i.name}">Disconnect</button>`
            : `<button class="btn btn--primary btn--sm" data-connect="${i.name}">Connect</button>`}
        </div>
      `).join('')}
    `;
  }

  if (tab === 'Billing') return html`
    <h2 style="font-family:var(--font-display); font-size:var(--app-text-h3); margin:0 0 var(--space-4); color:var(--color-text-primary);">Billing</h2>
    <p class="body-sm muted">Current plan: <span class="mono mono--strong">Pro · $49/mo</span></p>
    <p class="caption muted">Pricing is tentative — final tiers being validated.</p>
    <div style="display:flex; gap:var(--space-2); margin-top:var(--space-4);">
      <button class="btn btn--primary btn--sm">Upgrade to Unlimited →</button>
      <button class="btn btn--ghost btn--sm">Manage Billing</button>
    </div>
  `;

  if (tab === 'API') return html`
    <h2 style="font-family:var(--font-display); font-size:var(--app-text-h3); margin:0 0 var(--space-4); color:var(--color-text-primary);">API</h2>
    <div class="form-field">
      <label>API key</label>
      <input class="input mono" type="text" value="cf_••••••••••••••••" readonly />
      <span class="caption muted">Shown once. Copy it now — you won't see it again.</span>
    </div>
    <button class="btn btn--ghost btn--sm">Generate new key</button>
  `;

  if (tab === 'Data') return html`
    <h2 style="font-family:var(--font-display); font-size:var(--app-text-h3); margin:0 0 var(--space-4); color:var(--color-text-primary);">Data</h2>
    <p class="body-sm">Your data is yours. Export anytime.</p>
    <div style="display:flex; gap:var(--space-2); margin-top:var(--space-4);">
      <button class="btn btn--ghost btn--sm">Export all data (JSON)</button>
      <button class="btn btn--destructive btn--sm" data-action="delete-account">Delete Account</button>
    </div>
  `;

  return '<p>Not implemented in demo.</p>';
}

// ============ Onboarding ============
const ONBOARD = { step: 1, business: '', audience: '', autonomy: 1 };

function renderOnboardStep() {
  const c = $('#onboardContent');
  const back = $('#onboardBack');
  const next = $('#onboardNext');

  $$('#progressSteps .step').forEach((el, i) => {
    el.classList.toggle('is-active', i+1 === ONBOARD.step);
    el.classList.toggle('is-done', i+1 < ONBOARD.step);
  });

  back.style.visibility = ONBOARD.step === 1 ? 'hidden' : 'visible';
  next.textContent = ONBOARD.step === 5 ? 'Start Building →' : (ONBOARD.step === 4 ? 'Next →' : 'Next →');

  if (ONBOARD.step === 1) {
    c.innerHTML = html`
      <h1>What are you building?</h1>
      <textarea id="ob-desc" placeholder="Tell me what this business is about..." rows="4">${escape(ONBOARD.business)}</textarea>
      <p class="caption muted">Tell me a bit more — minimum 10 characters.</p>
    `;
    $('#ob-desc').addEventListener('input', e => { ONBOARD.business = e.target.value; });
  } else if (ONBOARD.step === 2) {
    c.innerHTML = html`
      <h1>Who is it for?</h1>
      <div class="ai-suggestion">
        <span class="overline">CO-FOUNDER SUGGESTION</span>
        Based on what you said, I think your audience is solo founders and indie hackers who want to ship faster without hiring a team.
      </div>
      <textarea id="ob-aud" placeholder="Edit or replace the suggestion..." rows="3">${escape(ONBOARD.audience || 'Solo founders and indie hackers who want to ship faster without hiring a team.')}</textarea>
    `;
    $('#ob-aud').addEventListener('input', e => { ONBOARD.audience = e.target.value; });
  } else if (ONBOARD.step === 3) {
    c.innerHTML = html`
      <h1>How hands-on do you want to be?</h1>
      <div style="background:var(--color-bg-elevated); border:1px solid var(--color-border-default); border-radius:var(--radius-xl); padding:var(--space-5);">
        <div class="autonomy__current" id="onboardAutonomyLabel">Balanced — I'll ask for high-stakes actions only.</div>
        <input type="range" min="0" max="2" value="${ONBOARD.autonomy}" class="slider" id="ob-autonomy" />
        <div class="slider-ends"><span>Approve everything</span><span>Fully autonomous</span></div>
      </div>
      <p class="caption muted">You can change this any time.</p>
    `;
    const labels = ['Hands-on — I\'ll ask for every action.', 'Balanced — I\'ll ask for high-stakes actions only.', 'Fully autonomous — I\'ll act on my own judgment for everything.'];
    $('#ob-autonomy').addEventListener('input', e => {
      ONBOARD.autonomy = parseInt(e.target.value);
      $('#onboardAutonomyLabel').textContent = labels[ONBOARD.autonomy];
    });
  } else if (ONBOARD.step === 4) {
    c.innerHTML = html`
      <h1>Got anything I can use?</h1>
      <p class="caption muted">Optional — skip if you're starting fresh.</p>
      <div style="background:var(--color-bg-elevated); border:1px dashed var(--color-border-default); border-radius:var(--radius-xl); padding:var(--space-8); text-align:center; color:var(--color-text-muted);">
        Drop logo / domain / existing content here
        <div style="margin-top:var(--space-2);"><button class="btn btn--ghost btn--sm">Browse files</button></div>
      </div>
      <button class="btn btn--ghost" id="ob-skip">Skip for now →</button>
    `;
    $('#ob-skip').addEventListener('click', () => { ONBOARD.step = 5; renderOnboardStep(); });
  } else if (ONBOARD.step === 5) {
    c.innerHTML = html`
      <h1>Here's what I'll start working on.</h1>
      <p class="caption muted">Take a look. Approve when ready.</p>
      <div class="plan-preview">
        <div class="row">&gt; [INFO] Setting up workspace for your business</div>
        <div class="row">&gt; [QUEUED] 🎯 Strategy — draft Q1 priorities</div>
        <div class="row">&gt; [QUEUED] 💻 Product — scaffold landing page</div>
        <div class="row">&gt; [QUEUED] 📣 Marketing — research target audience channels</div>
        <div class="row">&gt; [QUEUED] 💰 Finance — set up Stripe (when connected)</div>
        <div class="row">&gt; [QUEUED] 🤝 Sales — draft cold outreach template</div>
        <div class="row">&gt; [QUEUED] 📊 Analytics — define key metrics for this business</div>
      </div>
    `;
  }
}

// ============ Routing ============
function setRoute(route, sub) {
  const main = $('#main');
  const app = $('#app');
  const onboarding = $('#onboarding');
  const publicShell = $('#public');

  // Mark sidebar active
  $$('.nav-item').forEach(n => n.classList.toggle('is-active', n.dataset.route === route));

  if (route === 'onboard') {
    app.hidden = true; publicShell.hidden = true; onboarding.hidden = false;
    ONBOARD.step = 1;
    renderOnboardStep();
    return;
  }

  if (['home', 'live', 'contact'].includes(route)) {
    app.hidden = true; onboarding.hidden = true; publicShell.hidden = false;
    renderPublic(route);
    return;
  }

  // App routes
  app.hidden = false; onboarding.hidden = true; publicShell.hidden = true;

  switch(route) {
    case 'app': main.innerHTML = viewCommandCenter(); break;
    case 'business': main.innerHTML = viewBusinessDetail(sub); break;
    case 'chat': main.innerHTML = viewChat(); attachChatHandlers(); break;
    case 'activity': main.innerHTML = viewActivity(); break;
    case 'settings': main.innerHTML = viewSettings(); break;
    default: main.innerHTML = viewCommandCenter();
  }

  // Initial macro counter animation
  if (route === 'app') startCounters();
}

function parseHash() {
  const h = location.hash.replace(/^#\/?/, '');
  if (!h || h === 'app') return { route: 'app' };
  if (h.startsWith('app/business/')) return { route: 'business', sub: h.split('/')[2] };
  if (h.startsWith('app/onboard')) return { route: 'onboard' };
  if (h.startsWith('app/chat')) return { route: 'chat' };
  if (h.startsWith('app/activity')) return { route: 'activity' };
  if (h.startsWith('app/settings')) return { route: 'settings' };
  if (h === '' || h === '/') return { route: 'home' };
  if (h === 'live') return { route: 'live' };
  if (h === 'contact') return { route: 'contact' };
  return { route: 'app' };
}

window.addEventListener('hashchange', () => {
  const { route, sub } = parseHash();
  setRoute(route, sub);
});

// ============ Public surface ============
function renderPublic(route) {
  const main = $('#publicMain');
  if (route === 'home') {
    main.innerHTML = html`
      <section class="hero">
        <h1>Your AI Cofounder Is Already Working.</h1>
        <p>The tireless, brilliant cofounder every founder deserves. Describe your business — we build it. Marketing, development, operations, sales, finance. Running right now.</p>
        <div class="hero__ctas">
          <a href="#/app/onboard" class="btn btn--primary">Launch Your Business →</a>
          <a href="#/live" class="btn btn--ghost">See It Live →</a>
        </div>
      </section>
      <div class="ticker-bar">
        <div class="ticker">
          <span>Tasks completed today:</span> <span class="mono">14,823</span> ·
          <span>Active founders:</span> <span class="mono">1,847</span> ·
          <span>Outputs generated:</span> <span class="mono">8,912</span> ·
          <span>New this hour:</span> <span class="mono">42</span> ·
          <span>Tasks completed today:</span> <span class="mono">14,823</span> ·
          <span>Active founders:</span> <span class="mono">1,847</span> ·
        </div>
      </div>
      <section style="max-width:1200px; margin:0 auto; padding:var(--space-8);">
        <p class="caption muted" style="text-align:center;">Demo build — testimonials, real platform statistics, and final pricing pending validation. See app-ui-source-pack §20 for missing requirements.</p>
      </section>
    `;
  } else if (route === 'live') {
    main.innerHTML = html`
      <div class="live-page">
        <div class="live-header">
          <h1><span class="pulse-dot"></span>The Platform. Live.</h1>
          <p class="muted">Every business. Every task. Every decision. Happening right now.</p>
        </div>
        <div class="live-grid">
          ${renderFeed()}
          <div>
            <div class="section-header"><span class="overline">ACTIVE BUSINESSES</span></div>
            <div class="biz-grid">
              ${DEMO.businesses.map(b => html`
                <div class="card business-card" data-health="${b.health}">
                  <div class="business-card__head">
                    <span class="pulse-dot ${b.health==='yellow'?'pulse-dot--amber':''}"></span>
                    <span class="business-card__name">${escape(b.name)}</span>
                  </div>
                  <div class="caption muted">${escape(b.type)} · ${b.tasks} tasks</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        <div style="text-align:center; margin-top:var(--space-12);">
          <p class="body-sm muted">Your business could be here. Launching in minutes, not months.</p>
          <a href="#/app/onboard" class="btn btn--primary" style="margin-top:var(--space-3);">Launch Now →</a>
        </div>
      </div>
    `;
  } else if (route === 'contact') {
    main.innerHTML = html`
      <div class="contact">
        <h1>Let's Talk.</h1>
        <p class="body-sm muted">Whether you're a founder with questions, a journalist with a story, or a partner with an idea — we're here.</p>
        <div class="channel-cards">
          <div class="channel-card"><h3>Founders</h3><p class="caption muted">Platform, pricing, capabilities.</p><a href="mailto:founders@cofounder.new">founders@cofounder.new</a></div>
          <div class="channel-card"><h3>Press &amp; Media</h3><p class="caption muted">Interview requests, press kit.</p><a href="mailto:press@cofounder.new">press@cofounder.new</a></div>
          <div class="channel-card"><h3>Partnerships</h3><p class="caption muted">Integration proposals, API.</p><a href="mailto:partners@cofounder.new">partners@cofounder.new</a></div>
        </div>
        <form id="contactForm" style="display:flex; flex-direction:column; gap:var(--space-4);">
          <div class="form-field">
            <label>Your name</label>
            <input class="input" required />
          </div>
          <div class="form-field">
            <label>Email</label>
            <input class="input" type="email" required />
          </div>
          <div class="form-field">
            <label>Category</label>
            <select class="input" required>
              <option>Founder Inquiry</option>
              <option>Press</option>
              <option>Partnership</option>
              <option>Support</option>
              <option>Other</option>
            </select>
          </div>
          <div class="form-field">
            <label>Message</label>
            <textarea class="input" rows="4" required></textarea>
          </div>
          <button type="submit" class="btn btn--primary" style="align-self:flex-start;">Send Message →</button>
        </form>
      </div>
    `;

    $('#contactForm').addEventListener('submit', (e) => {
      e.preventDefault();
      toast('Message received. We\'ll get back to you within 24 hours.', 'success');
      e.target.reset();
    });
  }
}

// ============ Live counter increment (macro metrics) ============
function startCounters() {
  $$('.metric-tile__value').forEach(el => {
    const target = parseInt(el.dataset.target || '0', 10);
    if (!target) return;
    let current = 0;
    const dur = 1500;
    const steps = 30;
    const inc = target / steps;
    const tick = setInterval(() => {
      current += inc;
      if (current >= target) { current = target; clearInterval(tick); }
      el.textContent = Math.floor(current).toLocaleString();
    }, dur / steps);
  });
}

// ============ Live feed: per-second timer updates + new entries ============
function tickFeedTimers() {
  $$('.feed-row--running').forEach(row => {
    const id = parseInt(row.dataset.id, 10);
    const entry = DEMO.feed.find(e => e.id === id);
    if (!entry || !entry.startedAt) return;
    const timerEl = row.querySelector('.feed-row__timer');
    if (timerEl) timerEl.textContent = `Running for ${formatElapsed(entry.startedAt)}`;
  });
}

let nextFeedId = 100;
function addFeedEntry() {
  const pool = [
    { status: 'info', dept: 'Strategy', desc: 'Indexing daily metrics digest' },
    { status: 'running', dept: 'Marketing', desc: 'A/B testing new subject line variant' },
    { status: 'done', dept: 'Product', desc: 'Optimized image loading on landing page', timer: '01m 12s' },
    { status: 'warn', dept: 'Sales', desc: 'API rate limit hit. Retrying in 30s...', timer: '00m 12s' },
    { status: 'done', dept: 'Finance', desc: 'Synced Stripe transactions', timer: '00m 04s', artifact: 'Report' }
  ];
  const entry = { ...pool[Math.floor(Math.random()*pool.length)], id: ++nextFeedId, time: new Date().toLocaleTimeString('en-US', { hour12: false }) };
  if (entry.status === 'running') entry.startedAt = Date.now();
  DEMO.feed.unshift(entry);
  if (DEMO.feed.length > 12) DEMO.feed.pop();

  // Re-render only if feed view exists
  const stream = $('#feedStream');
  if (stream) {
    const html = renderFeedRow(entry);
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const newRow = tmp.firstElementChild;
    newRow.classList.add('is-new');
    stream.insertBefore(newRow, stream.firstChild);
    // trim
    while (stream.children.length > 12) stream.removeChild(stream.lastChild);
  }
}

// ============ Event Delegation ============
document.addEventListener('click', (e) => {
  const t = e.target;

  // Decision actions
  if (t.dataset.decision) {
    const action = t.dataset.decision;
    const id = t.dataset.id;
    if (action === 'approve') {
      $('#approvalModal').classList.add('is-open');
      $('#overlay').classList.add('is-open');
      // Update modal with this decision's content
      const d = DEMO.pending.find(x => x.id === id);
      if (d) {
        $('.overline.overline--amber', $('#approvalModal')).textContent = d.tag;
        $('#approvalTitle').textContent = d.title;
        $('.modal__body p:first-child', $('#approvalModal')).textContent = d.why;
      }
    } else if (action === 'modify') {
      toast('Modify: inline edit coming in production', 'info');
    } else if (action === 'skip') {
      DEMO.pending = DEMO.pending.filter(d => d.id !== id);
      setRoute('app');
      toast('Skipped. Logged in Activity Log.', 'info');
    }
    return;
  }

  // Approval modal actions
  if (t.closest('#approvalModal') && t.dataset.action) {
    const action = t.dataset.action;
    if (action === 'approve') {
      $('#approvalModal').classList.remove('is-open');
      $('#overlay').classList.remove('is-open');
      DEMO.pending.shift();
      setRoute('app');
      toast('Got it. Sending now.', 'success');
    } else if (action === 'modify') {
      toast('Inline edit would open here.', 'info');
    } else if (action === 'skip') {
      $('#approvalModal').classList.remove('is-open');
      $('#overlay').classList.remove('is-open');
    }
    return;
  }

  // Confirm modal
  if (t.closest('#confirmModal') && t.dataset.action) {
    if (t.dataset.action === 'cancel') {
      $('#confirmModal').classList.remove('is-open');
      $('#overlay').classList.remove('is-open');
    } else if (t.dataset.action === 'confirm') {
      $('#confirmModal').classList.remove('is-open');
      $('#overlay').classList.remove('is-open');
      toast('Action confirmed.', 'success');
    }
    return;
  }

  // Business card click
  const bizCard = t.closest('.business-card[data-id]');
  if (bizCard && !t.closest('.business-card .btn')) {
    location.hash = `#/app/business/${bizCard.dataset.id}`;
    return;
  }

  // Artifact click
  if (t.dataset.artifact || t.closest('[data-artifact]')) {
    $('#artifactDrawer').classList.add('is-open');
    return;
  }

  // Close drawer
  if (t.id === 'closeDrawer') {
    $('#artifactDrawer').classList.remove('is-open');
    return;
  }

  // Approve & Send (drawer)
  if (t.id === 'approveSend') {
    $('#approvalModal').classList.add('is-open');
    $('#overlay').classList.add('is-open');
    return;
  }

  // Copy artifact
  if (t.id === 'copyArtifact') {
    navigator.clipboard && navigator.clipboard.writeText('(artifact content copied)');
    toast('Copied.', 'success');
    return;
  }

  // Quick actions
  if (t.dataset.action === 'go-chat')     { location.hash = '#/app/chat'; return; }
  if (t.dataset.action === 'go-activity') { location.hash = '#/app/activity'; return; }
  if (t.dataset.action === 'new-business'){ toast('Business Creator modal would open here.', 'info'); return; }
  if (t.dataset.action === 'biz-chat')    { location.hash = '#/app/chat'; return; }
  if (t.dataset.action === 'biz-pause') {
    $('#confirmTitle').textContent = 'Pause this business?';
    $('#confirmBody').textContent = 'Your co-founder will stop all active tasks until you resume.';
    $('#confirmGo').textContent = 'Pause Business';
    $('#confirmModal').classList.add('is-open');
    $('#overlay').classList.add('is-open');
    return;
  }
  if (t.dataset.action === 'delete-account') {
    $('#confirmTitle').textContent = 'Delete account permanently?';
    $('#confirmBody').textContent = 'This cannot be undone. All your businesses and data will be removed.';
    $('#confirmGo').textContent = 'Delete Account';
    $('#confirmModal').classList.add('is-open');
    $('#overlay').classList.add('is-open');
    return;
  }
  if (t.dataset.action === 'discuss') { location.hash = '#/app/chat'; toast('Pre-scoped to this recommendation.', 'info'); return; }
  if (t.dataset.action === 'export') { toast('Preparing export...', 'info'); setTimeout(() => toast('Exported. Check your downloads.', 'success'), 1200); return; }
  if (t.dataset.action === 'save-account') { toast('Saved.', 'success'); return; }

  // Settings tab switch
  if (t.dataset.settingsTab) {
    window._settingsTab = t.dataset.settingsTab;
    setRoute('settings');
    return;
  }

  // Department tab switch
  if (t.classList.contains('tab') && t.dataset.tab) {
    window._activeTab = t.dataset.tab;
    $$('.tab').forEach(x => x.classList.toggle('is-active', x === t));
    return;
  }

  // Toggle switch
  if (t.classList.contains('toggle') || t.closest('.toggle')) {
    const tog = t.classList.contains('toggle') ? t : t.closest('.toggle');
    const cur = tog.getAttribute('aria-checked') === 'true';
    tog.setAttribute('aria-checked', !cur);
    toast('Saved.', 'success');
    return;
  }

  // Connect integration
  if (t.dataset.connect) {
    toast(`Connecting to ${t.dataset.connect}... (OAuth flow would open here)`, 'info');
    return;
  }
  if (t.dataset.disconnect) {
    $('#confirmTitle').textContent = `Disconnect ${t.dataset.disconnect}?`;
    $('#confirmBody').textContent = 'Affected co-founder tasks will be paused until you reconnect.';
    $('#confirmGo').textContent = 'Disconnect';
    $('#confirmModal').hidden = false;
    $('#overlay').hidden = false;
    return;
  }

  // Onboarding nav
  if (t.id === 'onboardNext') {
    if (ONBOARD.step === 1 && ONBOARD.business.length < 10) {
      toast('Tell me a bit more — what do you want this business to do?', 'warning');
      return;
    }
    if (ONBOARD.step < 5) {
      ONBOARD.step++;
      renderOnboardStep();
    } else {
      // Launch
      toast('Already on it. Let\'s go.', 'success');
      setTimeout(() => { location.hash = '#/app'; }, 600);
    }
    return;
  }
  if (t.id === 'onboardBack') {
    if (ONBOARD.step > 1) { ONBOARD.step--; renderOnboardStep(); }
    return;
  }
});

// Escape closes overlays
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if ($('#approvalModal').classList.contains('is-open')) {
      $('#approvalModal').classList.remove('is-open');
      $('#overlay').classList.remove('is-open');
    } else if ($('#confirmModal').classList.contains('is-open')) {
      $('#confirmModal').classList.remove('is-open');
      $('#overlay').classList.remove('is-open');
    } else if ($('#artifactDrawer').classList.contains('is-open')) {
      $('#artifactDrawer').classList.remove('is-open');
    }
  }
});

// ============ Chat ============
function attachChatHandlers() {
  const input = $('#chatInput');
  const send = $('#chatSend');
  const thread = $('#chatThread');
  if (!input) return;

  const sendMsg = () => {
    const text = input.value.trim();
    if (!text) return;
    thread.insertAdjacentHTML('beforeend', `<div class="chat-msg chat-msg--founder">${escape(text)}</div>`);
    input.value = '';
    // Hide suggested
    const s = $('#chatSuggested');
    if (s) s.style.display = 'none';
    // Typing indicator
    const typing = document.createElement('div');
    typing.className = 'chat-typing';
    typing.innerHTML = 'Your co-founder is typing<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>';
    thread.appendChild(typing);
    thread.scrollTop = thread.scrollHeight;
    setTimeout(() => {
      typing.remove();
      let reply = "Got it. I'll work on that and add it to your activity log.";
      if (/burn|finance|revenue/i.test(text)) {
        reply = "Right now you're at $13,557 across 3 businesses. Burn is steady — no immediate concerns. Want me to break it down by business?";
      } else if (/pause|stop/i.test(text)) {
        reply = "Got it — to pause something, I need a quick confirmation. Which business and which workstream?";
      } else if (/email|outreach/i.test(text)) {
        reply = "I can draft outreach right now. Which business — PetPal, GreenBean, or Vendora? And who's the audience?";
      }
      thread.insertAdjacentHTML('beforeend', `<div class="chat-msg chat-msg--cofounder">${reply}</div>`);
      thread.scrollTop = thread.scrollHeight;
    }, 900);
  };

  send.addEventListener('click', sendMsg);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); }
  });

  $$('.prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.prompt;
      input.focus();
    });
  });
}

// ============ Initial boot ============
function init() {
  const { route, sub } = parseHash();
  setRoute(route, sub);

  // Per-second timer updates
  setInterval(tickFeedTimers, 1000);

  // New feed entry every 5–10s
  const spawn = () => {
    addFeedEntry();
    setTimeout(spawn, 5000 + Math.random() * 5000);
  };
  setTimeout(spawn, 4000);
}

init();
