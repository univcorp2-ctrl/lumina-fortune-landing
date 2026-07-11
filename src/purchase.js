const statusElement = document.querySelector('#checkout-status');
const emailInput = document.querySelector('#checkout-email');
const buttons = [...document.querySelectorAll('[data-checkout-plan]')];
let checkoutConfigured = false;

function setStatus(message, tone = 'neutral') {
  statusElement.textContent = message;
  statusElement.dataset.tone = tone;
}

function setLoading(button, loading) {
  button.disabled = loading || !checkoutConfigured;
  button.setAttribute('aria-busy', String(loading));
  const label = button.querySelector('[data-button-label]');
  label.textContent = loading ? 'Stripeへ接続しています…' : button.dataset.defaultLabel;
}

async function loadCheckoutConfig() {
  try {
    const response = await fetch('/api/checkout-config', { headers: { Accept: 'application/json' } });
    const config = await response.json();
    checkoutConfigured = Boolean(config.configured);

    document.querySelector('#seller-name').textContent = config.seller?.name || '設定待ち';
    document.querySelector('#checkout-mode').textContent = config.stripeMode === 'live' ? '本番決済' : config.stripeMode === 'test' ? 'テスト決済' : '決済設定待ち';

    if (!checkoutConfigured) {
      setStatus(`決済設定が未完了です。運営者が ${config.missing.join(' / ')} を設定すると購入できます。`, 'warning');
    } else {
      setStatus('Stripeの安全な決済画面へ移動します。カード情報はLUMINAのサーバーを通りません。', 'success');
    }
  } catch {
    setStatus('決済設定を確認できませんでした。時間をおいて再度お試しください。', 'error');
  }

  buttons.forEach((button) => { button.disabled = !checkoutConfigured; });
}

async function startCheckout(button) {
  const email = emailInput.value.trim();
  if (email && !emailInput.checkValidity()) {
    emailInput.reportValidity();
    return;
  }

  buttons.forEach((item) => setLoading(item, item === button));
  setStatus('購入内容を確認し、Stripe Checkoutを準備しています。');

  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ plan: button.dataset.checkoutPlan, email })
    });
    const payload = await response.json();
    if (!response.ok || !payload.url) throw new Error(payload.message || 'Checkoutを開始できませんでした。');
    window.location.assign(payload.url);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : '決済画面を開けませんでした。', 'error');
    buttons.forEach((item) => setLoading(item, false));
  }
}

buttons.forEach((button) => {
  button.dataset.defaultLabel = button.querySelector('[data-button-label]').textContent;
  button.addEventListener('click', () => startCheckout(button));
});

loadCheckoutConfig();
