const supportTabs = document.querySelectorAll('.support-tab');
const qnaChips = document.querySelectorAll('.qna-chip');
const qnaItems = document.querySelectorAll('.qna-list > li');
const askForm = document.querySelector('#ask-form');
const askStatus = document.querySelector('#ask-status');

function selectTab(tab) {
  supportTabs.forEach((item) => {
    const isSelected = item === tab;
    item.classList.toggle('is-active', isSelected);
    item.setAttribute('aria-selected', String(isSelected));
    item.tabIndex = isSelected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !isSelected;
  });
  window.history.replaceState({}, '', `#${tab.getAttribute('aria-controls')}`);
}

supportTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextTab = supportTabs[(index + direction + supportTabs.length) % supportTabs.length];
    selectTab(nextTab);
    nextTab.focus();
  });
});

qnaChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    const topic = chip.dataset.topic;
    qnaChips.forEach((item) => {
      const isSelected = item === chip;
      item.classList.toggle('is-active', isSelected);
      item.setAttribute('aria-pressed', String(isSelected));
    });
    qnaItems.forEach((item) => { item.hidden = topic !== 'all' && item.dataset.topic !== topic; });
  });
});

askForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!askForm.reportValidity()) return;
  askStatus.textContent = '문의 전송 기능이 아직 연결되지 않아 접수되지 않았어요. 고객센터 연결 후 다시 이용해 주세요.';
  askStatus.classList.remove('is-success');
});

const initialTab = document.querySelector(`.support-tab[aria-controls="${window.location.hash.slice(1)}"]`);
if (initialTab) selectTab(initialTab);
