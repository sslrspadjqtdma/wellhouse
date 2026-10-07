const SORTERS = {
  recommended: () => 0,
  'price-desc': (a, b) => b.salePrice - a.salePrice,
  'price-asc': (a, b) => a.salePrice - b.salePrice,
  'discount-desc': (a, b) => b.discount - a.discount,
  'discount-asc': (a, b) => a.discount - b.discount,
  'sales-desc': (a, b) => b.sales - a.sales,
  'sales-asc': (a, b) => a.sales - b.sales,
};

// 전체 보기: 모든 카테고리 상품을 한곳에 모으고 카테고리로 다시 나눠볼 수 있게 한다.
const ALL_CATEGORY = {
  eyebrow: 'ALL PRODUCTS',
  title: '전체 상품',
  description: '패션, 전자기기, CD, 소품까지 wellhouse의 모든 빈티지 상품을 한눈에 살펴보세요.',
  filters: [{ key: 'categoryName', label: '카테고리', options: Object.values(CATEGORY_DATA).map((data) => data.title) }],
};
productsByCategory.all = allProducts;

// 인기 상품: 전체 상품 중 누적 판매량 상위 20개를 판매량 순으로 보여준다.
const POPULAR_LIMIT = 20;
const POPULAR_CATEGORY = {
  eyebrow: 'BEST SELLERS',
  title: '인기 상품',
  description: '많은 분들이 선택한 wellhouse 인기 빈티지 상품 TOP 20이에요.',
  filters: ALL_CATEGORY.filters,
};
productsByCategory.popular = [...productsByCategory.all].sort((a, b) => b.sales - a.sales).slice(0, POPULAR_LIMIT);
const popularRank = new Map(productsByCategory.popular.map((product, index) => [product.id, index + 1]));

const OVERVIEWS = { all: ALL_CATEGORY, popular: POPULAR_CATEGORY };
const isOverview = (key) => key in OVERVIEWS;
const SUB_FILTER_KEYS = [...new Set(Object.values(CATEGORY_DATA).flatMap((data) => data.filters.map((filter) => filter.key)))];

const favorites = new Set();
let categoryKey;
let category;
let products;
let activeFilters;

const grid = document.querySelector('#product-grid');
const filterGroups = document.querySelector('#filter-groups');
const sortSelect = document.querySelector('#sort-select');
const resultCount = document.querySelector('#result-count');
const searchInput = document.querySelector('#product-search');
const emptyState = document.querySelector('#empty-state');
const categoryButtons = document.querySelectorAll('.category-chip');

function cardTemplate(product) {
  const meta = product.album ? product.artist : product.shop;
  const detail = product.album ? `${product.genre} · ${product.year}` : product.sub;
  const tag = isOverview(categoryKey) ? `${product.categoryName} · ${product.album ? product.genre : detail}` : detail;
  const isFavorite = favorites.has(product.id);

  return `
  <article class="product-card category-card">
    <a class="product-image" href="product.html?id=${product.slug}"><img src="${product.img}" alt="${product.name}" loading="lazy" onerror="this.remove()"><span class="condition-tag">${product.condition}</span>${categoryKey === 'popular' ? `<span class="rank-badge">BEST ${String(popularRank.get(product.id)).padStart(2, '0')}</span>` : ''}${product.discount ? `<span class="discount-badge">${product.discount}% OFF</span>` : ''}</a>
    <button class="favorite-button" type="button" data-id="${product.id}" aria-label="${product.name} 찜하기" aria-pressed="${isFavorite}">${isFavorite ? '♥' : '♡'}</button>
    <div class="product-meta"><span>${meta}</span><span>${tag}</span></div>
    <h3><a href="product.html?id=${product.slug}">${product.name}</a></h3>
    ${product.discount ? `<div class="sale-price-line"><del>${won(product.price)}</del><span>${product.discount}% 할인</span></div>` : ''}
    <div class="product-bottom"><strong>${won(product.salePrice)}</strong><span class="product-size">${product.option}</span></div>
    <p class="sales-count">누적 판매 ${product.sales.toLocaleString('ko-KR')}개</p>
  </article>`;
}

function render() {
  const query = searchInput.value.trim().toLocaleLowerCase('ko');
  const visible = products
    .filter((product) => Object.entries(activeFilters).every(([key, value]) => value === 'all' || product[key] === value))
    .filter((product) => [product.name, product.shop, product.artist, product.sub, product.genre, product.categoryName].join(' ').toLocaleLowerCase('ko').includes(query))
    .sort(SORTERS[sortSelect.value]); // 정렬 기준이 같으면 목록 순서(추천·인기 순)를 그대로 유지한다

  grid.innerHTML = visible.map(cardTemplate).join('');
  resultCount.textContent = `상품 ${visible.length}개`;
  emptyState.hidden = visible.length > 0;
}

// preset: 주소(?sub=티셔츠, ?genre=발라드 등)로 넘어온 소분류를 처음부터 선택해 둔다.
function showCategory(key, preset = {}) {
  categoryKey = isOverview(key) || CATEGORY_DATA[key] ? key : 'all';
  category = OVERVIEWS[categoryKey] || CATEGORY_DATA[categoryKey];
  products = productsByCategory[categoryKey];
  activeFilters = Object.fromEntries(category.filters.map((filter) => [filter.key, filter.options.includes(preset[filter.key]) ? preset[filter.key] : 'all']));

  document.title = `${category.title} — wellhouse`;
  document.querySelector('#category-eyebrow').textContent = category.eyebrow;
  document.querySelector('#category-title').textContent = category.title;
  document.querySelector('#category-description').textContent = category.description;
  categoryButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.category === categoryKey));

  if (isOverview(categoryKey)) SUB_FILTER_KEYS.forEach((key) => { activeFilters[key] = 'all'; });

  filterGroups.innerHTML = category.filters.map((filter) => `
  <div class="filter-group" role="group" aria-label="${filter.label}">
    <span class="filter-label">${filter.label}</span>
    <div class="filter-chips${isOverview(categoryKey) ? ' has-dropdown' : ''}">
      ${['all', ...filter.options].map((option) => (isOverview(categoryKey) && option !== 'all' ? dropdownTemplate(option) : chipTemplate(filter.key, option))).join('')}
    </div>
  </div>`).join('');

  updateFilterUI();
  render();
}

const chipTemplate = (key, option, inner = option === 'all' ? '전체' : option) => `<button class="filter-chip" type="button" data-filter="${key}" data-value="${option}">${inner}</button>`;

// 전체 상품 보기에서 카테고리 칩에 마우스를 올리면 그 카테고리의 소분류 메뉴가 열린다.
function dropdownTemplate(title) {
  const data = Object.values(CATEGORY_DATA).find((item) => item.title === title);
  return `
      <div class="filter-dropdown">
        ${chipTemplate('categoryName', title, `${title}<span class="chip-selection"></span><span class="chip-caret" aria-hidden="true">▾</span>`)}
        <div class="filter-menu" role="menu" aria-label="${title} 소분류">
          ${data.filters.map((filter) => `
          <div class="filter-menu-group">
            <p class="filter-menu-label">${filter.label}</p>
            <div class="filter-menu-options">
              ${['all', ...filter.options].map((option) => `<button class="filter-menu-item" type="button" role="menuitem" data-category="${title}" data-filter="${filter.key}" data-value="${option}">${option === 'all' ? '전체' : option}</button>`).join('')}
            </div>
          </div>`).join('')}
        </div>
      </div>`;
}

function updateFilterUI() {
  filterGroups.querySelectorAll('.filter-chip').forEach((chip) => {
    const isActive = activeFilters[chip.dataset.filter] === chip.dataset.value;
    chip.classList.toggle('is-active', isActive);
    chip.setAttribute('aria-pressed', String(isActive));

    const selection = chip.querySelector('.chip-selection');
    if (selection) {
      const picked = isActive ? SUB_FILTER_KEYS.map((key) => activeFilters[key]).filter((value) => value !== 'all') : [];
      selection.textContent = picked.length ? ` · ${picked.join(' · ')}` : '';
    }
  });

  filterGroups.querySelectorAll('.filter-menu-item').forEach((item) => {
    const isActive = activeFilters.categoryName === item.dataset.category && activeFilters[item.dataset.filter] === item.dataset.value;
    item.classList.toggle('is-active', isActive);
  });
}

function resetSubFilters() {
  SUB_FILTER_KEYS.forEach((key) => { activeFilters[key] = 'all'; });
}

filterGroups.addEventListener('click', (event) => {
  const menuItem = event.target.closest('.filter-menu-item');
  const chip = event.target.closest('.filter-chip');

  if (menuItem) {
    if (activeFilters.categoryName !== menuItem.dataset.category) resetSubFilters();
    activeFilters.categoryName = menuItem.dataset.category;
    activeFilters[menuItem.dataset.filter] = menuItem.dataset.value;
    menuItem.blur();
  } else if (chip) {
    if (chip.dataset.filter === 'categoryName') resetSubFilters();
    activeFilters[chip.dataset.filter] = chip.dataset.value;
  } else {
    return;
  }

  updateFilterUI();
  render();
});

grid.addEventListener('click', (event) => {
  const button = event.target.closest('.favorite-button');
  if (!button) return;

  const id = Number(button.dataset.id);
  if (favorites.has(id)) favorites.delete(id);
  else favorites.add(id);
  button.setAttribute('aria-pressed', String(favorites.has(id)));
  button.textContent = favorites.has(id) ? '♥' : '♡';
});

sortSelect.addEventListener('change', render);
searchInput.addEventListener('input', render);

// 카테고리 버튼은 페이지를 새로 열지 않고 같은 화면에서 상품 목록만 바꾼다.
function showFromUrl() {
  const params = Object.fromEntries(new URLSearchParams(window.location.search));
  if (params.q !== undefined) searchInput.value = params.q;
  showCategory(params.category, params);
}

function navigate(url) {
  if (url !== window.location.pathname.split('/').pop() + window.location.search) history.pushState(null, '', url);
  showFromUrl();
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.add('is-closing'));
}

categoryButtons.forEach((button) => {
  button.addEventListener('click', () => navigate(`category.html?category=${button.dataset.category}`));
});

// 헤더 드롭다운의 소분류 링크도 같은 화면에서 바로 필터링한다.
document.querySelectorAll('.nav-menu a').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    navigate(link.getAttribute('href'));
  });
});

document.querySelectorAll('.nav-item').forEach((item) => {
  item.addEventListener('mouseleave', () => item.classList.remove('is-closing'));
});

window.addEventListener('popstate', showFromUrl);

document.querySelector('.bag-button').addEventListener('click', () => {
  window.location.href = 'auth.html';
});

// 상세 페이지에서 담은 장바구니 수량을 헤더에 표시한다.
try { document.querySelector('.bag-count').textContent = Number(localStorage.getItem('wellhouse-cart-count')) || 0; } catch { /* 저장소 사용 불가 */ }

showFromUrl();
