import Overlay from 'ol/Overlay';

/**
 * 클릭 속성조회 팝업(OL Overlay)을 만든다.
 * index.html의 #popup / #popup-content / #popup-closer 요소를 사용한다.
 * @param {import('ol/Map').default} map
 */
export function createPopup(map) {
  const element = document.getElementById('popup');
  const content = document.getElementById('popup-content');
  const closer = document.getElementById('popup-closer');

  const overlay = new Overlay({
    element,
    autoPan: { animation: { duration: 200 } },
  });
  map.addOverlay(overlay);

  closer.addEventListener('click', (e) => {
    e.preventDefault();
    overlay.setPosition(undefined);
    closer.blur();
  });

  const escapeHtml = (v) =>
    String(v ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  return {
    /**
     * @param {import('ol/coordinate').Coordinate} coordinate
     * @param {Array<{title:string, props:Object}>} results 레이어별 속성 묶음
     */
    show(coordinate, results) {
      content.innerHTML = results
        .map((r) => {
          const rows = Object.entries(r.props)
            .map(([k, v]) => `<tr><th>${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`)
            .join('');
          return `<div class="popup-item"><h4>${escapeHtml(r.title)}</h4><table>${rows}</table></div>`;
        })
        .join('');
      overlay.setPosition(coordinate);
    },
    hide() {
      overlay.setPosition(undefined);
    },
  };
}
