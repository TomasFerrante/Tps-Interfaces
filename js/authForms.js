// ==================== FORMULARIOS DE AUTENTICACIÓN ====================
// FUNCIONALIDAD:
// - Validación en tiempo real de formularios de registro y login
// - Sistema de captcha visual con ruido aleatorio
// - Validación de nombre, nickname, edad, email, contraseña
// - Feedback visual inmediato con iconos y colores
// - Toggle de visibilidad de contraseña
// - Redirección automática tras validación exitosa

// VARIABLES CRÍTICAS Y SU IMPACTO:

// VALIDADORES:
// - Nombre mínimo (línea 36): 3 caracteres - MODIFICAR para cambiar longitud mínima
// - Nickname mínimo (línea 49): 3 caracteres - MODIFICAR para cambiar longitud mínima
// - Edad mínima (línea 63): 13 años - MODIFICAR para cambiar restricción de edad
// - Edad máxima (línea 66): 110 años - MODIFICAR para cambiar límite superior
// - Contraseña mínima (línea 88): 8 caracteres - MODIFICAR para cambiar seguridad
// - Regex nombre (línea 39): /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/ - Solo letras y espacios
// - Regex nickname (línea 52): /^[a-zA-Z0-9_]+$/ - Letras, números y guiones bajos
// - Regex email (línea 76): Formato estándar de email

// CAPTCHA:
// - Longitud código (línea 124): 6 caracteres - MODIFICAR para hacer captcha más largo/corto
// - Caracteres permitidos (línea 122): Excluye I, O, l, 0, 1 para evitar confusión
// - Líneas de ruido (línea 147): 5 líneas - MODIFICAR para más/menos distracción
// - Puntos de ruido (línea 157): 30 puntos - MODIFICAR para más/menos ruido
// - Tamaño fuente (línea 171): 28px - MODIFICAR para hacer texto más grande/pequeño

// REDIRECCIONES:
// - Registro exitoso (línea 382): './html/home.html' - MODIFICAR para cambiar destino
// - Login exitoso (línea 475): './home.html' - MODIFICAR para cambiar destino
// - Delay redirección (líneas 382, 475): 600ms - MODIFICAR para cambiar tiempo de espera

document.addEventListener('DOMContentLoaded', () => {

  // ==================== UTILIDADES COMPARTIDAS ====================

  function setHelper(element, type, icon, message) {
    if (!element) return;
    element.className = `helper-text ${type}`;
    element.innerHTML = `<span class="material-symbols-outlined icon">${icon}</span><span>${message}</span>`;
  }

  function setFieldState(input, isValid, helperElement, successMsg, errorMsg) {
    if (isValid) {
      input.classList.add('valid');
      input.classList.remove('invalid');
      setHelper(helperElement, 'success', 'check_circle', successMsg);
    } else {
      input.classList.add('invalid');
      input.classList.remove('valid');
      setHelper(helperElement, 'error', 'cancel', errorMsg);
    }
  }

  // ==================== VALIDADORES ====================

  const validators = {
    name: (value) => {
      if (value.length === 0) {
        return { valid: null, message: 'Ingresa tu nombre completo' };
      }
      // MODIFICAR 3 para cambiar longitud mínima del nombre
      if (value.length < 3) {
        return { valid: false, message: 'El nombre debe tener al menos 3 caracteres' };
      }
      // MODIFICAR regex para cambiar caracteres permitidos (actualmente: letras y espacios con acentos)
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
        return { valid: false, message: 'El nombre solo puede contener letras' };
      }
      return { valid: true, message: 'Nombre válido' };
    },

    nickname: (value) => {
      if (value.length === 0) {
        return { valid: null, message: 'Ingresa tu nickname (opcional)' };
      }
      // MODIFICAR 3 para cambiar longitud mínima del nickname
      if (value.length < 3) {
        return { valid: false, message: 'El nickname debe tener al menos 3 caracteres' };
      }
      // MODIFICAR regex para cambiar caracteres permitidos (actualmente: letras, números, guiones bajos)
      if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        return { valid: false, message: 'Solo letras, números y guiones bajos' };
      }
      return { valid: true, message: 'Nickname válido' };
    },

    age: (value) => {
      if (value.length === 0) {
        return { valid: null, message: 'Ingresa tu edad' };
      }
      const age = parseInt(value);
      // MODIFICAR 13 para cambiar edad mínima permitida
      if (isNaN(age) || age < 13) {
        return { valid: false, message: 'Debes tener al menos 13 años' };
      }
      // MODIFICAR 110 para cambiar edad máxima permitida
      if (age > 110) {
        return { valid: false, message: 'Edad no válida' };
      }
      return { valid: true, message: 'Edad válida' };
    },

    email: (value) => {
      if (value.length === 0) {
        return { valid: null, message: 'Ingresa un email válido' };
      }
      // MODIFICAR regex para cambiar formato de email aceptado (actualmente: formato estándar)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { valid: false, message: 'Email inválido' };
      }
      return { valid: true, message: 'Email válido' };
    },

    password: (value, isLogin = false) => {
      if (value.length === 0) {
        return { valid: null, message: isLogin ? 'Ingresa tu contraseña' : 'Mínimo 8 caracteres, 1 mayúscula y 1 número' };
      }
      if (!isLogin) {
        // MODIFICAR 8 para cambiar longitud mínima de contraseña
        if (value.length < 8) {
          return { valid: false, message: 'Debe tener al menos 8 caracteres' };
        }
        // MODIFICAR regex para cambiar requisito de mayúscula
        if (!/[A-Z]/.test(value)) {
          return { valid: false, message: 'Debe tener al menos una mayúscula' };
        }
        // MODIFICAR regex para cambiar requisito de número
        if (!/[0-9]/.test(value)) {
          return { valid: false, message: 'Debe tener al menos un número' };
        }
      }
      return { valid: true, message: 'Contraseña válida' };
    },

    confirmPassword: (value, passwordValue) => {
      if (value.length === 0) {
        return { valid: null, message: 'Confirma tu contraseña' };
      }
      if (value !== passwordValue) {
        return { valid: false, message: 'Las contraseñas no coinciden' };
      }
      return { valid: true, message: 'Las contraseñas coinciden' };
    }
  };

  // ==================== SISTEMA DE CAPTCHA ====================

  const canvas = document.getElementById('captchaCanvas');
  const refreshBtn = document.getElementById('refreshCaptcha');
  const captchaInput = document.getElementById('captcha-input');
  const captchaHelper = document.querySelector('.captcha-helper');

  let captchaCode = '';

  function generateCaptchaCode() {
    // MODIFICAR para incluir/excluir caracteres (excluye I, O, l, 0, 1 por similitud visual)
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let code = '';
    // MODIFICAR 6 para cambiar longitud del captcha
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }

  function drawCaptcha() {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    captchaCode = generateCaptchaCode();

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo con gradiente
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f0f0f0');
    gradient.addColorStop(1, '#e0e0e0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Líneas de ruido
    // MODIFICAR 5 para cambiar cantidad de líneas de distracción
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.3)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Puntos de ruido
    // MODIFICAR 30 para cambiar cantidad de puntos de distracción
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.5)`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Dibujar el código
    // MODIFICAR '28px' para cambiar tamaño del texto del captcha
    ctx.font = 'bold 28px Arial';
    ctx.textBaseline = 'middle';

    const spacing = canvas.width / (captchaCode.length + 1);

    for (let i = 0; i < captchaCode.length; i++) {
      const hue = Math.random() * 360;
      ctx.fillStyle = `hsl(${hue}, 70%, 40%)`;

      const x = spacing * (i + 1);
      const y = canvas.height / 2;
      const angle = (Math.random() - 0.5) * 0.4;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(captchaCode[i], 0, 0);
      ctx.restore();
    }

    // Resetear el input
    if (captchaInput) {
      captchaInput.value = '';
      captchaInput.classList.remove('valid', 'invalid');
      setHelper(captchaHelper, 'info', 'info', 'Ingresa el código que ves en la imagen');
    }
  }

  // Validación del captcha en tiempo real
  if (captchaInput) {
    captchaInput.addEventListener('input', function() {
      const value = this.value.trim();

      if (value.length === 0) {
        this.classList.remove('valid', 'invalid');
        setHelper(captchaHelper, 'info', 'info', 'Ingresa el código que ves en la imagen');
      } else if (value === captchaCode) {
        this.classList.add('valid');
        this.classList.remove('invalid');
        setHelper(captchaHelper, 'success', 'check_circle', 'Código correcto');
      } else if (value.length >= captchaCode.length) {
        this.classList.add('invalid');
        this.classList.remove('valid');
        setHelper(captchaHelper, 'error', 'cancel', 'Código incorrecto');
      } else {
        this.classList.remove('valid', 'invalid');
        setHelper(captchaHelper, 'info', 'info', `${value.length}/${captchaCode.length} caracteres`);
      }
    });
  }

  // Botón de refresh del captcha
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      drawCaptcha();
      refreshBtn.style.transform = 'rotate(360deg) scale(1.1)';
      setTimeout(() => {
        refreshBtn.style.transform = 'rotate(0deg) scale(1)';
      }, 300);
    });
  }

  // ==================== FORMULARIO DE REGISTRO ====================

  const signupForm = document.querySelector('.form-signup');

  if (signupForm) {
    const nameInput = signupForm.querySelector('#name');
    const nicknameInput = signupForm.querySelector('#nickname');
    const ageInput = signupForm.querySelector('#age');
    const emailInput = signupForm.querySelector('#email');
    const passwordInput = signupForm.querySelector('input[type="password"]');
    const confirmPasswordInput = signupForm.querySelector('#confirm-password');

    const helpers = signupForm.querySelectorAll('.helper-text');
    const nameHelper = helpers[0];
    const nicknameHelper = helpers[1];
    const ageHelper = helpers[2];
    const emailHelper = helpers[3];
    const passwordHelper = helpers[4];
    const confirmPasswordHelper = helpers[5];

    // Inicializar helper texts
    setHelper(nameHelper, 'info', 'info', 'Ingresa tu nombre completo');
    setHelper(nicknameHelper, 'info', 'info', 'Ingresa tu nickname (opcional)');
    setHelper(ageHelper, 'info', 'info', 'Debes tener al menos 13 años');
    setHelper(emailHelper, 'info', 'info', 'Ingresa un email válido');
    setHelper(passwordHelper, 'info', 'info', 'Mínimo 8 caracteres, 1 mayúscula y 1 número');
    setHelper(confirmPasswordHelper, 'info', 'info', 'Confirma tu contraseña');

    // Validación en tiempo real - Nombre
    if (nameInput) {
      nameInput.addEventListener('input', function() {
        const result = validators.name(this.value.trim());
        if (result.valid === null) {
          this.classList.remove('valid', 'invalid');
          setHelper(nameHelper, 'info', 'info', result.message);
        } else {
          setFieldState(this, result.valid, nameHelper, result.message, result.message);
        }
      });
    }

    // Validación en tiempo real - Nickname
    if (nicknameInput) {
      nicknameInput.addEventListener('input', function() {
        const result = validators.nickname(this.value.trim());
        if (result.valid === null) {
          this.classList.remove('valid', 'invalid');
          setHelper(nicknameHelper, 'info', 'info', result.message);
        } else {
          setFieldState(this, result.valid, nicknameHelper, result.message, result.message);
        }
      });
    }

    // Validación en tiempo real - Edad
    if (ageInput) {
      ageInput.addEventListener('input', function() {
        const result = validators.age(this.value);
        if (result.valid === null) {
          this.classList.remove('valid', 'invalid');
          setHelper(ageHelper, 'info', 'info', result.message);
        } else {
          setFieldState(this, result.valid, ageHelper, result.message, result.message);
        }
      });
    }

    // Validación en tiempo real - Email
    if (emailInput) {
      emailInput.addEventListener('input', function() {
        const result = validators.email(this.value.trim());
        if (result.valid === null) {
          this.classList.remove('valid', 'invalid');
          setHelper(emailHelper, 'info', 'info', result.message);
        } else {
          setFieldState(this, result.valid, emailHelper, result.message, result.message);
        }
      });
    }

    // Validación en tiempo real - Contraseña
    if (passwordInput) {
      passwordInput.addEventListener('input', function() {
        const result = validators.password(this.value);
        if (result.valid === null) {
          this.classList.remove('valid', 'invalid');
          setHelper(passwordHelper, 'info', 'info', result.message);
        } else {
          setFieldState(this, result.valid, passwordHelper, result.message, result.message);
        }

        if (confirmPasswordInput && confirmPasswordInput.value) {
          confirmPasswordInput.dispatchEvent(new Event('input'));
        }
      });
    }

    // Validación en tiempo real - Confirmar contraseña
    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener('input', function() {
        const passwordValue = passwordInput ? passwordInput.value : '';
        const result = validators.confirmPassword(this.value, passwordValue);
        if (result.valid === null) {
          this.classList.remove('valid', 'invalid');
          setHelper(confirmPasswordHelper, 'info', 'info', result.message);
        } else {
          setFieldState(this, result.valid, confirmPasswordHelper, result.message, result.message);
        }
      });
    }

    // Envío del formulario de registro
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validar captcha primero
      if (captchaInput) {
        const captchaValue = captchaInput.value.trim();
        if (captchaValue !== captchaCode) {
          captchaInput.classList.add('invalid');
          captchaInput.classList.remove('valid');
          setHelper(captchaHelper, 'error', 'cancel', 'Debes completar correctamente el captcha');
          captchaInput.focus();
          setTimeout(() => drawCaptcha(), 1000);
          return;
        }
      }

      const requiredInputs = [nameInput, ageInput, emailInput, passwordInput, confirmPasswordInput];
      let isValid = true;
      let firstInvalidInput = null;

      requiredInputs.forEach(input => {
        if (input) {
          input.dispatchEvent(new Event('input'));
          if (!input.classList.contains('valid')) {
            isValid = false;
            if (!firstInvalidInput) {
              firstInvalidInput = input;
            }
          }
        }
      });

      if (isValid) {
        const submitButton = signupForm.querySelector('.btn-signup');
        submitButton.focus();

        // MODIFICAR './html/home.html' para cambiar destino tras registro exitoso
        // MODIFICAR 600 para cambiar delay antes de redirección (en ms)
        setTimeout(() => {
          window.location.href = './html/home.html';
        }, 600);
      } else if (firstInvalidInput) {
        firstInvalidInput.focus();
      }
    });
  }

  // ==================== FORMULARIO DE LOGIN ====================

  const loginForm = document.querySelector('.login-body form');

  if (loginForm) {
    const emailInput = loginForm.querySelector('#email');
    const passwordInput = loginForm.querySelector('#password');
    const submitButton = loginForm.querySelector('.btn-signup');

    const emailContainer = emailInput?.closest('.container-input');
    const passwordContainer = passwordInput?.closest('.container-input');

    let emailHelper = emailContainer?.querySelector('.helper-text');
    let passwordHelper = passwordContainer?.querySelector('.helper-text');

    if (emailContainer && !emailHelper) {
      emailHelper = document.createElement('p');
      emailHelper.className = 'helper-text info';
      emailContainer.appendChild(emailHelper);
    }

    if (passwordContainer && !passwordHelper) {
      passwordHelper = document.createElement('p');
      passwordHelper.className = 'helper-text info';
      passwordContainer.appendChild(passwordHelper);
    }

    setHelper(emailHelper, 'info', 'info', 'Ingresa tu email');
    setHelper(passwordHelper, 'info', 'info', 'Ingresa tu contraseña');

    // Validación en tiempo real - Email
    if (emailInput) {
      emailInput.addEventListener('input', function() {
        const result = validators.email(this.value.trim());
        if (result.valid === null) {
          this.classList.remove('valid', 'invalid');
          setHelper(emailHelper, 'info', 'info', result.message);
        } else {
          setFieldState(this, result.valid, emailHelper, result.message, result.message);
        }
      });
    }

    // Validación en tiempo real - Contraseña
    if (passwordInput) {
      passwordInput.addEventListener('input', function() {
        const result = validators.password(this.value, true);
        if (result.valid === null) {
          this.classList.remove('valid', 'invalid');
          setHelper(passwordHelper, 'info', 'info', result.message);
        } else {
          setFieldState(this, result.valid, passwordHelper, result.message, result.message);
        }
      });
    }

    // Envío del formulario de login
    if (submitButton) {
      submitButton.addEventListener('click', (e) => {
        e.preventDefault();

        let isValid = true;
        let firstInvalidInput = null;

        if (emailInput) {
          emailInput.dispatchEvent(new Event('input'));
          if (!emailInput.classList.contains('valid')) {
            isValid = false;
            firstInvalidInput = emailInput;
          }
        }

        if (passwordInput) {
          passwordInput.dispatchEvent(new Event('input'));
          if (!passwordInput.classList.contains('valid')) {
            isValid = false;
            if (!firstInvalidInput) {
              firstInvalidInput = passwordInput;
            }
          }
        }

        if (isValid) {
          submitButton.focus();
          // MODIFICAR './home.html' para cambiar destino tras login exitoso
          // MODIFICAR 600 para cambiar delay antes de redirección (en ms)
          setTimeout(() => {
            window.location.href = './home.html';
          }, 600);
        } else if (firstInvalidInput) {
          firstInvalidInput.focus();
        }
      });
    }
  }

  // ==================== TOGGLE PASSWORD VISIBILITY ====================

  const togglePasswordIcons = document.querySelectorAll('.toggle-password');

  togglePasswordIcons.forEach((icon, index, icons) => {
    if (index % 2 === 0) {
      const visibilityIcon = icons[index];
      const visibilityOffIcon = icons[index + 1];
      const passwordInput = icon.closest('.input-with-icon').querySelector('input[type="password"], input[type="text"]');

      if (passwordInput) {
        if (visibilityOffIcon) {
          visibilityOffIcon.style.display = 'none';
        }

        visibilityIcon.addEventListener('click', () => {
          passwordInput.type = 'text';
          visibilityIcon.style.display = 'none';
          if (visibilityOffIcon) {
            visibilityOffIcon.style.display = 'block';
          }
        });

        if (visibilityOffIcon) {
          visibilityOffIcon.addEventListener('click', () => {
            passwordInput.type = 'password';
            visibilityOffIcon.style.display = 'none';
            visibilityIcon.style.display = 'block';
          });
        }
      }
    }
  });

  // ==================== INICIALIZACIÓN ====================

  // Inicializar captcha si existe
  if (canvas) {
    drawCaptcha();
  }
});
