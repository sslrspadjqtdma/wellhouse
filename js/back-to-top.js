const backToTopButton = document.createElement('button');
backToTopButton.className = 'back-to-top';
backToTopButton.type = 'button';
backToTopButton.setAttribute('aria-label', '맨 위로 이동');
backToTopButton.title = '맨 위로';
backToTopButton.hidden = true;
backToTopButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 14 7-7 7 7M12 7v12"/></svg>';
document.body.append(backToTopButton);

function updateBackToTopVisibility() {
  backToTopButton.hidden = window.scrollY < 320;
}

window.addEventListener('scroll', updateBackToTopVisibility, { passive: true });
backToTopButton.addEventListener('click', () => {
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  window.scrollTo({ top: 0, behavior });
});

updateBackToTopVisibility();
