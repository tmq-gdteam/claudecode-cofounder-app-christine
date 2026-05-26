/* =========================================================
   cofounder.new — Reusable Component Library
   Pure factory functions returning HTML strings.
   Each component honors the design tokens in styles.css.
   Source of truth: app-ui-source-pack.md §9, §10, §17
   ========================================================= */

(function (global) {
  'use strict';

  // ============ Utilities ============
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const cx = (...classes) => classes.filter(Boolean).join(' ');

  const h = (strings, ...values) =>
    strings.reduce((acc, s, i) => acc + s + (values[i] !== undefined ? values[i] : ''), '');

  function formatElapsed(startedAt) {
    const ms = Date.now() - startedAt;
    const s = Math.floor(ms / 1000);
    const hh = Math.floor(s / 3600);
    const mm = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    if (hh > 0) return `${String(hh).padStart(2,'0')}h ${String(mm).padStart(2,'0')}m ${String(ss).padStart(2,'0')}s`;
    return `${String(mm).padStart(2,'0')}m ${String(ss).padStart(2,'0')}s`;
  }

  // ============ Primitives ============

  /** Button — Source pack §17 component tokens */
  function Button({ label, variant = 'ghost', size = 'md', dataset = {}, icon = '', disabled = false, ariaLabel = '' }) {
    const cls = cx('btn', `btn--${variant}`, size === 'sm' && 'btn--sm');
    const data = Object.entries(dataset).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ');
    const aria = ariaLabel ? ` aria-label="${esc(ariaLabel)}"` : '';
    return `<button class="${cls}" ${disabled ? 'disabled' : ''} ${data}${aria}>${icon}${esc(label)}</button>`;
  }

  /** Overline label — small mono UPPERCASE text */
  function Overline({ text, tone = '' }) {
    const cls = cx('overline', tone && `overline--${tone}`);
    return `<span class="${cls}">${esc(text)}</span>`;
  }

  /** Section header with optional badge count and action */
  function SectionHeader({ title, count = null, action = null }) {
    const badge = count !== null ? ` <span class="badge badge--amber">${count}</span>` : '';
    const act = action ? `<a class="section-header__action">${esc(action)}</a>` : '';
    return `
      <div class="section-header">
        ${Overline({ text: title })}${badge}
        ${act}
      </div>`;
  }

  /** Status tag — monospace UPPERCASE in hard brackets */
  function StatusTag(status) {
    const labels = {
      running: 'RUNNING', done: 'DONE', warn: 'WARN', retry: 'RETRY',
      blocked: 'BLOCKED', info: 'INFO', sent: 'SENT', skipped: 'SKIPPED'
    };
    const label = labels[status] || 'INFO';
    return `<span class="status-tag status-tag--${status}" aria-label="Status: ${label}">[${label}]</span>`;
  }

  /** WoW velocity badge — arrow + percentage + direction color */
  function WoWBadge({ wow, dir = 'up' }) {
    const arrow = dir === 'up' ? '↑' : dir === 'down' ? '↓' : '—';
    return `<span class="wow-badge wow-badge--${dir}" aria-label="${dir === 'up' ? 'Up' : dir === 'down' ? 'Down' : 'Flat'} ${esc(wow)} week over week">${arrow} ${esc(wow)} WoW</span>`;
  }

  /** Live Pulse Indicator */
  function PulseDot({ tone = '' } = {}) {
    const cls = cx('pulse-dot', tone === 'amber' && 'pulse-dot--amber', tone === 'red' && 'pulse-dot--red', tone === 'idle' && 'pulse-dot--idle');
    return `<span class="${cls}" aria-hidden="true"></span>`;
  }

  /** Health Score Badge */
  function HealthBadge({ state }) {
    const labels = { green: 'Healthy', yellow: 'Attention needed', red: 'Action required' };
    return `<span class="health-badge health-badge--${state}" aria-label="Business health: ${labels[state]}"><span class="health-badge__dot"></span>${labels[state]}</span>`;
  }

  /** Sparkline (SVG) — single line, no axes, color = direction */
  function Sparkline({ data, dir = 'up' }) {
    const w = 100, hh = 24;
    const min = Math.min(...data), max = Math.max(...data);
    const range = (max - min) || 1;
    const step = w / (data.length - 1);
    const points = data.map((v, i) => `${i*step},${hh - ((v - min) / range) * (hh - 4) - 2}`).join(' ');
    const color = dir === 'up' ? 'var(--color-accent-green)' : dir === 'down' ? 'var(--color-accent-red)' : 'var(--color-text-muted)';
    return `<svg class="sparkline" viewBox="0 0 ${w} ${hh}" preserveAspectRatio="none" width="100%" aria-hidden="true"><polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.5" /></svg>`;
  }

  // ============ Metrics ============

  /** Metric Tile — single value + label + WoW badge */
  function MetricTile({ label, value, wow, dir = 'up', target = null }) {
    const targetAttr = target !== null ? ` data-target="${target}"` : '';
    return `
      <div class="metric-tile">
        <div class="metric-tile__label">${esc(label)}</div>
        <div class="metric-tile__value"${targetAttr}>${esc(value)}</div>
        ${WoWBadge({ wow, dir })}
      </div>`;
  }

  /** Macro Metrics Bar — 4–6 platform-wide stats */
  function MacroMetricsBar(metrics) {
    return `
      <div class="metrics-bar" aria-label="Platform metrics (demo data)">
        ${metrics.map(m => MetricTile({
          label: m.label,
          value: (m.value ?? 0).toLocaleString(),
          target: m.target,
          wow: m.wow,
          dir: m.dir
        })).join('')}
      </div>`;
  }

  // ============ Feed ============

  /** Live Feed Entry — monospace row */
  function FeedRow(entry) {
    const timer = entry.status === 'running' && entry.startedAt
      ? `<span class="feed-row__timer mono">Running for ${formatElapsed(entry.startedAt)}</span>`
      : (entry.timer ? `<span class="feed-row__timer mono">${esc(entry.timer)}</span>` : '');
    const artifact = entry.artifact
      ? `<span class="feed-row__artifact" data-artifact="${esc(entry.artifact)}" role="button" tabindex="0" aria-label="Open ${esc(entry.artifact)} artifact">▸ ${esc(entry.artifact)}</span>`
      : '';
    return h`
      <div class="feed-row feed-row--${entry.status}" data-id="${entry.id}" role="listitem">
        <span class="feed-row__prompt">&gt;</span>
        <span class="feed-row__time">[${esc(entry.time)}]</span>
        ${StatusTag(entry.status)}
        <span class="feed-row__desc">${esc(entry.desc)}</span>
        <span>${timer}${artifact}</span>
      </div>`;
  }

  /** Live Feed Stream — full feed container */
  function FeedStream({ id = 'feedStream', label = 'LIVE CO-FOUNDER FEED', entries, count = null }) {
    return `
      <div class="feed" aria-label="Live co-founder activity feed">
        <div class="feed__header">
          <div class="cluster gap-2">
            ${PulseDot()}
            ${Overline({ text: label })}
          </div>
          <span class="caption mono">${count ?? entries.length} entries</span>
        </div>
        <div class="feed__stream" id="${id}" role="log" aria-live="polite">
          ${entries.map(FeedRow).join('')}
        </div>
      </div>`;
  }

  // ============ Cards ============

  /** Generic Card wrapper */
  function Card({ children, variant = '', dataset = {}, role = '', tabindex = null, ariaLabel = '' }) {
    const cls = cx('card', variant && `card--${variant}`);
    const data = Object.entries(dataset).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ');
    const r = role ? ` role="${role}"` : '';
    const ti = tabindex !== null ? ` tabindex="${tabindex}"` : '';
    const al = ariaLabel ? ` aria-label="${esc(ariaLabel)}"` : '';
    return `<div class="${cls}" ${data}${r}${ti}${al}>${children}</div>`;
  }

  /** Pending Decision Card */
  function PendingDecisionCard({ id, tag, title, why }) {
    const actions = `
      <div class="decision-card__actions cluster gap-2">
        ${Button({ label: 'Approve →', variant: 'primary', size: 'sm', dataset: { decision: 'approve', id } })}
        ${Button({ label: 'Modify', variant: 'ghost', size: 'sm', dataset: { decision: 'modify', id } })}
        ${Button({ label: 'Skip this time', variant: 'ghost', size: 'sm', dataset: { decision: 'skip', id } })}
      </div>`;
    return `
      <div class="card decision-card" data-id="${esc(id)}">
        ${Overline({ text: tag, tone: 'amber' })}
        <h3 class="decision-card__title">${esc(title)}</h3>
        <p class="decision-card__why muted">${esc(why)}</p>
        ${actions}
      </div>`;
  }

  /** Business Card */
  function BusinessCard(b) {
    const healthTone = b.health === 'yellow' ? 'amber' : b.health === 'red' ? 'red' : '';
    return `
      <div class="card business-card" data-health="${esc(b.health)}" data-id="${esc(b.id)}" role="link" tabindex="0" aria-label="${esc(b.name)} — ${b.health} health, ${b.tasks} tasks running">
        <div class="business-card__head cluster gap-2">
          ${PulseDot({ tone: healthTone })}
          <span class="business-card__name">${esc(b.name)}</span>
          ${Overline({ text: b.type })}
        </div>
        <div class="business-card__meta">
          <span class="business-card__revenue">${esc(b.revenue)}</span>
          ${HealthBadge({ state: b.health })}
        </div>
        <div class="business-card__sparkline">${Sparkline({ data: b.sparkdata, dir: b.dir })}</div>
        <div class="business-card__footer caption">
          ${WoWBadge({ wow: b.wow, dir: b.dir })} · ${b.tasks} tasks · ${esc(b.last)}
        </div>
      </div>`;
  }

  /** AI Recommendation Card */
  function RecommendationCard({ intro, body, data, variant = 'growth' }) {
    return `
      <div class="recommendation recommendation--${variant}">
        <div class="recommendation__intro">▸ ${esc(intro)}</div>
        <div class="recommendation__body">${esc(body)}</div>
        ${data ? `<div class="recommendation__data">${esc(data)}</div>` : ''}
        <div class="recommendation__actions cluster gap-2">
          ${Button({ label: 'Accept', variant: 'primary', size: 'sm', dataset: { reco: 'accept' } })}
          ${Button({ label: 'Dismiss', variant: 'ghost', size: 'sm', dataset: { reco: 'dismiss' } })}
          ${Button({ label: 'Discuss', variant: 'ghost', size: 'sm', dataset: { action: 'discuss' } })}
        </div>
      </div>`;
  }

  /** Integration Card */
  function IntegrationCard({ name, short, connected, date }) {
    const actionBtn = connected
      ? Button({ label: 'Disconnect', variant: 'ghost', size: 'sm', dataset: { disconnect: name } })
      : Button({ label: 'Connect', variant: 'primary', size: 'sm', dataset: { connect: name } });
    return `
      <div class="integration-card" data-connected="${connected}">
        <div class="integration-card__left">
          <div class="integration-card__logo" aria-hidden="true">${esc(short)}</div>
          <div>
            <div class="integration-card__name">${esc(name)}</div>
            <div class="integration-card__status">${connected ? `Connected · ${esc(date)}` : 'Not connected'}</div>
          </div>
        </div>
        ${actionBtn}
      </div>`;
  }

  // ============ Lists / Highlights ============

  /** Highlight item */
  function HighlightItem({ type, text }) {
    const marker = type === 'warn' ? '⚠' : type === 'win' ? '✓' : '▸';
    return `
      <div class="highlight ${type === 'warn' ? 'highlight--warn' : ''}">
        <span class="highlight__marker">${marker}</span>
        <span>${esc(text)}</span>
      </div>`;
  }

  function HighlightsList(items) {
    return `<div class="stack gap-2">${items.map(HighlightItem).join('')}</div>`;
  }

  /** Queue item — mono single-line */
  function QueueItem(text) {
    return `<div class="queue-item">▸ ${esc(text)}</div>`;
  }

  function QueueList(items) {
    return `<div class="stack gap-2">${items.map(QueueItem).join('')}</div>`;
  }

  // ============ Forms / Inputs ============

  /** Form Field — label + input + helper/error */
  function FormField({ id, label, type = 'text', value = '', placeholder = '', helper = '', error = '', readonly = false, required = false }) {
    const errClass = error ? 'input--error' : '';
    return `
      <div class="form-field">
        <label for="${esc(id)}">${esc(label)}${required ? ' <span aria-label="required" class="required-marker">*</span>' : ''}</label>
        <input class="input ${errClass}" id="${esc(id)}" type="${esc(type)}" value="${esc(value)}" placeholder="${esc(placeholder)}" ${readonly ? 'readonly' : ''} ${required ? 'required' : ''} ${error ? `aria-invalid="true" aria-describedby="${id}-err"` : ''} />
        ${error ? `<span class="caption" id="${id}-err" style="color:var(--color-accent-red);">${esc(error)}</span>` : (helper ? `<span class="caption muted">${esc(helper)}</span>` : '')}
      </div>`;
  }

  /** Toggle Switch row */
  function ToggleRow({ label, checked = false, id }) {
    return `
      <div class="toggle-row">
        <span class="toggle-row__label">${esc(label)}</span>
        <button class="toggle" role="switch" aria-checked="${checked}" data-toggle="${esc(id)}" aria-label="${esc(label)}"></button>
      </div>`;
  }

  /** Autonomy Slider */
  function AutonomySlider({ value = 1, id = 'autonomySlider', label = 'Co-founder autonomy', currentText = "Balanced — I'll ask for high-stakes actions only." }) {
    return `
      <div class="autonomy">
        <div class="autonomy__label">${esc(label)}</div>
        <div class="autonomy__current" id="${esc(id)}Label">${esc(currentText)}</div>
        <input type="range" min="0" max="2" value="${value}" class="slider" id="${esc(id)}" aria-label="${esc(label)}" />
        <div class="slider-ends"><span>Approve everything</span><span>Fully autonomous</span></div>
      </div>`;
  }

  // ============ State components ============

  /** Empty State */
  function EmptyState({ title, sub = '', cta = null, symbol = null }) {
    const sym = symbol ? `<div class="empty-state__symbol">${esc(symbol)}</div>` : '';
    const ctaBtn = cta ? Button({ label: cta.label, variant: 'primary', dataset: cta.dataset || {} }) : '';
    return `
      <div class="empty-state">
        ${sym}
        <h3 class="empty-state__title">${esc(title)}</h3>
        ${sub ? `<p class="empty-state__sub">${esc(sub)}</p>` : ''}
        ${ctaBtn}
      </div>`;
  }

  /** Skeleton Loader */
  function Skeleton({ variant = 'row', count = 1 }) {
    const item = `<div class="skeleton skeleton--${variant}" aria-hidden="true"></div>`;
    return `<div class="stack gap-2" aria-busy="true" aria-label="Loading">${item.repeat(count)}</div>`;
  }

  // ============ Tabs ============

  /** Tab Bar — horizontal with optional badge counts */
  function TabBar({ tabs, activeTab, dataAttr = 'tab' }) {
    return `
      <div class="tab-bar" role="tablist">
        ${tabs.map(t => {
          const label = typeof t === 'string' ? t : t.label;
          const count = typeof t === 'object' ? t.count : null;
          const isActive = label === activeTab;
          return `
            <button class="tab ${isActive ? 'is-active' : ''}" role="tab" aria-selected="${isActive}" data-${dataAttr}="${esc(label)}">
              ${esc(label)}${count ? ` <span class="tab__count">${count}</span>` : ''}
            </button>`;
        }).join('')}
      </div>`;
  }

  // ============ Suggested Prompts ============
  function PromptChip(text) {
    return `<button class="prompt-chip" data-prompt="${esc(text)}">${esc(text)}</button>`;
  }

  // ============ Chat ============
  function ChatMessage({ sender, text, variant = '' }) {
    const cls = cx('chat-msg', `chat-msg--${sender}`, variant && `chat-msg--${variant}`);
    return `<div class="${cls}">${esc(text)}</div>`;
  }

  // ============ Toast (creates DOM directly, not string) ============
  function showToast(message, type = 'success', persistent = false) {
    const region = document.getElementById('toastRegion');
    if (!region) return;
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.setAttribute('role', type === 'error' || type === 'warning' ? 'alert' : 'status');
    el.textContent = message;
    region.appendChild(el);
    if (!persistent && type !== 'error' && type !== 'warning') {
      setTimeout(() => {
        el.style.transition = 'opacity 200ms';
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 220);
      }, 4000);
    }
    return el;
  }

  // ============ Public API ============
  global.Components = {
    // Utilities
    esc, cx, h, formatElapsed,
    // Primitives
    Button, Overline, SectionHeader, StatusTag, WoWBadge, PulseDot,
    HealthBadge, Sparkline,
    // Metrics
    MetricTile, MacroMetricsBar,
    // Feed
    FeedRow, FeedStream,
    // Cards
    Card, PendingDecisionCard, BusinessCard, RecommendationCard, IntegrationCard,
    // Lists
    HighlightItem, HighlightsList, QueueItem, QueueList,
    // Forms
    FormField, ToggleRow, AutonomySlider,
    // States
    EmptyState, Skeleton,
    // Nav
    TabBar,
    // Chat
    PromptChip, ChatMessage,
    // Feedback
    showToast
  };

})(window);
