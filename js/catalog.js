// 카테고리 페이지와 상품 상세 페이지가 같이 쓰는 상품 목록.
// products.js(데이터)와 product-art.js(일러스트) 다음에 불러온다.

const BACKGROUNDS = ['#efe7db', '#e8e4d6', '#f0e4dc', '#e4e8e0', '#ece5e8', '#e9e2d3'];

const photoUrl = (id, width = 700) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=85`;

let nextId = 0;
const productsByCategory = Object.fromEntries(Object.entries(CATEGORY_DATA).map(([key, data]) => [key, data.products.map((product, index) => {
  const bg = BACKGROUNDS[index % BACKGROUNDS.length];
  let img = photoUrl(product.photo);
  if (product.art) img = productArt({ bg, ...product.art });
  if (product.album) img = albumArt({ bg, title: product.name, artist: product.artist, year: product.year, ...product.album });

  return {
    ...product,
    id: nextId++,
    slug: `${key}-${index}`,
    bg,
    img,
    categoryKey: key,
    categoryName: data.title,
    era: product.year ? `${Math.floor(product.year / 10) * 10}년대` : undefined,
    salePrice: Math.round((product.price * (100 - product.discount)) / 100 / 100) * 100,
  };
})]));

const allProducts = Object.values(productsByCategory).flat();
const findProduct = (slug) => allProducts.find((product) => product.slug === slug);

const won = (value) => `${value.toLocaleString('ko-KR')}원`;
