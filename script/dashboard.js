document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('totalJejak').textContent = 12;
  document.getElementById('totalBudaya').textContent = 7;
  document.getElementById('totalLapor').textContent = 3;

  document.getElementById('logout').addEventListener('click', () => {
    alert('Logout berhasil! (simulasi)');
    window.location.href = 'login.html';
  });
});
