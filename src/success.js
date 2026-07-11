const params = new URLSearchParams(window.location.search);
const sessionId = params.get('session_id');
const title = document.querySelector('#success-title');
const message = document.querySelector('#success-message');
const details = document.querySelector('#purchase-details');
const portalButton = document.querySelector('#portal-button');

function formatAmount(amount, currency) {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: String(currency || 'jpy').toUpperCase()
  }).format((amount || 0) / 100);
}

async function loadSession() {
  if (!sessionId || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
    title.textContent = '購入情報を確認できませんでした';
    message.textContent = 'URLに有効なCheckout Session IDがありません。';
    return;
  }

  try {
    const response = await fetch(`/api/checkout-session?id=${encodeURIComponent(sessionId)}`, {
      headers: { Accept: 'application/json' }
    });
    const session = await response.json();
    if (!response.ok) throw new Error(session.message || '購入情報を取得できませんでした。');

    const paid = session.paymentStatus === 'paid' || session.status === 'complete';
    title.textContent = paid ? 'お申し込みありがとうございます' : '決済を確認しています';
    message.textContent = paid
      ? 'Stripeでのお支払いを確認しました。この画面を購入記録として保存できます。'
      : '支払い方法によって反映まで時間がかかる場合があります。';

    details.hidden = false;
    document.querySelector('#detail-plan').textContent = session.planName || session.planId || 'LUMINA 鑑定プラン';
    document.querySelector('#detail-amount').textContent = formatAmount(session.amountTotal, session.currency);
    document.querySelector('#detail-email').textContent = session.customerEmail || 'Stripeで入力したメールアドレス';
    document.querySelector('#detail-status').textContent = session.paymentStatus || session.status;

    if (session.mode === 'subscription' && session.customerAvailable) {
      portalButton.hidden = false;
    }
  } catch (error) {
    title.textContent = '購入情報を確認できませんでした';
    message.textContent = error instanceof Error ? error.message : '時間をおいて再度お試しください。';
  }
}

portalButton.addEventListener('click', async () => {
  portalButton.disabled = true;
  portalButton.textContent = '管理画面を準備しています…';
  try {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ sessionId })
    });
    const payload = await response.json();
    if (!response.ok || !payload.url) throw new Error(payload.message || '管理画面を開けませんでした。');
    window.location.assign(payload.url);
  } catch (error) {
    portalButton.disabled = false;
    portalButton.textContent = '契約内容・解約を管理する';
    message.textContent = error instanceof Error ? error.message : '管理画面を開けませんでした。';
  }
});

loadSession();
