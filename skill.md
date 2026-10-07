---
name: wellhouse-site
description: 빈티지 중고거래 사이트 "wellhouse" 프로젝트(현민서프로젝트)의 구조, 디자인 규칙, 지금까지의 작업 기록과 사용자 선호를 정리한 문서. 이 프로젝트의 HTML/CSS/JS를 수정하거나 기능을 추가할 때 먼저 읽는다.
---

# wellhouse 빈티지 사이트

검수를 거친 빈티지 상품(패션·전자기기·CD·소품)을 사고파는 쇼핑몰 정적 사이트입니다.
빌드 도구 없이 HTML + CSS + 순수 JavaScript로 만들며, 브라우저에서 `index.html`을 바로 열어 확인합니다.

---

## 1. 작업 규칙 (사용자와 합의한 내용)

### 소통
- 답변과 화면 문구는 모두 **한국어**로 쓴다.
- 사용자는 참고 사이트 **스크린샷을 첨부해 "이걸 참고해서 바꿔줘"** 식으로 요청하는 경우가 많다. 레이아웃·구조만 참고하고, 참고 사이트의 **실제 정보(전화번호, 계좌, 이름, 주소 등)는 절대 그대로 옮기지 않는다**. 자리표시자(placeholder)로 채우고 바꿔야 할 항목을 표로 알려준다.
- 수정 후에는 무엇을 바꿨는지, 어느 파일을 고쳤는지 링크로 정리해서 알려준다.

### 디자인 선호
- **간결하고 깔끔하게.** 불필요한 장식 화살표(↗ ↘ 등)는 빼는 쪽을 선호한다. (히어로 버튼 화살표 제거함)
- 카테고리 옆 **숫자(상품 개수) 표시는 넣지 않는다.**
- 사용자가 **한눈에 읽을 수 있게** 정리한다. 긴 설명은 짧은 요약 + 마우스를 올리면(hover) 자세한 설명이 뜨는 방식을 선호한다.
- 구매 욕구를 끄는 요소(상품명, 할인율, 섹션 제목)는 **크고 굵게** 강조한다.
- hover로 여는 요소는 **클릭해도 고정되면 안 된다.** 마우스가 벗어나면 원래대로 돌아와야 한다. (`:focus`로 열지 말고 `:hover` + `:focus-visible`, 터치 기기는 JS로 탭 토글)

### 개발
- 새 기능은 기존 파일 구조와 이름 규칙(아래 3번)을 따른다.
- 같은 페이지 안 이동은 새로고침 없이 처리한다. (카테고리 전환은 `history.pushState`)
- 이미지 URL을 새로 넣을 때는 **실제로 열리는지 확인**한다. (`curl -s -o /dev/null -w "%{http_code}"` → 200인지)
- 사진이 없거나 마땅치 않은 상품은 `js/product-art.js`의 SVG 일러스트를 쓴다.
- 작업 후 **헤드리스 크롬으로 스크린샷을 찍어 확인**한다. (6번 참고)
- 이 폴더는 git 저장소다. 사용자가 요청하기 전에는 커밋하지 않는다.

---

## 2. 디자인 토큰

`css/style.css`의 `:root` 변수를 사용한다.

| 변수 | 값 | 용도 |
|---|---|---|
| `--paper` | `#faf8f4` | 기본 배경 |
| `--ink` | `#30251e` | 기본 글자 |
| `--muted` | `#786c61` | 보조 글자 |
| `--olive` | `#76513b` | 브라운 포인트, 영문 eyebrow |
| `--lime` | `#e8cb8a` | 골드 포인트 (어두운 배경 위 강조) |
| `--line` | `#ded5ca` | 구분선 |
| `--serif` | Gowun Batang | 섹션 제목 |
| `--sans` | DM Sans | 영문, 기본 |

- 강조 빨강(할인): `#b8402a` / 진한 브라운 버튼: `#493426` / 검수 섹션 배경: `#604633`
- **Pretendard**(jsdelivr CDN)를 상품명, 가격, 버튼, 메뉴에 사용한다.
- 섹션 제목: Gowun Batang 700, 44px (태블릿 38px, 모바일 30px)
- 상품명: Pretendard 700, 19px / 가격: Pretendard 800, 18px / 할인가: 22px 빨강
- 반응형 기준: 900px, 760px, 650px

---

## 3. 파일 구조

```
index.html                홈 (히어로, 투데이 베스트, 할인 상품, 오늘의 발견, 검수과정, 브랜드 스토리)
html/category.html        카테고리 목록 (?category=all|popular|fashion|electronics|cd|props)
html/product.html         상품 상세 (?id=fashion-0 형태)
html/auth.html            로그인/회원가입 (아이디 찾기 → 비밀번호 찾기 순서)
html/support.html         이용 안내와 Q&A

css/style.css             원본 기본 스타일 (압축된 한 줄 형태, 되도록 직접 수정하지 않음)
css/readable-text.css     글자 크기·가독성 덮어쓰기, 상품 카드/할인/섹션 제목 강조
css/header.css            헤더 (유틸 바 + 가운데 로고 + 메뉴 + 드롭다운)
css/footer.css            푸터 (CUSTOMER / BANK ACCOUNT / REFUND & EXCHANGE)
css/inspection.css        홈 검수과정 섹션 (4단계 박스 + 큰 화살표 + 등급 요약)
css/category.css          카테고리 페이지 필터 칩, 정렬, 드롭다운, 배지
css/product.css           상품 상세 페이지 (pd- 접두사)
css/auth.css              로그인 페이지

js/products.js            상품 데이터 CATEGORY_DATA (카테고리·소분류·상품 목록)
js/product-art.js         SVG 일러스트 생성 productArt(), albumArt()
js/catalog.js             공통 상품 목록: id·slug·img·salePrice 계산, findProduct(), won()
js/category.js            카테고리 페이지: 필터·정렬·검색·드롭다운·URL 반영
js/product-details.js     상세 콘텐츠 생성: 등급, 검수 리포트, 상세설명, 후기, Q&A
js/product.js             상세 페이지 렌더링과 상호작용
js/main.js                홈 페이지 동작
js/auth.js                로그인 페이지 동작
```

스크립트 로딩 순서(카테고리/상세 페이지): `product-art.js → products.js → catalog.js → (product-details.js) → category.js / product.js`

---

## 4. 주요 기능과 동작

### 헤더 (index, category, product 공통)
- 위 유틸 바: 왼쪽 `묻고 답하기 · 공지사항`, 오른쪽 `상품 검색 · JOIN US · LOGIN · CART(개수)`
- 가운데 큰 로고 `wellhouse.`
- 메뉴 순서: **전체상품 · 인기상품 · 패션 · 전자기기 · CD · 소품 · 브랜드 스토리 · 검수과정**
- 패션/전자기기/CD/소품에 마우스를 올리면 소분류 드롭다운이 열린다. 클릭 시 `category.html?category=fashion&sub=청바지` 처럼 이동해 해당 소분류가 선택된 상태로 열린다. (모바일은 드롭다운 숨김, 메뉴 가로 스크롤)
- 카테고리 버튼은 `.category-chip[data-category]`로 JS가 찾는다. 클래스명을 바꾸지 말 것.
- 장바구니 개수는 `localStorage['wellhouse-cart-count']`에 저장하고 모든 페이지 헤더에 표시한다.

### 카테고리와 소분류 (`js/products.js`)
| 카테고리 | 소분류 |
|---|---|
| 패션 | 티셔츠, 반바지, 스웨터, 후드티, 후드집업, 청바지, 아우터 |
| 전자기기 | 카메라, 오디오, 컴퓨터·게임, 조명 |
| CD | 장르(클래식, 발라드, 팝, K팝) + 연대(1990년대~2020년대) 두 가지 필터 |
| 소품 | 인테리어 소품, 데스크 소품, 컴퓨터 소품, 냉장고 소품, 수납·정리, 키친·테이블 |

### 카테고리 페이지 (`html/category.html`)
- 소분류 필터 칩, 정렬(추천순 / 가격 높은·낮은 순 / 할인율 높은·낮은 순 / 판매량 높은·낮은 순), 검색.
- **전체상품**: 모든 상품 + 카테고리 칩. 칩에 마우스를 올리면 그 카테고리의 소분류 메뉴가 열린다.
- **인기상품**: 판매량 상위 20개, 카드에 `BEST 01` 배지.
- 정렬은 안정 정렬이라 기준이 같으면 원래 순서(추천·인기 순)를 유지한다.
- URL 파라미터: `category`, `sub` / `genre` / `era`, `q`(검색어)

### 상품 상세 페이지 (`html/product.html?id=...`)
- 상단: 경로(Home › 카테고리 › 소분류), 사진 + 디테일 확대 썸네일, 상품명, 등급 배지, 가격·할인, 판매처·옵션, 배송 방법(택배 3,500원 / 100,000원 이상 무료 / 매장 픽업 무료), 재고, 수량, 총액, 구매하기·장바구니·찜·공유하기
- 탭(스크롤 따라 고정): **상세정보 / 검수 리포트 / 후기 / Q&A**, 맨 아래 "함께 보면 좋은 상품"
- 등급: `condition` → SEALED=S, LIKE NEW=A, VERY GOOD=B, GOOD=C (상품에 `grade` 필드를 넣으면 우선 적용, F 가능)
- 검수 리포트: 4단계 완료 표시, 최종 등급 카드, "이 등급이 나온 이유", 카테고리별 5개 체크리스트(양호/경미/흠집)
- 같은 상품은 항상 같은 내용이 나오도록 slug 기반 시드로 문구를 고른다.

### 홈 화면
- 히어로 `구매하기` → 전체상품 페이지, 버튼에는 화살표 없음
- 베스트 순위 박스 40×40
- 검수과정: 4개 박스(사진 검수 → 실물 입고 → 실물 검수·등급 → 판매 등록) + 큰 화살표, 마우스를 올리면 원래의 자세한 설명이 뜬다. 등급 S·A·B·C·F 요약 박스.
- 홈 상품 카드는 같은 이름의 상품 상세로 연결된다.

---

## 5. 자주 하는 작업 방법

### 상품 추가
1. `js/products.js`의 해당 카테고리 `products` 배열에 객체를 추가한다.
   - 필수: `name, sub(CD는 genre·year·artist), shop, condition, price(정가), discount(%), sales, option`
   - 이미지: `photo: 'Unsplash ID'` 또는 `art: { shape, color, accent }` 또는 CD는 `album: { color, accent, pattern }`
2. 상품 ID(slug)는 `카테고리-배열순서`이므로 **중간에 끼워 넣으면 뒤 상품의 상세 주소가 바뀐다.** 가능하면 배열 끝에 추가한다.
3. 새 소분류라면 `filters.options`, `product-details.js`의 `SUB_COPY`, 그리고 **index.html과 html/category.html·product.html 헤더 드롭다운 링크**도 함께 수정한다.

### SVG 일러스트 shape 목록 (`product-art.js`)
tshirt, shorts, sweater, hoodie, zipup, jeans, jacket, camera, radio, cassette, handheld, keyboard, headphones, lamp, vase, candle, plant, clock, frame, pencup, shelf, bookend, tray, keycap, mousepad, cableclip, magnets, memoboard, box, mug

### 헤더/푸터 수정
헤더와 푸터 마크업이 `index.html`, `html/category.html`, `html/product.html`에 각각 들어 있다. **세 파일 모두 같이 수정**한다. (경로 접두사: 홈은 `html/`, 하위 페이지는 없음 또는 `../`)

---

## 6. 확인 방법

헤드리스 크롬으로 스크린샷을 찍어 확인한다. (Windows, Git Bash 기준)

```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --hide-scrollbars \
  --window-size=1400,2000 --virtual-time-budget=6000 \
  --screenshot="<스크래치 폴더>/shot.png" \
  "file:///C:/Users/SBS/Desktop/현민서프로젝트/html/category.html?category=cd"
```

- 특정 섹션만 보려면 임시 복사본에 `<style>`로 다른 부분을 숨긴 뒤 찍고, 임시 파일은 지운다.
- hover 상태는 임시 스타일로 강제로 열어서 확인한다.
- 헤드리스 크롬은 최소 폭 때문에 420px 모바일 스크린샷 오른쪽이 잘려 보일 수 있다(실제 화면 문제 아님).
- JS 문법 확인: `node --check js/파일.js`
- Python은 설치되어 있지 않다. 파일 일괄 수정은 Node 스크립트를 쓴다.

---

## 7. 남아 있는 확인 사항 (실제 운영 전 교체 필요)

| 항목 | 현재 상태 | 위치 |
|---|---|---|
| 푸터 매장 정보 | 전화 02-000-0000, OO은행 000000-00-000000, 예금주 홍길동, 주소 서울 마포구 와우산로 00, 사업자번호 000-00-00000, @wellhouse.vintage, hello@wellhouse.kr 모두 **자리표시자** | 3개 HTML의 `<footer>` |
| 상품 후기·Q&A | **예시 문구**. 실제 고객 데이터로 교체해야 한다 | `js/product-details.js` |
| 검수 결과·검수자·날짜 | 자동 생성 예시. 실제 검수 결과로 교체 | `js/product-details.js` |
| 상품 가격·할인·판매량·앨범명 | 예시 데이터(앨범·아티스트는 가상) | `js/products.js` |
| 홈 사진 불일치 | "플라워 패턴 빈티지 손수건"은 옷걸이 사진, "빈티지 플라워 베이스"는 소파 사진, "올림푸스 필름 카메라"는 다른 브랜드 카메라 사진 | `index.html` |
| 데이터에 없는 홈 상품 | 손수건, 체크 울 머플러, 레더 크로스백 → 상세 페이지 없이 패션 카테고리로 연결 | `index.html` |
| 빈티지 유리잔 사진 | 원래 사진이 Unsplash에서 삭제(404)되어 록 글라스 사진으로 교체 | `index.html`, `js/products.js` |
| 브랜드 스토리 링크 | `html/about.html`로 연결되지만 파일이 없다 | `index.html` |
| support.html / auth.html | 예전 헤더 그대로, 새 헤더·푸터 미적용 | 해당 파일 |
| Q&A 문의·찜·구매 | 서버가 없어 화면에서만 동작(새로고침하면 사라짐), 구매하기는 로그인 페이지로 이동 | `js/product.js` |

---

## 8. 작업 기록 (요청 순서)

1. 카테고리 버튼 클릭 시 해당 카테고리 판매 페이지로 이동, 카테고리 옆 숫자 삭제
2. 카테고리 안 소분류(패션 7종, CD 장르·연대, 소품 6종) + 6가지 정렬, 부족한 상품 이미지는 SVG로 제작
3. "전체" 클릭 시 홈이 아닌 같은 페이지에서 전체 상품 보기 + 정렬
4. 전체상품의 카테고리 칩에 마우스를 올리면 소분류 선택 메뉴
5. 히어로 "구매하기" → 전체 상품 페이지
6. 베스트 순위 박스 32×32 → 40×40
7. 상품명 폰트를 Pretendard로, 더 크고 굵게
8. 할인 배지·할인율·할인가 크게 강조
9. 히어로 버튼 화살표 제거, 간결하게
10. 검수과정 섹션을 박스 + 큰 화살표로 한눈에 보이게 정리
11. 검수 박스에 마우스를 올리면 원래 상세 설명 표시 → 클릭 시 고정되던 버그 수정(hover 전용)
12. 푸터에 매장 정보 추가 → 참고 사이트처럼 CUSTOMER / BANK ACCOUNT / REFUND & EXCHANGE 3단 구성
13. 헤더를 참고 사이트(iwaya)처럼 유틸 바 + 가운데 로고 + 가운데 메뉴로 변경
14. 메뉴 순서 변경(전체상품 맨 왼쪽), 인기상품 페이지 추가
15. 헤더 메뉴에 마우스를 올리면 소분류 드롭다운
16. 로그인 페이지 "아이디 찾기 · 비밀번호 찾기" 순서로 변경
17. 모든 섹션 제목 크고 굵게
18. 깨진 유리잔 이미지 디버깅(404) 후 교체
19. 상품 상세 페이지 제작: 최종 등급, 등급 이유, 상세설명, 후기, Q&A
