/**
 * QR Kafe - Self-Servis Mutfak & Bar Yönetim Paneli (admin.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  let currentEnteredPin = '';
  const ADMIN_PIN = localStorage.getItem('admin_custom_pin') || '1977';

  const adminAuthOverlayEl = document.getElementById('adminAuthOverlay');
  const adminMainContentEl = document.getElementById('adminMainContent');
  const pinDisplayEl = document.getElementById('pinDisplay');
  const lockAdminBtnEl = document.getElementById('lockAdminBtn');

  // PIN KLAVYE MANTIĞI
  window.enterPin = function(num) {
    if (currentEnteredPin.length < 4) {
      currentEnteredPin += num;
      updatePinDisplay();
      if (currentEnteredPin.length === 4) {
        setTimeout(window.submitPin, 150);
      }
    }
  };

  window.clearPin = function() {
    currentEnteredPin = '';
    updatePinDisplay();
  };

  function updatePinDisplay() {
    if (!pinDisplayEl) return;
    if (currentEnteredPin.length === 0) {
      pinDisplayEl.textContent = '••••';
      pinDisplayEl.style.color = 'var(--text-muted)';
    } else {
      pinDisplayEl.textContent = '•'.repeat(currentEnteredPin.length);
      pinDisplayEl.style.color = 'var(--primary)';
    }
  }

  window.submitPin = function() {
    if (currentEnteredPin === ADMIN_PIN) {
      sessionStorage.setItem('admin_authenticated', 'true');
      unlockAdminPanel();
    } else {
      alert('❌ Hatalı Bar PIN Kodu! Lütfen tekrar deneyiniz.');
      window.clearPin();
    }
  };

  function unlockAdminPanel() {
    if (adminAuthOverlayEl) adminAuthOverlayEl.style.display = 'none';
    if (adminMainContentEl) adminMainContentEl.style.display = 'block';
    initAdmin();
  }

  // OTURUM KONTROLÜ
  if (sessionStorage.getItem('admin_authenticated') === 'true') {
    unlockAdminPanel();
  } else {
    if (adminAuthOverlayEl) adminAuthOverlayEl.style.display = 'flex';
    if (adminMainContentEl) adminMainContentEl.style.display = 'none';
  }

  if (lockAdminBtnEl) {
    lockAdminBtnEl.addEventListener('click', () => {
      sessionStorage.removeItem('admin_authenticated');
      window.location.reload();
    });
  }

  // YÖNETİM PANELİ ANA MANTIK
  const state = {
    activeTab: 'kds',
    orders: CafeStore.getOrders(),
    products: CafeStore.getProducts(),
    notifications: CafeStore.getNotifications(),
    filterStatus: 'active'
  };

  const kdsGridEl = document.getElementById('kdsGrid');
  const notificationsListEl = document.getElementById('notificationsList');
  const qrGridEl = document.getElementById('qrGrid');
  const menuCmsGridEl = document.getElementById('menuCmsGrid');
  const activeOrdersCountEl = document.getElementById('activeOrdersCount');
  const totalRevenueEl = document.getElementById('totalRevenue');
  const waiterCallsCountEl = document.getElementById('waiterCallsCount');
  const clearOrdersBtn = document.getElementById('clearOrdersBtn');
  const addNewProductBtn = document.getElementById('addNewProductBtn');
  const downloadMenuJsonBtn = document.getElementById('downloadMenuJsonBtn');
  const importMenuJsonInput = document.getElementById('importMenuJsonInput');

  const productFormModal = document.getElementById('productFormModal');
  const closeProductFormBtn = document.getElementById('closeProductFormBtn');
  const saveProductBtn = document.getElementById('saveProductBtn');
  const formProductFileInput = document.getElementById('formProductFileInput');
  const formImagePreview = document.getElementById('formImagePreview');
  const formProductImageInput = document.getElementById('formProductImage');
  const imageSizeInfo = document.getElementById('imageSizeInfo');

  function initAdmin() {
    setupSync();
    setupTabSwitching();
    renderActiveTab();
    setupEventListeners();
    startRealtimeCloudListener();

    // GARANTİLİ 1.5 SANİYEDE BİR BULUT SİPARİŞ KONTROLÜ (FIREBASE REALTIME DB)
    refreshCloudOrders();
    setInterval(refreshCloudOrders, 1500);

    refreshCloudProducts();
  }

  async function refreshCloudOrders() {
    const cloudOrders = await CafeStore.fetchOrdersFromCloud();
    if (cloudOrders) {
      const prevCount = state.orders.length;
      state.orders = cloudOrders;
      if (cloudOrders.length > prevCount) {
        playAlertSound();
      }
      updateHeaderStats();
      if (state.activeTab === 'kds') renderKDS();
      renderNotifications();
    }
  }

  async function refreshCloudProducts() {
    const cloudProducts = await CafeStore.fetchProductsFromCloud();
    if (cloudProducts && cloudProducts.length > 0) {
      state.products = cloudProducts;
      if (state.activeTab === 'menu_cms') renderMenuCMS();
    } else {
      state.products = CafeStore.getProducts();
      if (state.activeTab === 'menu_cms') renderMenuCMS();
    }
  }

  function startRealtimeCloudListener() {
    CafeStore.listenCloudOrders((newOrder) => {
      refreshCloudOrders();
    });
    CafeStore.listenCloudProducts((productsFromCloud) => {
      if (productsFromCloud && Array.isArray(productsFromCloud) && productsFromCloud.length > 0) {
        state.products = productsFromCloud;
        if (state.activeTab === 'menu_cms') renderMenuCMS();
      }
    });
  }

  function setupSync() {
    if ('BroadcastChannel' in window) {
      const bc = new BroadcastChannel('cafe_sync');
      bc.onmessage = (event) => {
        state.orders = CafeStore.getOrders();
        state.notifications = CafeStore.getNotifications();
        state.products = CafeStore.getProducts();

        if (event.data.type === 'orders_updated' || event.data.type === 'notification_added') {
          playAlertSound();
          updateHeaderStats();
          if (state.activeTab === 'kds') renderKDS();
          renderNotifications();
        } else if (event.data.type === 'products_updated') {
          if (state.activeTab === 'menu_cms') renderMenuCMS();
        }
      };
    }
  }

 function playAlertSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Dikkat çekici, tekrarlayan 3'lü uyarı tonu
      const playOscillator = (freq, type, startTime, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
        
        gain.gain.setValueAtTime(0.6, ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
      };

      // Tiz frekanslar mutfak/blender gürültüsünü aşar
      playOscillator(800, 'square', 0, 0.15);
      playOscillator(1200, 'square', 0.2, 0.15);
      playOscillator(1600, 'square', 0.4, 0.2);
      
    } catch (e) {}
  }

  function setupTabSwitching() {
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.activeTab = tab.dataset.tab;
        renderActiveTab();
      });
    });
  }

  function renderActiveTab() {
    updateHeaderStats();
    renderNotifications();

    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    const activeEl = document.getElementById(`tab_${state.activeTab}`);
    if (activeEl) activeEl.style.display = 'block';

    if (state.activeTab === 'kds') renderKDS();
    else if (state.activeTab === 'qr_gen') renderQRGenerator();
    else if (state.activeTab === 'menu_cms') renderMenuCMS();
    else if (state.activeTab === 'stats') renderStats();
  }

function updateHeaderStats() {
    state.orders = CafeStore.getOrders();
    state.notifications = CafeStore.getNotifications();

    const activeOrders = state.orders.filter(o => o.status !== 'completed');
    const totalRev = state.orders.reduce((sum, o) => sum + (o.total || 0), 0);

    if (activeOrdersCountEl) activeOrdersCountEl.textContent = activeOrders.length;
    if (totalRevenueEl) totalRevenueEl.textContent = `${totalRev} ₺`;
    if (waiterCallsCountEl) waiterCallsCountEl.textContent = activeOrders.filter(o => o.status === 'ready').length;

    // YENİ EKLENEN KISIM: 3 Saniyelik Tekrarlayan Alarm Döngüsü
    // Durumu "received" (Yeni gelmiş, henüz onaylanmamış) olan sipariş var mı kontrol et
    const hasNewOrder = state.orders.some(o => o.status === 'received');
    
    if (hasNewOrder) {
      // Eğer yeni sipariş varsa ve alarm zaten çalmıyorsa başlat
      if (!window.orderAlarmInterval) {
        playAlertSound(); // İlk alarmı anında çal
        window.orderAlarmInterval = setInterval(playAlertSound, 3000); // 3 saniyede bir tekrarla
      }
    } else {
      // Bekleyen sipariş kalmadıysa (barista onayladıysa) alarmı sustur
      if (window.orderAlarmInterval) {
        clearInterval(window.orderAlarmInterval);
        window.orderAlarmInterval = null;
      }
    }
  }

  function renderNotifications() {
    if (!notificationsListEl) return;
    const readyOrders = state.orders.filter(o => o.status === 'ready');

    if (readyOrders.length === 0) {
      notificationsListEl.innerHTML = '<div style="color: var(--text-dim); font-size: 0.85rem; padding: 10px;">Şu an bardan teslim bekleyen sipariş yok.</div>';
      return;
    }

    notificationsListEl.innerHTML = readyOrders.map(o => `
      <div style="padding: 10px 14px; background: var(--bg-surface); border: 1px solid var(--accent-rose); border-radius: var(--radius-sm); margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; animation: pulseBorder 1.5s infinite;">
        <div>
          <div style="font-weight: 800; font-size: 0.95rem; color: var(--primary);">
            ⚡ ${o.table} • Sipariş #${o.id}
          </div>
          <div style="font-size: 0.82rem; color: var(--text-main);">Müşterinin telefonunda flaş uyarısı ve ses çalıyor.</div>
        </div>
        <button class="action-btn btn-complete" onclick="window.updateStatus('${o.id}', 'completed')" style="padding: 6px 12px; font-size: 0.8rem; flex: none;">
          ✓ Teslim Alındı / Kapat
        </button>
      </div>
    `).join('');
  }

  function renderKDS() {
    if (!kdsGridEl) return;
    let orders = CafeStore.getOrders();

    if (state.filterStatus === 'active') {
      orders = orders.filter(o => o.status !== 'completed');
    } else if (state.filterStatus !== 'all') {
      orders = orders.filter(o => o.status === state.filterStatus);
    }

    if (orders.length === 0) {
      kdsGridEl.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <div style="font-size: 3.5rem; margin-bottom: 12px;">👨‍🍳</div>
          <h2>Aktif Sipariş Bulunmuyor</h2>
          <p style="font-size: 0.9rem; margin-top: 4px;">Masalardan yeni sipariş verildiğinde bu ekrana anında düşecektir.</p>
        </div>
      `;
      return;
    }

    kdsGridEl.innerHTML = orders.map(order => {
      const isNew = order.status === 'received';
      const timeAgo = Math.round((Date.now() - new Date(order.createdAt).getTime()) / 60000);

      return `
        <div class="order-ticket ${isNew ? 'new-order' : ''}">
          <div class="ticket-header">
            <div>
              <div class="ticket-table">${order.table}</div>
              <div class="ticket-time">Sipariş #${order.id} • ${timeAgo > 0 ? `${timeAgo} dk önce` : 'Az önce'}</div>
            </div>
            <div class="badge-pill" style="font-size: 0.75rem; background: ${getStatusColor(order.status)}; color: white;">
              ${getStatusLabel(order.status)}
            </div>
          </div>
          <div class="ticket-body">
            ${order.items.map(item => {
              const opts = Object.values(item.selectedOptions || {}).map(o => o.label).join(', ');
              return `
                <div class="ticket-item">
                  <div>
                    <span class="ticket-item-qty">${item.qty}x</span>
                    <span style="font-weight: 700; color: var(--text-main);">${item.product.name}</span>
                    ${opts ? `<div class="ticket-item-options">${opts}</div>` : ''}
                    ${item.note ? `<div class="ticket-item-options" style="color: var(--primary); font-weight: 600;">Not: ${item.note}</div>` : ''}
                  </div>
                  <div style="font-weight: 700;">${item.product.price * item.qty} ₺</div>
                </div>
              `;
            }).join('')}
            <div style="display: flex; justify-content: space-between; border-top: 1px dashed var(--border-subtle); padding-top: 10px; margin-top: 10px; font-weight: 800; font-size: 1.05rem;">
              <span>Toplam:</span>
              <span style="color: var(--primary);">${order.total} ₺</span>
            </div>
          </div>
          <div class="ticket-footer">
            ${order.status === 'received' ? `
              <button class="action-btn btn-prepare" onclick="window.updateStatus('${order.id}', 'preparing')">✓ Siparişi Onayla & Hazırla</button>
            ` : ''}
            ${order.status === 'preparing' ? `
              <button class="action-btn btn-ready-call" onclick="window.updateStatus('${order.id}', 'ready')">⚡ SİPARİŞ HAZIR (BARA ÇAĞIR)</button>
            ` : ''}
            ${order.status === 'ready' ? `
              <button class="action-btn btn-complete" onclick="window.updateStatus('${order.id}', 'completed')">✓ Teslim Edildi / Kapat</button>
            ` : ''}
            ${order.status === 'completed' ? `
              <div style="font-size: 0.8rem; color: var(--accent-emerald); text-align: center; width: 100%; font-weight: 700;">✓ Bardan Teslim Alındı</div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  window.updateStatus = function(orderId, newStatus) {
    CafeStore.updateOrderStatus(orderId, newStatus);
    state.orders = CafeStore.getOrders();
    renderKDS();
    updateHeaderStats();
    renderNotifications();
  };

  function getStatusLabel(s) {
    switch(s) {
      case 'received': return 'Onay Bekliyor';
      case 'preparing': return 'Hazırlanıyor';
      case 'ready': return '⚡ Bardan Çağrılıyor';
      case 'completed': return 'Teslim Edildi';
      default: return s;
    }
  }

  function getStatusColor(s) {
    switch(s) {
      case 'received': return '#f43f5e';
      case 'preparing': return '#3b82f6';
      case 'ready': return '#f39c12';
      case 'completed': return '#10b981';
      default: return '#64748b';
    }
  }

  function getCustomerBaseUrl() {
    const origin = window.location.origin;
    let path = window.location.pathname;

    path = path.replace(/\/admin(\.html)?\/?$/i, '/');
    if (!path.endsWith('/')) {
      path = path.substring(0, path.lastIndexOf('/') + 1);
    }
    return origin + path + 'index.html';
  }

  function renderQRGenerator() {
    if (!qrGridEl) return;
    
    const baseUrl = getCustomerBaseUrl();
    const tables = Array.from({ length: 60 }, (_, i) => `Masa ${String(i + 1).padStart(2, '0')}`);

    qrGridEl.innerHTML = tables.map(t => {
      const tableToken = CafeStore.getTableSecurityToken(t);
      const tableUrl = `${baseUrl}?masa=${encodeURIComponent(t)}&token=${encodeURIComponent(tableToken)}`;
      const containerId = `qr_box_${t.replace(/\s+/g, '_')}`;

      return `
        <div class="qr-card-preview">
          <div style="font-size: 1.5rem;">🐻☕</div>
          <h3 style="letter-spacing: -0.01em;">QR KAFE</h3>
          <div style="font-weight: 800; color: #d35400; font-size: 0.75rem; letter-spacing: 0.05em;">MACKBEAR COFFEE</div>
          <div style="padding: 10px; background: white; border-radius: 12px; border: 2px solid #eee; display: flex; justify-content: center; min-width: 170px; min-height: 170px; align-items: center;" id="${containerId}">
          </div>
          <div style="font-weight: 800; font-size: 1.1rem; color: #111; margin-top: 4px;">${t}</div>
          <div style="font-size: 0.65rem; color: var(--accent-emerald); font-weight: 700; margin-top: 2px;">🔒 KAFE İÇİ GÜVENLİ QR</div>
          <div style="font-size: 0.62rem; color: #888; word-break: break-all; max-width: 200px; margin-top: 2px;">${tableUrl}</div>
        </div>
      `;
    }).join('');

    setTimeout(() => {
      tables.forEach(t => {
        const tableToken = CafeStore.getTableSecurityToken(t);
        const tableUrl = `${baseUrl}?masa=${encodeURIComponent(t)}&token=${encodeURIComponent(tableToken)}`;
        const containerId = `qr_box_${t.replace(/\s+/g, '_')}`;
        const containerEl = document.getElementById(containerId);
        
        if (containerEl) {
          containerEl.innerHTML = '';
          try {
            if (typeof QRCode !== 'undefined') {
              new QRCode(containerEl, {
                text: tableUrl,
                width: 170,
                height: 170,
                correctLevel: QRCode.CorrectLevel.M
              });
            } else {
              throw new Error('QRCode library not ready');
            }
          } catch (e) {
            const fallbackApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=170x170&margin=5&data=${encodeURIComponent(tableUrl)}`;
            containerEl.innerHTML = `<img src="${fallbackApiUrl}" alt="${t} QR" style="width:170px; height:170px; display:block;" />`;
          }
        }
      });
    }, 50);
  }

  function renderMenuCMS() {
    if (!menuCmsGridEl) return;
    const products = CafeStore.getProducts();

    menuCmsGridEl.innerHTML = products.map(p => `
      <div class="glass-card" style="padding: 16px; display: flex; gap: 14px; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 14px; flex: 1;">
          <img src="${p.image}" alt="${p.name}" style="width: 75px; height: 75px; border-radius: var(--radius-sm); object-fit: cover; border: 1px solid var(--border-subtle);" />
          <div>
            <div style="font-weight: 800; font-size: 1rem; color: var(--text-main);">${p.name}</div>
            <div style="font-size: 0.85rem; color: var(--primary); font-weight: 700; margin-top: 2px;">${p.price} ₺</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">${p.description || ''}</div>
          </div>
        </div>

        <div style="display: flex; gap: 8px; align-items: center;">
          <button class="stock-toggle-btn ${p.inStock ? 'btn-in-stock' : 'btn-out-of-stock'}" data-id="${p.id}" style="padding: 8px 14px; font-weight: 800; font-size: 0.85rem; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s ease; ${p.inStock ? 'background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4);' : 'background: rgba(244, 63, 94, 0.2); color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.5);'}">
            ${p.inStock ? '🟢 Stokta Var' : '🔴 TÜKENDİ'}
          </button>

          <button class="select-table-btn" onclick="window.openEditProductModal('${p.id}')" style="padding: 6px 12px; background: var(--primary-light); color: var(--primary); border-color: var(--border-active);">
            🖼️ Görsel & Düzenle
          </button>

          <button class="select-table-btn" onclick="window.deleteProductItem('${p.id}')" style="padding: 6px 12px; background: rgba(244, 63, 94, 0.15); color: var(--accent-rose); border-color: rgba(244, 63, 94, 0.3);">
            🗑️ Sil
          </button>
        </div>
      </div>
    `).join('');
  }

  window.toggleStock = async function(id) {
    await CafeStore.toggleProductStock(id);
    state.products = CafeStore.getProducts();
    renderMenuCMS();
  };

  window.openEditProductModal = function(id) {
    const products = CafeStore.getProducts();
    const p = products.find(item => item.id === id);
    if (!p) return;

    document.getElementById('productFormTitle').textContent = '✏️ Ürün & Fotoğraf Düzenle';
    document.getElementById('editProductId').value = p.id;
    document.getElementById('formProductName').value = p.name;
    document.getElementById('formProductCategory').value = p.categoryId || 'hot_coffee';
    document.getElementById('formProductPrice').value = p.price;
    document.getElementById('formProductStock').value = p.inStock ? 'true' : 'false';
    document.getElementById('formProductImage').value = p.image || '';
    document.getElementById('formProductDesc').value = p.description || '';

    if (formImagePreview) formImagePreview.src = p.image || 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&auto=format&fit=crop&q=80';
    if (imageSizeInfo) imageSizeInfo.textContent = 'Mevcut fotoğraf yüklü';

    if (productFormModal) productFormModal.classList.add('active');
  };

  window.deleteProductItem = async function(id) {
    const products = CafeStore.getProducts();
    const p = products.find(item => item.id === id);
    if (p && confirm(`"${p.name}" menüden tamamen silinsin mi?`)) {
      await CafeStore.deleteProduct(id);
      state.products = CafeStore.getProducts();
      renderMenuCMS();
    }
  };

  function compressAndResizeImage(file, maxWidth = 450, maxHeight = 450, quality = 0.70) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function renderStats() {
    const statsContainer = document.getElementById('statsContainer');
    if (!statsContainer) return;

    const orders = CafeStore.getOrders();
    const totalOrdersCount = orders.length;
    const totalRev = orders.reduce((s, o) => s + (o.total || 0), 0);
    const avgOrderValue = totalOrdersCount > 0 ? (totalRev / totalOrdersCount).toFixed(1) : 0;

    statsContainer.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div class="glass-card" style="padding: 20px;">
          <div style="font-size: 0.85rem; color: var(--text-muted);">Bugünkü Toplam Sipariş</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--primary); margin-top: 4px;">${totalOrdersCount} Sipariş</div>
        </div>
        <div class="glass-card" style="padding: 20px;">
          <div style="font-size: 0.85rem; color: var(--text-muted);">Toplam Ciro</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--accent-emerald); margin-top: 4px;">${totalRev} ₺</div>
        </div>
        <div class="glass-card" style="padding: 20px;">
          <div style="font-size: 0.85rem; color: var(--text-muted);">Ortalama Sipariş Tutarı</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--accent-sky); margin-top: 4px;">${avgOrderValue} ₺</div>
        </div>
      </div>
    `;
  }

  function setupEventListeners() {
    if (menuCmsGridEl) {
      menuCmsGridEl.addEventListener('click', (e) => {
        const stockBtn = e.target.closest('.stock-toggle-btn');
        if (stockBtn) {
          const id = stockBtn.dataset.id;
          window.toggleStock(id);
        }
      });
    }

    const printQRsBtn = document.getElementById('printQRsBtn');
    if (printQRsBtn) {
      printQRsBtn.addEventListener('click', () => window.print());
    }

    if (clearOrdersBtn) {
      clearOrdersBtn.addEventListener('click', async () => {
        if (confirm('Tüm sipariş geçmişi ve bulut verileri sıfırlansın mı?')) {
          await CafeStore.clearAllOrders();
          state.orders = [];
          updateHeaderStats();
          renderKDS();
          renderNotifications();
        }
      });
    }

    if (downloadMenuJsonBtn) {
      downloadMenuJsonBtn.addEventListener('click', () => {
        CafeStore.downloadMenuJSON();
        alert('📥 "menu.json" dosyası bilgisayarınıza/telefonunuza indirildi!\n\nŞimdi bu dosyayı GitHub "meackbearrize" deponuza yükleyerek menünüzü tüm dünyada %100 kalıcı hale getirebilirsiniz.');
      });
    }

    if (importMenuJsonInput) {
      importMenuJsonInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            const importedProducts = await CafeStore.importMenuJSON(file);
            state.products = importedProducts;
            renderMenuCMS();
            alert('✅ "menu.json" başarıyla panele yüklendi ve güncellendi!');
          } catch (err) {
            alert('❌ Dosya yükleme hatası: ' + err.message);
          }
        }
      });
    }

    if (formProductFileInput) {
      formProductFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          if (imageSizeInfo) imageSizeInfo.textContent = '⏳ Fotoğraf işleniyor ve sıkıştırılıyor...';
          try {
            const compressedDataUrl = await compressAndResizeImage(file, 450, 450, 0.70);
            if (formProductImageInput) formProductImageInput.value = compressedDataUrl;
            if (formImagePreview) formImagePreview.src = compressedDataUrl;
            if (imageSizeInfo) imageSizeInfo.textContent = '✅ Fotoğraf optimize edildi (~25 KB)';
          } catch (err) {
            console.error('Image compress error:', err);
            if (imageSizeInfo) imageSizeInfo.textContent = 'Fotoğraf yükleme hatası';
          }
        }
      });
    }

    if (formProductImageInput) {
      formProductImageInput.addEventListener('input', (e) => {
        if (formImagePreview) formImagePreview.src = e.target.value;
      });
    }

    if (addNewProductBtn) {
      addNewProductBtn.addEventListener('click', () => {
        document.getElementById('productFormTitle').textContent = '➕ Yeni Ürün & Fotoğraf Ekle';
        document.getElementById('editProductId').value = '';
        document.getElementById('formProductName').value = '';
        document.getElementById('formProductCategory').value = 'hot_coffee';
        document.getElementById('formProductPrice').value = '';
        document.getElementById('formProductStock').value = 'true';
        const defaultImg = 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&auto=format&fit=crop&q=80';
        document.getElementById('formProductImage').value = defaultImg;
        if (formImagePreview) formImagePreview.src = defaultImg;
        if (imageSizeInfo) imageSizeInfo.textContent = 'Fotoğraf seçiniz veya çekiniz';
        document.getElementById('formProductDesc').value = '';

        if (productFormModal) productFormModal.classList.add('active');
      });
    }

    if (closeProductFormBtn) {
      closeProductFormBtn.addEventListener('click', () => {
        if (productFormModal) productFormModal.classList.remove('active');
      });
    }

    if (saveProductBtn) {
      saveProductBtn.addEventListener('click', async () => {
        const id = document.getElementById('editProductId').value;
        const name = document.getElementById('formProductName').value.trim();
        const categoryId = document.getElementById('formProductCategory').value;
        const price = parseFloat(document.getElementById('formProductPrice').value) || 0;
        const inStock = document.getElementById('formProductStock').value === 'true';
        const image = document.getElementById('formProductImage').value.trim() || 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&auto=format&fit=crop&q=80';
        const description = document.getElementById('formProductDesc').value.trim();

        if (!name) {
          alert('Lütfen ürün adını giriniz.');
          return;
        }

        saveProductBtn.disabled = true;
        saveProductBtn.textContent = '⏳ Kaydedildi...';

        if (id) {
          await CafeStore.updateProduct({ id, name, categoryId, price, inStock, image, description });
        } else {
          const newProduct = {
            id: 'p_' + Date.now(),
            name,
            categoryId,
            price,
            inStock,
            image,
            description,
            badges: ['Yeni']
          };
          await CafeStore.addProduct(newProduct);
        }

        saveProductBtn.disabled = false;
        saveProductBtn.textContent = '💾 Ürünü ve Fotoğrafı Kaydet';

        state.products = CafeStore.getProducts();
        renderMenuCMS();
        if (productFormModal) productFormModal.classList.remove('active');

        alert(`✅ "${name}" listeye kaydedildi!\n\nDeğişikliğin tüm telefonlarda %100 kalıcı olması için "📥 Güncel menu.json İndir" butonuna basıp dosyayı GitHub meackbearrize deponuza yükleyin.`);
      });
    }

    const filterSelect = document.getElementById('kdsFilterSelect');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        state.filterStatus = e.target.value;
        renderKDS();
      });
    }
  }
});
