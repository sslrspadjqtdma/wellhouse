const categoryButtons = document.querySelectorAll('.category-chip');
const productCards = document.querySelectorAll('.product-card');
const searchInput = document.querySelector('#product-search');
const emptyState = document.querySelector('#empty-state');
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
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
    selectedCategory = button.dataset.category;
    categoryButtons.forEach((item) => item.classList.toggle('is-active', item === button));
    updateProducts();
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

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? '메뉴 열기' : '메뉴 닫기');
  mainNav.classList.toggle('is-open', !isOpen);
});

mainNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '메뉴 열기');
  });
});

document.querySelector('.load-more').addEventListener('click', (event) => {
  event.currentTarget.textContent = '새로운 보물을 준비 중이에요';
  event.currentTarget.disabled = true;
});

document.querySelector('.bag-button').addEventListener('click', () => {
  window.location.href = 'html/auth.html';
});