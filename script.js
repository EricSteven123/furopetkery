const IMG_BARKCHANG = 'images/barkchang.png';
const IMG_CUSTOM_CAKES = 'images/custom_cakes.png';
const IMG_DUBAI_CHEWY_COOKIES = 'images/dubai_chewy_cookies.png';


/* ---------------- Data ---------------- */
const categories = [
  {id:'all', name:'All items', icon:'🏷️'},
  {id:'savory', name:'Savory bites', icon:'🍙'},
  {id:'cakes', name:'Custom cakes', icon:'🎂'},
  {id:'cookies', name:'Cookies & sweets', icon:'🍪'},
];

const products = [
  {
    id:'bakchang',
    name:'Bak Chang — Savory Rice Dumpling',
    tagline:'Sticky rice parcel with braised pork, salted egg yolk and mushroom, wrapped and steamed in bamboo leaf.',
    price:45000,
    cat:'savory',
    sold:210,
    badge:'New',
    image: IMG_BARKCHANG,
    bs:true, rank:2,
  },
  {
    id:'customcake',
    name:'Custom Character Cake',
    tagline:'Hand-piped buttercream cake fully customized to your theme — send us a reference and we\'ll recreate it.',
    price:350000,
    cat:'cakes',
    sold:64,
    badge:'Made to order',
    image: IMG_CUSTOM_CAKES,
    bs:true, rank:1,
  },
  {
    id:'dubaicookie',
    name:'Dubai Chewy Cookies',
    tagline:'Pistachio-kunafa stuffed cookies, rolled in rich cocoa. Sold as a box of 6.',
    price:95000,
    cat:'cookies',
    sold:188,
    image: IMG_DUBAI_CHEWY_COOKIES,
    bs:true, rank:3,
  },
];

/* ---------------- State ---------------- */
let activeCategory = 'all';
let activeFilter = 'featured';
let cartState = {};       // { productId: quantity }
let modalProductId = null;
let modalQty = 1;

function fmtPrice(v){ return 'Rp ' + v.toLocaleString('id-ID'); }
function cartTotalCount(){ return Object.values(cartState).reduce((a,b)=>a+b,0); }
function cartTotalPrice(){
  return Object.entries(cartState).reduce((sum,[id,qty])=>{
    const p = products.find(x=>x.id===id);
    return sum + (p ? p.price*qty : 0);
  },0);
}

/* ---------------- Hero carousel ---------------- */
const heroSlides = [
  {eyebrow:'Made to order', title:'Baked warm,\\nmade for you.', sub:'Savory bites, custom cakes and small-batch sweets — every order made fresh, just for you.', frames:[{img:IMG_BARKCHANG,label:'Bak Chang'},{img:IMG_CUSTOM_CAKES,label:'Custom Cakes'},{img:IMG_DUBAI_CHEWY_COOKIES,label:'Chewy Cookies'}]},
  {eyebrow:'Custom cakes', title:'Tell us the idea,\\nwe\'ll bake it.', sub:'From a favorite pet to a party theme — every custom cake is hand-sculpted to order.', frames:[{img:IMG_CUSTOM_CAKES,label:'Custom Cakes'}]},
  {eyebrow:'Customer favourite', title:'Chewy, cocoa-\\ndusted, gone fast.', sub:'Our Dubai-style chewy cookies, rolled in rich cocoa — restocked weekly.', frames:[{img:IMG_DUBAI_CHEWY_COOKIES,label:'Chewy Cookies'}]},
];
let heroIndex = 0;

function renderHero(){
  const s = heroSlides[heroIndex];
  document.getElementById('heroContent').innerHTML = `
    <span class="hero-eyebrow">${s.eyebrow}</span>
    <h1 class="hero-title">${s.title.split('\\n').join('<br>')}</h1>
    <p class="hero-sub">${s.sub}</p>
    <button class="hero-cta" onclick="scrollToProducts('all')">Shop the menu</button>
  `;
  document.getElementById('heroFrames').innerHTML = s.frames.map(f=>`
    <div class="frame-chip"><img src="${f.img}" alt="${f.label}"><span>${f.label}</span></div>
  `).join('');
  document.getElementById('heroDots').innerHTML = heroSlides.map((_,i)=>`<i class="${i===heroIndex?'active':''}"></i>`).join('');
}
function shiftHero(dir){
  heroIndex = (heroIndex + dir + heroSlides.length) % heroSlides.length;
  renderHero();
}
setInterval(()=>shiftHero(1), 6000);

/* ---------------- Sidebar categories ---------------- */
function renderCategories(){
  const counts = {};
  products.forEach(p=>{ counts[p.cat]=(counts[p.cat]||0)+1; });
  counts.all = products.length;
  document.getElementById('catList').innerHTML = categories.map(c=>`
    <li>
      <button class="cat-item ${activeCategory===c.id?'active':''}" data-cat="${c.id}">
        <span>${c.icon} ${c.name}</span>
        <span class="count">${counts[c.id]||0}</span>
      </button>
    </li>
  `).join('');
  document.querySelectorAll('.cat-item').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      activeCategory = btn.dataset.cat;
      renderCategories();
      renderProducts();
    });
  });
}

/* ---------------- Product grid ---------------- */
function getSortedFiltered(){
  let list = products.filter(p => activeCategory==='all' || p.cat===activeCategory);
  if(activeFilter==='newest') list = [...list].reverse();
  else if(activeFilter==='bestseller') list = [...list].sort((a,b)=>b.sold-a.sold);
  else if(activeFilter==='price') list = [...list].sort((a,b)=>a.price-b.price);
  return list;
}

function productCardHTML(p){
  const inCart = cartState[p.id] || 0;
  return `
    <div class="product-card" data-id="${p.id}">
      <div class="product-thumb">
        ${p.badge?`<span class="badge">${p.badge}</span>`:''}
        ${inCart>0?`<span class="in-cart-badge">${inCart} in cart</span>`:''}
        <img src="${p.image}" alt="${p.name}">
      </div>
      <div class="product-info">
        <p class="product-name">${p.name}</p>
        <p class="product-tagline">${p.tagline}</p>
        <p class="product-price">${fmtPrice(p.price)}</p>
        <button class="add-btn" data-id="${p.id}">🛍 Add to cart</button>
      </div>
    </div>
  `;
}

function renderProducts(){
  const list = getSortedFiltered();
  const grid = document.getElementById('productGrid');
  if(!list.length){
    grid.innerHTML = `<div class="empty-msg">No items in this category yet.</div>`;
    return;
  }
  grid.innerHTML = list.map(productCardHTML).join('');
  attachProductCardEvents(grid);
}

// function attachProductCardEvents(scope){
//   scope.querySelectorAll('.product-card').forEach(card=>{
//     card.addEventListener('click', (e)=>{
//       openProductModal(card.dataset.id);
//     });
//   });
// }

function attachProductCardEvents(scope){
  scope.querySelectorAll('.product-card').forEach(card=>{
    card.addEventListener('click', (e)=>{
      // Check if the click originated from the add button
      if (e.target.closest('.add-btn')) {
        const productId = card.dataset.id;
        const product = products.find(p => p.id === productId);
        
        cartState[productId] = (cartState[productId] || 0) + 1;
        updateHeaderCart();
        showToast(`Added 1 × ${product.name}`);
        renderProducts();
        renderBestsellers();
      } else {
        // Otherwise, open the modal
        openProductModal(card.dataset.id);
      }
    });
  });
}

document.getElementById('filterTabs').addEventListener('click', (e)=>{
  const btn = e.target.closest('.filter-tab');
  if(!btn) return;
  document.querySelectorAll('.filter-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  activeFilter = btn.dataset.filter;
  renderProducts();
});

/* ---------------- Bestseller strip ---------------- */
function renderBestsellers(){
  const bs = products.filter(p=>p.bs).sort((a,b)=>a.rank-b.rank);
  const track = document.getElementById('bestsellerTrack');
  track.innerHTML = `
    <div class="bs-badge">
      <span class="tag">Top picks</span>
      <h4>Most loved<br>right now</h4>
      <p>Made fresh weekly</p>
    </div>
  ` + bs.map(p=>`
    <div class="bs-card" data-id="${p.id}">
      <div class="bs-thumb"><span class="bs-rank">#${p.rank}</span><img src="${p.image}" alt="${p.name}"></div>
      <div class="bs-info">
        <p class="bs-name">${p.name}</p>
        <p class="bs-price">${fmtPrice(p.price)}</p>
        <p class="bs-sold">${p.sold.toLocaleString('id-ID')}+ ordered</p>
      </div>
    </div>
  `).join('');
  track.querySelectorAll('.bs-card').forEach(card=>{
    card.addEventListener('click', ()=> openProductModal(card.dataset.id));
  });
}

/* ---------------- Search ---------------- */
document.getElementById('searchInput').addEventListener('input', (e)=>{
  const q = e.target.value.trim().toLowerCase();
  const grid = document.getElementById('productGrid');
  if(!q){ renderProducts(); return; }
  const list = getSortedFiltered().filter(p=>p.name.toLowerCase().includes(q));
  if(!list.length){
    grid.innerHTML = `<div class="empty-msg">No matches for "${e.target.value}"</div>`;
    return;
  }
  grid.innerHTML = list.map(productCardHTML).join('');
  attachProductCardEvents(grid);
});

/* ---------------- Modal ---------------- */
function openProductModal(productId){
  modalProductId = productId;
  modalQty = 1;
  renderModal();
  document.getElementById('modalOverlay').classList.add('show');
}
function openCartModal(){
  modalProductId = null;
  renderModal();
  document.getElementById('modalOverlay').classList.add('show');
}
function closeModal(){
  document.getElementById('modalOverlay').classList.remove('show');
}
document.getElementById('modalOverlay').addEventListener('click', (e)=>{
  if(e.target.id === 'modalOverlay') closeModal();
});

function cartListHTML(){
  const entries = Object.entries(cartState).filter(([,qty])=>qty>0);
  if(!entries.length){
    return `<p class="cart-empty-note">Your cart is empty — add something delicious.</p>`;
  }
  const lines = entries.map(([id,qty])=>{
    const p = products.find(x=>x.id===id);
    if(!p) return '';
    return `
      <div class="cart-line">
        <img src="${p.image}" alt="${p.name}">
        <div class="cart-line-name">${p.name}<br><span class="cart-line-qty">Qty ${qty}</span></div>
        <div class="cart-line-sub">${fmtPrice(p.price*qty)}</div>
      </div>
    `;
  }).join('');
  return lines + `<div class="cart-total-row"><span>Total</span><span>${fmtPrice(cartTotalPrice())}</span></div>`;
}

function renderModal(){
  const box = document.getElementById('modalBox');
  const product = modalProductId ? products.find(p=>p.id===modalProductId) : null;

  let productSection = '';
  if(product){
    productSection = `
      <img class="modal-product-img" src="${product.image}" alt="${product.name}">
      <h3 class="modal-title">${product.name}</h3>
      <p class="modal-tagline">${product.tagline}</p>
      <p class="modal-price">${fmtPrice(product.price)}</p>
      <div class="stepper-row">
        <span class="label">Quantity</span>
        <div class="stepper-controls">
          <button class="stepper-btn" id="qtyMinus" ${modalQty<=1?'disabled':''}>−</button>
          <span class="stepper-qty" id="qtyValue">${modalQty}</span>
          <button class="stepper-btn" id="qtyPlus">+</button>
        </div>
      </div>
      <button class="modal-add-btn" id="modalAddBtn">Add ${modalQty} to cart — ${fmtPrice(product.price*modalQty)}</button>
      <hr class="modal-divider">
    `;
  }

  box.innerHTML = `
    <button class="modal-close" onclick="closeModal()">✕</button>
    ${productSection}
    <div class="modal-cart-heading"><span>Your cart</span><span>${cartTotalCount()} item(s)</span></div>
    <div id="cartListArea">${cartListHTML()}</div>
  `;

  if(product){
    document.getElementById('qtyMinus').addEventListener('click', ()=>{
      if(modalQty>1){ modalQty--; renderModal(); }
    });
    document.getElementById('qtyPlus').addEventListener('click', ()=>{
      modalQty++; renderModal();
    });
    document.getElementById('modalAddBtn').addEventListener('click', ()=>{
      cartState[product.id] = (cartState[product.id]||0) + modalQty;
      updateHeaderCart();
      showToast(`Added ${modalQty} × ${product.name}`);
      modalQty = 1;
      renderModal();
      renderProducts();
      renderBestsellers();
    });
  }
}

// /* ---------------- Header cart ---------------- */
// function updateHeaderCart(){
//   const total = cartTotalCount();
//   document.getElementById('cartCount').textContent = total;
//   const navDot = document.getElementById('navCartDot');
//   if(total>0){ navDot.style.display='flex'; navDot.textContent = total; }
//   else { navDot.style.display='none'; }
// }

/* ---------------- Header cart ---------------- */
function updateHeaderCart(){
  const total = cartTotalCount();
  document.getElementById('cartCount').textContent = total;
  
  const navDot = document.getElementById('navCartDot');
  // Add safety check to prevent null reference errors
  if (navDot) {
    if (total > 0) { 
      navDot.style.display = 'flex'; 
      navDot.textContent = total; 
    } else { 
      navDot.style.display = 'none'; 
    }
  }
}
document.getElementById('cartBtn').addEventListener('click', openCartModal);

/* ---------------- Misc UI helpers ---------------- */
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 1500);
}
function scrollToProducts(cat){
  activeCategory = cat;
  renderCategories();
  renderProducts();
  document.querySelector('.products-wrap').scrollIntoView({behavior:'smooth', block:'start'});
}
function scrollToFooter(){
  document.querySelector('footer').scrollIntoView({behavior:'smooth', block:'start'});
}
function scrollTop(){ window.scrollTo({top:0, behavior:'smooth'}); }

/* ---------------- Support Overlay ---------------- */
function toggleSupport(show) {
  const overlay = document.getElementById('supportOverlay');
  if (show) {
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent scrolling underneath
  } else {
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }
}

/* ---------------- Init ---------------- */
renderHero();
renderCategories();
renderBestsellers();
renderProducts();
updateHeaderCart();