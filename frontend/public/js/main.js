/* =========================================================
   MERA YÖNETİM SİSTEMİ — Ana JavaScript
   ========================================================= */

'use strict';

/* ── DOM Hazır ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTooltips();
  initFlashDismiss();
  initUploadZones();
  initConfirmDialogs();
  initTableSearch();
  highlightActiveNav();
});

/* ── Bootstrap Tooltip Başlat ───────────────────────────── */
function initTooltips() {
  const tooltipEls = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  tooltipEls.forEach(el => new bootstrap.Tooltip(el, { trigger: 'hover' }));
}

/* ── Flash Mesajları Otomatik Kapat ─────────────────────── */
function initFlashDismiss() {
  const alerts = document.querySelectorAll('.alert-dismissible.auto-dismiss');
  alerts.forEach(alert => {
    setTimeout(() => {
      const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
      bsAlert.close();
    }, 5000);
  });
}

/* ── Drag-Drop Yükleme Alanları ─────────────────────────── */
function initUploadZones() {
  const zones = document.querySelectorAll('.upload-zone');

  zones.forEach(zone => {
    const input = zone.querySelector('input[type="file"]');
    if (!input) return;

    // Tıklama ile dosya seçimi
    zone.addEventListener('click', (e) => {
      if (e.target !== input) input.click();
    });

    // Drag olayları
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', () => {
      zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const dt = new DataTransfer();
        // Mevcut dosyaları koru (multiple ise)
        if (input.multiple) {
          Array.from(input.files).forEach(f => dt.items.add(f));
        }
        Array.from(files).forEach(f => {
          if (isValidExcel(f)) dt.items.add(f);
          else showToast(`"${f.name}" geçersiz format. Sadece .xlsx, .xls, .csv kabul edilir.`, 'warning');
        });
        input.files = dt.files;
        updateFilePreview(zone, input.files);
      }
    });

    // Dosya seçimi değişince önizle
    input.addEventListener('change', () => {
      updateFilePreview(zone, input.files);
    });
  });
}

function isValidExcel(file) {
  const allowed = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
  ];
  const ext = file.name.toLowerCase().split('.').pop();
  return allowed.includes(file.type) || ['xlsx', 'xls', 'csv'].includes(ext);
}

function updateFilePreview(zone, files) {
  let previewContainer = zone.parentElement.querySelector('.file-preview-list');
  if (!previewContainer) {
    previewContainer = document.createElement('div');
    previewContainer.className = 'file-preview-list mt-2';
    zone.parentElement.appendChild(previewContainer);
  }

  previewContainer.innerHTML = '';

  if (!files || files.length === 0) return;

  Array.from(files).forEach(file => {
    const item = document.createElement('div');
    item.className = 'file-preview-item';
    item.innerHTML = `
      <span class="file-icon">📊</span>
      <div>
        <div class="file-name">${escapeHtml(file.name)}</div>
        <div class="file-size">${formatBytes(file.size)}</div>
      </div>
    `;
    previewContainer.appendChild(item);
  });

  // Yükleme alanı metnini güncelle
  const uploadLabel = zone.querySelector('.upload-label');
  if (uploadLabel) {
    const iconEl = uploadLabel.querySelector('.upload-icon');
    const textEl = uploadLabel.querySelector('.upload-text');
    if (iconEl) iconEl.textContent = '✅';
    if (textEl) textEl.textContent = `${files.length} dosya seçildi`;
  }
}

/* ── Onay Diyalogları ───────────────────────────────────── */
function initConfirmDialogs() {
  document.querySelectorAll('[data-confirm]').forEach(el => {
    el.addEventListener('click', (e) => {
      const msg = el.dataset.confirm || 'Bu işlemi onaylıyor musunuz?';
      if (!confirm(msg)) e.preventDefault();
    });
  });
}

/* ── Tablo Arama ────────────────────────────────────────── */
function initTableSearch() {
  document.querySelectorAll('[data-search-table]').forEach(input => {
    const tableId = input.dataset.searchTable;
    const table = document.getElementById(tableId);
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');

    input.addEventListener('input', () => {
      const query = input.value.toLowerCase().trim();
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = query === '' || text.includes(query) ? '' : 'none';
      });

      // Sonuç sayısı göster
      const visibleCount = Array.from(rows).filter(r => r.style.display !== 'none').length;
      const countEl = document.querySelector(`[data-search-count="${tableId}"]`);
      if (countEl) countEl.textContent = `${visibleCount} kayıt gösteriliyor`;
    });
  });
}

/* ── Aktif Navigasyon Vurgulama ─────────────────────────── */
function highlightActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && path.startsWith(href) && href !== '/') {
      link.classList.add('active');
    } else if (href === '/' && path === '/') {
      link.classList.add('active');
    }
  });
}

/* ── Loading Overlay ────────────────────────────────────── */
function showLoading(message = 'Hesaplanıyor...') {
  let overlay = document.getElementById('loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
      <div class="text-center">
        <div class="spinner-mera mx-auto mb-3"></div>
        <div id="loading-message" class="fw-semibold text-muted">${escapeHtml(message)}</div>
      </div>
    `;
    document.body.appendChild(overlay);
  } else {
    document.getElementById('loading-message').textContent = message;
    overlay.style.display = 'flex';
  }
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.style.display = 'none';
}

/* ── Toast Bildirimi ────────────────────────────────────── */
function showToast(message, type = 'info') {
  const typeMap = {
    success: { bg: '#2d6a4f', icon: '✅' },
    error:   { bg: '#dc3545', icon: '❌' },
    warning: { bg: '#fd7e14', icon: '⚠️' },
    info:    { bg: '#0dcaf0', icon: 'ℹ️' },
  };

  const { bg, icon } = typeMap[type] || typeMap.info;

  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'position-fixed top-0 end-0 p-3';
    container.style.zIndex = '11000';
    document.body.appendChild(container);
  }

  const id = 'toast-' + Date.now();
  const toastHtml = `
    <div id="${id}" class="toast align-items-center text-white border-0 mb-2" role="alert"
         style="background:${bg}; min-width:280px;" data-bs-autohide="true" data-bs-delay="4000">
      <div class="d-flex">
        <div class="toast-body fw-semibold">
          ${icon} ${escapeHtml(message)}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', toastHtml);
  const toastEl = document.getElementById(id);
  const toast = new bootstrap.Toast(toastEl);
  toast.show();

  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

/* ── Yardımcılar ────────────────────────────────────────── */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatSayi(n, ondalik = 2) {
  if (n === null || n === undefined || isNaN(n)) return '-';
  return Number(n).toLocaleString('tr-TR', {
    minimumFractionDigits: ondalik,
    maximumFractionDigits: ondalik,
  });
}

function formatTarih(d) {
  if (!d) return '-';
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString('tr-TR');
}

/* ── Hesaplama Formu Gönderimi ───────────────────────────── */
function hesaplamaBaslat(projeId, mahalle) {
  showLoading('Hesaplama yapılıyor, lütfen bekleyin...');

  const body = mahalle ? JSON.stringify({ mahalle }) : JSON.stringify({});

  fetch(`/hesapla/${projeId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })
    .then(r => r.json())
    .then(data => {
      hideLoading();
      if (data.success) {
        showToast('Hesaplama tamamlandı!', 'success');
        setTimeout(() => {
          const redirect = mahalle
            ? `/hesapla/${projeId}/${encodeURIComponent(mahalle)}`
            : `/projeler/${projeId}`;
          window.location.href = redirect;
        }, 800);
      } else {
        showToast(data.message || 'Hesaplama hatası oluştu.', 'error');
      }
    })
    .catch(err => {
      hideLoading();
      showToast('Sunucu bağlantı hatası: ' + err.message, 'error');
    });
}

/* ── Sütun Eşleştirme Doğrulama ─────────────────────────── */
function eslestirmeDogrula(form) {
  const selects = form.querySelectorAll('select[data-required="true"]');
  let valid = true;

  selects.forEach(sel => {
    if (!sel.value || sel.value === '') {
      sel.classList.add('is-invalid');
      valid = false;
    } else {
      sel.classList.remove('is-invalid');
    }
  });

  if (!valid) {
    showToast('Lütfen zorunlu alanları eşleştirin (*).', 'warning');
  }

  return valid;
}

/* ── Excel Export İndir ──────────────────────────────────── */
function excelIndir(projeId, mahalle) {
  const url = mahalle
    ? `/export/${projeId}/${encodeURIComponent(mahalle)}`
    : `/export/${projeId}`;

  showLoading('Excel dosyası hazırlanıyor...');

  // Iframe ile indir (loading'i kapamak için)
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = url;
  document.body.appendChild(iframe);

  setTimeout(() => {
    hideLoading();
    iframe.remove();
  }, 3000);
}

/* ── Global olarak dışa aç ───────────────────────────────── */
window.MeraApp = {
  showLoading,
  hideLoading,
  showToast,
  formatBytes,
  formatSayi,
  formatTarih,
  hesaplamaBaslat,
  eslestirmeDogrula,
  excelIndir,
  escapeHtml,
};
