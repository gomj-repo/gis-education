import 'ol/ol.css';
import { createMap } from './map';

// VWorld 배경지도 위에 MapPrime OGC 레이어를 올리는 실습 뷰어의 진입점.
const map = createMap('map');

// 이후 커밋에서 WFS/WMS/WMTS 레이어와 클릭 팝업, 스타일 토글을 연결한다.
export default map;
