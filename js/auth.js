const authForm = document.querySelector('#auth-form');
const authTabs = document.querySelectorAll('.auth-tab');
const signupFields = document.querySelectorAll('.signup-only');
const formTitle = document.querySelector('#form-title');
const formDescription = document.querySelector('#form-description');
const submitButton = document.querySelector('#submit-button');
const passwordInput = document.querySelector('#password');
const formMessage = document.querySelector('#form-message');

function setMode(mode) {
  const isSignup = mode === 'signup';
  authTabs.forEach((tab) => {
    const isActive = tab.dataset.mode === mode;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });
  signupFields.forEach((field) => { field.hidden = !isSignup; });
  formTitle.textContent = isSignup ? 'wellhouse에 오신 걸 환영해요.' : '다시 만나 반가워요.';
  formDescription.textContent = isSignup ? '취향을 나눌 준비가 되셨나요?' : '로그인하고 마음에 담아둔 물건을 만나보세요.';
  submitButton.innerHTML = `${isSignup ? '회원가입' : '로그인'} <span aria-hidden="true">↗</span>`;
  passwordInput.autocomplete = isSignup ? 'new-password' : 'current-password';
  document.querySelector('#nickname').required = isSignup;
  document.querySelector('#password-confirm').required = isSignup;
  document.querySelector('.remember-option').hidden = isSignup;
  document.querySelector('.forgot-button').hidden = isSignup;
  formMessage.textContent = '';
  formMessage.classList.remove('is-success');
  const url = new URL(window.location.href);
  if (isSignup) url.searchParams.set('mode', 'signup');
  else url.searchParams.delete('mode');
  window.history.replaceState({}, '', url);
}

authTabs.forEach((tab) => tab.addEventListener('click', () => setMode(tab.dataset.mode)));

authForm.addEventListener('submit', (event) => {
  event.preventDefault();
  formMessage.classList.remove('is-success');
  if (!authForm.reportValidity()) return;

  const isSignup = document.querySelector('.auth-tab[data-mode="signup"]').getAttribute('aria-selected') === 'true';
  if (isSignup && passwordInput.value !== document.querySelector('#password-confirm').value) {
    formMessage.textContent = '비밀번호가 서로 달라요. 다시 확인해주세요.';
    document.querySelector('#password-confirm').focus();
    return;
  }

  formMessage.textContent = isSignup ? '가입 정보가 확인됐어요. 실제 계정 등록은 아직 연결되지 않았습니다.' : '로그인 정보가 입력됐어요. 실제 로그인을 사용하려면 계정 서버 연결이 필요합니다.';
  formMessage.classList.add('is-success');
});

document.querySelector('.forgot-button').addEventListener('click', () => {
  formMessage.classList.remove('is-success');
  formMessage.textContent = '비밀번호 재설정 기능은 계정 서버 연결 후 이용할 수 있어요.';
});

setMode(new URLSearchParams(window.location.search).get('mode') === 'signup' ? 'signup' : 'login');