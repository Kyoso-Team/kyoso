export function toggleTheme() {
  document.documentElement.classList.toggle(
    'dark',
    localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
}

export function switchTheme() {
  const theme = localStorage.getItem('theme');
  localStorage.setItem('theme', theme === 'dark' ? 'light' : 'dark');
  toggleTheme();
}
