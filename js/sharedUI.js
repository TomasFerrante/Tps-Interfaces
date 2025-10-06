// ==================== COMPONENTES DE UI COMPARTIDOS ====================
// Módulo consolidado que maneja componentes de interfaz reutilizables:
// - Menú lateral (sidebar)
// - Menú desplegable de usuario

document.addEventListener('DOMContentLoaded', () => {

  // ==================== MENÚ LATERAL (SIDEBAR) ====================

  const menuButton = document.querySelector('.menu');
  const closeButton = document.querySelector('.close-menu');
  const sidebar = document.querySelector('.sidebar-menu');
  const overlay = document.querySelector('.sidebar-overlay');

  // Abrir menú lateral
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
    if (e.key === 'Escape' && sidebar && sidebar.classList.contains('active')) {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
    }
  });

  // ==================== MENÚ DESPLEGABLE DE USUARIO ====================

  const accountIcon = document.querySelector('.account');
  const userDropdownMenu = document.querySelector('.user-dropdown-menu');
  const accountContainer = document.querySelector('.account-menu-container');

  let isDropdownOpen = false;

  function openDropdown() {
    if (userDropdownMenu) {
      userDropdownMenu.classList.add('active');
      isDropdownOpen = true;
    }
  }

  function closeDropdown() {
    if (userDropdownMenu) {
      userDropdownMenu.classList.remove('active');
      isDropdownOpen = false;
    }
  }

  function toggleDropdown() {
    if (isDropdownOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }

  // Evento de clic en el ícono de cuenta
  if (accountIcon && userDropdownMenu) {
    accountIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown();
    });

    // Cierra el menú cuando se hace clic fuera de él
    document.addEventListener('click', (e) => {
      if (isDropdownOpen && accountContainer && !accountContainer.contains(e.target)) {
        closeDropdown();
      }
    });

    // Evita que el clic dentro del menú lo cierre
    userDropdownMenu.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Cierra el menú al presionar la tecla Escape (si no está el sidebar activo)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isDropdownOpen) {
        // Solo cerrar dropdown si el sidebar no está activo
        if (!sidebar || !sidebar.classList.contains('active')) {
          closeDropdown();
        }
      }
    });
  }
});
