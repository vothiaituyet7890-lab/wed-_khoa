// Script đơn giản lấy dữ liệu tenant id=3 và hiển thị
async function fetchTenant() {
  const container = document.getElementById('tenant-card');
  container.innerHTML = '<div id="loading">Đang tải dữ liệu...</div>';
  try {
    const res = await fetch('/api/tenants/3');
    if (!res.ok) {
      container.innerHTML = `<div class="error">Lỗi: ${res.status} ${res.statusText}</div>`;
      return;
    }
    const t = await res.json();

    // Hiển thị các trường cơ bản
    container.innerHTML = `
      <h2>${escapeHtml(t.tenantname || '—')}</h2>
      <ul class="fields">
        <li><strong>Domain:</strong> ${escapeHtml(t.domain || '—')}</li>
        <li><strong>Email:</strong> ${escapeHtml(t.email || '—')}</li>
        <li><strong>Phone:</strong> ${escapeHtml(t.phone || '—')}</li>
        <li><strong>Address:</strong> ${escapeHtml(t.address || '—')}</li>
        <li><strong>Status:</strong> ${escapeHtml(t.status || '—')}</li>
        <li><strong>Created at:</strong> ${formatDate(t.createdat)}</li>
        <li><strong>Updated at:</strong> ${formatDate(t.updatedat)}</li>
      </ul>
    `;

  } catch (err) {
    container.innerHTML = `<div class="error">Lỗi khi kết nối tới server: ${escapeHtml(err.message)}</div>`;
  }
}

function formatDate(d) {
  if (!d) return '—';
  try { return new Date(d).toLocaleString(); } catch { return d; }
}

// Very small sanitizer for insertion into HTML
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Event listeners
document.getElementById('refresh').addEventListener('click', fetchTenant);
window.addEventListener('DOMContentLoaded', fetchTenant);