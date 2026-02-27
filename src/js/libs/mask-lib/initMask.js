import IMask from 'imask';

export function initMask() {
  const phoneInputs = document.querySelectorAll("input[type='tel']");

  if (phoneInputs.length > 0) {
    phoneInputs.forEach((input) => {
      let mask;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

      if (isIOS && window.innerWidth <= 768) {
        // Инициализация масок с условием для начала с 8 и с +7
        mask = IMask(input, {
          mask: [
            {
              mask: '0 (000) 000-00-00',
              startsWith: '8', // Маска для номеров, начинающихся с 8
            },
            {
              mask: '+{7} (000) 000-00-00', // Маска для номеров с кодом страны +7
            },
          ],
          dispatch: (appended, dynamicMasked) => {
            // Считываем текущее значение и добавляем введенную цифру
            const number = (dynamicMasked.value + appended).replace(/\D/g, '');

            // Ищем маску, подходящую под номер
            return dynamicMasked.compiledMasks.find((m) => {
              return !m.startsWith ? true : number.indexOf(m.startsWith) === 0;
            });
          },
        });
      } else {
        mask = IMask(input, {
          mask: '+{7} (000) 000-00-00',
          lazy: input.placeholder === '' ? false : true,
        });
      }

      const correctPhone = (value) => {
        // Убираем все нецифровые символы
        let cleaned = (value || '').replace(/\D/g, '');

        // Проверка на наличие '8' в начале и только в этом случае меняем на '7'
        if (cleaned.startsWith('8') && cleaned.length > 1) {
          cleaned = '7' + cleaned; // Заменяем 8 на 7 только если номер имеет более одной цифры
        }

        if (cleaned.startsWith('779')) cleaned = cleaned.slice(1);
        if (cleaned.startsWith('789')) cleaned = cleaned.slice(2);

        return cleaned;
      };

      // Обработчик вставки
      input.addEventListener('paste', (e) => {
        const pasted = e.clipboardData?.getData('text') || '';
        mask.unmaskedValue = correctPhone(pasted); // Применяем сразу без таймаута
      });

      // Обработчик для ввода текста вручную
      input.addEventListener('input', () => {
        const normalized = correctPhone(input.value); // Нормализуем после изменения значения
        if (normalized !== mask.unmaskedValue) {
          mask.unmaskedValue = normalized; // Применяем нормализованное значение
        }
      });
    });
  }
}
