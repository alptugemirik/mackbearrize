/**
 * QR Kafe - Self-Servis Müşteri Menü & Flaşlı Çağrı Uygulaması (app.js)
 * ANLIK BULUT STOK EŞİTLEME VE TÜKENDİ ROLLERİ EKLENDİ
 */

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const scannedTokenFromUrl = urlParams.get('token');
  const scannedTableFromUrl = getTableFromUrl() || localStorage.getItem('current_table') || 'Masa 01';

  // MASA GÜVENLİK TOKENİ VE SÜRE KONTROLÜ
  const sessionCheck = CafeStore.validateScanSession(scannedTokenFromUrl, scannedTableFromUrl);

  const state = {
    selectedTable: scannedTableFromUrl,
    activeCategory: 'all',
    searchQuery: '',
    cart: loadSavedCart(),
    currentOrder: null,
    products: CafeStore.getProducts(),
    selectedProductForModal: null,
    modalOptionsState: {},
    torchStream: null,
    flashIntervalId: null,
    isSecurityValid: sessionCheck.valid,
    isSessionExpired: sessionCheck.expired
  };

  const tablePillEl = document.getElementById('tablePill');
  const categoriesListEl = document.getElementById('categoriesList');
  const productsGridEl = document.getElementById('productsGrid');
  const searchInputEl = document.getElementById('searchInput');
  const floatingCartBarEl = document.getElementById('floatingCartBar');
  const cartBadgeCountEl = document.getElementById('cartBadgeCount');
  const cartTotalValEl = document.getElementById('cartTotalVal');
  const viewCartBtn = document.getElementById('viewCartBtn');
  const readyFlashOverlay = document.getElementById('readyFlashOverlay');
  const flashOrderInfo = document.getElementById('flashOrderInfo');
  const dismissFlashBtn = document.getElementById('dismissFlashBtn');

  const liveOrderTrackerSection = document.getElementById('liveOrderTrackerSection');
  const trackerOrderIdEl = document.getElementById('trackerOrderId');
  const trackerStatusBadgeEl = document.getElementById('trackerStatusBadge');
  const trackerSubTextEl = document.getElementById('trackerSubText');
  const stepperProgressFillEl = document.getElementById('stepperProgressFill');

  const step1El = document.getElementById('step1');
  const step2El = document.getElementById('step2');
  const step3El = document.getElementById('step3');
  const step1IconEl = document.getElementById('step1Icon');
  const step2IconEl = document.getElementById('step2Icon');
  const step3IconEl = document.getElementById('step3Icon');

  const productModalOverlay = document.getElementById('productModalOverlay');
  const cartModalOverlay = document.getElementById('cartModalOverlay');
  const statusModalOverlay = document.getElementById('statusModalOverlay');
  const tableModalOverlay = document.getElementById('tableModalOverlay');

  const selectTableBtn = document.getElementById('selectTableBtn');
  const submitOrderBtn = document.getElementById('submitOrderBtn');
  const refreshMenuBtn = document.getElementById('refreshMenuBtn');

  const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80';

  initApp();

  async function initApp() {
	  // TELEFONUN ESKİ MENÜ HAFIZASINI ZORLA SİLEN KOD
    localStorage.removeItem('cafe_products');
    updateTableUI();
    renderCategories();
    updateCartUI();
    setupSyncListener();
    setupEventListeners();
    startRealtimeCloudListeners();

    // Başlangıçta canlı takip kartını gizle ve aktif sipariş varsa göster
    if (liveOrderTrackerSection) liveOrderTrackerSection.style.display = 'none';
    checkActiveOrder();

    await syncProductsFromCloud();
    renderProducts();

    // ANLIK CANLI BULUT KONTROLÜ (1.5 SANİYEDE BİR STOK KONTROLÜ)
    setInterval(syncProductsFromCloud, 1500);
    setInterval(checkSessionExpiry, 10000);
  }

  function loadSavedCart() {
    try {
      const c = localStorage.getItem('draft_cart');
      return c ? JSON.parse(c) : [];
    } catch (e) {
      return [];
    }
  }

  function saveDraftCart() {
    try {
      localStorage.setItem('draft_cart', JSON.stringify(state.cart));
    } catch (e) {}
  }

  function checkSessionExpiry() {
    const check = CafeStore.validateScanSession(null, state.selectedTable);
    state.isSessionExpired = check.expired;
  }

  function applyProducts(newProducts) {
    if (!newProducts || !Array.isArray(newProducts) || newProducts.length === 0) return;
    const prevJson = JSON.stringify(state.products);
    const newJson = JSON.stringify(newProducts);

    if (prevJson !== newJson) {
      state.products = newProducts;
      renderProducts();

      // Eğer müşterinin ekranında açık bir ürün modalı varsa güncelle
      if (state.selectedProductForModal) {
        const updatedModalProduct = newProducts.find(p => p.id === state.selectedProductForModal.id);
        if (!updatedModalProduct) {
          closeAllModals();
          showToast(`⚠️ Bakmakta olduğunuz ürün menüden kaldırıldı.`, 'info');
        } else if (updatedModalProduct.inStock === false) {
          closeAllModals();
          showToast(`⚠️ Bakmakta olduğunuz "${updatedModalProduct.name}" ürünü tükendi!`, 'error');
        } else {
          state.selectedProductForModal = updatedModalProduct;
          const totalPriceValEl = document.getElementById('modalTotalPriceVal');
          if (totalPriceValEl) {
            let unitPrice = updatedModalProduct.price;
            Object.values(state.modalOptionsState || {}).forEach(opt => {
              if (opt && opt.priceAdd) unitPrice += opt.priceAdd;
            });
            const qtyValEl = document.getElementById('modalQtyVal');
            const currentQty = qtyValEl ? parseInt(qtyValEl.textContent) || 1 : 1;
            totalPriceValEl.textContent = `${unitPrice * currentQty} ₺`;
          }
        }
      }
    }
  }

  async function syncProductsFromCloud() {
    const cloudProducts = await CafeStore.fetchProductsFromCloud();
    if (cloudProducts && Array.isArray(cloudProducts) && cloudProducts.length > 0) {
      applyProducts(cloudProducts);
    }
  }

  function startRealtimeCloudListeners() {
    CafeStore.listenCloudStatus((payload) => {
      checkActiveOrder();
    });
    CafeStore.listenCloudProducts((productsFromCloud) => {
      if (productsFromCloud && Array.isArray(productsFromCloud) && productsFromCloud.length > 0) {
        applyProducts(productsFromCloud);
      } else {
        syncProductsFromCloud();
      }
    });
  }

  function renderOrderTracker(order) {
    if (!liveOrderTrackerSection) return;

    if (!order || !order.status || order.status === 'completed') {
      liveOrderTrackerSection.style.display = 'none';
      return;
    }

    liveOrderTrackerSection.style.display = 'block';
    if (trackerOrderIdEl) trackerOrderIdEl.textContent = `(#${order.id})`;

    [step1El, step2El, step3El].forEach(el => {
      if (el) {
        el.classList.remove('active', 'completed');
      }
    });

    if (step1IconEl) step1IconEl.textContent = '📡';
    if (step2IconEl) step2IconEl.textContent = '☕';
    if (step3IconEl) step3IconEl.textContent = '⚡';

    if (order.status === 'received') {
      if (step1El) step1El.classList.add('active');
      if (stepperProgressFillEl) stepperProgressFillEl.style.width = '10%';
      if (trackerStatusBadgeEl) {
        trackerStatusBadgeEl.textContent = '📡 İletişim Bekleniyor / Mutfak Henüz Onaylamadı';
        trackerStatusBadgeEl.style.background = 'rgba(230, 126, 34, 0.2)';
        trackerStatusBadgeEl.style.color = 'var(--primary)';
      }
      if (trackerSubTextEl) trackerSubTextEl.textContent = 'Siparişiniz ekrana iletildi. Mutfak ekibinin siparişinizi onaylaması bekleniyor (Henüz kabul edilmedi)...';

    } else if (order.status === 'preparing') {
      if (step1El) {
        step1El.classList.add('completed');
        if (step1IconEl) step1IconEl.textContent = '✓';
      }
      if (step2El) step2El.classList.add('active');
      if (stepperProgressFillEl) stepperProgressFillEl.style.width = '60%';
      if (trackerStatusBadgeEl) {
        trackerStatusBadgeEl.textContent = '✅ Mutfak Onayladı & Hazırlanıyor';
        trackerStatusBadgeEl.style.background = 'rgba(56, 189, 248, 0.2)';
        trackerStatusBadgeEl.style.color = 'var(--accent-sky)';
      }
      if (trackerSubTextEl) trackerSubTextEl.textContent = 'Mutfak ekibi siparişinizi KABUL ETTİ! Baristanız içeceklerinizi özenle hazırlıyor...';

    } else if (order.status === 'ready') {
      if (step1El) {
        step1El.classList.add('completed');
        if (step1IconEl) step1IconEl.textContent = '✓';
      }
      if (step2El) {
        step2El.classList.add('completed');
        if (step2IconEl) step2IconEl.textContent = '✓';
      }
      if (step3El) step3El.classList.add('active');
      if (stepperProgressFillEl) stepperProgressFillEl.style.width = '100%';
      if (trackerStatusBadgeEl) {
        trackerStatusBadgeEl.textContent = '⚡ HAZIR! BARDAN ALINIZ';
        trackerStatusBadgeEl.style.background = 'rgba(244, 63, 94, 0.2)';
        trackerStatusBadgeEl.style.color = 'var(--accent-rose)';
      }
      if (trackerSubTextEl) trackerSubTextEl.textContent = 'Siparişiniz tamamlandı! Lütfen bardan teslim alınız.';
    }
  }

  function getTableFromUrl() {
    const m = urlParams.get('masa') || urlParams.get('table');
    if (m) {
      return m.startsWith('Masa') ? m : `Masa ${m.padStart(2, '0')}`;
    }
    return null;
  }

  function updateTableUI() {
    if (tablePillEl) tablePillEl.textContent = `📍 ${state.selectedTable}`;
    localStorage.setItem('current_table', state.selectedTable);
  }

  function renderCategories() {
    if (!categoriesListEl) return;
    categoriesListEl.innerHTML = DEFAULT_CATEGORIES.map(cat => `
      <button class="category-chip ${cat.id === state.activeCategory ? 'active' : ''}" data-id="${cat.id}">
        <span>${cat.icon}</span> ${cat.name}
      </button>
    `).join('');
  }

  function renderProducts() {
    if (!productsGridEl) return;
    let filtered = state.products;

    if (state.activeCategory !== 'all') {
      filtered = filtered.filter(p => p.categoryId === state.activeCategory);
    }

    if (state.searchQuery.trim() !== '') {
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
    }

    if (filtered.length === 0) {
      productsGridEl.innerHTML = `
        <div style="text-align:center; padding: 40px 20px; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 10px;">🔍</div>
          <p style="font-weight: 600;">Aradığınız kriterlere uygun ürün bulunamadı.</p>
        </div>
      `;
      return;
    }

    productsGridEl.innerHTML = filtered.map(p => {
      const imgUrl = p.image || DEFAULT_FALLBACK_IMAGE;
      const isOutOfStock = p.inStock === false;

      return `
        <div class="product-card ${isOutOfStock ? 'out-of-stock-card' : ''}" data-id="${p.id}" style="${isOutOfStock ? 'opacity: 0.6; filter: grayscale(0.5);' : ''}">
          <img src="${imgUrl}" alt="${p.name}" class="product-img" loading="lazy" onerror="this.onerror=null; this.src='${DEFAULT_FALLBACK_IMAGE}';" />
          <div class="product-info">
            <div>
              <div class="product-name">${p.name}</div>
              <div class="product-desc">${p.description || ''}</div>
              <div class="badge-row">
                ${isOutOfStock ? `<span class="badge-pill" style="background: rgba(244, 63, 94, 0.2); color: #f43f5e; font-weight: 800;">🚫 TÜKENDİ</span>` : ''}
                ${p.badges && !isOutOfStock ? p.badges.map(b => `<span class="badge-pill">${b}</span>`).join('') : ''}
              </div>
            </div>
            <div class="product-bottom">
              <div class="product-price">${p.price} ₺</div>
              ${isOutOfStock 
                ? `<button class="add-btn" disabled style="background: #475569; cursor: not-allowed; opacity: 0.5;">✕</button>`
                : `<button class="add-btn" data-id="${p.id}">+</button>`
              }
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function updateCartUI() {
    saveDraftCart();
    const totalCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = calculateCartTotal();

    if (cartBadgeCountEl) cartBadgeCountEl.textContent = totalCount;
    if (cartTotalValEl) cartTotalValEl.textContent = `${totalPrice} ₺`;

    if (floatingCartBarEl) {
      floatingCartBarEl.style.display = totalCount > 0 ? 'flex' : 'none';
    }
  }

  function calculateCartTotal() {
    return state.cart.reduce((sum, item) => {
      let itemPrice = item.product.price;
      if (item.selectedOptions) {
        Object.values(item.selectedOptions).forEach(opt => {
          if (opt && opt.priceAdd) itemPrice += opt.priceAdd;
        });
      }
      return sum + (itemPrice * item.qty);
    }, 0);
  }

  function addToCart(product, options = {}, qty = 1, note = '') {
    if (product.inStock === false) {
      showToast(`⚠️ Bu ürün tükenmiştir. Sipariş edilemez.`, 'error');
      return;
    }
    const cartItem = {
      cartId: 'c_' + Date.now() + Math.random().toString(36).substr(2, 4),
      product,
      selectedOptions: options,
      qty,
      note
    };
    state.cart.push(cartItem);
    updateCartUI();
    showToast(`"${product.name}" sepete eklendi!`, 'success');
  }

  function setupEventListeners() {
    if (categoriesListEl) {
      categoriesListEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.category-chip');
        if (btn) {
          state.activeCategory = btn.dataset.id;
          renderCategories();
          renderProducts();
        }
      });
    }

    if (searchInputEl) {
      searchInputEl.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderProducts();
      });
    }

    if (productsGridEl) {
      productsGridEl.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        if (card) {
          const productId = card.dataset.id;
          const product = state.products.find(p => p.id === productId);
          if (product) {
            if (product.inStock === false) {
              showToast(`⚠️ "${product.name}" tükenmiştir.`, 'error');
              return;
            }
            openProductModal(product);
          }
        }
      });
    }

    if (viewCartBtn) viewCartBtn.addEventListener('click', openCartModal);
    if (selectTableBtn) selectTableBtn.addEventListener('click', openTableModal);
    if (submitOrderBtn) submitOrderBtn.addEventListener('click', submitOrder);

    if (refreshMenuBtn) {
      refreshMenuBtn.addEventListener('click', async () => {
        await syncProductsFromCloud();
        showToast(`✨ Menü güncellendi!`, 'success');
      });
    }

    if (dismissFlashBtn) {
      dismissFlashBtn.addEventListener('click', stopSelfServiceFlashAlert);
    }

    document.querySelectorAll('.close-btn, .modal-overlay').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target === el || e.target.classList.contains('close-btn')) {
          closeAllModals();
        }
      });
    });
  }

  function openProductModal(product) {
    state.selectedProductForModal = product;
    state.modalOptionsState = {};
    let modalQty = 1;

    if (product.options) {
      product.options.forEach(group => {
        if (group.choices && group.choices.length > 0) {
          state.modalOptionsState[group.name] = group.choices[0];
        }
      });
    }

    const modalBody = document.getElementById('productModalBody');
    if (!modalBody) return;

    modalBody.innerHTML = `
      <img src="${product.image || DEFAULT_FALLBACK_IMAGE}" alt="${product.name}" class="detail-img" onerror="this.onerror=null; this.src='${DEFAULT_FALLBACK_IMAGE}';" />
      <h2 style="font-size: 1.3rem; margin-bottom: 6px;">${product.name}</h2>
      <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 16px;">${product.description || ''}</p>
      
      ${product.options && product.options.length > 0 ? product.options.map(group => `
        <div class="option-group">
          <div class="option-group-title">${group.name}</div>
          <div class="option-choices">
            ${group.choices.map((choice, idx) => `
              <label class="choice-label ${idx === 0 ? 'selected' : ''}" data-group="${group.name}" data-idx="${idx}">
                <span>${choice.label}</span>
                <span style="font-weight: 700;">${choice.priceAdd > 0 ? `+${choice.priceAdd} ₺` : ''}</span>
              </label>
            `).join('')}
          </div>
        </div>
      `).join('') : ''}

      <div class="option-group">
        <div class="option-group-title">Sipariş Notu</div>
        <textarea id="modalProductNote" class="note-input" placeholder="Örn: Az şekerli olsun, buzsuz..."></textarea>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-subtle);">
        <div class="qty-counter">
          <button class="qty-btn" id="modalQtyMinus">-</button>
          <span class="qty-val" id="modalQtyVal">1</span>
          <button class="qty-btn" id="modalQtyPlus">+</button>
        </div>
        <button id="modalAddToCartBtn" class="view-cart-btn">
          Ekle • <span id="modalTotalPriceVal">${product.price} ₺</span>
        </button>
      </div>
    `;

    const qtyValEl = document.getElementById('modalQtyVal');
    const totalPriceValEl = document.getElementById('modalTotalPriceVal');

    const updateModalPrice = () => {
      let unitPrice = product.price;
      Object.values(state.modalOptionsState).forEach(opt => {
        if (opt && opt.priceAdd) unitPrice += opt.priceAdd;
      });
      totalPriceValEl.textContent = `${unitPrice * modalQty} ₺`;
    };

    modalBody.querySelectorAll('.choice-label').forEach(label => {
      label.addEventListener('click', () => {
        const groupName = label.dataset.group;
        const choiceIdx = parseInt(label.dataset.idx);
        
        modalBody.querySelectorAll(`.choice-label[data-group="${groupName}"]`).forEach(l => l.classList.remove('selected'));
        label.classList.add('selected');

        const groupObj = product.options.find(g => g.name === groupName);
        if (groupObj) state.modalOptionsState[groupName] = groupObj.choices[choiceIdx];
        updateModalPrice();
      });
    });

    document.getElementById('modalQtyMinus').addEventListener('click', () => {
      if (modalQty > 1) {
        modalQty--;
        qtyValEl.textContent = modalQty;
        updateModalPrice();
      }
    });

    document.getElementById('modalQtyPlus').addEventListener('click', () => {
      modalQty++;
      qtyValEl.textContent = modalQty;
      updateModalPrice();
    });

    document.getElementById('modalAddToCartBtn').addEventListener('click', () => {
      const note = document.getElementById('modalProductNote').value;
      addToCart(product, { ...state.modalOptionsState }, modalQty, note);
      closeAllModals();
    });

    if (productModalOverlay) productModalOverlay.classList.add('active');
  }

  function openCartModal() {
    const cartBody = document.getElementById('cartModalBody');
    if (!cartBody) return;

    if (state.cart.length === 0) {
      cartBody.innerHTML = `
        <div style="text-align:center; padding: 30px 10px; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 10px;">🛒</div>
          <p style="font-weight: 700; font-size: 1.1rem; color: var(--text-main);">Sepetiniz Boş</p>
        </div>
      `;
      if (submitOrderBtn) submitOrderBtn.style.display = 'none';
    } else {
      cartBody.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px;">
          ${state.cart.map((item, idx) => {
            let itemUnitPrice = item.product.price;
            const optionsText = Object.entries(item.selectedOptions || {}).map(([key, opt]) => {
              if (opt.priceAdd) itemUnitPrice += opt.priceAdd;
              return `${opt.label}`;
            }).join(', ');

            return `
              <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 12px; background: var(--bg-surface); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                <div style="flex:1;">
                  <div style="font-weight: 700; color: var(--text-main);">${item.product.name}</div>
                  ${optionsText ? `<div style="font-size: 0.75rem; color: var(--text-muted);">${optionsText}</div>` : ''}
                  ${item.note ? `<div style="font-size: 0.75rem; color: var(--primary); font-style: italic;">Not: ${item.note}</div>` : ''}
                  <div style="font-weight: 800; color: var(--primary); margin-top: 4px;">${itemUnitPrice * item.qty} ₺</div>
                </div>
                <div class="qty-counter" style="padding: 4px 8px;">
                  <button class="qty-btn cart-qty-minus" data-idx="${idx}">-</button>
                  <span class="qty-val">${item.qty}</span>
                  <button class="qty-btn cart-qty-plus" data-idx="${idx}">+</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div style="background: var(--bg-surface); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem; color: var(--text-muted);">
            <span>Masa:</span>
            <span style="font-weight: 700; color: var(--text-main);">${state.selectedTable}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 800; color: var(--text-main); border-top: 1px solid var(--border-subtle); padding-top: 8px;">
            <span>Toplam Tutar:</span>
            <span style="color: var(--primary);">${calculateCartTotal()} ₺</span>
          </div>
        </div>
      `;

      if (submitOrderBtn) submitOrderBtn.style.display = 'block';

      cartBody.querySelectorAll('.cart-qty-minus').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx);
          if (state.cart[idx].qty > 1) state.cart[idx].qty--;
          else state.cart.splice(idx, 1);
          updateCartUI();
          openCartModal();
        });
      });

      cartBody.querySelectorAll('.cart-qty-plus').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx);
          state.cart[idx].qty++;
          updateCartUI();
          openCartModal();
        });
      });
    }

    if (cartModalOverlay) cartModalOverlay.classList.add('active');
  }

  async function submitOrder() {
    if (state.cart.length === 0) return;

    submitOrderBtn.disabled = true;
    submitOrderBtn.textContent = '📡 İletişim Kuruluyor...';

    const ultraLightItems = state.cart.map(item => ({
      cartId: item.cartId,
      product: {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        categoryId: item.product.categoryId || 'cold_drinks'
      },
      selectedOptions: item.selectedOptions || {},
      qty: item.qty,
      note: item.note || ''
    }));

    const newOrder = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      table: state.selectedTable,
      items: ultraLightItems,
      total: calculateCartTotal(),
      status: 'received',
      createdAt: new Date().toISOString()
    };

    await CafeStore.addOrder(newOrder);

    submitOrderBtn.disabled = false;
    submitOrderBtn.textContent = '🚀 Siparişi Onayla ve Gönder';

    state.currentOrder = newOrder;
    state.cart = [];
    saveDraftCart();
    updateCartUI();
    closeAllModals();

    renderOrderTracker(newOrder);
    showToast(`📡 Sipariş İletildi - Mutfak Ekibinin Onayı Bekleniyor...`, 'info');
  }

  function checkActiveOrder() {
    const orders = CafeStore.getOrders();
    const active = orders.find(o => o.table === state.selectedTable && o.status && o.status !== 'completed');

    if (active) {
      state.currentOrder = active;
      renderOrderTracker(active);
      if (active.status === 'ready') {
        startSelfServiceFlashAlert(active);
      }
    } else {
      state.currentOrder = null;
      if (liveOrderTrackerSection) liveOrderTrackerSection.style.display = 'none';
    }
  }

  function startSelfServiceFlashAlert(order) {
    if (!readyFlashOverlay) return;

    if (flashOrderInfo) {
      flashOrderInfo.innerHTML = `
        <div style="font-size: 0.85rem; color: var(--text-muted);">Sipariş No: <strong>#${order.id}</strong></div>
        <div style="font-size: 1.2rem; font-weight: 800; color: var(--primary); margin-top: 2px;">📍 ${order.table}</div>
      `;
    }

    readyFlashOverlay.classList.add('active');
    playAlarmBeepSound();

    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([500, 200, 500, 200, 500, 200, 800]);
      } catch (e) {}
    }

    tryEnableCameraTorch();
  }

  function stopSelfServiceFlashAlert() {
    if (readyFlashOverlay) readyFlashOverlay.classList.remove('active');

    if (state.torchStream) {
      state.torchStream.getTracks().forEach(track => track.stop());
      state.torchStream = null;
    }

    if (state.currentOrder) {
      CafeStore.updateOrderStatus(state.currentOrder.id, 'completed');
      state.currentOrder = null;
    }

    if (liveOrderTrackerSection) liveOrderTrackerSection.style.display = 'none';
    showToast(`✨ Afiyet olsun! Sipariş teslim alındı.`, 'success');
  }

  function playAlarmBeepSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const playPulse = (delay, freq) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.4, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        }, delay);
      };

      playPulse(0, 880);
      playPulse(350, 880);
      playPulse(700, 1174.66);
    } catch (e) {}
  }

  async function tryEnableCameraTorch() {
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        state.torchStream = stream;
        const track = stream.getVideoTracks()[0];

        if (track && track.getCapabilities && track.getCapabilities().torch) {
          let torchOn = true;
          state.flashIntervalId = setInterval(() => {
            track.applyConstraints({ advanced: [{ torch: torchOn }] }).catch(() => {});
            torchOn = !torchOn;
          }, 400);
        }
      } catch (e) {}
    }
  }

  function setupSyncListener() {
    if ('BroadcastChannel' in window) {
      const bc = new BroadcastChannel('cafe_sync');
      bc.postMessage = bc.postMessage || function(){};
      bc.onmessage = (event) => {
        if (event.data.type === 'orders_updated') {
          checkActiveOrder();
        } else if (event.data.type === 'products_updated') {
          syncProductsFromCloud();
        }
      };
    }

    window.addEventListener('storage', (event) => {
      if (event.key === 'cafe_products') {
        syncProductsFromCloud();
      }
    });

    window.addEventListener('cafe_data_sync', (event) => {
      if (event.detail && event.detail.type === 'products_updated') {
        syncProductsFromCloud();
      }
    });
  }

  function openTableModal() {
    const tableBody = document.getElementById('tableModalBody');
    if (!tableBody) return;

    const tables = Array.from({ length: 60 }, (_, i) => `Masa ${String(i + 1).padStart(2, '0')}`);

    tableBody.innerHTML = `
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px;">Oturduğunuz masayı seçiniz:</p>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
        ${tables.map(t => `
          <button class="choice-label ${t === state.selectedTable ? 'selected' : ''}" style="justify-content: center; font-weight: 700;" data-table="${t}">
            ${t}
          </button>
        `).join('')}
      </div>
    `;

    tableBody.querySelectorAll('[data-table]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.selectedTable = btn.dataset.table;
        updateTableUI();
        closeAllModals();
        showToast(`Masa "${state.selectedTable}" mevcuttur.`, 'info');
      });
    });

    if (tableModalOverlay) tableModalOverlay.classList.add('active');
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  }

  function showToast(message, type = 'info') {
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toastContainer';
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
});
