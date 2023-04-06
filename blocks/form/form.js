const context = {};

/**
 * Returns true of the input string is a valid email address.
 * @param {string} email An email address
 */
function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

/**
 * Returns true of the input string is a valid phone number.
 * @param {string} phone A phone number
 */
function validatePhone(phone) {
  const re = /^(?:\+|\d)[\d- ]{8,}$/;
  return re.test(phone);
}

/**
 * Returns true of the input string is a valid value for PLZ (5-digit number).
 * @param {string} number A PLZ
 */
function validatePLZ(number) {
  // Use regular expression to check if input string is a positive 5-digit integer
  const regex = /^[1-9]\d{4}$/;
  return regex.test(number);
}

// this is the method performing execution of functions
function execFn(fnName, ctx, ...args) {
  // execute the function with passed parameters and return result
  return ctx[fnName](...args);
}

function createSelect(fd) {
  const radioOuter = document.createElement('div');
  radioOuter.className = 'radio-outer';
  radioOuter.id = fd.Field;

  let i = 1;
  fd.Options.split(',').forEach((o) => {
    const radioInner = document.createElement('div');
    radioInner.className = 'radio-inner';

    const option = document.createElement('input');
    option.type = 'radio';
    option.textContent = o.trim();
    option.value = o.trim();
    option.id = o.trim();
    option.name = fd.Field;
    option.setAttribute('validation-error-message', fd.ValidationErrorMessage);

    // only the first one of the radios should have the required attribute set
    if ((fd.Mandatory === 'x') && (i === 1)) {
      option.required = true;
    }

    radioInner.append(option);

    const innerLabel = document.createElement('label');
    innerLabel.className = 'option-label';
    innerLabel.htmlFor = o.trim();
    innerLabel.textContent = o.trim();
    radioInner.append(innerLabel);

    radioOuter.append(radioInner);
    i += 1;
  });

  return radioOuter;
}

function constructPayload(form) {
  const payload = {};
  [...form.elements].forEach((fe) => {
    // radio buttons should be indexed by name, not id
    if (fe.type === 'radio') {
      if (fe.checked) payload[fe.name] = fe.value;
    } else if (fe.type === 'checkbox') {
      if (fe.checked) payload[fe.id] = fe.value;
    } else if (fe.id) {
      payload[fe.id] = fe.value;
    }
  });
  return payload;
}

async function submitForm(form) {
  const payload = constructPayload(form);
  const resp = await fetch(form.dataset.action, {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: payload }),
  });
  await resp.text();
  return payload;
}

/**
 * Add an error message to the input element
 *
 * @param {elem} input element
 */

function addErrorMessage(elem) {
  const lastNode = elem.parentNode.parentNode.lastChild;

  if (!lastNode.classList.contains('error-message')) {
    const errorWrapper = document.createElement('div');
    errorWrapper.className = 'error-message';

    const containerMessage = document.createElement('ul');
    containerMessage.className = 'error-message';

    const errorMessage = document.createElement('li');
    errorMessage.innerText = elem.getAttribute('validation-error-message');

    containerMessage.append(errorMessage);
    errorWrapper.append(containerMessage);

    lastNode.parentNode.insertBefore(errorWrapper, lastNode.nextSibling);
    elem.classList.add('invalid');
  }
}

/**
 * Remove the error message from the input element, if any
 *
 * @param {elem} input element
 */
function removeErrorMessage(elem) {
  const lastNode = elem.parentNode.parentNode.lastChild;

  if (lastNode.classList.contains('error-message')) {
    lastNode.parentNode.removeChild(lastNode);
  }
  elem.classList.remove('invalid');
}

function createButton(fd) {
  const button = document.createElement('button');
  button.textContent = fd.Label;
  button.classList.add('button');
  if (fd.Type === 'submit') {
    button.addEventListener('click', async (event) => {
      const form = button.closest('form');
      if (form.checkValidity()) {
        event.preventDefault();
        button.setAttribute('disabled', '');
        await submitForm(form);
        const redirectTo = fd.Extra;
        window.location.href = redirectTo;
      } else {
        [...form.elements].forEach((elem) => {
          if (elem.checkValidity()) {
            removeErrorMessage(elem);
          } else {
            addErrorMessage(elem);
          }
        });
      }
    });
  }
  return button;
}

function createHeading(fd) {
  const heading = document.createElement('h3');
  heading.textContent = fd.Label;
  return heading;
}

function createInput(fd) {
  const customValidationFunction = fd.ValidationFunction;

  const input = document.createElement('input');
  input.type = fd.Type;
  input.id = fd.Field;
  input.setAttribute('placeholder', fd.Placeholder);
  input.setAttribute('validation-error-message', fd.ValidationErrorMessage);

  if (fd.Mandatory === 'x') {
    input.required = true;
  }

  if (customValidationFunction !== '') {
    input.addEventListener('change', () => {
      const funName = `validate-${customValidationFunction}`;
      if (!context[funName]) {
        return;
      }

      if (!execFn(funName, context, input.value)) {
        input.setCustomValidity(fd.ValidationErrorMessage);
      } else {
        input.setCustomValidity('');
      }
    });
  }

  return input;
}

function createTextArea(fd) {
  const input = document.createElement('textarea');
  input.id = fd.Field;
  input.setAttribute('placeholder', fd.Placeholder);
  input.setAttribute('validation-error-message', fd.ValidationErrorMessage);
  if (fd.Mandatory === 'x') {
    input.required = true;
  }

  return input;
}

function createLabel(fd) {
  const label = document.createElement('label');
  label.setAttribute('for', fd.Field);
  label.textContent = fd.Label;
  label.className = 'entry-label';

  if (fd.Mandatory === 'x' && (!fd.Style.includes('no-star'))) {
    label.classList.add('required');
  }

  if (fd.LabelLinks) {
    const links = JSON.parse(fd.LabelLinks);
    Object.keys(links).forEach((key) => {
      const link = `<a href="${links[key]}" target="_blank">${key}</a>`;
      label.innerHTML = label.innerHTML.replace(key, link);
    });
  }

  return label;
}

function applyRules(form, rules) {
  const payload = constructPayload(form);
  rules.forEach((field) => {
    const { type, condition: { key, operator, value } } = field.rule;
    if (type === 'visible') {
      if (operator === 'eq') {
        if (payload[key] === value) {
          form.querySelector(`.${field.fieldId}`).classList.remove('hidden');
        } else {
          form.querySelector(`.${field.fieldId}`).classList.add('hidden');
        }
      }
    }
  });
}

async function createForm(formURL) {
  const { pathname } = new URL(formURL);
  const resp = await fetch(pathname);
  const json = await resp.json();
  const form = document.createElement('form');
  const rules = [];
  // eslint-disable-next-line prefer-destructuring
  form.dataset.action = pathname.split('.json')[0];
  json.data.forEach((fd) => {
    fd.Type = fd.Type || 'text';
    const fieldWrapper = document.createElement('div');
    const style = fd.Style ? ` form-${fd.Style}` : '';
    fieldWrapper.className = 'field-wrapper';

    const fieldId = `form-${fd.Type}-wrapper${style}`;
    fieldWrapper.classList.add(...fieldId.split(' '));

    const internalFieldWrapper = document.createElement('div');
    internalFieldWrapper.className = 'inner-element';
    fieldWrapper.append(internalFieldWrapper);

    switch (fd.Type) {
      case 'select':
        internalFieldWrapper.append(createLabel(fd));
        internalFieldWrapper.append(createSelect(fd));
        break;
      case 'heading':
        internalFieldWrapper.append(createHeading(fd));
        break;
      case 'checkbox':
        internalFieldWrapper.append(createInput(fd));
        internalFieldWrapper.append(createLabel(fd));
        break;
      case 'text-area':
        internalFieldWrapper.append(createLabel(fd));
        internalFieldWrapper.append(createTextArea(fd));
        break;
      case 'submit':
        internalFieldWrapper.append(createButton(fd));
        break;
      case 'section':
        internalFieldWrapper.append(createLabel(fd));
        break;
      default:
        internalFieldWrapper.append(createLabel(fd));
        internalFieldWrapper.append(createInput(fd));
    }

    if (fd.Rules) {
      try {
        rules.push({ fieldId, rule: JSON.parse(fd.Rules) });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`Invalid Rule ${fd.Rules}: ${e}`);
      }
    }
    form.append(fieldWrapper);
  });

  form.addEventListener('change', () => applyRules(form, rules));
  applyRules(form, rules);

  return (form);
}

export default async function decorate(block) {
  const form = block.querySelector('a[href$=".json"]');
  if (form) {
    form.replaceWith(await createForm(form.href));
  }

  // assign functions to the context for verification
  context['validate-email'] = validateEmail;
  context['validate-phone'] = validatePhone;
  context['validate-plz'] = validatePLZ;
}
