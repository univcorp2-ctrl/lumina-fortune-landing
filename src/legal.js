async function loadSeller() {
  try {
    const response = await fetch('/api/checkout-config', { headers: { Accept: 'application/json' } });
    const config = await response.json();
    const values = {
      name: config.seller?.name || '本番販売前に設定',
      address: config.seller?.address || '本番販売前に設定',
      email: config.seller?.email || '本番販売前に設定'
    };
    document.querySelectorAll('[data-seller-name]').forEach((node) => { node.textContent = values.name; });
    document.querySelectorAll('[data-seller-address]').forEach((node) => { node.textContent = values.address; });
    document.querySelectorAll('[data-support-email]').forEach((node) => { node.textContent = values.email; });
  } catch {
    document.querySelectorAll('[data-legal-status]').forEach((node) => { node.textContent = '運営者情報を取得できませんでした。'; });
  }
}

loadSeller();
