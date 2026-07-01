# GIS 교육 · OpenLayers × MapPrime 뷰어

VWorld 배경지도 위에, MapPrime이 발행하는 3개 레이어를 **각기 다른 OGC 서비스**로 표출하는
OpenLayers 실습 뷰어. (교육과정 3과정 과제3 — "OpenLayers에서 OGC Service 사용: Feature 조회 / Style 변경")

## 레이어 구성

| 레이어 | 지오메트리 | OGC 서비스 | 기본 표현 | 스타일 변경 시 |
|---|---|---|---|---|
| 읍면동 경계 (`seoul_admin_boundary`) | Polygon | **WMTS** (타일) | 서버 기본 | `red_polygon` |
| 지하철 노선 (`seoul_subway_lines`) | LineString | **WFS** (벡터) | 피처 `colour` 속성별 | `blue_polyline` |
| 지하철 역 (`seoul_subway_stations`) | Point | **WMS** (이미지) | 서버 기본 | `green_point` |

- **클릭 → 속성 팝업**: WFS(노선)는 로드된 피처에서 직접, WMS(역)·WMTS(읍면동)은 `GetFeatureInfo`로 조회.
- **스타일 토글**: 기본은 스타일 미요청. 토글 ON일 때만 빨강/파랑/초록 스타일을 각 서비스에 요청.
- **좌표계**: 데이터·MapPrime·배경 모두 **EPSG:4326**으로 통일(재투영 없음).

## 실행

```bash
npm install
cp .env.example .env      # 아래 값 채우기
npm run start            # webpack-dev-server, 브라우저 자동 오픈
npm run build            # dist 프로덕션 번들
```

`.env` 필수 값:

```
VWORLD_ACCESS_KEY=...        # https://www.vworld.kr 발급
MAPPRIME_BASE_URL=...        # 예: http://host:8080/geoserver
MAPPRIME_WORKSPACE=          # (선택) 레이어 워크스페이스
```

> `.env`는 `.gitignore`에 포함되어 커밋되지 않는다. 키는 절대 소스에 하드코딩하지 않는다.

## 코드 구조

```
js/
  config.js            # .env 주입 값, 좌표계·격자·레이어명·스타일명·엔드포인트
  map.js               # OL Map/View(4326) + VWorld 배경(WMTS)
  popup.js             # 클릭 속성 팝업(Overlay)
  layers/
    wmtsPolygon.js     # 읍면동 (WMTS) + GetFeatureInfo
    wfsLine.js         # 노선 (WFS) + colour 속성 스타일
    wmsPoint.js        # 역 (WMS) + GetFeatureInfo
  app.js               # 조립: 레이어·팝업·토글 배선
  entities.js          # 도메인 모델(참고용 클래스 정의)
```

각 레이어 모듈은 `{ layer, setStyled(on), infoAt(map, evt) }`를 노출하고, `app.js`가 이를 조립한다.

## 확인 시 참고

- **CORS**: WFS와 GetFeatureInfo는 `fetch`로 데이터를 받으므로 MapPrime에 CORS 허용이 필요하다.
  (WMS/WMTS 이미지 타일은 `<img>`라 CORS 불필요.) 차단되면 dev-server `proxy`로 우회한다.
- **WMTS 격자/스타일**: `EPSG:4326` TileMatrixSet(격자 식별자 `EPSG:4326:{level}`)과
  `red_polygon` 스타일이 MapPrime(GWC)에 발행돼 있어야 한다. 서버 설정이 다르면
  `js/config.js`의 격자·엔드포인트, `js/layers/wmtsPolygon.js`의 `matrixIds`를 조정한다.
- **VWorld 4326 타일**: 배경이 어긋나면 VWorld의 4326 타일 격자/레이어명(`Base`)을 확인한다.
