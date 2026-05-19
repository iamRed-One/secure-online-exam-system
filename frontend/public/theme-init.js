// Force light mode on every page load
(function () {
  try { localStorage.removeItem('theme'); } catch (e) {}
  document.documentElement.classList.remove('dark');
  document.documentElement.style.backgroundColor = '#f9fafb';
  if (document.body) {
    document.body.style.backgroundColor = '#f9fafb';
    document.body.style.color = '#101828';
  }
})();
