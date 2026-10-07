const categoryButtons = document.querySelectorAll('.category-chip');
const productCards = document.querySelectorAll('.product-card');
const searchInput = document.querySelector('#product-search');
const emptyState = document.querySelector('#empty-state');
const bestTabs = document.querySelectorAll('.best-tab');
const bestGrid = document.querySelector('#best-product-grid');
const bestTitle = document.querySelector('#best-period-title');

bestTabs.forEach((button) => {
  button.addEventListener('click', () => {
    bestTabs.forEach((tab) => tab.setAttribute('aria-pressed', String(tab === button)));
    bestTitle.textContent = button.dataset.periodLabel;

    const rankKey = `rank${button.dataset.period[0].toUpperCase()}${button.dataset.period.slice(1)}`;
    const rankedCards = Array.from(bestGrid.children).sort((first, second) => Number(first.dataset[rankKey]) - Number(second.dataset[rankKey]));

    rankedCards.forEach((card, index) => {
      card.querySelector('.best-rank').textContent = String(index + 1).padStart(2, '0');
      bestGrid.append(card);
    });
  });
});

let selectedCategory = 'all';

function updateProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase('ko');
  let visibleCount = 0;

  productCards.forEach((card) => {
    const matchesCategory = selectedCategory === 'all' || card.dataset.category === selectedCategory;
    const matchesSearch = card.dataset.name.toLocaleLowerCase('ko').includes(query);
    const isVisible = matchesCategory && matchesSearch;
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  emptyState.hidden = visibleCount > 0;
}

categoryButtons.forEach((button) => {
  button.addEventListener('click', () => {
    window.location.href = `html/category.html?category=${button.dataset.category}`;
  });
});

searchInput.addEventListener('input', updateProducts);

document.querySelectorAll('.favorite-button').forEach((button) => {
  button.addEventListener('click', () => {
    const isFavorite = button.getAttribute('aria-pressed') === 'true';
    button.setAttribute('aria-pressed', String(!isFavorite));
    button.textContent = isFavorite ? '♡' : '♥';
  });
});

document.querySelector('.load-more').addEventListener('click', (event) => {
  event.currentTarget.textContent = '새로운 보물을 준비 중이에요';
  event.currentTarget.disabled = true;
});

// 검수 단계 박스: 마우스는 CSS hover로 처리하고, 터치 기기에서는 탭할 때마다 설명을 열고 닫는다.
const qcSteps = document.querySelectorAll('.qc-step');

qcSteps.forEach((step) => {
  step.addEventListener('click', () => {
    if (window.matchMedia('(hover: hover)').matches) return;
    const willOpen = !step.classList.contains('is-open');
    qcSteps.forEach((item) => item.classList.remove('is-open'));
    step.classList.toggle('is-open', willOpen);
  });
});

document.querySelector('.bag-button').addEventListener('click', () => {
  window.location.href = 'html/auth.html';
});
// 상세 페이지에서 담은 장바구니 수량을 헤더에 표시한다.
try { document.querySelector('.bag-count').textContent = Number(localStorage.getItem('wellhouse-cart-count')) || 0; } catch { /* 저장소 사용 불가 */ }
