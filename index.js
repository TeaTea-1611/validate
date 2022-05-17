
function Validation(options = {}) {
  let formElement = document.querySelector(options.form);

  let formRules = {}

  //tim the cha
  function getParent (element, selector) {
    if (element.matches(selector)) {
      return element;
    } else if (element.parentElement) {
      return getParent(element.parentElement, selector);
    } else {
      return null;
    }
  }

  //Kiem tra cac input co dinh dang khong
  let validationRules = {
    required: function(value) {
      return value ? undefined : 'Bắt buộc';
    },
    accout: function(value) {
      if (value[0] === '0' || value[0] === '1' || value[0] === '2' || value[0] === '3' || value[0] === '4' || value[0] === '5' || value[0] === '6' || value[0] === '7' || value[0] === '8' || value[0] === '9') {
        return 'Chữ cái đầu tiên không được là số';
      }
      if (value && !/^[a-zA-Z0-9]{6,20}$/.test(value)) {
        if (value.length > 20) {
          return 'Tài khoản không được vượt quá 20 ký tự';
        }
        if (value.length < 6) {
          return 'Tài khoản phải có ít nhất 6 ký tự';
        }
        return 'Tài khoản không được chứa ký tự đặc biệt';
      }
      return undefined;
    },
    email: function(value) {
      let regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return regex.test(value) ? undefined : 'Email không hợp lệ';
    },
    min: function(value, min) {
      return value.length >= min ? undefined : 'Tối thiểu ' + min + ' ký tự';
    },
    max: function(value, max) {
      return value.length <= max ? undefined : 'Tối đa ' + max + ' ký tự';
    },
    confirmPassword: function(value) {
      let password = formElement.querySelector(`${options.password}`).value;
      return value === password ? undefined : 'Mật khẩu không khớp';
    },
  }

  if (formElement) {
    let inputs = formElement.querySelectorAll('[name][rules]');

    for(let input of inputs) {
      let rules = input.getAttribute('rules').split('|');
      for (let rule of rules) {
        let ruleName = rule.split(':')[0];
        let ruleValue = rule.split(':')[1];
        if (ruleName in validationRules) {
          formRules[input.name] = formRules[input.name] || [];
          formRules[input.name].push(validationRules[ruleName]);
        }

        //Báo lỗi khi input không hợp lệ
        input.onblur = function() {
          let errors = formRules[this.name];
          let errorMessage = '';
          for (let error of errors) {
            errorMessage = error(this.value, ruleValue);
            if (errorMessage) {
              break;
            }
          }
          if (errorMessage) {
            let formGroup = getParent(this, `${options.formGroup}`);
            if (formGroup) {
              formGroup.classList.add('invalid');
              let errorElement;
              errorElement = formGroup.querySelector(`${options.errorMessage}`);
              if (errorElement) {
                errorElement.innerHTML = errorMessage;
              }
            }
          }
          return !errorMessage;
        }

        //xóa lỗi khi input hợp lệ
        input.oninput = function() {
          let formGroup = getParent(this, `${options.formGroup}`);
          if (formGroup) {
            formGroup.classList.remove('invalid');
            let errorElement = formGroup.querySelector(`${options.errorMessage}`);
            if (errorElement) {
              errorElement.innerHTML = '';
            }
          }
        }
      }
    }
  }

  //Xử lí hành vi submit form
  formElement.onsubmit = e => {
    e.preventDefault();
    let inputs = formElement.querySelectorAll('[name][rules]');
    let isValid = true;
    for (let input of inputs) {
      if (!input.onblur()) {
        isValid = false;
      }
    }
    if (isValid) {
      if (typeof this.onSubmit === 'function') {
        var formValues = Array.from(inputs).reduce(function (values, input) {
            switch(input.type) {
                case 'radio':
                    values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                    break;
                case 'checkbox':
                    if (!input.matches(':checked')) {
                        values[input.name] = '';
                        return values;
                    }
                    if (!Array.isArray(values[input.name])) {
                        values[input.name] = [];
                    }
                    values[input.name].push(input.value);
                    break;
                case 'file':
                    values[input.name] = input.files;
                    break;
                default:
                    values[input.name] = input.value;
            }
            return values;
        }, {});
        this.onSubmit(formValues);
      }
      else {
          formElement.submit();
      }
    }
  }
}