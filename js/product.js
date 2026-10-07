// 상품 상세 페이지: product.html?id=fashion-0 형태의 주소로 상품을 찾아 화면을 만든다.

const SHIPPING_FEE = 3500;
const FREE_SHIPPING_FROM = 100000;
const CART_KEY = 'wellhouse-cart-count';

const root = document.querySelector('#pd-root');
const toast = document.querySelector('#pd-toast');
const product = findProduct(new URLSearchParams(window.location.search).get('id'));

const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
const stars = (rating) => `<span class="pd-stars" aria-label="5점 만점에 ${rating}점">${'★'.repeat(Math.round(rating))}<span>${'★'.repeat(5 - Math.round(rating))}</span></span>`;

function readCartCount() {
  try { return Number(localStorage.getItem(CART_KEY)) || 0; } catch { return 0; }
}

function writeCartCount(count) {
  try { localStorage.setItem(CART_KEY, String(count)); } catch { /* 저장소를 쓸 수 없으면 화면에만 반영 */ }
  document.querySelectorAll('.bag-count').forEach((badge) => { badge.textContent = count; });
}

let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2400);
}

function infoTemplate(inspection, stock) {
  const grade = GRADES[inspection.grade];
  return `
    <div class="pd-info">
      <p class="pd-eyebrow">${escapeHtml(CATEGORY_DATA[product.categoryKey].eyebrow)} · ${escapeHtml(product.sub || product.genre)}</p>
      <h1 class="pd-title">${escapeHtml(product.name)}</h1>
      <a class="pd-grade-chip" href="#inspection-report"><span class="pd-grade-letter">${inspection.grade}</span><span><strong>${grade.name}</strong> · 검수 완료 등급</span><span aria-hidden="true">›</span></a>

      <div class="pd-price">
        ${product.discount ? `<span class="pd-discount">${product.discount}%</span>` : ''}
        <strong>${won(product.salePrice)}</strong>
        ${product.discount ? `<del>${won(product.price)}</del>` : ''}
      </div>
      <p class="pd-lead">${escapeHtml(SUB_COPY[product.sub || product.genre].story)}</p>

      <dl class="pd-rows">
        <div><dt>${product.album ? '아티스트' : '판매처'}</dt><dd>${escapeHtml(product.album ? product.artist : product.shop)}</dd></div>
        <div><dt>${product.categoryKey === 'fashion' ? '사이즈' : '옵션'}</dt><dd>${escapeHtml(product.option)}</dd></div>
        <div>
          <dt><label for="pd-shipping">배송 방법</label></dt>
          <dd><select id="pd-shipping" class="pd-select"><option value="parcel">택배</option><option value="pickup">매장 픽업 (방문 수령)</option></select></dd>
        </div>
        <div><dt>배송비</dt><dd id="pd-shipping-note"></dd></div>
        <div><dt>재고</dt><dd><span class="pd-stock">${stock}점 남음</span> 빈티지 상품은 같은 상품이 다시 들어오지 않을 수 있어요.</dd></div>
      </dl>

      <div class="pd-quantity">
        <span class="pd-quantity-name">${escapeHtml(product.name)}</span>
        <div class="pd-stepper">
          <button type="button" data-step="-1" aria-label="수량 줄이기">−</button>
          <input id="pd-qty" type="number" value="1" min="1" max="${stock}" aria-label="수량">
          <button type="button" data-step="1" aria-label="수량 늘리기">+</button>
        </div>
        <span class="pd-line-price" id="pd-line-price"></span>
      </div>

      <div class="pd-total">
        <span>총 상품금액 <small id="pd-total-count"></small></span>
        <strong id="pd-total-price"></strong>
      </div>

      <div class="pd-actions">
        <button class="pd-buy" type="button" id="pd-buy">구매하기</button>
        <button class="pd-cart" type="button" id="pd-cart">장바구니</button>
        <button class="pd-wish" type="button" id="pd-wish" aria-pressed="false" aria-label="찜하기"><span aria-hidden="true">♡</span> <b id="pd-wish-count">${product.sales % 40}</b></button>
      </div>
      <button class="pd-share" type="button" id="pd-share">공유하기</button>
    </div>`;
}

function galleryTemplate() {
  // 같은 이미지를 원본 / 디테일 확대 두 컷으로 보여준다.
  const shots = [
    { label: '전체 사진', origin: 'center', zoom: 1 },
    { label: '디테일 확대 1', origin: '35% 40%', zoom: 1.7 },
    { label: '디테일 확대 2', origin: '65% 70%', zoom: 1.7 },
  ];
  return `
    <div class="pd-gallery">
      <div class="pd-main-image" style="background:${product.bg}">
        <img id="pd-image" src="${product.img}" alt="${escapeHtml(product.name)}" onerror="this.remove()">
        ${product.discount ? `<span class="discount-badge">${product.discount}% OFF</span>` : ''}
      </div>
      <div class="pd-thumbs" role="group" aria-label="상품 사진 선택">
        ${shots.map((shot, index) => `<button type="button" class="pd-thumb${index === 0 ? ' is-active' : ''}" data-origin="${shot.origin}" data-zoom="${shot.zoom}" aria-label="${shot.label}" style="background:${product.bg}"><img src="${product.img}" alt="" style="transform-origin:${shot.origin};transform:scale(${shot.zoom})"></button>`).join('')}
      </div>
    </div>`;
}

function detailTemplate(detail) {
  return `
    <section class="pd-section" id="detail" aria-labelledby="detail-title">
      <h2 class="pd-section-title" id="detail-title">상세정보</h2>
      <div class="pd-detail-body">
        <div class="pd-detail-copy">
          <p class="pd-detail-intro">${escapeHtml(detail.intro)}</p>
          <p>${escapeHtml(detail.story)}</p>
          <ul class="pd-points">${detail.points.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul>
        </div>
        <div class="pd-detail-side">
          <table class="pd-spec">
            <caption>상품 정보</caption>
            <tbody>${detail.specs.map(([key, value]) => `<tr><th scope="row">${key}</th><td>${escapeHtml(value)}</td></tr>`).join('')}</tbody>
          </table>
          ${detail.sizeTable ? `
          <table class="pd-size">
            <caption>실측 사이즈 (cm, 단면 기준)</caption>
            <thead><tr><th scope="col">사이즈</th>${detail.sizeTable.headers.map((header) => `<th scope="col">${header}</th>`).join('')}</tr></thead>
            <tbody><tr><th scope="row">${escapeHtml(product.option)}</th>${detail.sizeTable.values.map((value) => `<td>${value}</td>`).join('')}</tr></tbody>
          </table>` : ''}
        </div>
      </div>
    </section>`;
}

function inspectionTemplate(inspection) {
  const grade = GRADES[inspection.grade];
  const steps = ['사진 검수', '실물 입고', '실물 검수 · 등급', '판매 등록'];
  return `
    <section class="pd-section pd-report" id="inspection-report" aria-labelledby="report-title">
      <h2 class="pd-section-title" id="report-title">검수 리포트</h2>
      <ol class="pd-report-steps" aria-label="검수 과정">
        ${steps.map((step, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span>${step}<b aria-label="완료">✓</b></li>`).join('')}
      </ol>
      <div class="pd-report-body">
        <div class="pd-grade-card">
          <p class="pd-grade-label">최종 등급</p>
          <span class="pd-grade-big">${inspection.grade}</span>
          <strong>${grade.name}</strong>
          <p>${grade.summary}</p>
          <ul class="pd-grade-scale" aria-label="등급 기준">
            ${GRADE_ORDER.map((key) => `<li class="${key === inspection.grade ? 'is-current' : ''}" title="${GRADES[key].name}">${key}</li>`).join('')}
          </ul>
          <p class="pd-grade-meta">${inspection.inspector} · ${inspection.date} 검수</p>
        </div>
        <div class="pd-report-detail">
          <h3>이 등급이 나온 이유</h3>
          <p class="pd-report-reason">${escapeHtml(inspection.reason)}</p>
          <table class="pd-checklist">
            <caption>검수 항목별 결과</caption>
            <thead><tr><th scope="col">검수 항목</th><th scope="col">결과</th><th scope="col">내용</th></tr></thead>
            <tbody>
              ${inspection.items.map((item) => `<tr><th scope="row">${item.label}</th><td><span class="pd-status is-${item.status}">${STATUS_LABEL[item.status]}</span></td><td>${escapeHtml(item.text)}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </section>`;
}

function reviewsTemplate(reviews) {
  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const distribution = [5, 4, 3, 2, 1].map((score) => [score, reviews.filter((review) => review.rating === score).length]);
  return `
    <section class="pd-section" id="reviews" aria-labelledby="reviews-title">
      <h2 class="pd-section-title" id="reviews-title">상품 후기 <span>${reviews.length}</span></h2>
      <div class="pd-review-summary">
        <div class="pd-review-score"><strong>${average.toFixed(1)}</strong>${stars(average)}<span>후기 ${reviews.length}개</span></div>
        <ul class="pd-review-bars">
          ${distribution.map(([score, count]) => `<li><span>${score}점</span><span class="pd-bar"><span style="width:${(count / reviews.length) * 100}%"></span></span><span>${count}</span></li>`).join('')}
        </ul>
      </div>
      <ul class="pd-review-list">
        ${reviews.map((review) => `
        <li class="pd-review">
          <div class="pd-review-head">${stars(review.rating)}<span class="pd-badge">구매 확정</span></div>
          <p>${escapeHtml(review.text)}</p>
          <div class="pd-review-meta"><span>${review.name}</span><span>${review.date}</span><span>옵션 ${escapeHtml(product.option)}</span>
            <button type="button" class="pd-helpful" aria-pressed="false" data-count="${review.helpful}">도움돼요 <b>${review.helpful}</b></button></div>
        </li>`).join('')}
      </ul>
    </section>`;
}

function qnaItemTemplate(item) {
  return `
    <li class="pd-qna-item">
      <details>
        <summary><span class="pd-qna-q">Q</span><span class="pd-qna-text">${escapeHtml(item.question)}</span><span class="pd-qna-state${item.answer ? ' is-done' : ''}">${item.answer ? '답변 완료' : '답변 대기'}</span><span class="pd-qna-meta">${item.name} · ${item.date}</span></summary>
        <div class="pd-qna-answer"><span class="pd-qna-a">A</span><p>${item.answer ? escapeHtml(item.answer) : '확인 후 빠르게 답변드릴게요.'}</p></div>
      </details>
    </li>`;
}

function qnaTemplate(qna) {
  return `
    <section class="pd-section" id="qna" aria-labelledby="qna-title">
      <div class="pd-qna-head">
        <h2 class="pd-section-title" id="qna-title">상품 Q&amp;A <span id="pd-qna-count">${qna.length}</span></h2>
        <button type="button" class="pd-qna-open" id="pd-qna-open" aria-expanded="false" aria-controls="pd-qna-form">문의하기</button>
      </div>
      <form class="pd-qna-form" id="pd-qna-form" hidden>
        <label for="pd-qna-input">이 상품에 대해 궁금한 점을 남겨주세요.</label>
        <textarea id="pd-qna-input" rows="3" maxlength="300" placeholder="예) 실측 사이즈를 더 알고 싶어요." required></textarea>
        <div><button type="submit">문의 등록</button></div>
      </form>
      <ul class="pd-qna-list" id="pd-qna-list">${qna.map(qnaItemTemplate).join('')}</ul>
    </section>`;
}

function relatedTemplate() {
  const sameSub = allProducts.filter((item) => item.slug !== product.slug && item.categoryKey === product.categoryKey && (item.sub || item.genre) === (product.sub || product.genre));
  const sameCategory = allProducts.filter((item) => item.slug !== product.slug && item.categoryKey === product.categoryKey && !sameSub.includes(item));
  const related = [...sameSub, ...sameCategory].slice(0, 4);
  return `
    <section class="pd-section pd-related" aria-labelledby="related-title">
      <h2 class="pd-section-title" id="related-title">함께 보면 좋은 상품</h2>
      <div class="pd-related-grid">
        ${related.map((item) => `
        <a class="pd-related-card" href="product.html?id=${item.slug}">
          <span class="pd-related-image" style="background:${item.bg}"><img src="${item.img}" alt="" loading="lazy" onerror="this.remove()"></span>
          <span class="pd-related-name">${escapeHtml(item.name)}</span>
          <strong>${won(item.salePrice)}</strong>
        </a>`).join('')}
      </div>
    </section>`;
}

function render() {
  const inspection = buildInspection(product);
  const detail = buildDetail(product);
  const reviews = buildReviews(product);
  const qna = buildQna(product);
  const stock = buildStock(product);
  const subLabel = product.sub || product.genre;
  const subKey = product.sub ? 'sub' : 'genre';

  document.title = `${product.name} — wellhouse`;
  document.querySelectorAll('.category-chip').forEach((chip) => chip.classList.toggle('is-active', chip.dataset.category === product.categoryKey));

  root.innerHTML = `
    <nav class="pd-breadcrumb" aria-label="현재 위치">
      <a href="../index.html">Home</a><span aria-hidden="true">›</span>
      <a href="category.html?category=${product.categoryKey}">${product.categoryName}</a><span aria-hidden="true">›</span>
      <a href="category.html?category=${product.categoryKey}&${subKey}=${encodeURIComponent(subLabel)}">${escapeHtml(subLabel)}</a>
    </nav>
    <section class="pd-top">${galleryTemplate()}${infoTemplate(inspection, stock)}</section>
    <nav class="pd-tabs" aria-label="상품 상세 메뉴">
      <a href="#detail" class="is-active">상세정보</a>
      <a href="#inspection-report">검수 리포트</a>
      <a href="#reviews">후기 <span>${reviews.length}</span></a>
      <a href="#qna">Q&amp;A <span>${qna.length}</span></a>
    </nav>
    ${detailTemplate(detail)}
    ${inspectionTemplate(inspection)}
    ${reviewsTemplate(reviews)}
    ${qnaTemplate(qna)}
    ${relatedTemplate()}`;

  bindInteractions(stock);
}

function bindInteractions(stock) {
  const qtyInput = document.querySelector('#pd-qty');
  const shippingSelect = document.querySelector('#pd-shipping');

  function updateTotals() {
    const qty = Math.min(stock, Math.max(1, Number(qtyInput.value) || 1));
    qtyInput.value = qty;
    const subtotal = product.salePrice * qty;
    const isPickup = shippingSelect.value === 'pickup';
    const shipping = isPickup || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
    document.querySelector('#pd-line-price').textContent = won(subtotal);
    document.querySelector('#pd-total-count').textContent = `(${qty}개${shipping ? ` + 배송비 ${won(shipping)}` : ''})`;
    document.querySelector('#pd-total-price').textContent = won(subtotal + shipping);
    document.querySelector('#pd-shipping-note').innerHTML = isPickup
      ? '무료 · 영업시간 내 매장에서 수령'
      : `택배 ${won(SHIPPING_FEE)} · <b>${won(FREE_SHIPPING_FROM)} 이상 무료배송</b>`;
  }

  document.querySelectorAll('[data-step]').forEach((button) => {
    button.addEventListener('click', () => {
      const next = (Number(qtyInput.value) || 1) + Number(button.dataset.step);
      if (next > stock) showToast(`남은 재고는 ${stock}점이에요.`);
      qtyInput.value = next;
      updateTotals();
    });
  });
  qtyInput.addEventListener('change', updateTotals);
  shippingSelect.addEventListener('change', updateTotals);
  updateTotals();

  // 사진 썸네일
  const mainImage = document.querySelector('#pd-image');
  document.querySelectorAll('.pd-thumb').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      document.querySelectorAll('.pd-thumb').forEach((item) => item.classList.toggle('is-active', item === thumb));
      if (!mainImage) return;
      mainImage.style.transformOrigin = thumb.dataset.origin;
      mainImage.style.transform = `scale(${thumb.dataset.zoom})`;
    });
  });

  document.querySelector('#pd-buy').addEventListener('click', () => {
    showToast('로그인 후 결제를 진행할 수 있어요.');
    setTimeout(() => { window.location.href = 'auth.html'; }, 900);
  });

  document.querySelector('#pd-cart').addEventListener('click', () => {
    writeCartCount(readCartCount() + Number(qtyInput.value));
    showToast('장바구니에 담았어요.');
  });

  const wishButton = document.querySelector('#pd-wish');
  wishButton.addEventListener('click', () => {
    const isOn = wishButton.getAttribute('aria-pressed') !== 'true';
    const countEl = document.querySelector('#pd-wish-count');
    wishButton.setAttribute('aria-pressed', String(isOn));
    wishButton.querySelector('span').textContent = isOn ? '♥' : '♡';
    countEl.textContent = Number(countEl.textContent) + (isOn ? 1 : -1);
    showToast(isOn ? '찜한 상품에 추가했어요.' : '찜을 해제했어요.');
  });

  document.querySelector('#pd-share').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('상품 링크를 복사했어요.');
    } catch {
      showToast('주소창의 링크를 복사해 공유해 주세요.');
    }
  });

  document.querySelectorAll('.pd-helpful').forEach((button) => {
    button.addEventListener('click', () => {
      const isOn = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(isOn));
      button.querySelector('b').textContent = Number(button.dataset.count) + (isOn ? 1 : 0);
    });
  });

  // Q&A 문의 작성: 서버가 없으므로 화면에만 '답변 대기'로 추가한다.
  const qnaOpen = document.querySelector('#pd-qna-open');
  const qnaForm = document.querySelector('#pd-qna-form');
  qnaOpen.addEventListener('click', () => {
    qnaForm.hidden = !qnaForm.hidden;
    qnaOpen.setAttribute('aria-expanded', String(!qnaForm.hidden));
    if (!qnaForm.hidden) qnaForm.querySelector('textarea').focus();
  });
  qnaForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = qnaForm.querySelector('textarea');
    const today = new Date();
    const date = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
    document.querySelector('#pd-qna-list').insertAdjacentHTML('afterbegin', qnaItemTemplate({ question: input.value.trim(), answer: '', name: '나', date }));
    const countEl = document.querySelector('#pd-qna-count');
    countEl.textContent = Number(countEl.textContent) + 1;
    input.value = '';
    qnaForm.hidden = true;
    qnaOpen.setAttribute('aria-expanded', 'false');
    showToast('문의가 등록되었어요.');
  });

  // 스크롤 위치에 맞춰 탭 표시
  const tabs = document.querySelectorAll('.pd-tabs a');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) tabs.forEach((tab) => tab.classList.toggle('is-active', tab.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  ['detail', 'inspection-report', 'reviews', 'qna'].forEach((id) => observer.observe(document.getElementById(id)));
}

// 헤더 공통 동작
document.querySelectorAll('.category-chip').forEach((chip) => {
  chip.addEventListener('click', () => { window.location.href = `category.html?category=${chip.dataset.category}`; });
});
document.querySelector('#product-search').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') window.location.href = `category.html?category=all&q=${encodeURIComponent(event.target.value.trim())}`;
});
document.querySelector('.bag-button').addEventListener('click', () => { window.location.href = 'auth.html'; });
writeCartCount(readCartCount());

if (product) {
  render();
} else {
  root.innerHTML = '<p class="empty-state">상품을 찾을 수 없어요. <a href="category.html?category=all">전체 상품 보기</a></p>';
}
