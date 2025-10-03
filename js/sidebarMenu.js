// Módulo para manejar el menú lateral
// Gestiona la apertura y cierre del sidebar con animaciones

document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.menu');
  const closeButton = document.querySelector('.close-menu');
  const sidebar = document.querySelector('.sidebar-menu');
  const overlay = document.querySelector('.sidebar-overlay');

  // Abrir menú
  if (menuButton) {
    menuButton.addEventListener('click', () => {
      sidebar.classList.add('active');
      overlay.classList.add('active');
    });
  }

  // Cerrar menú con el botón de cerrar
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
    });
  }

  // Cerrar menú al hacer clic en el overlay
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
    });
  }

  // Cerrar menú con la tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
    }
  });
});
