const fs = require("node:fs");
const path = require("node:path");

function calculateTotalPrice(item) {
  return Number(item.price) + Number(item.shippingFee || 0);
}

function formatWon(value) {
  return `${Number(value).toLocaleString("ko-KR")}원`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeItem(item) {
  return {
    ...item,
    totalPrice: calculateTotalPrice(item),
  };
}

function selectBestOffer(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new TypeError("selectBestOffer requires at least one item");
  }

  return [...items].sort((left, right) => {
    const priceDiff = calculateTotalPrice(left) - calculateTotalPrice(right);
    if (priceDiff !== 0) {
      return priceDiff;
    }

    return String(left.source).localeCompare(String(right.source), "ko-KR");
  })[0];
}

function groupItems(items) {
  if (!Array.isArray(items)) {
    throw new TypeError("groupItems requires an items array");
  }

  const groupsByKey = new Map();

  for (const item of items.map(normalizeItem)) {
    const groupKey = item.groupKey || `ungrouped-${item.id}`;
    const currentItems = groupsByKey.get(groupKey) || [];
    currentItems.push(item);
    groupsByKey.set(groupKey, currentItems);
  }

  return [...groupsByKey.entries()]
    .map(([groupKey, groupedItems]) => {
      const sortedItems = [...groupedItems].sort(
        (left, right) => left.totalPrice - right.totalPrice,
      );
      const bestOffer = selectBestOffer(sortedItems);
      const averageConfidence =
        sortedItems.reduce(
          (sum, item) => sum + Number(item.matchConfidence || 0),
          0,
        ) / sortedItems.length;

      return {
        groupKey,
        items: sortedItems,
        bestOffer,
        needsReview: sortedItems.some((item) => item.needsReview),
        averageConfidence,
      };
    })
    .sort((left, right) => {
      if (left.needsReview !== right.needsReview) {
        return Number(left.needsReview) - Number(right.needsReview);
      }

      return left.bestOffer.totalPrice - right.bestOffer.totalPrice;
    });
}

function buildReportModel(data) {
  if (!data || typeof data !== "object") {
    throw new TypeError("buildReportModel requires a data object");
  }

  const items = Array.isArray(data.items) ? data.items : [];
  const groups = groupItems(items);

  return {
    query: data.query || "가격 후보",
    notice: data.notice || "",
    generatedAt: new Date().toISOString(),
    totalItems: items.length,
    groups,
  };
}

function renderOfferCard(item, isBestOffer) {
  const reviewBadge = item.needsReview
    ? '<span class="badge badge-review">검토 필요</span>'
    : '<span class="badge badge-ok">동일 제품 후보</span>';
  const bestBadge = isBestOffer
    ? '<span class="badge badge-best">대표 최저가</span>'
    : "";

  return `
    <article class="offer ${isBestOffer ? "offer-best" : ""}">
      <img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.productName)}" loading="lazy">
      <div class="offer-body">
        <div class="badges">${bestBadge}${reviewBadge}</div>
        <h3>${escapeHtml(item.productName)}</h3>
        <p class="source">${escapeHtml(item.source)} · ${escapeHtml(item.packageSize)}</p>
        <dl>
          <div><dt>상품 가격</dt><dd>${formatWon(item.price)}</dd></div>
          <div><dt>배송비</dt><dd>${formatWon(item.shippingFee)}</dd></div>
          <div><dt>최종가</dt><dd>${formatWon(item.totalPrice)}</dd></div>
          <div><dt>매칭 신뢰도</dt><dd>${Math.round(Number(item.matchConfidence || 0) * 100)}%</dd></div>
        </dl>
        <p class="reason">${escapeHtml(item.matchReason)}</p>
        <a class="product-link" href="${escapeHtml(item.url)}">상품 링크 확인</a>
      </div>
    </article>
  `;
}

function renderHtml(model) {
  const groupSections = model.groups
    .map((group) => {
      const reviewText = group.needsReview ? "사람 검토 필요" : "자동 그룹 후보";
      const offers = group.items
        .map((item) => renderOfferCard(item, item.id === group.bestOffer.id))
        .join("\n");

      return `
        <section class="group">
          <header class="group-header">
            <div>
              <p class="eyebrow">${escapeHtml(group.groupKey)}</p>
              <h2>${escapeHtml(group.bestOffer.productName)}</h2>
            </div>
            <div class="group-summary">
              <strong>${formatWon(group.bestOffer.totalPrice)}</strong>
              <span>${reviewText} · 평균 신뢰도 ${Math.round(group.averageConfidence * 100)}%</span>
            </div>
          </header>
          <div class="offers">${offers}</div>
        </section>
      `;
    })
    .join("\n");

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(model.query)} 가격 후보 탐색 리포트</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f7f7f4;
      --surface: #ffffff;
      --text: #1f2933;
      --muted: #667085;
      --line: #d9dde3;
      --accent: #0f766e;
      --accent-soft: #d9f3ef;
      --warn: #a15c00;
      --warn-soft: #fff2cf;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: Arial, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
      line-height: 1.55;
    }
    main {
      width: min(1120px, calc(100% - 32px));
      margin: 0 auto;
      padding: 32px 0 56px;
    }
    .hero {
      padding: 28px 0 22px;
      border-bottom: 1px solid var(--line);
    }
    .hero h1 {
      margin: 0 0 10px;
      font-size: 32px;
    }
    .hero p {
      margin: 6px 0;
      color: var(--muted);
    }
    .notice {
      margin: 20px 0 28px;
      padding: 14px 16px;
      border: 1px solid var(--line);
      background: var(--surface);
    }
    .group {
      margin: 22px 0;
      padding: 20px;
      background: var(--surface);
      border: 1px solid var(--line);
    }
    .group-header {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      border-bottom: 1px solid var(--line);
      padding-bottom: 14px;
      margin-bottom: 16px;
    }
    .eyebrow {
      margin: 0 0 4px;
      color: var(--accent);
      font-size: 13px;
      font-weight: 700;
    }
    .group h2 {
      margin: 0;
      font-size: 22px;
    }
    .group-summary {
      min-width: 170px;
      text-align: right;
    }
    .group-summary strong {
      display: block;
      font-size: 24px;
      color: var(--accent);
    }
    .group-summary span {
      color: var(--muted);
      font-size: 13px;
    }
    .offers {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 14px;
    }
    .offer {
      display: grid;
      grid-template-columns: 96px 1fr;
      gap: 14px;
      padding: 14px;
      border: 1px solid var(--line);
      background: #fbfcfc;
    }
    .offer-best {
      border-color: var(--accent);
      background: var(--accent-soft);
    }
    .offer img {
      width: 96px;
      height: 96px;
      object-fit: cover;
      border: 1px solid var(--line);
      background: #fff;
    }
    .offer h3 {
      margin: 8px 0 4px;
      font-size: 16px;
    }
    .source, .reason {
      margin: 0 0 8px;
      color: var(--muted);
      font-size: 13px;
    }
    .badges {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .badge {
      display: inline-flex;
      padding: 3px 7px;
      font-size: 12px;
      border: 1px solid var(--line);
      background: #fff;
    }
    .badge-best {
      border-color: var(--accent);
      background: var(--accent);
      color: #fff;
    }
    .badge-review {
      border-color: var(--warn);
      background: var(--warn-soft);
      color: var(--warn);
    }
    .badge-ok {
      border-color: var(--accent);
      color: var(--accent);
    }
    dl {
      display: grid;
      gap: 4px;
      margin: 8px 0;
    }
    dl div {
      display: flex;
      justify-content: space-between;
      gap: 10px;
    }
    dt {
      color: var(--muted);
    }
    dd {
      margin: 0;
      font-weight: 700;
    }
    .product-link {
      display: inline-flex;
      margin-top: 8px;
      color: #075985;
      font-weight: 700;
    }
    @media (max-width: 720px) {
      .group-header {
        display: block;
      }
      .group-summary {
        margin-top: 12px;
        text-align: left;
      }
      .offer {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <h1>${escapeHtml(model.query)} 가격 후보 탐색 리포트</h1>
      <p>총 ${model.totalItems}개 후보, ${model.groups.length}개 제품 그룹</p>
      <p>생성 시각: ${escapeHtml(model.generatedAt)}</p>
    </section>
    <section class="notice">
      <strong>샘플 데이터 안내</strong>
      <p>${escapeHtml(model.notice)}</p>
      <p>이 리포트는 실제 쇼핑몰 자동 수집 결과가 아니며, 같은 제품 묶기와 최저가 대표 선택 흐름을 검증하기 위한 예시입니다.</p>
    </section>
    ${groupSections}
  </main>
</body>
</html>`;
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function generateReport({
  inputPath = path.join("samples", "products.json"),
  outputPath = path.join("outputs", "price-report.html"),
} = {}) {
  const raw = fs.readFileSync(inputPath, "utf8");
  const data = JSON.parse(raw);
  const model = buildReportModel(data);
  const html = renderHtml(model);

  ensureDirectory(path.dirname(outputPath));
  fs.writeFileSync(outputPath, html, "utf8");

  return { outputPath, model };
}

if (require.main === module) {
  const inputPath = process.argv[2] || path.join("samples", "products.json");
  const outputPath = process.argv[3] || path.join("outputs", "price-report.html");
  const result = generateReport({ inputPath, outputPath });
  console.log(`HTML report written to ${result.outputPath}`);
  console.log(`Groups: ${result.model.groups.length}, items: ${result.model.totalItems}`);
}

module.exports = {
  buildReportModel,
  calculateTotalPrice,
  escapeHtml,
  formatWon,
  generateReport,
  groupItems,
  renderHtml,
  selectBestOffer,
};
