import { CONCERNS, computeStreak, createReading, getQuotaState, runReadingFlow } from './fortune.js';
import { clearDemoData, loadHistory, saveHistory } from './storage.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let history = loadHistory();
let selectedConcern = 'love';
let latestReading = null;

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);
}

function updateDashboard() {
  const quota = getQuotaState(history);
  const streak = computeStreak(history);
  $('#quota-count').textContent = `${quota.remaining} / ${quota.limit}`;
  $('#streak-count').textContent = `${streak}日`;
  $('#quota-note').textContent = quota.remaining > 0
    ? `本日はあと${quota.remaining}回、無料デモを試せます。`
    : '本日の無料デモ分を使いました。明日また新しいカードが開きます。';
}

function renderDailyPulse() {
  const pulse = createReading({ concern: 'self', nickname: '', birthDate: '' });
  $('#daily-symbol').textContent = pulse.cardSymbol;
  $('#daily-card').textContent = pulse.cardName;
  $('#daily-action').textContent = pulse.action;
}

function selectConcern(value) {
  selectedConcern = CONCERNS[value] ? value : 'self';
  $$('.concern-button').forEach((button) => {
    const active = button.dataset.concern === selectedConcern;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  $('#concern-input').value = selectedConcern;
}

function showResult(reading) {
  latestReading = reading;
  const result = $('#reading-result');
  result.hidden = false;
  $('#result-category').textContent = `${reading.concernLabel}のオラクル`;
  $('#result-symbol').textContent = reading.cardSymbol;
  $('#result-card-name').textContent = reading.cardName;
  $('#result-headline').textContent = reading.headline;
  $('#result-interpretation').textContent = reading.interpretation;
  $('#result-action').textContent = reading.action;
  $('#result-color').textContent = reading.luckyColor;
  $('#result-word').textContent = reading.focusWord;
  $('#premium-list').innerHTML = reading.premiumPreview.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  result.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
}

function openPremiumDialog() {
  const dialog = $('#premium-dialog');
  if (typeof dialog.showModal === 'function') dialog.showModal();
}

function closePremiumDialog() {
  const dialog = $('#premium-dialog');
  if (dialog.open) dialog.close();
}

$$('.concern-button').forEach((button) => button.addEventListener('click', () => selectConcern(button.dataset.concern)));

$('#reading-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const submitButton = $('#draw-button');
  const outcome = runReadingFlow({
    concern: selectedConcern,
    nickname: $('#nickname').value,
    birthDate: $('#birth-date').value
  }, history);
  if (!outcome.ok) return openPremiumDialog();
  submitButton.disabled = true;
  submitButton.classList.add('is-loading');
  submitButton.querySelector('span').textContent = '星を読んでいます…';
  window.setTimeout(() => {
    history = outcome.history;
    saveHistory(history);
    showResult(outcome.reading);
    updateDashboard();
    submitButton.disabled = false;
    submitButton.classList.remove('is-loading');
    submitButton.querySelector('span').textContent = 'オラクルカードを引く';
  }, reducedMotion ? 0 : 720);
});

$('#copy-result').addEventListener('click', async () => {
  if (!latestReading) return;
  const text = `LUMINA｜${latestReading.cardName}\n${latestReading.headline}\n今日の一歩：${latestReading.action}`;
  try {
    await navigator.clipboard.writeText(text);
    $('#copy-result').textContent = 'コピーしました';
    window.setTimeout(() => { $('#copy-result').textContent = '結果をコピー'; }, 1400);
  } catch {
    $('#copy-result').textContent = 'コピーできませんでした';
  }
});

$$('[data-open-premium]').forEach((button) => button.addEventListener('click', openPremiumDialog));
$('#close-dialog').addEventListener('click', closePremiumDialog);
$('#premium-dialog').addEventListener('click', (event) => {
  if (event.target === $('#premium-dialog')) closePremiumDialog();
});
$('#reset-demo').addEventListener('click', () => {
  clearDemoData();
  history = [];
  latestReading = null;
  $('#reading-result').hidden = true;
  updateDashboard();
  $('#reset-demo').textContent = 'デモデータをリセットしました';
});

const menuButton = $('#menu-button');
menuButton.addEventListener('click', () => {
  const nav = $('#nav-links');
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  nav.classList.toggle('is-open', !expanded);
});
$$('#nav-links a').forEach((link) => link.addEventListener('click', () => {
  $('#nav-links').classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

selectConcern('love');
renderDailyPulse();
updateDashboard();
