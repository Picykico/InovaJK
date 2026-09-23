document.addEventListener('DOMContentLoaded', function () {
  var assunto = document.getElementById('assunto');
  var partnershipFields = document.getElementById('partnershipFields');
  var cnpjInput = document.getElementById('cnpj');
  var cnpjFeedback = document.getElementById('cnpjFeedback');
  var empresaNome = document.getElementById('empresaNome');
  var joinUsButton = document.getElementById('joinUsButton');
  var telefoneInput = document.getElementById('telefone');
  var telefoneFeedback = document.getElementById('telefoneFeedback');
  var emailFeedback = document.getElementById('emailFeedback');

  if (!assunto || !partnershipFields) return;

  var PARTNERSHIP_OPTION = 'Parceria com a escola';

  function togglePartnershipFields() {
    var isPartnership = assunto.value === PARTNERSHIP_OPTION;
    partnershipFields.style.display = isPartnership ? 'grid' : 'none';

    if (cnpjInput) cnpjInput.required = isPartnership;
    if (empresaNome) empresaNome.required = isPartnership;

    if (!isPartnership && cnpjFeedback) {
      cnpjFeedback.textContent = '';
      cnpjFeedback.className = 'field-feedback';
    }
  }

  // Aplica a máscara 00.000.000/0000-00 enquanto a pessoa digita
  function maskCNPJ(value) {
    value = value.replace(/\D/g, '').slice(0, 14);
    value = value.replace(/^(\d{2})(\d)/, '$1.$2');
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
    value = value.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    return value;
  }

  // Validação oficial do CNPJ (dígitos verificadores), só para confirmar
  // que o número tem um formato matematicamente válido — não confirma que
  // a empresa existe de fato ou está ativa na Receita Federal.
  function validarCNPJ(rawValue) {
    var cnpj = String(rawValue).replace(/\D/g, '');
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cnpj)) return false; // todos os dígitos iguais

    function calcDigit(base) {
      var length = base.length;
      var weights = length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      var sum = 0;
      for (var i = 0; i < length; i++) {
        sum += parseInt(base.charAt(i), 10) * weights[i];
      }
      var remainder = sum % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    }

    var base12 = cnpj.substring(0, 12);
    var digit1 = calcDigit(base12);
    var base13 = base12 + String(digit1);
    var digit2 = calcDigit(base13);

    return cnpj === base13 + String(digit2);
  }

  // Validação de e-mail: apenas formato (não existe lista de domínio que
  // cubra todo e-mail empresarial/institucional legítimo do mundo real —
  // Gmail empresarial, por exemplo, usa domínio próprio da empresa).
  var EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  function validarEmail(value) {
    var email = String(value).trim();
    if (!email || email.indexOf('..') !== -1) return false;
    return EMAIL_REGEX.test(email);
  }

  if (emailInput && emailFeedback) {
    emailInput.addEventListener('input', function () {
      emailFeedback.textContent = '';
      emailFeedback.className = 'field-feedback';
    });

    emailInput.addEventListener('blur', function () {
      var value = emailInput.value.trim();
      if (!value) {
        emailFeedback.textContent = '';
        emailFeedback.className = 'field-feedback';
        return;
      }
      if (validarEmail(value)) {
        emailFeedback.textContent = 'E-mail válido.';
        emailFeedback.className = 'field-feedback is-valid';
      } else {
        emailFeedback.textContent =
          'E-mail inválido — confira se está completo (ex: nome@empresa.com).';
        emailFeedback.className = 'field-feedback is-invalid';
      }
    });
  }

  // Aplica a máscara (00) 00000-0000 / (00) 0000-0000 enquanto digita
  function maskTelefone(value) {
    value = value.replace(/\D/g, '').slice(0, 11);
    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
    } else if (value.length > 6) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
    } else if (value.length > 0) {
      value = value.replace(/^(\d{0,2}).*/, '($1');
    }
    return value;
  }

  // Valida DDD real (11 a 99, sem DDDs inexistentes) e quantidade de
  // dígitos (10 para fixo, 11 para celular com o 9 na frente).
  function validarTelefone(value) {
    var digits = String(value).replace(/\D/g, '');
    if (digits.length !== 10 && digits.length !== 11) return false;
    var ddd = parseInt(digits.substring(0, 2), 10);
    if (ddd < 11 || ddd > 99) return false;
    if (digits.length === 11 && digits.charAt(2) !== '9') return false;
    if (/^(\d)\1+$/.test(digits)) return false; // todos os dígitos iguais
    return true;
  }

  if (telefoneInput) {
    telefoneInput.addEventListener('input', function () {
      telefoneInput.value = maskTelefone(telefoneInput.value);
      if (telefoneFeedback) {
        telefoneFeedback.textContent = '';
        telefoneFeedback.className = 'field-feedback';
      }
    });

    telefoneInput.addEventListener('blur', function () {
      if (!telefoneFeedback) return;
      var digits = telefoneInput.value.replace(/\D/g, '');
      if (digits.length === 0) {
        telefoneFeedback.textContent = '';
        telefoneFeedback.className = 'field-feedback';
        return;
      }
      if (validarTelefone(telefoneInput.value)) {
        telefoneFeedback.textContent = 'Telefone válido.';
        telefoneFeedback.className = 'field-feedback is-valid';
      } else {
        telefoneFeedback.textContent = 'Telefone inválido — confira o DDD e a quantidade de números.';
        telefoneFeedback.className = 'field-feedback is-invalid';
      }
    });
  }

  if (cnpjInput) {
    cnpjInput.addEventListener('input', function () {
      cnpjInput.value = maskCNPJ(cnpjInput.value);
      if (cnpjFeedback) {
        cnpjFeedback.textContent = '';
        cnpjFeedback.className = 'field-feedback';
      }
    });

    cnpjInput.addEventListener('blur', function () {
      if (!cnpjFeedback) return;
      var digits = cnpjInput.value.replace(/\D/g, '');
      if (digits.length === 0) {
        cnpjFeedback.textContent = '';
        cnpjFeedback.className = 'field-feedback';
        return;
      }
      if (validarCNPJ(cnpjInput.value)) {
        cnpjFeedback.textContent = 'CNPJ válido.';
        cnpjFeedback.className = 'field-feedback is-valid';
      } else {
        cnpjFeedback.textContent = 'CNPJ inválido — confira os números digitados.';
        cnpjFeedback.className = 'field-feedback is-invalid';
      }
    });
  }

  assunto.addEventListener('change', togglePartnershipFields);
  togglePartnershipFields();

  if (joinUsButton) {
    joinUsButton.addEventListener('click', function () {
      assunto.value = 'Quero fazer parte';
      togglePartnershipFields();
    });
  }

  // ---- Envio do formulário ----
  // O envio real acontece via Formspree (form.action no HTML). Aqui só
  // validamos os campos (inclusive o CNPJ, quando for parceria) e, se
  // estiver tudo certo, mandamos os dados por fetch — sem recarregar a
  // página e sem abrir o Gmail/app de e-mail da pessoa.
  var form = document.querySelector('.form-panel form');
  var formFeedback = document.getElementById('formFeedback');
  var nomeInput = document.getElementById('nome');
  var emailInput = document.getElementById('email');
  var mensagemInput = document.getElementById('mensagem');
  var submitButton = document.getElementById('submitButton');

  function showFormFeedback(message, isValid) {
    if (!formFeedback) return;
    formFeedback.textContent = message;
    formFeedback.className = 'form-feedback ' + (isValid ? 'is-valid' : 'is-invalid');
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var errors = [];

      if (!nomeInput || !nomeInput.value.trim()) {
        errors.push('Informe seu nome.');
      }

      var emailValue = emailInput ? emailInput.value.trim() : '';
      if (!validarEmail(emailValue)) {
        errors.push('Informe um e-mail válido.');
        if (emailFeedback) {
          emailFeedback.textContent =
            'E-mail inválido — confira se está completo (ex: nome@empresa.com).';
          emailFeedback.className = 'field-feedback is-invalid';
        }
      }

      var telefoneValue = telefoneInput ? telefoneInput.value.trim() : '';
      if (!telefoneValue) {
        errors.push('Informe seu telefone com DDD.');
      } else if (!validarTelefone(telefoneValue)) {
        errors.push('Telefone inválido — informe o DDD e o número completos.');
        if (telefoneFeedback) {
          telefoneFeedback.textContent = 'Telefone inválido — informe o DDD e o número completos.';
          telefoneFeedback.className = 'field-feedback is-invalid';
        }
      }

      if (!mensagemInput || !mensagemInput.value.trim()) {
        errors.push('Escreva sua mensagem.');
      }

      var isPartnership = assunto.value === PARTNERSHIP_OPTION;
      if (isPartnership) {
        if (!empresaNome || !empresaNome.value.trim()) {
          errors.push('Informe o nome da empresa ou instituição.');
        }
        if (!cnpjInput || !validarCNPJ(cnpjInput.value)) {
          errors.push('Informe um CNPJ válido.');
          if (cnpjFeedback) {
            cnpjFeedback.textContent = 'CNPJ inválido — confira os números digitados.';
            cnpjFeedback.className = 'field-feedback is-invalid';
          }
        }
      }

      if (errors.length > 0) {
        showFormFeedback(errors.join(' '), false);
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
      }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      })
        .then(function (response) {
          if (response.ok) {
            showFormFeedback('Mensagem enviada com sucesso! Em breve entraremos em contato.', true);
            form.reset();
            togglePartnershipFields();
          } else {
            return response.json().then(function (data) {
              var msg =
                data && data.errors && data.errors.length
                  ? data.errors.map(function (e) { return e.message; }).join(' ')
                  : 'Não foi possível enviar agora. Tente novamente em instantes ou fale por telefone.';
              showFormFeedback(msg, false);
            });
          }
        })
        .catch(function () {
          showFormFeedback(
            'Não foi possível enviar agora (verifique sua conexão). Tente novamente ou fale por telefone.',
            false
          );
        })
        .finally(function () {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Enviar mensagem';
          }
        });
    });
  }
});
