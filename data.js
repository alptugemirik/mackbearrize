/**
 * QR Kafe - Menü Verileri, Ürünler & Sipariş Katmanı (data.js)
 * FIREBASE REALTIME DATABASE ENTEGRASYONLU VERSİYON
 */

const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'Tümü', icon: '✨' },
  { id: 'hot_coffee', name: 'Sıcak Kahveler', icon: '☕' },
  { id: 'cold_coffee', name: 'Soğuk Kahveler', icon: '🧊' },
  { id: 'tea', name: 'Çay & Bitki Çayları', icon: '🫖' },
  { id: 'desserts', name: 'Tatlılar & Pastalar', icon: '🍰' },
  { id: 'food', name: 'Yiyecek & Sandviç', icon: '🥪' },
  { id: 'cold_drinks', name: 'Soğuk İçecekler', icon: '🥤' }
];

const DEFAULT_PRODUCTS = [
  {
    id: "mb_filter_coffee",
    categoryId: "hot_coffee",
    name: "Filter Coffee (Filtre Kahve)",
    description: "Özel harman taze çekilmiş Arabica çekirdeklerinden demlenmiş zengin aromalı filtre kahve.",
    price: 70,
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Klasik"],
    options: [{ name: "Boyut", choices: [{ label: "Orta (350ml)", priceAdd: 0 }, { label: "Büyük (450ml)", priceAdd: 15 }] }]
  },
  {
    id: "mb_cafe_au_lait",
    categoryId: "hot_coffee",
    name: "Cafe Au Lait",
    description: "Demleme filtre kahve ve sıcak sütün dengeli harmanı.",
    price: 75,
    image: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80",
    popular: false,
    inStock: true,
    badges: ["Yumuşak İçim"],
    options: []
  },
  {
    id: "mb_espresso",
    categoryId: "hot_coffee",
    name: "Espresso",
    description: "%100 Arabica çekirdeklerinden taze çekilmiş yoğun gövdeli geleneksel İtalyan espressosu.",
    price: 65,
    image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Yoğun"],
    options: [{ name: "Boyut", choices: [{ label: "Tek (Single)", priceAdd: 0 }, { label: "Çift (Double)", priceAdd: 25 }] }]
  },
  {
    id: "mb_americano",
    categoryId: "hot_coffee",
    name: "Americano",
    description: "Espresso shot üzerine eklenen sıcak su ile yumuşatılmış zengin kahve lezzeti.",
    price: 75,
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Popüler"],
    options: [{ name: "Boyut", choices: [{ label: "Orta (350ml)", priceAdd: 0 }, { label: "Büyük (450ml)", priceAdd: 15 }] }]
  },
  {
    id: "mb_latte",
    categoryId: "hot_coffee",
    name: "Cafe Latte",
    description: "Yumuşak içimli espresso ve buharla kadifemsi ısıtılmış taze süt.",
    price: 85,
    image: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Favori"],
    options: [
      { name: "Boyut", choices: [{ label: "Orta (400ml)", priceAdd: 0 }, { label: "Büyük (500ml)", priceAdd: 20 }] },
      { name: "Süt Tercihi", choices: [{ label: "Tam Yağlı Süt", priceAdd: 0 }, { label: "Yulaf Sütü", priceAdd: 20 }, { label: "Badem Sütü", priceAdd: 20 }, { label: "Laktozsuz Süt", priceAdd: 10 }] }
    ]
  },
  {
    id: "mb_flat_white",
    categoryId: "hot_coffee",
    name: "Flat White",
    description: "Çift shot ristretto espresso ve mikroskopik mikro köpüklü sıcak süt dengesi.",
    price: 90,
    image: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=600&q=80",
    popular: false,
    inStock: true,
    badges: ["Yoğun Aromalı"],
    options: []
  },
  {
    id: "mb_caramel_macchiato",
    categoryId: "hot_coffee",
    name: "Caramel Macchiato",
    description: "Sıcak süt, vanilya şurubu, dökülen espresso shot ve üzerinde nefis karamel sos.",
    price: 95,
    image: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Tatlı", "Popüler"],
    options: [{ name: "Boyut", choices: [{ label: "Orta (400ml)", priceAdd: 0 }, { label: "Büyük (500ml)", priceAdd: 20 }] }]
  },
  {
    id: "mb_mocha",
    categoryId: "hot_coffee",
    name: "Mocha",
    description: "Espresso, Belçika çikolatası sosu, sıcak süt ve süt köpüğü.",
    price: 95,
    image: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Çikolatalı"],
    options: []
  },
  {
    id: "mb_white_mocha",
    categoryId: "hot_coffee",
    name: "White Chocolate Mocha",
    description: "Espresso, aromatik beyaz çikolata sosu ve kadifemsi süt.",
    price: 100,
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Çok Satan"],
    options: []
  },
  {
    id: "mb_cappuccino",
    categoryId: "hot_coffee",
    name: "Cappuccino",
    description: "Espresso, sıcak süt ve bol köpük tabakası. Üzerinde kakao tozu ile.",
    price: 85,
    image: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Bol Köpüklü"],
    options: []
  },
  {
    id: "mb_pumpkin_spice_latte",
    categoryId: "hot_coffee",
    name: "Pumpkin Spice Latte",
    description: "Balkabağı aroması, tarçın, karanfil, espresso ve sıcak kremsi süt.",
    price: 105,
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Özel Sezon"],
    options: []
  },
  {
    id: "mb_biscoff_latte",
    categoryId: "hot_coffee",
    name: "Biscoff Latte",
    description: "Lotus Bisküvi krema özü, espresso ve kremsi sıcak süt kombinasyonu.",
    price: 110,
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Mackbear Özel"],
    options: []
  },
  {
    id: "mb_oreo_latte",
    categoryId: "hot_coffee",
    name: "Oreo Latte",
    description: "Gerçek Oreo bisküvi parçacıkları, Belçika çikolatası, espresso ve sıcak süt.",
    price: 110,
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Özel Lezzet"],
    options: []
  },
  {
    id: "mb_turkish_coffee",
    categoryId: "hot_coffee",
    name: "Türk Kahvesi",
    description: "Geleneksel közde demlenmiş Bol Köpüklü Türk Kahvesi. Yanında lokum ve su ile.",
    price: 50,
    image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Geleneksel"],
    options: [{ name: "Şeker Oranı", choices: [{ label: "Sade", priceAdd: 0 }, { label: "Az Şekerli", priceAdd: 0 }, { label: "Orta", priceAdd: 0 }, { label: "Şekerli", priceAdd: 0 }] }]
  },
  {
    id: "mb_ice_americano",
    categoryId: "cold_coffee",
    name: "Ice Americano",
    description: "Buzlu soğuk su üzerine taze çekilmiş çift shot espresso.",
    price: 80,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Soğuk", "Sert"],
    options: []
  },
  {
    id: "mb_ice_latte",
    categoryId: "cold_coffee",
    name: "Ice Cafe Latte",
    description: "Bol buzlu soğuk süt ve üzerine süzülen taze espresso.",
    price: 90,
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Popüler Soğuk"],
    options: []
  },
  {
    id: "mb_ice_caramel_macchiato",
    categoryId: "cold_coffee",
    name: "Ice Caramel Macchiato",
    description: "Buzlu süt, vanilya şurubu, espresso shot ve üzerinde nefis karamel sos gezdirilmiş soğuk kahve.",
    price: 105,
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Favori Soğuk"],
    options: []
  },
  {
    id: "mb_ice_white_mocha",
    categoryId: "cold_coffee",
    name: "Ice White Chocolate Mocha",
    description: "Buzlu süt, yoğun beyaz çikolata aroması ve espresso.",
    price: 110,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Çok Satan"],
    options: []
  },
  {
    id: "mb_coffee_frappe",
    categoryId: "cold_coffee",
    name: "Coffee Frappe",
    description: "Buz, süt ve kahve özünün blenderda kremsi kıvamda çekilmesi ile hazırlanan buz gibi frappe.",
    price: 105,
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Buz Gibi Frappe"],
    options: []
  },
  {
    id: "mb_mocha_frappe",
    categoryId: "cold_coffee",
    name: "Mocha Frappe",
    description: "Çikolata sosu, espresso, süt ve kırılmış buz harmanı. Üzerinde krema ile.",
    price: 115,
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Çikolatalı Frappe"],
    options: []
  },
  {
    id: "mb_caramel_frappe",
    categoryId: "cold_coffee",
    name: "Caramel Frappe",
    description: "Karamel sosu, kahve, kremsi süt ve kırılmış buz harmanı. Üzerinde krema ile.",
    price: 115,
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Karamelli Frappe"],
    options: []
  },
  {
    id: "mb_chai_tea_latte",
    categoryId: "tea",
    name: "Chai Tea Latte",
    description: "Aromatik Hint baharatları (tarçın, zencefil, karanfil) ve sıcak köpüklü süt harmanı.",
    price: 85,
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Baharatlı", "Sıcak"],
    options: []
  },
  {
    id: "mb_hot_chocolate",
    categoryId: "tea",
    name: "Hot Chocolate (Sıcak Çikolata)",
    description: "Yoğun Belçika çikolatası ve buharla ısıtılmış taze süt.",
    price: 85,
    image: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Çikolata"],
    options: []
  },
  {
    id: "mb_salep",
    categoryId: "tea",
    name: "Geleneksel Salep",
    description: "Gerçek salep yumrusundan hazırlanan üzerine bol tarçın serpilmiş kıvamlı sıcak salep.",
    price: 80,
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Kış Klasiği"],
    options: []
  },
  {
    id: "mb_tea_demleme",
    categoryId: "tea",
    name: "Geleneksel Demleme Çay",
    description: "Rize harmanı taze demlenmiş geleneksel ince belli bardakta Türk çayı.",
    price: 30,
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Demleme"],
    options: []
  },
  {
    id: "mb_lemonade_strawberry",
    categoryId: "cold_drinks",
    name: "Lemonade Strawberry (Çilekli Limonata)",
    description: "Taze sıkılmış limon, gerçek çilek püresi ve nane yaprakları buz gibi.",
    price: 85,
    image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Meyveli", "Taze"],
    options: []
  },
  {
    id: "mb_lemonade_mint",
    categoryId: "cold_drinks",
    name: "Lemonade Mint (Naneli Limonata)",
    description: "Ev yapımı taze sıkılmış limonata ve ferahlatıcı taze nane yaprakları.",
    price: 80,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Naneli"],
    options: []
  },
  {
    id: "mb_frozen_wildberries",
    categoryId: "cold_drinks",
    name: "Wild Berries Frozen",
    description: "Orman meyveleri (ahududu, böğüttlen, yaban mersini) ile buz gibi blender serinliği.",
    price: 105,
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Frozen", "Buzlu"],
    options: []
  },
  {
    id: "mb_frozen_mango",
    categoryId: "cold_drinks",
    name: "Mango Frozen",
    description: "Tropikal mango özü ve kırılmış buz ferahlığı.",
    price: 105,
    image: "https://images.unsplash.com/photo-1623065422902-30a2d299bcc4?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Tropikal"],
    options: []
  },
  {
    id: "mb_cheesecake_san_sebastian",
    categoryId: "desserts",
    name: "İspanyol San Sebastian Cheesecake",
    description: "Dışı karamelize olmuş, içi akışkan İspanyol tatlısı. Sıcak Belçika çikolatası ile.",
    price: 160,
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Şefin Seçimi", "Favori"],
    options: [{ name: "Sos Tercihi", choices: [{ label: "Sütlü Çikolata", priceAdd: 0 }, { label: "Bitter Çikolata", priceAdd: 0 }] }]
  },
  {
    id: "mb_cheesecake_frambuaz",
    categoryId: "desserts",
    name: "Frambuazlı Swirl Cheesecake",
    description: "Geleneksel kıvamda fırınlanmış, üzerinde nefis ekşimsi frambuaz sosu.",
    price: 140,
    image: "https://images.unsplash.com/photo-1524351199678-941a58a3df50?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Meyveli Tatlı"],
    options: []
  },
  {
    id: "mb_tiramisu",
    categoryId: "desserts",
    name: "İtalyan Tiramisu",
    description: "Espresso ıslatmalı kedi dili bisküvi ve mascarpone peynirli orijinal İtalyan tarifi.",
    price: 135,
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["İtalyan"],
    options: []
  },
  {
    id: "mb_marlenka",
    categoryId: "desserts",
    name: "Klasik Ballı Marlenka",
    description: "Orijinal Çek tarifi ballı ve cevizli kat kat lezzet şöleni.",
    price: 140,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Ballı Cevizli"],
    options: []
  },
  {
    id: "mb_red_velvet",
    categoryId: "desserts",
    name: "Red Velvet (Kırmızı Kadife Pasta)",
    description: "Kadife dokulu kırmızı kek katları ve yumuşak krema dolgusu.",
    price: 140,
    image: "https://images.unsplash.com/photo-1586788680404-328248283776?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Popüler Pasta"],
    options: []
  },
  {
    id: "mb_panini_tavuk",
    categoryId: "food",
    name: "Kremalı Tavuk Susamlı Panini Sandviç",
    description: "Susamlı ciabatta ekmeği arasında kremalı jülyen tavuk parçaları, eritilmiş peynir.",
    price: 175,
    image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Sıcak Panini"],
    options: []
  },
  {
    id: "mb_panini_hindi_fume",
    categoryId: "food",
    name: "Hindi Füme Cheddar Panini",
    description: "Ekşi mayalı ciabatta ekmeği, hindi füme, erimiş cheddar peyniri ve taze domates.",
    price: 170,
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Popüler Sandviç"],
    options: []
  },
  {
    id: "mb_kruvasan_cikolata",
    categoryId: "food",
    name: "Çikolata Kremalı Fransız Kruvasanı",
    description: "Kat kat tereyağlı çıtır Fransız kruvasanı, içi bol Belçika çikolatası dolgulu.",
    price: 95,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
    popular: true,
    inStock: true,
    badges: ["Taze Fırın"],
    options: []
  },
  {
    id: "mb_berliner_visne",
    categoryId: "food",
    name: "Vişne Dolgulu Berliner",
    description: "Alman puf çöreği, içi yoğun ekşimsi tatlı vişne marmeladı dolgulu.",
    price: 75,
    image: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=600&q=80",
    popular: false,
    inStock: true,
    badges: ["Alman Çöreği"],
    options: []
  }
];

const NTFY_ORDERS_TOPIC = 'https://ntfy.sh/mackbear_cafe_orders_v99';
const NTFY_STATUS_TOPIC = 'https://ntfy.sh/mackbear_cafe_status_v99';

const QR_SESSION_MAX_AGE_MS = 5 * 60 * 1000;

class CafeStore {
  static getTableSecurityToken(tableName) {
    const tableNum = (tableName || 'Masa 01').replace(/\D/g, '') || '01';
    return `MBK-M${tableNum.padStart(2, '0')}-SEC99`;
  }

  static validateScanSession(scannedToken, scannedTable) {
    if (!scannedToken && !localStorage.getItem('qr_scanned_token')) {
      localStorage.setItem('qr_scan_timestamp', Date.now().toString());
      localStorage.setItem('qr_scanned_table', scannedTable);
      localStorage.setItem('qr_scanned_token', CafeStore.getTableSecurityToken(scannedTable));
      return { valid: true, expired: false, table: scannedTable };
    }

    const expectedToken = CafeStore.getTableSecurityToken(scannedTable);
    const storedScanTime = parseInt(localStorage.getItem('qr_scan_timestamp') || '0');

    if (scannedToken) {
      localStorage.setItem('qr_scan_timestamp', Date.now().toString());
      localStorage.setItem('qr_scanned_table', scannedTable);
      localStorage.setItem('qr_scanned_token', scannedToken);
      return { valid: true, expired: false, table: scannedTable };
    }

    if (storedScanTime > 0) {
      const elapsed = Date.now() - storedScanTime;
      if (elapsed <= QR_SESSION_MAX_AGE_MS) {
        return { valid: true, expired: false, table: scannedTable, remainingMs: QR_SESSION_MAX_AGE_MS - elapsed };
      } else {
        return { valid: true, expired: true, table: scannedTable };
      }
    }

    return { valid: true, expired: false, table: scannedTable };
  }

  static refreshScanTimer() {
    localStorage.setItem('qr_scan_timestamp', Date.now().toString());
  }

  static getProducts() {
    try {
      const localData = localStorage.getItem('cafe_products');
      if (localData) {
        const parsed = JSON.parse(localData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return DEFAULT_PRODUCTS;
    } catch (e) {
      return DEFAULT_PRODUCTS;
    }
  }

  // 1. ÜRÜNLERİ FİREBASE'DEN ÇEKECEK ŞEKİLDE GÜNCELLENDİ
  static async fetchProductsFromCloud() {
    try {
      // GitHub'daki menu.json yerine, direkt Firebase veritabanına istek atıyoruz
      const res = await fetch(`https://mackbearrize1-default-rtdb.europe-west1.firebasedatabase.app/products_v3.json?v=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          // Firebase veriyi bazen obje bazen dizi döndürebilir, bunu diziye çeviriyoruz
          const fileProducts = Array.isArray(data) ? data : Object.values(data).filter(Boolean);
          if (fileProducts.length > 0) {
            try {
              localStorage.setItem('cafe_products', JSON.stringify(fileProducts));
            } catch (e) { }
            return fileProducts;
          }
        }
      }
    } catch (e) {
      console.warn('fetchProductsFromCloud Firebase fetch error:', e);
    }
    return CafeStore.getProducts();
  }

  // 2. ÜRÜNLERİ FİREBASE'E KAYDEDECEK ŞEKİLDE GÜNCELLENDİ
  static async saveProducts(products) {
    if (!products || !Array.isArray(products)) return { success: false };

    try {
      localStorage.setItem('cafe_products', JSON.stringify(products));
    } catch (e) { }

    CafeStore.notifyDataChange('products_updated');

    // Verileri Firebase'e anında yüklüyoruz
    try {
      await fetch(`https://mackbearrize1-default-rtdb.europe-west1.firebasedatabase.app/products_v3.json`, {
        method: 'PUT', // Tüm ürün listesini günceller
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(products)
      });
    } catch (e) {
      console.error('Firebase saveProducts error:', e);
    }

    return { success: true };
  }

  // 3. FİREBASE'İ BEKLEMESİ İÇİN (async/await) DİĞER METOTLAR GÜNCELLENDİ
  static async toggleProductStock(productId) {
    const products = CafeStore.getProducts();
    const p = products.find(item => item.id === productId);
    if (!p) return;

    p.inStock = !p.inStock;
    await CafeStore.saveProducts(products);
    return p.inStock;
  }

  static downloadMenuJSON() {
    const products = CafeStore.getProducts();
    const jsonStr = JSON.stringify(products, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'menu.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static async importMenuJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (Array.isArray(parsed) && parsed.length > 0) {
            await CafeStore.saveProducts(parsed);
            resolve(parsed);
          } else {
            reject(new Error('Geçersiz menu.json formatı'));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  static async addProduct(product) {
    const products = CafeStore.getProducts();
    products.unshift(product);
    return await CafeStore.saveProducts(products);
  }

  static async updateProduct(product) {
    const products = CafeStore.getProducts();
    const idx = products.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      products[idx] = { ...products[idx], ...product };
      return await CafeStore.saveProducts(products);
    }
    return { success: false };
  }

  static async deleteProduct(id) {
    let products = CafeStore.getProducts();
    products = products.filter(p => p.id !== id);
    return await CafeStore.saveProducts(products);
  }

  static getOrders() {
    try {
      const data = localStorage.getItem('cafe_orders');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  static async clearAllOrders() {
    try {
      localStorage.removeItem('cafe_orders');
      localStorage.removeItem('cafe_notifications');
    } catch (e) { }
    CafeStore.notifyDataChange('orders_updated');

    try {
      await fetch(`https://mackbearrize1-default-rtdb.europe-west1.firebasedatabase.app/orders_v3.json`, {
        method: 'DELETE'
      });
    } catch (e) { }
  }

  static async fetchOrdersFromCloud() {
    try {
      const res = await fetch(`https://mackbearrize1-default-rtdb.europe-west1.firebasedatabase.app/orders_v3.json?v=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          const list = Object.values(data).filter(Boolean);
          list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          try {
            localStorage.setItem('cafe_orders', JSON.stringify(list));
          } catch (e) { }
          return list;
        }
      }
    } catch (e) {
      console.warn('fetchOrdersFromCloud error:', e);
    }
    return CafeStore.getOrders();
  }

  static async addOrder(order) {
    const orders = CafeStore.getOrders();
    if (!orders.some(o => o.id === order.id)) {
      orders.unshift(order);
      try {
        localStorage.setItem('cafe_orders', JSON.stringify(orders));
      } catch (e) { }
      CafeStore.notifyDataChange('orders_updated');
    }

    const payloadString = JSON.stringify(order);

    try {
      await fetch(`https://mackbearrize1-default-rtdb.europe-west1.firebasedatabase.app/orders_v3/${order.id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: payloadString
      });
    } catch (e) {
      console.error('Firebase addOrder error:', e);
    }

    try {
      await fetch(NTFY_ORDERS_TOPIC, {
        method: 'POST',
        headers: { 'Title': 'Yeni Siparis' },
        body: payloadString
      });
    } catch (e) {
      console.error('ntfy addOrder error:', e);
    }

    return order;
  }

  static async updateOrderStatus(orderId, newStatus) {
    const orders = CafeStore.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      order.updatedAt = new Date().toISOString();
      try {
        localStorage.setItem('cafe_orders', JSON.stringify(orders));
      } catch (e) { }
      CafeStore.notifyDataChange('orders_updated');
    }

    try {
      await fetch(`https://mackbearrize1-default-rtdb.europe-west1.firebasedatabase.app/orders_v3/${orderId}/status.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStatus)
      });
      await fetch(NTFY_STATUS_TOPIC, {
        method: 'POST',
        headers: { 'Title': 'Siparis Durum' },
        body: JSON.stringify({ orderId, status: newStatus, updatedAt: Date.now() })
      });
    } catch (e) { }
  }

  static getNotifications() {
    try {
      const data = localStorage.getItem('cafe_notifications');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  static markNotificationRead(id) {
    const notifs = CafeStore.getNotifications();
    const n = notifs.find(item => item.id === id);
    if (n) {
      n.read = true;
      try {
        localStorage.setItem('cafe_notifications', JSON.stringify(notifs));
      } catch (e) { }
      CafeStore.notifyDataChange('notification_updated');
    }
  }

  static notifyDataChange(type) {
    if ('BroadcastChannel' in window) {
      const bc = new BroadcastChannel('cafe_sync');
      bc.postMessage({ type, timestamp: Date.now() });
    }
    try {
      window.dispatchEvent(new CustomEvent('cafe_data_sync', { detail: { type, timestamp: Date.now() } }));
    } catch (e) { }
  }

  static listenCloudOrders(onNewOrder) {
    try {
      const eventSource = new EventSource(`${NTFY_ORDERS_TOPIC}/sse`);
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && parsed.message) {
            let order = null;
            if (typeof parsed.message === 'string') {
              order = JSON.parse(parsed.message);
            } else {
              order = parsed.message;
            }

            if (order && order.id) {
              const orders = CafeStore.getOrders();
              const existingIdx = orders.findIndex(o => o.id === order.id);
              if (existingIdx >= 0) {
                orders[existingIdx] = order;
              } else {
                orders.unshift(order);
              }
              try {
                localStorage.setItem('cafe_orders', JSON.stringify(orders));
              } catch (e) { }
              if (onNewOrder) onNewOrder(order);
            }
          }
        } catch (err) { }
      };
    } catch (e) { }
  }

  static listenCloudStatus(onStatusChange) {
    try {
      const eventSource = new EventSource(`${NTFY_STATUS_TOPIC}/sse`);
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && parsed.message) {
            let payload = null;
            if (typeof parsed.message === 'string') {
              payload = JSON.parse(parsed.message);
            } else {
              payload = parsed.message;
            }

            if (payload && payload.orderId) {
              const orders = CafeStore.getOrders();
              const order = orders.find(o => o.id === payload.orderId);
              if (order) {
                order.status = payload.status;
                try {
                  localStorage.setItem('cafe_orders', JSON.stringify(orders));
                } catch (e) { }
                if (onStatusChange) onStatusChange(payload);
              }
            }
          }
        } catch (err) { }
      };
    } catch (e) { }
  }

  // 4. UYGULAMANIN HATA VERMEMESİ İÇİN EKLENEN BOŞ DİNLEYİCİ
  static listenCloudProducts(onProductsChange) {
    // app.js dosyası setInterval ile (1.5 saniyede bir) ürünleri çektiği için bu fonksiyon şimdilik sadece uyumluluk sağlamak adına boş bırakılmıştır.
  }
}