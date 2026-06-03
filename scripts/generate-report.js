const fs = require("node:fs");
const path = require("node:path");

function calculateTotalPrice(item) {
  return Number(item.price) + Number(item.shippingFee || 0);
}

function calculateUnitPrice(item) {
  const totalPrice = Number(item?.totalPrice);
  const unitCount = Number(item?.unitCount);

  if (
    item?.totalPrice == null ||
    item?.unitCount == null ||
    !Number.isFinite(totalPrice) ||
    !Number.isFinite(unitCount) ||
    unitCount <= 0
  ) {
    return null;
  }

  return Math.round(totalPrice / unitCount);
}

function calculateDailyCost(item) {
  const unitPrice = Number(item?.unitPrice);
  const dailyServingCount = Number(item?.dailyServingCount);

  if (
    item?.unitPrice == null ||
    item?.dailyServingCount == null ||
    !Number.isFinite(unitPrice) ||
    !Number.isFinite(dailyServingCount) ||
    dailyServingCount <= 0
  ) {
    return null;
  }

  return unitPrice * dailyServingCount;
}

function calculateDaysCovered(item) {
  const unitCount = Number(item?.unitCount);
  const dailyServingCount = Number(item?.dailyServingCount);

  if (
    item?.unitCount == null ||
    item?.dailyServingCount == null ||
    !Number.isFinite(unitCount) ||
    !Number.isFinite(dailyServingCount) ||
    dailyServingCount <= 0
  ) {
    return null;
  }

  return unitCount / dailyServingCount;
}

function formatWon(value) {
  return `${Number(value).toLocaleString("ko-KR")}원`;
}

function formatOptionalWon(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return "확인 필요";
  }

  return formatWon(value);
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
  const totalPrice = calculateTotalPrice(item);
  const unitPrice = calculateUnitPrice({ ...item, totalPrice });
  const dailyCost = calculateDailyCost({ ...item, unitPrice });
  const daysCovered = calculateDaysCovered(item);

  return {
    ...item,
    totalPrice,
    unitPrice,
    dailyCost,
    daysCovered,
  };
}

function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function validateIngredients(ingredients) {
  if (!Array.isArray(ingredients)) {
    return ["ingredients must be an array"];
  }

  const errors = [];
  const requiredIngredientFields = [
    "ingredientId",
    "nameKo",
    "summary",
    "functionalIngredientStatus",
    "functionalIngredientStatusLabel",
    "functionalIngredientNote",
  ];

  ingredients.forEach((ingredient, ingredientIndex) => {
    for (const field of requiredIngredientFields) {
      if (!hasValue(ingredient?.[field])) {
        errors.push(`ingredients[${ingredientIndex}].${field} is required`);
      }
    }

    if (!Array.isArray(ingredient?.claims) || ingredient.claims.length === 0) {
      errors.push(`ingredients[${ingredientIndex}].claims must include at least one claim`);
    } else {
      ingredient.claims.forEach((claim, claimIndex) => {
        for (const field of ["claim", "evidenceLevel", "summary"]) {
          if (!hasValue(claim?.[field])) {
            errors.push(
              `ingredients[${ingredientIndex}].claims[${claimIndex}].${field} is required`,
            );
          }
        }
      });
    }

    for (const field of ["title", "summary", "caution"]) {
      if (!hasValue(ingredient?.reviewSummary?.[field])) {
        errors.push(`ingredients[${ingredientIndex}].reviewSummary.${field} is required`);
      }
    }

    if (!Array.isArray(ingredient?.cautions) || ingredient.cautions.length === 0) {
      errors.push(`ingredients[${ingredientIndex}].cautions must include at least one caution`);
    }

    if (ingredient?.priorityCautions !== undefined) {
      if (!Array.isArray(ingredient.priorityCautions)) {
        errors.push(`ingredients[${ingredientIndex}].priorityCautions must be an array`);
      } else {
        ingredient.priorityCautions.forEach((caution, cautionIndex) => {
          if (!hasValue(caution)) {
            errors.push(
              `ingredients[${ingredientIndex}].priorityCautions[${cautionIndex}] is required`,
            );
          }
        });
      }
    }

    if (!Array.isArray(ingredient?.references) || ingredient.references.length === 0) {
      errors.push(`ingredients[${ingredientIndex}].references must include at least one reference`);
    }

    const regulatoryStatus = ingredient?.regulatoryStatus || {};
    for (const key of ["krMfds", "usFda", "nihOds", "usFtc"]) {
      const regulatoryItem = regulatoryStatus[key];
      if (!regulatoryItem || typeof regulatoryItem !== "object") {
        errors.push(`ingredients[${ingredientIndex}].regulatoryStatus.${key} is required`);
        continue;
      }

      for (const field of ["title", "label", "explanation", "note"]) {
        if (!hasValue(regulatoryItem[field])) {
          errors.push(
            `ingredients[${ingredientIndex}].regulatoryStatus.${key}.${field} is required`,
          );
        }
      }

      if (!Array.isArray(regulatoryItem.sources) || regulatoryItem.sources.length === 0) {
        errors.push(
          `ingredients[${ingredientIndex}].regulatoryStatus.${key}.sources must include at least one source`,
        );
      }
    }
  });

  return errors;
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

function selectIngredient(data, items) {
  const ingredients = Array.isArray(data?.ingredients) ? data.ingredients : [];
  if (ingredients.length === 0) {
    return null;
  }

  const ingredientIds = Array.isArray(items)
    ? items.map((item) => item.ingredientId).filter(Boolean)
    : [];

  for (const ingredientId of ingredientIds) {
    const ingredient = ingredients.find(
      (candidate) => candidate.ingredientId === ingredientId,
    );
    if (ingredient) {
      return ingredient;
    }
  }

  return ingredients[0];
}

function buildReportModel(data) {
  if (!data || typeof data !== "object") {
    throw new TypeError("buildReportModel requires a data object");
  }

  const items = Array.isArray(data.items) ? data.items : [];
  const ingredientErrors = validateIngredients(
    Array.isArray(data.ingredients) ? data.ingredients : [],
  );
  if (ingredientErrors.length > 0) {
    throw new Error(ingredientErrors.join("; "));
  }

  const groups = groupItems(items);
  const ingredient = selectIngredient(data, items);

  return {
    query: data.query || "가격 후보",
    notice: data.notice || "",
    evidenceSchemaVersion: data.evidenceSchemaVersion || "supplement-evidence-v1",
    generatedAt: new Date().toISOString(),
    totalItems: items.length,
    ingredient,
    groups,
  };
}

function renderRegulatoryStatus(regulatoryStatus) {
  const orderedKeys = ["krMfds", "usFda", "nihOds", "usFtc"];
  const items = orderedKeys
    .map((key) => regulatoryStatus?.[key])
    .filter((item) => item && item.defaultVisible !== false)
    .map((item) => {
      const sourceText = Array.isArray(item.sources)
        ? item.sources.filter(Boolean).join(", ")
        : "";

      return `
        <article class="evidence-block">
          <p class="eyebrow">공식 기준 확인 결과</p>
          <h3>${escapeHtml(item.title)}</h3>
          <p><strong>${escapeHtml(item.label)}</strong></p>
          ${
            item.consumerQuestion
              ? `<p class="consumer-question">${escapeHtml(item.consumerQuestion)}</p>`
              : ""
          }
          ${
            item.consumerAnswer
              ? `<p class="consumer-answer">${escapeHtml(item.consumerAnswer)}</p>`
              : ""
          }
          ${
            item.buyerValue
              ? `<p><strong>구매할 때 의미</strong> ${escapeHtml(item.buyerValue)}</p>`
              : ""
          }
          <p>${escapeHtml(item.explanation)}</p>
          <p>${escapeHtml(item.note)}</p>
          ${
            sourceText
              ? `<p class="source-note">출처: ${escapeHtml(sourceText)}</p>`
              : ""
          }
        </article>
      `;
    })
    .join("\n");

  return items || "";
}

function renderIngredientSummary(ingredient) {
  if (!ingredient) {
    return "";
  }

  const claims = Array.isArray(ingredient.claims) ? ingredient.claims : [];
  const priorityCautions = Array.isArray(ingredient.priorityCautions)
    ? ingredient.priorityCautions
    : [];
  const cautions = Array.isArray(ingredient.cautions) ? ingredient.cautions : [];
  const references = Array.isArray(ingredient.references)
    ? ingredient.references
    : [];
  const reviewSummary = ingredient.reviewSummary || {};
  const regulatoryItems = renderRegulatoryStatus(ingredient.regulatoryStatus);
  const displayName = [ingredient.nameKo, ingredient.nameEn]
    .filter(Boolean)
    .join(" / ");
  const claimItems =
    claims.length > 0
      ? claims
          .map(
            (claim) => `
              <li>
                <strong>${escapeHtml(claim.claim || "근거 항목")}</strong>
                <span>${escapeHtml(claim.evidenceLevel || "확인 필요")}</span>
                <p>${escapeHtml(claim.summary || "확인 필요")}</p>
              </li>
            `,
          )
          .join("\n")
      : "<li>확인 필요</li>";
  const cautionItems =
    cautions.length > 0
      ? cautions.map((caution) => `<li>${escapeHtml(caution)}</li>`).join("\n")
      : "<li>확인 필요</li>";
  const priorityCautionBlock =
    priorityCautions.length > 0
      ? `
        <article class="evidence-block priority-cautions">
          <h3>먼저 확인할 주의사항</h3>
          <ul>${priorityCautions.map((caution) => `<li>${escapeHtml(caution)}</li>`).join("\n")}</ul>
        </article>
      `
      : "";
  const referenceItems =
    references.length > 0
      ? references
          .map((reference) => {
            const title = reference.title || reference.source || "참고자료";
            const label = reference.source
              ? `${title} · ${reference.source}`
              : title;
            const link = reference.url
              ? `<a href="${escapeHtml(reference.url)}">${escapeHtml(label)}</a>`
              : escapeHtml(label);

            return `
              <li>
                ${link}
                ${reference.note ? `<p>${escapeHtml(reference.note)}</p>` : ""}
              </li>
            `;
          })
          .join("\n")
      : "<li>확인 필요</li>";

  return `
    <section class="ingredient-summary">
      <header>
        <p class="eyebrow">영양제 근거 요약</p>
        <h2>${escapeHtml(displayName || "원료 정보")}</h2>
        <p>${escapeHtml(ingredient.summary || "확인 필요")}</p>
      </header>
      <div class="evidence-grid">
        ${priorityCautionBlock}
        ${regulatoryItems}
        <article class="evidence-block">
          <h3>효능/근거 요약</h3>
          <ul>${claimItems}</ul>
        </article>
        <article class="evidence-block">
          <h3>${escapeHtml(reviewSummary.title || "후기에서 자주 보이는 반응")}</h3>
          <p>${escapeHtml(reviewSummary.summary || "확인 필요")}</p>
          <p class="caution">${escapeHtml(reviewSummary.caution || "후기는 개인 경험으로만 참고합니다.")}</p>
        </article>
        <article class="evidence-block">
          <h3>주의사항</h3>
          <ul>${cautionItems}</ul>
        </article>
        <article class="evidence-block evidence-wide">
          <h3>참고자료</h3>
          <ul>${referenceItems}</ul>
        </article>
      </div>
    </section>
  `;
}

function renderOfferCard(item, isBestOffer) {
  const reviewBadge = item.needsReview
    ? '<span class="badge badge-review">검토 필요</span>'
    : '<span class="badge badge-ok">동일 제품 후보</span>';
  const bestBadge = isBestOffer
    ? '<span class="badge badge-best">대표 최저가</span>'
    : "";
  const unitType = item.unitType || "개";
  const daysCovered =
    item.daysCovered == null || Number.isNaN(Number(item.daysCovered))
      ? "확인 필요"
      : `${Number(item.daysCovered).toLocaleString("ko-KR")}일`;

  return `
    <article class="offer ${isBestOffer ? "offer-best" : ""}">
      <img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.productName)}" loading="lazy">
      <div class="offer-body">
        <div class="badges">${bestBadge}${reviewBadge}</div>
        <h3>${escapeHtml(item.productName)}</h3>
        <p class="source">${escapeHtml(item.source)} · ${escapeHtml(item.packageSize)}</p>
        <dl>
          ${
            item.activeIngredientLabel
              ? `<div><dt>주요 함량</dt><dd>${escapeHtml(item.activeIngredientLabel)}</dd></div>`
              : ""
          }
          <div><dt>상품 가격</dt><dd>${formatWon(item.price)}</dd></div>
          <div><dt>배송비</dt><dd>${formatWon(item.shippingFee)}</dd></div>
          <div><dt>최종가</dt><dd>${formatWon(item.totalPrice)}</dd></div>
          <div><dt>1${escapeHtml(unitType)}당</dt><dd>${formatOptionalWon(item.unitPrice)}</dd></div>
          <div><dt>하루 비용</dt><dd>${formatOptionalWon(item.dailyCost)}</dd></div>
          <div><dt>복용 가능일</dt><dd>${daysCovered}</dd></div>
          <div><dt>매칭 신뢰도</dt><dd>${Math.round(Number(item.matchConfidence || 0) * 100)}%</dd></div>
        </dl>
        <p class="reason">${escapeHtml(item.matchReason)}</p>
        <a class="product-link" href="${escapeHtml(item.url)}">상품 링크 확인</a>
      </div>
    </article>
  `;
}

function renderHtml(model) {
  const ingredientSummary = renderIngredientSummary(model.ingredient);
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
    .ingredient-summary {
      margin: 20px 0 28px;
      padding: 20px;
      border: 1px solid var(--line);
      background: var(--surface);
    }
    .ingredient-summary header {
      border-bottom: 1px solid var(--line);
      margin-bottom: 16px;
      padding-bottom: 12px;
    }
    .ingredient-summary h2,
    .ingredient-summary h3 {
      margin: 0 0 8px;
    }
    .ingredient-summary header p {
      margin: 6px 0 0;
      color: var(--muted);
    }
    .evidence-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 12px;
    }
    .evidence-block {
      padding: 14px;
      border: 1px solid var(--line);
      background: #fbfcfc;
    }
    .evidence-wide {
      grid-column: 1 / -1;
    }
    .evidence-block ul {
      margin: 8px 0 0;
      padding-left: 18px;
    }
    .evidence-block li + li {
      margin-top: 8px;
    }
    .evidence-block p {
      margin: 6px 0 0;
      color: var(--muted);
    }
    .evidence-block span,
    .caution,
    .source-note {
      color: var(--warn);
      font-size: 13px;
    }
    .consumer-question {
      font-weight: 700;
      color: var(--text);
    }
    .consumer-answer {
      padding: 8px 10px;
      border-left: 3px solid var(--accent);
      background: #eef8f6;
      color: var(--text);
      font-weight: 700;
    }
    .priority-cautions {
      border-color: var(--warn);
      background: var(--warn-soft);
    }
    .priority-cautions h3 {
      color: var(--warn);
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
      <p><strong>근거자료 스키마 v1</strong> (${escapeHtml(model.evidenceSchemaVersion)}): 영양제 효능/근거 요약은 참고용이며 의료 조언이 아님을 전제로 표시합니다.</p>
    </section>
    ${ingredientSummary}
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
  ingredientPath = path.join("samples", "ingredients.json"),
  outputPath = path.join("outputs", "price-report.html"),
} = {}) {
  const raw = fs.readFileSync(inputPath, "utf8");
  const data = JSON.parse(raw);
  if (ingredientPath && fs.existsSync(ingredientPath)) {
    const ingredientRaw = fs.readFileSync(ingredientPath, "utf8");
    const ingredientData = JSON.parse(ingredientRaw);
    data.evidenceSchemaVersion =
      ingredientData.evidenceSchemaVersion || data.evidenceSchemaVersion;
    data.ingredients = Array.isArray(ingredientData.ingredients)
      ? ingredientData.ingredients
      : [];
  }

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
  calculateDailyCost,
  calculateDaysCovered,
  calculateTotalPrice,
  calculateUnitPrice,
  escapeHtml,
  formatOptionalWon,
  formatWon,
  generateReport,
  groupItems,
  renderIngredientSummary,
  renderHtml,
  selectIngredient,
  selectBestOffer,
  validateIngredients,
};
