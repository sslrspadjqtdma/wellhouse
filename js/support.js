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
    const nextTab = supportTabs[(index + 1) % supportTabs.length];
    selectTab(nextTab);
    nextTab.focus();
  });
});

qnaChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    const topic = chip.dataset.topic;
    qnaChips.forEach((item) => item.classList.toggle('is-active', item === chip));
    qnaItems.forEach((item) => { item.hidden = topic !== 'all' && item.dataset.topic !== topic; });
  });
});

askForm.addEventListener('submit', (event) => {
  event.preventDefault();
  askStatus.classList.remove('is-success');
  if (!askForm.reportValidity()) return;
  askStatus.textContent = '문의가 접수됐어요. 실제 답변 발송은 고객센터 서버 연결 후 이용할 수 있어요.';
  askStatus.classList.add('is-success');
  askForm.reset();
});

const initialTab = document.querySelector(`.support-tab[aria-controls="${window.location.hash.slice(1)}"]`);
if (initialTab) selectTab(initialTab);
