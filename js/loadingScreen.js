// Loading Screen - Pantalla de carga de 5 segundos para home

document.addEventListener('DOMContentLoaded', () => {
  const loadingScreen = document.querySelector('.loading-screen');
  const loadingPercent = document.getElementById('loadingPercent');
  const body = document.body;

  if (!loadingScreen) return;

  // Prevenir scroll mientras carga
  body.style.overflow = 'hidden';

  // Duración del loading: 5 segundos
  const LOADING_DURATION = 5000;
  const UPDATE_INTERVAL = 50; // Actualizar cada 50ms para suavidad

  let currentPercent = 0;
  const incrementAmount = 100 / (LOADING_DURATION / UPDATE_INTERVAL);

  // Actualizar porcentaje gradualmente
  const percentageInterval = setInterval(() => {
    currentPercent += incrementAmount;

    // Asegurar que no pase de 100
    if (currentPercent >= 100) {
      currentPercent = 100;
      clearInterval(percentageInterval);
    }

    // Actualizar el texto del porcentaje
    if (loadingPercent) {
      loadingPercent.textContent = Math.floor(currentPercent);
    }
  }, UPDATE_INTERVAL);

  // Ocultar el loading después de 5 segundos
  setTimeout(() => {
    // Asegurar que llegue a 100%
    if (loadingPercent) {
      loadingPercent.textContent = '100';
    }

    // Agregar clase para animación de salida
    loadingScreen.classList.add('hidden');

    // Restaurar scroll
    body.style.overflow = '';

    // Limpiar intervalo
    clearInterval(percentageInterval);

    // Remover del DOM después de la animación
    setTimeout(() => {
      loadingScreen.remove();
    }, 500); // Tiempo de la transición CSS
  }, LOADING_DURATION);
});
