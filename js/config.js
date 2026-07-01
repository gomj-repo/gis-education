/**
 * 앱 전역 설정. 값은 빌드 시 dotenv-webpack이 .env에서 process.env.* 로 주입한다.
 *
 * 좌표계: 데이터·MapPrime·배경 모두 EPSG:4326으로 통일한다.
 * (읍면동/노선/역 원본이 4326이고, MapPrime도 4326으로 서비스한다고 전제)
 */

// --- 인증/접속 정보 (.env) ---
export const VWORLD_KEY = process.env.VWORLD_ACCESS_KEY;
export const MAPPRIME_BASE_URL = process.env.MAPPRIME_BASE_URL || '';
export const MAPPRIME_WORKSPACE = process.env.MAPPRIME_WORKSPACE || '';

// --- 좌표계 ---
export const VIEW_PROJECTION = 'EPSG:4326';

/**
 * EPSG:4326(WGS84) 표준 타일 격자.
 * level 0 = 경도 360°를 2개 타일(각 180°/256px)로 → 최상위 해상도 0.703125 도/픽셀.
 * VWorld 배경 WMTS와 MapPrime WMTS(GWC)가 같은 격자를 쓰도록 공유한다.
 */
export const WGS84_ORIGIN = [-180, 90];
export const WGS84_RESOLUTIONS = Array.from({ length: 20 }, (_, z) => 0.703125 / 2 ** z);

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

// --- OGC 엔드포인트 (base URL 하위 경로 가정, 서버 구성에 맞게 조정) ---
export const wmsUrl = () => `${MAPPRIME_BASE_URL}/wms`;
export const wfsUrl = () => `${MAPPRIME_BASE_URL}/wfs`;
export const wmtsUrl = () => `${MAPPRIME_BASE_URL}/gwc/service/wmts`;
