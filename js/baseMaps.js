import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';

import { VWORLD_KEY } from './config';

/**
 * VWorld 베이스맵 종류. (유효 tiletype: Base, Satellite, midnight, white, Hybrid)
 * 위성영상만 jpeg, 나머지는 png.
 */
export const VWORLD_TYPES = {
  Base: { ext: 'png', label: '일반' },
  Satellite: { ext: 'jpeg', label: '위성영상' },
  midnight: { ext: 'png', label: '야간(다크)' },
  white: { ext: 'png', label: '백지도' },
};

const DEFAULT_TYPE = 'Base';

function vworldLayer(type, ext) {
  return new TileLayer({
    source: new XYZ({
      url: `https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_KEY}/${type}/{z}/{y}/{x}.${ext}`,
      attributions: 'VWorld',
      crossOrigin: 'anonymous',
      maxZoom: 19,
    }),
  });
}

/**
 * VWorld 베이스맵 세트를 만든다.
 * - 베이스 4종은 상호 배타(하나만 표시), 하이브리드(주기)는 위성 위 라벨 오버레이.
 * - 배경 전체 on/off, 종류 전환, 하이브리드 on/off를 제어한다.
 */
export function createBaseMaps() {
  const baseLayers = {};
  Object.entries(VWORLD_TYPES).forEach(([type, { ext }]) => {
    const layer = vworldLayer(type, ext);
    layer.setVisible(type === DEFAULT_TYPE);
    baseLayers[type] = layer;
  });

  // 하이브리드(주기): 지명·도로 라벨. 위성영상과 함께 쓰면 유용하다.
  const hybridLayer = vworldLayer('Hybrid', 'png');
  hybridLayer.setVisible(false);

  let visible = true;
  let active = DEFAULT_TYPE;
  let hybridOn = false;

  const apply = () => {
    Object.entries(baseLayers).forEach(([type, layer]) => {
      layer.setVisible(visible && type === active);
    });
    hybridLayer.setVisible(visible && hybridOn);
  };

  return {
    TYPES: VWORLD_TYPES,
    // 지도에 추가할 순서: 베이스 4종 → 하이브리드(맨 위). 모두 데이터 레이어보다 아래.
    orderedLayers: [...Object.values(baseLayers), hybridLayer],
    /** 배경지도 종류 전환 (예: 'Satellite') */
    setActive(type) {
      if (baseLayers[type]) active = type;
      apply();
    },
    /** 배경지도 전체 표시/숨김 */
    setVisible(on) {
      visible = on;
      apply();
    },
    /** 하이브리드(주기) 오버레이 on/off */
    setHybrid(on) {
      hybridOn = on;
      apply();
    },
  };
}
