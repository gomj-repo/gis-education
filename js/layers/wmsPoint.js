import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';

import { wmsUrl, qualified, LAYERS, STYLES, VIEW_PROJECTION } from '../config';

/**
 * 지하철 역 레이어 (WMS, point).
 * WMS를 쓰는 이유: 서버가 스타일까지 입혀 완성된 지도 이미지를 준다.
 * 기본은 STYLES 미지정(서버 기본 스타일), 토글 시 green_point 스타일을 요청한다.
 */
export function createStationsLayer() {
  const source = new ImageWMS({
    url: wmsUrl(),
    params: { LAYERS: qualified(LAYERS.stations), STYLES: '' },
    projection: VIEW_PROJECTION,
    ratio: 1,
    crossOrigin: 'anonymous',
  });
  const layer = new ImageLayer({ source });

  return {
    layer,
    setStyled(on) {
      source.updateParams({ STYLES: on ? STYLES.stations : '' });
    },
    /** WMS는 이미지라 좌표의 속성을 GetFeatureInfo로 되묻는다. */
    infoAt(map, evt) {
      const view = map.getView();
      const url = source.getFeatureInfoUrl(evt.coordinate, view.getResolution(), VIEW_PROJECTION, {
        INFO_FORMAT: 'application/json',
        FEATURE_COUNT: 5,
      });
      if (!url) return Promise.resolve(null);
      return fetch(url)
        .then((r) => (r.ok ? r.json() : null))
        .then((json) => {
          const feature = json && json.features && json.features[0];
          if (!feature) return null;
          const props = { ...feature.properties };
          return { title: `역 · ${props['역사명'] || ''}`, props };
        })
        .catch(() => null);
    },
  };
}
