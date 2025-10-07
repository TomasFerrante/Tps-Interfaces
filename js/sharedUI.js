// ==================== COMPONENTES DE UI COMPARTIDOS ====================
// FUNCIONALIDAD:
// - Gestión del menú lateral (sidebar) que se abre desde el ícono hamburguesa
// - Gestión del menú desplegable de usuario (dropdown) del ícono de cuenta
// - Cierre de menús con click fuera, tecla ESC, o botón cerrar
// - Overlay oscuro cuando el sidebar está abierto

// VARIABLES CRÍTICAS Y SU IMPACTO:
// - Clase 'active' (múltiples líneas): Controla visibilidad de sidebar y dropdown
//   MODIFICAR esta clase en CSS afecta cómo aparecen/desaparecen los menús
// - Selectores CSS: Deben coincidir exactamente con las clases en el HTML
//   MODIFICAR nombres de clases aquí requiere actualizar el HTML y CSS también
// - Tecla 'Escape' (líneas 41, 98): Cierra menús abiertos
//   MODIFICAR para cambiar el comportamiento del teclado

// IMPACTO DE MODIFICACIONES:
// - Cambiar selectores sin actualizar HTML/CSS romperá la funcionalidad
// - Modificar lógica de 'active' puede hacer que múltiples menús se abran simultáneamente
// - Eliminar stopPropagation causará que clicks dentro cierren los menús

document.addEventListener('DOMContentLoaded', () => {

  // ==================== MENÚ LATERAL (SIDEBAR) ====================

  const menuButton = document.querySelector('.menu');
  const closeButton = document.querySelector('.close-menu');
  const sidebar = document.querySelector('.sidebar-menu');
  const overlay = document.querySelector('.sidebar-overlay');

  // Abrir menú lateral al hacer clic en el botón hamburguesa
  // MODIFICAR para cambiar cómo se abre el sidebar (ej: agregar animación personalizada)
  if (menuButton) {
    menuButton.addEventListener('click', () => {
      sidebar.classList.add('active');
      overlay.classList.add('active');
    });
  }

  // Cerrar menú con el botón de cerrar (X)
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
    });
  }

  // Cerrar menú al hacer clic en el overlay (fondo oscuro)
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
    });
  }

  // Cerrar menú con la tecla ESC
  // MODIFICAR 'Escape' para cambiar la tecla que cierra el sidebar
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

  // Evento de clic en el ícono de cuenta (abre/cierra dropdown)
  if (accountIcon && userDropdownMenu) {
    accountIcon.addEventListener('click', (e) => {
      // stopPropagation evita que el click cierre el menú inmediatamente
      e.stopPropagation();
      toggleDropdown();
    });

    // Cierra el menú cuando se hace clic fuera de él
    // MODIFICAR para cambiar comportamiento de cierre (ej: solo cerrar con click en overlay)
    document.addEventListener('click', (e) => {
      if (isDropdownOpen && accountContainer && !accountContainer.contains(e.target)) {
        closeDropdown();
      }
    });

    // Evita que el clic dentro del menú lo cierre
    // ELIMINAR stopPropagation hará que clicks dentro también cierren el menú
    userDropdownMenu.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Cierra el menú al presionar la tecla Escape (si no está el sidebar activo)
    // MODIFICAR 'Escape' para cambiar la tecla que cierra el dropdown
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isDropdownOpen) {
        // Solo cerrar dropdown si el sidebar no está activo (prioridad al sidebar)
        if (!sidebar || !sidebar.classList.contains('active')) {
          closeDropdown();
        }
      }
    });
  }
});
