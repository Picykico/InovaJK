document.addEventListener('DOMContentLoaded', function () {
  var assunto = document.getElementById('assunto');
  var partnershipFields = document.getElementById('partnershipFields');
  var cnpjInput = document.getElementById('cnpj');
  var cnpjFeedback = document.getElementById('cnpjFeedback');
  var empresaNome = document.getElementById('empresaNome');
  var joinUsButton = document.getElementById('joinUsButton');

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
  // Este site é estático (sem backend), então não existe para onde enviar
  // o formulário de verdade ainda. Por isso interceptamos o envio: validamos
  // os campos (inclusive o CNPJ, quando for parceria) e mostramos uma
  // confirmação, em vez de deixar o navegador recarregar a página e apagar
  // tudo que a pessoa preencheu.
  var form = document.querySelector('.form-panel form');
  var formFeedback = document.getElementById('formFeedback');
  var nomeInput = document.getElementById('nome');
  var emailInput = document.getElementById('email');

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
      if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        errors.push('Informe um e-mail válido.');
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

      showFormFeedback(
        'Mensagem registrada! Como este é um site estático (sem backend), ' +
          'para o envio chegar de verdade é preciso conectar este formulário a ' +
          'um serviço de e-mail ou a um backend — por enquanto, esta confirmação ' +
          'é só uma prévia do funcionamento.',
        true
      );
      form.reset();
      togglePartnershipFields();
    });
  }
});
