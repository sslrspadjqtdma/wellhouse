// 상품 상세 페이지 콘텐츠(등급·검수 리포트·상세설명·후기·Q&A)를 상품 정보로부터 만든다.
// 같은 상품은 항상 같은 내용이 나오도록 상품 slug로 만든 시드를 사용한다.
// ※ 후기와 Q&A는 화면 구성을 위한 예시 문구입니다. 실제 운영 시 실제 고객 데이터로 교체하세요.

const GRADES = {
  S: { name: '미개봉', summary: '포장을 뜯지 않은 새 상품' },
  A: { name: '새 상품급', summary: '개봉만 한 새것 상태' },
  B: { name: '사용감 조금', summary: '가벼운 사용 흔적이 있는 상태' },
  C: { name: '흠집 있음', summary: '기스·까짐 등 눈에 띄는 흠집이 있는 상태' },
  F: { name: '사용감 많음', summary: '박스가 없고 사용 흔적이 뚜렷한 상태' },
};
const GRADE_ORDER = ['S', 'A', 'B', 'C', 'F'];
const CONDITION_TO_GRADE = { SEALED: 'S', 'LIKE NEW': 'A', 'VERY GOOD': 'B', GOOD: 'C' };

function seedOf(text) {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

// 시드로 섞은 뒤 앞에서 count개를 고른다.
function pickMany(list, seed, count) {
  const copy = [...list];
  let s = seed || 1;
  for (let i = copy.length - 1; i > 0; i -= 1) {
    s = (s * 1103515245 + 12345) >>> 0;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

// 검수 체크리스트: always가 true인 항목은 판매 가능한 상품이라면 항상 양호하다.
const CHECKLISTS = {
  fashion: [
    { label: '오염·얼룩', ok: '오염 없음', minor: '안쪽 라벨 주변에 옅은 변색', issue: '앞판에 지워지지 않는 작은 얼룩(약 1cm)' },
    { label: '보풀·마모', ok: '보풀 없음', minor: '소매 끝과 옆구리에 가벼운 보풀', issue: '팔꿈치와 밑단에 눈에 띄는 마모' },
    { label: '구멍·뜯김', ok: '구멍·뜯김 없음', minor: '봉제선 실밥 한 군데 풀림(수선 가능)', issue: '밑단 박음질 약 2cm 뜯김' },
    { label: '부자재', ok: '지퍼·단추 정상 작동', minor: '단추 하나의 색이 살짝 다름', issue: '지퍼 손잡이 도금 벗겨짐' },
    { label: '세탁·냄새', ok: '전문 세탁 완료, 냄새 없음', always: true },
  ],
  electronics: [
    { label: '외관', ok: '눈에 띄는 흠집 없음', minor: '모서리에 생활 기스', issue: '상판에 찍힘 자국(약 3mm)' },
    { label: '작동 테스트', ok: '전원과 주요 기능 정상 작동', always: true },
    { label: '버튼·다이얼', ok: '모든 버튼 정상 반응', minor: '다이얼 회전이 약간 뻑뻑함', issue: '보조 버튼 하나의 눌림이 약함' },
    { label: '단자·배터리부', ok: '부식 없음, 접점 깨끗함', minor: '배터리 덮개 걸쇠가 헐거움', issue: '배터리 덮개 모서리 일부 깨짐' },
    { label: '구성품', ok: '본체와 기본 구성품 포함', minor: '원래 박스 없음', issue: '정품 케이블 없음(호환 케이블 동봉)' },
  ],
  cd: [
    { label: '디스크 기록면', ok: '스크래치 없음', minor: '빛에 비추면 보이는 미세한 헤어라인', issue: '가는 스크래치 2~3줄(재생 영향 없음)' },
    { label: '재생 테스트', ok: '전 트랙 끊김 없이 재생', always: true },
    { label: '케이스', ok: '깨짐 없음', minor: '케이스 모서리에 미세한 크랙', issue: '케이스 힌지 한쪽 파손(새 케이스로 교체 가능)' },
    { label: '부클릿·속지', ok: '구김·변색 없음', minor: '부클릿 가장자리가 살짝 누렇게 바램', issue: '부클릿에 접힘 자국' },
    { label: '구성·특전', ok: '구성품 모두 포함', minor: '띠지 없음', issue: '포토카드 미포함' },
  ],
  props: [
    { label: '표면', ok: '흠집 없음', minor: '바닥면에 생활 기스', issue: '측면에 긁힘 자국' },
    { label: '변색·얼룩', ok: '변색 없음', minor: '세월에 따른 자연스러운 색 바램', issue: '한쪽 면에 얼룩 자국' },
    { label: '파손·이 빠짐', ok: '깨짐·이 빠짐 없음', minor: '모서리에 아주 작은 칩', issue: '테두리 이 빠짐(약 2mm)' },
    { label: '고정·흔들림', ok: '흔들림 없이 견고함', minor: '결합부에 미세한 유격', issue: '다리 한쪽 고정이 약해 보강함' },
    { label: '세척·소독', ok: '세척·소독 완료', always: true },
  ],
};

const STATUS_LABEL = { ok: '양호', minor: '경미', issue: '흠집' };

function buildInspection(product) {
  const grade = product.grade || CONDITION_TO_GRADE[product.condition] || 'B';
  const seed = seedOf(product.slug);
  const checklist = CHECKLISTS[product.categoryKey];
  const adjustable = checklist.map((item, index) => index).filter((index) => !checklist[index].always);
  const [first, second] = pickMany(adjustable, seed, 2);

  const statuses = checklist.map(() => 'ok');
  if (grade === 'B') statuses[first] = 'minor';
  if (grade === 'C') { statuses[first] = 'issue'; statuses[second] = 'minor'; }
  if (grade === 'F') { statuses[first] = 'issue'; statuses[second] = 'issue'; adjustable.forEach((index) => { if (statuses[index] === 'ok') statuses[index] = 'minor'; }); }

  const items = checklist.map((item, index) => ({ label: item.label, status: statuses[index], text: item[statuses[index]] }));
  const findings = items.filter((item) => item.status !== 'ok').map((item) => item.text);
  const gradeName = `${grade}등급(${GRADES[grade].name})`;

  const reasons = {
    S: `제조사 포장이 뜯기지 않은 미개봉 상태를 직접 확인했어요. 포장 겉면까지 깨끗해 ${gradeName}으로 판정했어요.`,
    A: `개봉 이력은 있지만 사용 흔적을 찾을 수 없을 만큼 깨끗해요. 모든 검수 항목이 양호해 ${gradeName}으로 판정했어요.`,
    B: `전체적으로 깨끗하지만 ‘${findings.join(', ')}’ 부분이 확인되어 ${gradeName}으로 판정했어요. 사용에는 전혀 문제가 없는 수준이에요.`,
    C: `‘${findings.join(', ')}’ 부분이 확인되어 ${gradeName}으로 판정했어요. 흠집 위치는 사진과 리포트로 미리 안내해 드리며, 기능과 사용에는 문제가 없어요.`,
    F: `‘${findings.join(', ')}’ 등 사용 흔적이 뚜렷해 ${gradeName}으로 판정했어요. 빈티지 특유의 손때를 좋아하시는 분께 추천해요.`,
  };

  const day = 1 + (seed % 26);
  return {
    grade,
    items,
    reason: reasons[grade],
    inspector: `검수 담당 ${'KLPJMH'[seed % 6]}`,
    date: `2026.09.${String(day).padStart(2, '0')}`,
  };
}

// 소분류(CD는 장르)별 상세 설명 재료
const SUB_COPY = {
  티셔츠: { material: '코튼 100%', origin: 'USA', story: '여러 번의 세탁으로 부드럽게 길든 코튼이라 한 장으로도, 셔츠 안에 레이어드해도 자연스러워요.' },
  반바지: { material: '코튼 데님 / 트윌', origin: 'USA', story: '허리선이 편안하고 기장이 무릎 위로 떨어져 여름 내내 손이 가는 반바지예요.' },
  스웨터: { material: '울 혼방', origin: 'Ireland', story: '도톰한 짜임이 살아 있어 한겨울에도 따뜻하고, 셔츠 칼라를 꺼내 입으면 클래식한 느낌이 나요.' },
  후드티: { material: '코튼·폴리 혼방 기모', origin: 'USA', story: '두툼한 기모 안감에 넉넉한 후드가 달려 있어 간절기부터 겨울까지 편하게 입기 좋아요.' },
  후드집업: { material: '헤비 코튼', origin: 'USA', story: '지퍼를 열면 아우터처럼, 잠그면 상의처럼 입을 수 있는 활용도 높은 집업이에요.' },
  청바지: { material: '코튼 데님 100%', origin: 'USA', story: '오랜 시간 입으며 생긴 자연스러운 워싱과 페이드가 매력적인 데님이에요.' },
  아우터: { material: '가죽 / 울 / 코듀로이', origin: 'Italy', story: '시간이 지날수록 멋이 깊어지는 소재로, 어떤 코디에도 무게감을 더해주는 아우터예요.' },
  카메라: { material: '금속 바디', origin: 'Japan', story: '필름만 넣으면 바로 촬영할 수 있도록 셔터, 조리개, 노출계를 모두 점검했어요.' },
  오디오: { material: '플라스틱 / 우드 패널', origin: 'Japan', story: '따뜻한 아날로그 소리를 그대로 들려주는 오디오로, 인테리어 오브제로도 멋스러워요.' },
  '컴퓨터·게임': { material: '플라스틱', origin: 'Japan / USA', story: '추억의 디자인 그대로, 실제로 쓸 수 있도록 키와 버튼 하나하나를 점검했어요.' },
  조명: { material: '유리 / 패브릭 / 금속', origin: 'Denmark', story: '은은한 빛이 공간을 감싸는 조명이에요. 전구는 새 LED 전구로 교체해 보내드려요.' },
  클래식: { material: '폴리카보네이트 디스크', origin: '수입 / 국내반', story: '깊이 있는 연주를 오롯이 담은 음반으로, 조용한 밤 처음부터 끝까지 듣기 좋아요.' },
  발라드: { material: '폴리카보네이트 디스크', origin: '국내반', story: '한 시대를 함께한 목소리와 노랫말이 담긴 앨범이에요. 가사집과 함께 천천히 들어보세요.' },
  팝: { material: '폴리카보네이트 디스크', origin: '수입반', story: '수입반 특유의 커버 아트와 함께, 지금 들어도 세련된 사운드가 담긴 앨범이에요.' },
  K팝: { material: '폴리카보네이트 디스크', origin: '국내반', story: '그 시절 무대를 떠올리게 하는 타이틀곡과 수록곡이 가득한 앨범이에요.' },
  '인테리어 소품': { material: '세라믹 / 우드 / 유리', origin: 'France', story: '공간 한쪽에 두기만 해도 분위기가 달라지는, 시간이 만든 색감의 오브제예요.' },
  '데스크 소품': { material: '우드 / 스틸', origin: 'Germany', story: '책상 위를 정돈해 주면서 작업 공간에 빈티지한 온기를 더해줘요.' },
  '컴퓨터 소품': { material: '레진 / 코르크 / 실리콘', origin: 'Korea', story: '매일 쓰는 컴퓨터 주변을 미니멀하고 따뜻한 분위기로 바꿔주는 소품이에요.' },
  '냉장고 소품': { material: '자석 / 코르크', origin: 'Japan', story: '냉장고나 철제 보드에 붙여 메모와 사진을 귀엽게 정리할 수 있어요.' },
  '수납·정리': { material: '틴 / 패브릭', origin: 'UK', story: '자잘한 물건을 깔끔하게 담아 두면서 그 자체로 장식이 되는 수납함이에요.' },
  '키친·테이블': { material: '세라믹 / 유리 / 에나멜', origin: 'Japan', story: '식탁 위에 빈티지한 포인트를 더해주는 테이블웨어로, 바로 쓸 수 있게 세척·소독을 마쳤어요.' },
};

const CARE_POINTS = {
  fashion: ['빈티지 특성상 사진과 실제 색감이 조금 다를 수 있어요.', '실측 사이즈는 단면 기준이며 재는 방법에 따라 1~2cm 차이가 날 수 있어요.', '전문 세탁과 스팀 살균을 마친 뒤 발송해요.'],
  electronics: ['출고 전 전원과 주요 기능 작동 테스트를 한 번 더 진행해요.', '수령 후 7일 이내 초기 불량은 무상 수리 또는 환불해 드려요.', '오래된 기기 특성상 배터리 등 소모품은 포함되지 않을 수 있어요.'],
  cd: ['전 트랙 재생 테스트를 마친 디스크예요.', '케이스를 깨끗이 닦아 새 비닐에 담아 보내드려요.', '중고 음반 특성상 부클릿에 세월의 흔적이 있을 수 있어요.'],
  props: ['오래된 제품 특성상 크기와 색에 개체 차이가 있어요.', '세척·소독을 마친 뒤 완충재로 꼼꼼히 포장해 보내드려요.', '사용 흔적은 검수 리포트에 빠짐없이 적어두었어요.'],
};

const TOP_SIZES = { S: [66, 44, 50, 59], M: [69, 46, 53, 61], L: [72, 48, 56, 62], XL: [75, 51, 60, 64], FREE: [70, 52, 58, 58] };

function buildSizeTable(product) {
  if (product.categoryKey !== 'fashion') return null;
  if (['반바지', '청바지'].includes(product.sub)) {
    const waist = Number(product.option) || 30;
    return {
      headers: ['허리단면', '밑위', '허벅지단면', '총장'],
      values: [Math.round((waist * 2.54) / 2), 28 + (waist % 3), 29 + (waist % 4), product.sub === '반바지' ? 48 : 104],
    };
  }
  return { headers: ['총장', '어깨너비', '가슴단면', '소매길이'], values: TOP_SIZES[product.option] || TOP_SIZES.M };
}

// 받침 유무에 따라 '이에요/예요'를 붙인다(한글이 아니면 '예요').
function withEyo(word) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  const hasFinal = code >= 0 && code <= 11171 && code % 28 !== 0;
  return `${word}${hasFinal ? '이에요' : '예요'}.`;
}

function buildDetail(product) {
  const seed = seedOf(product.slug);
  const copy = SUB_COPY[product.sub || product.genre];
  const era = product.year ? `${product.year}년` : (/90s/.test(product.name) ? '1990년대' : ['1980년대', '1990년대', '2000년대'][seed % 3]);
  const intro = product.album
    ? `${product.year}년에 발매된 ${product.artist}의 앨범, 「${product.name}」.`
    : `${era}에 만들어져 ${product.shop} 셀러를 거쳐 wellhouse에 들어온 ${withEyo(product.name)}`;

  const specs = [
    ['카테고리', `${product.categoryName} · ${product.sub || product.genre}`],
    product.album ? ['아티스트', product.artist] : ['판매처', product.shop],
    [product.album ? '발매 연도' : '제작 연대', era],
    ['소재', copy.material],
    ['원산지', copy.origin],
    [product.categoryKey === 'fashion' ? '사이즈' : '옵션', product.option],
  ];

  return { intro, story: copy.story, points: CARE_POINTS[product.categoryKey], specs, sizeTable: buildSizeTable(product) };
}

// 예시 후기 문구(카테고리별)
const REVIEW_POOL = {
  fashion: [
    [5, '사진보다 실물 색감이 훨씬 예뻐요. 검수 리포트에 적힌 보풀 위치까지 그대로라 믿음이 갔어요.'],
    [5, '빈티지인데 세탁이 깔끔하게 되어 와서 바로 입었어요. 사이즈도 실측표랑 거의 같아요.'],
    [4, '핏은 마음에 드는데 생각보다 살짝 커요. 실측 꼭 확인하세요!'],
    [5, '포장이 정성스러워서 선물 받는 기분이었어요. 다음에도 여기서 살게요.'],
    [4, '등급 설명이 솔직해서 좋았어요. 적혀 있는 부분 말고는 정말 깨끗해요.'],
  ],
  electronics: [
    [5, '작동 영상까지 보내주셔서 안심하고 샀어요. 받자마자 잘 작동해요.'],
    [5, '외관 기스가 리포트에 적힌 정도라 딱 예상한 상태였어요.'],
    [4, '배송이 조금 걸렸지만 상태는 아주 좋아요.'],
    [5, '빈티지 감성은 그대로인데 기능은 멀쩡해서 매일 쓰고 있어요.'],
    [4, '구성품 설명이 정확했어요. 배터리는 따로 준비하세요!'],
  ],
  cd: [
    [5, '디스크 상태가 거의 새것 같아요. 부클릿도 깨끗해요.'],
    [5, '오래 찾던 앨범인데 상태 좋은 걸로 구해서 너무 기뻐요.'],
    [4, '케이스에 미세한 자국은 있지만 설명대로라 만족해요.'],
    [5, '재생 테스트까지 해주셔서 믿고 샀어요. 포장도 꼼꼼했어요.'],
    [4, '튀는 곳 없이 잘 재생돼요. 띠지가 없는 건 조금 아쉬워요.'],
  ],
  props: [
    [5, '방에 두니 분위기가 확 살아요. 사진보다 실물이 더 예뻐요.'],
    [5, '세척까지 해서 보내주셔서 바로 사용했어요.'],
    [4, '생각보다 크기가 조금 작지만 귀여워서 만족해요.'],
    [5, '완충재로 꼼꼼히 포장해 주셔서 깨짐 없이 잘 받았어요.'],
    [4, '자연스러운 사용감이 오히려 빈티지 느낌이라 좋아요.'],
  ],
};
const REVIEWER_NAMES = ['minj**', 'seo***', 'vint**', 'haru**', 'jiwo**', 'oldl***', 'yuna**', 'dami**'];

function buildReviews(product) {
  const seed = seedOf(product.slug);
  const count = 3 + (seed % 2);
  return pickMany(REVIEW_POOL[product.categoryKey], seed, count).map(([rating, text], index) => ({
    rating,
    text,
    name: REVIEWER_NAMES[(seed + index * 3) % REVIEWER_NAMES.length],
    date: `2026.${String(8 + ((seed + index) % 2)).padStart(2, '0')}.${String(3 + ((seed >> index) % 25)).padStart(2, '0')}`,
    helpful: (seed >> (index + 2)) % 12,
  }));
}

// 예시 Q&A(카테고리별 2개 + 공통 1개)
const QNA_POOL = {
  fashion: [
    ['세탁은 어떻게 하면 좋을까요?', '전문 세탁을 마친 상태로 발송해요. 오래 입으시려면 찬물 단독 손세탁이나 드라이클리닝을 추천드려요.'],
    ['키 170cm, 평소 M 사이즈 입는데 맞을까요?', '실측 사이즈표 기준으로 가슴단면이 넉넉한 편이라 살짝 여유 있게 맞으실 거예요. 가지고 계신 옷과 실측을 비교해 보시는 걸 추천드려요.'],
    ['보풀은 제거된 상태인가요?', '네, 검수 후 보풀 정리를 마쳤어요. 리포트에 적힌 부분은 정리 후에도 남아 있는 흔적이에요.'],
  ],
  electronics: [
    ['작동 영상을 받아볼 수 있을까요?', '네, 주문 시 요청사항에 남겨주시면 출고 전 작동 영상을 촬영해 보내드려요.'],
    ['고장 나면 A/S가 되나요?', '수령 후 7일 이내 초기 불량은 무상 수리 또는 환불해 드려요. 이후에는 믿을 수 있는 유상 수리 업체를 안내해 드려요.'],
    ['배터리도 같이 오나요?', '배터리는 포함되지 않아요. 맞는 규격은 상세정보의 구성품 안내를 참고해 주세요.'],
  ],
  cd: [
    ['디스크에 스크래치가 있나요?', '검수 리포트의 ‘디스크 기록면’ 항목에 실제 상태를 적어두었어요. 전 트랙 재생 테스트도 마쳤어요.'],
    ['포토카드 같은 특전도 포함인가요?', '리포트의 ‘구성·특전’ 항목에 적힌 것만 포함돼요. 빠진 특전이 있으면 따로 표기해요.'],
    ['초판인가요?', '앨범 뒷면과 디스크 각인으로 확인한 판본 정보를 문의 주시면 바로 알려드릴게요.'],
  ],
  props: [
    ['실제 크기가 어느 정도인가요?', '상세정보의 옵션 항목과 사진을 참고해 주세요. 더 정확한 실측이 필요하시면 문의 주시면 바로 재서 알려드릴게요.'],
    ['선물 포장이 가능한가요?', '네, 요청사항에 ‘선물 포장’이라고 남겨주시면 크라프트 박스와 리본으로 포장해 드려요.'],
    ['실제로 사용해도 되나요?', '네, 세척·소독을 마쳐 바로 사용하실 수 있어요. 오래된 제품이라 식기세척기 사용은 피해 주세요.'],
  ],
  common: [
    ['오늘 주문하면 언제 받을 수 있나요?', '평일 오후 2시 이전 결제 건은 당일 출고되며, 보통 1~2일 안에 받아보실 수 있어요.'],
    ['매장에서 직접 보고 살 수 있나요?', '네, 배송 방법에서 ‘매장 픽업’을 선택하시면 영업시간에 매장에서 상품을 확인하고 받아 가실 수 있어요.'],
  ],
};

function buildQna(product) {
  const seed = seedOf(product.slug);
  const picked = [...pickMany(QNA_POOL[product.categoryKey], seed, 2), ...pickMany(QNA_POOL.common, seed, 1)];
  return picked.map(([question, answer], index) => ({
    question,
    answer,
    name: REVIEWER_NAMES[(seed + index * 5 + 1) % REVIEWER_NAMES.length],
    date: `2026.09.${String(2 + ((seed >> index) % 26)).padStart(2, '0')}`,
  }));
}

function buildStock(product) {
  return 1 + (seedOf(product.slug) % 3);
}
