// Módulo para manejar el formulario de registro
// Gestiona la animación del botón y la redirección

document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.querySelector('.form-signup');

  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitButton = signupForm.querySelector('.btn-signup');

      // Activar la animación del botón
      submitButton.focus();

      // Esperar a que termine la animación (600ms según el CSS transition)
      setTimeout(() => {
        window.location.href = '../html/home.html';
      }, 600);
    });
  }
});
