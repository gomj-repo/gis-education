/**
 * 앱 전역 설정. 값은 빌드 시 dotenv-webpack이 .env에서 process.env.* 로 주입한다.
 *
 * 좌표계: 데이터·MapPrime·배경 모두 EPSG:4326으로 통일한다.
 * (읍면동/노선/역 원본이 4326이고, MapPrime도 4326으로 서비스한다고 전제)
 */

// --- 인증/접속 정보 (.env) ---
export const VWORLD_KEY = process.env.VWORLD_ACCESS_KEY;
export const MAPPRIME_BASE_URL = process.env.MAPPRIME_BASE_URL || '';
// MapPrime OGC 네임스페이스 접두어. 발행 레이어가 `mapprime:...` 형태라 기본값 mapprime.
export const MAPPRIME_WORKSPACE = process.env.MAPPRIME_WORKSPACE || 'mapprime';

// --- 좌표계 ---
// 지도 뷰·배경은 웹 메르카토르(3857). VWorld 타일이 3857 격자로만 제공되기 때문이다.
export const VIEW_PROJECTION = 'EPSG:3857';
// 원본 데이터·MapPrime 서비스 좌표계. 로드 시 뷰(3857)로 재투영한다.
export const DATA_PROJECTION = 'EPSG:4326';
// MapPrime WMTS TileMatrixSet. admin 레이어는 GoogleCRS84Quad(EPSG:4326)만 지원한다.
// (GetCapabilities 확인: TileMatrix 식별자 `GoogleCRS84Quad_{level}`, 포맷은 jpeg만 시드됨.)
export const WMTS_MATRIX_SET = 'GoogleCRS84Quad';
export const WMTS_FORMAT = 'image/jpeg';
// MapPrime WFS는 2.0.0 미지원 → 1.1.0 사용(확인: 2.0.0 요청 시 OperationNotSupported).
export const WFS_VERSION = '1.1.0';

// --- 레이어명 (gpkg 테이블명과 동일) ---
export const LAYERS = {
  admin: 'seoul_admin_boundary', // 읍면동 (polygon)
  lines: 'seoul_subway_lines', // 지하철 노선 (linestring)
  stations: 'seoul_subway_stations', // 지하철 역 (point)
};

// --- 스타일명 (MapPrime에 발행된 SLD 이름) ---
export const STYLES = {
  admin: 'red_polygon',
  lines: 'blue_polyline',
  stations: 'green_point',
};

/** 워크스페이스가 있으면 `workspace:layer` 형태로 한정한다. */
export const qualified = (name) =>
  MAPPRIME_WORKSPACE ? `${MAPPRIME_WORKSPACE}:${name}` : name;

// --- OGC(OWS) 엔드포인트 — MapPrime은 /map 하위에 WMS/WFS/WMTS를 발행한다 (CLAUDE.md # ows Service). ---
export const wmsUrl = () => `${MAPPRIME_BASE_URL}/map/wms`;
export const wfsUrl = () => `${MAPPRIME_BASE_URL}/map/wfs`;
export const wmtsUrl = () => `${MAPPRIME_BASE_URL}/map/wmts`;

// --- 레이어 표시 메타데이터 (SidePanel 카드/칩용) ---
// nameProp: 카드 제목으로 쓸 속성명(entities의 name에 대응).
export const LAYER_META = {
  admin: { label: '읍면동 경계', geomType: 'polygon', nameProp: 'NAME' },
  lines: { label: '지하철 노선', geomType: 'linestring', nameProp: 'name' },
  stations: { label: '지하철 역', geomType: 'point', nameProp: '역사명' },
};

/** 선택 레이어의 피처 속성을 조회하는 WFS GetFeature(JSON) URL. */
export const wfsFeaturesUrl = (layerKey, maxFeatures = 300) =>
  `${wfsUrl()}?service=WFS&version=${WFS_VERSION}&request=GetFeature` +
  `&typeName=${encodeURIComponent(qualified(LAYERS[layerKey]))}` +
  `&outputFormat=application/json&maxFeatures=${maxFeatures}&srsName=${DATA_PROJECTION}`;
