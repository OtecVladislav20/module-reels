/**********************************************************/
/*	@copyright	VICTORY group					          */
/*	@support	https://victoryagency.ru/				  */
/**********************************************************/

export function initVGMap() {
  const mapsWraps = document.querySelectorAll('[data-map]');

  // Создаем нижнюю подсказку ОДИН РАЗ, вне цикла
  let mapClueBottom = document.querySelector('.map-clue-bottom');
  if (!mapClueBottom) {
    mapClueBottom = document.createElement('div');
    mapClueBottom.className = 'map-clue-bottom';
    mapClueBottom.textContent = 'Выйти из режима просмотра карты';
    document.body.appendChild(mapClueBottom);
  }

  for (const mapWrap of mapsWraps) {
    if (!mapWrap) continue;

    const mapClue = document.createElement('div');
    const mapFrame = mapWrap.querySelector('iframe') ?? mapWrap.querySelector('[data-map-frame]');
    const mapOut = document.createElement('div');

    if (!mapFrame) continue; // Пропускаем, если нет карты

    mapWrap.style.position = 'relative';
    mapFrame.style.pointerEvents = 'none';

    mapOut.className = 'map-out';
    mapWrap.appendChild(mapOut);

    mapClue.className = 'map-clue';
    mapClue.textContent = 'Для управления картой - нажмите на неё';
    mapOut.appendChild(mapClue);

    if (window.screen.availWidth <= 1200) {
      mapClue.style.cssText = `display:flex;bottom:20px;left:20px;right:20px;`;
    }

    // Функция для АКТИВАЦИИ карты
    const activateMap = () => {
      mapFrame.style.pointerEvents = 'auto';
      if (mapClue) {
        mapClue.classList.toggle('show');
      }
      mapClueBottom.classList.toggle('show');
      mapOut.classList.toggle('hide');
      // НОВОЕ: Сообщаем скрипту курсора, что карта стала активной
      document.dispatchEvent(new CustomEvent('map:activated'));
    };

    // Функция для ДЕАКТИВАЦИИ карты
    const deactivateMap = () => {
      mapClue.classList.remove('show');
      mapFrame.style.pointerEvents = 'none';
      mapOut.classList.remove('hide');
      mapClueBottom.classList.remove('show');
      // НОВОЕ: Сообщаем скрипту курсора, что карта снова неактивна
      document.dispatchEvent(new CustomEvent('map:deactivated'));
    };

    // --- Обработчики событий ---
    mapOut.addEventListener('click', activateMap);

    mapOut.addEventListener('mousemove', (event) => {
      if (window.screen.width > 1200) {
        mapClue.classList.add('show');
        if (event.offsetY > 10) mapClue.style.top = event.offsetY + 20 + 'px';
        if (event.offsetX > 10) mapClue.style.left = event.offsetX + 20 + 'px';
      }
    });

    mapWrap.addEventListener('mouseleave', deactivateMap);
    mapWrap.addEventListener('touchend', deactivateMap);
  }

  // Добавляем обработчик на нижнюю кнопку один раз
  mapClueBottom.addEventListener('click', () => {
    // Просто находим активную карту и деактивируем ее
    const activeMap = document.querySelector('.map-out.hide');
    if (activeMap) {
      // Нам не нужно вызывать deactivateMap напрямую, достаточно сгенерировать событие,
      // чтобы и карта, и курсор на него среагировали.
      // Но для простоты и надежности, мы можем имитировать событие выхода мыши
      const mapWrap = activeMap.closest('[data-map]');
      if (mapWrap) {
        mapWrap.dispatchEvent(new Event('mouseleave'));
      }
    }
  });
}
