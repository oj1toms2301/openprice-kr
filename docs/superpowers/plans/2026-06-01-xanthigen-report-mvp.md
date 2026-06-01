# 잔티젠 가격 후보 탐색 리포트 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 샘플 잔티젠 가격 후보 데이터를 읽어 같은 제품 후보를 묶고, 배송비 포함 최저가 대표 후보를 보여주는 HTML 리포트와 Codex Skill을 만든다.

**Architecture:** 실행 코드는 npm 패키지 없는 Node.js 스크립트 하나로 시작한다. 샘플 데이터는 `samples/products.json`에 두고, 검증용 테스트는 Node 기본 `assert`만 사용하며, 결과물은 `outputs/price-report.html`로 생성한다.

**Tech Stack:** Node.js built-in modules, Markdown, JSON, HTML, CSS, Git

---

## 파일 구조

이번 계획에서 만들거나 수정할 파일은 다음과 같다.

- 생성: `samples/products.json`
  - 역할: 잔티젠 가격 후보 샘플 데이터. 실제 수집 데이터가 아니라 MVP 검증용 예시다.
- 생성: `scripts/generate-report.js`
  - 역할: 샘플 데이터를 읽고, 같은 제품 후보를 그룹으로 묶고, 최저가 대표 후보를 골라 HTML 리포트를 만든다.
- 생성: `scripts/generate-report.test.js`
  - 역할: 리포트 생성 로직의 핵심 규칙을 Node 기본 `assert`로 검증한다.
- 생성: `skills/openprice-report/SKILL.md`
  - 역할: Codex 앱에서 이 프로젝트를 어떻게 사용하면 되는지 안내하는 Skill 문서다.
- 생성: `docs/mvp-report-generator.md`
  - 역할: 잔티젠 HTML 리포트 MVP의 목적, 실행 방법, 한계를 설명한다.
- 수정: `README.md`
  - 역할: 새 MVP 실행 방법과 Skill 위치를 연결한다.
- 생성: `outputs/.gitkeep`
  - 역할: 리포트 출력 폴더 구조를 보존한다. 실제 HTML 리포트는 재생성 가능한 산출물이므로 기본 커밋 대상에서 제외한다.
- 수정: `.gitignore`
  - 역할: `outputs/*.html`을 제외해서 생성된 리포트가 실수로 커밋되지 않게 한다.

이번 계획에서 하지 않는 것:

- 실제 쇼핑몰 크롤링
- 외부 npm 패키지 설치
- 로그인 필요한 가격 수집
- 이미지 AI 모델 연동
- 웹 서버 실행
- 데이터베이스 추가

## Task 1: 샘플 데이터 작성

**Files:**

- Create: `samples/products.json`

- [ ] **Step 1: 잔티젠 샘플 후보 데이터 작성**

  `samples/products.json`을 만든다.

  ```json
  {
    "query": "잔티젠",
    "generatedFor": "openprice-kr MVP sample",
    "notice": "이 데이터는 실제 수집 결과가 아니라 리포트 구조 검증용 샘플입니다.",
    "items": [
      {
        "id": "xan-001",
        "query": "잔티젠",
        "source": "네이버쇼핑 예시",
        "productName": "잔티젠 다이어트 600mg 30캡슐",
        "brand": "Xanthigen",
        "price": 29800,
        "shippingFee": 3000,
        "currency": "KRW",
        "url": "https://example.com/naver/xanthigen-30",
        "imageUrl": "https://placehold.co/240x240?text=Xanthigen+30",
        "packageSize": "30캡슐",
        "groupKey": "xanthigen-30caps",
        "matchConfidence": 0.92,
        "matchReason": "브랜드명, 잔티젠 키워드, 30캡슐 포장 단위가 일치합니다.",
        "needsReview": false
      },
      {
        "id": "xan-002",
        "query": "잔티젠",
        "source": "쿠팡 예시",
        "productName": "Xanthigen 잔티젠 30캡슐 건강기능식품",
        "brand": "Xanthigen",
        "price": 28500,
        "shippingFee": 2500,
        "currency": "KRW",
        "url": "https://example.com/coupang/xanthigen-30",
        "imageUrl": "https://placehold.co/240x240?text=Xanthigen+30",
        "packageSize": "30캡슐",
        "groupKey": "xanthigen-30caps",
        "matchConfidence": 0.9,
        "matchReason": "상품명과 30캡슐 포장 단위가 일치합니다.",
        "needsReview": false
      },
      {
        "id": "xan-003",
        "query": "잔티젠",
        "source": "브랜드몰 예시",
        "productName": "잔티젠 30캡슐 공식몰 단품",
        "brand": "Xanthigen",
        "price": 27900,
        "shippingFee": 0,
        "currency": "KRW",
        "url": "https://example.com/brand/xanthigen-30",
        "imageUrl": "https://placehold.co/240x240?text=Brand+Mall+30",
        "packageSize": "30캡슐",
        "groupKey": "xanthigen-30caps",
        "matchConfidence": 0.88,
        "matchReason": "브랜드몰 단품이며 30캡슐 기준으로 같은 제품 후보입니다.",
        "needsReview": false
      },
      {
        "id": "xan-004",
        "query": "잔티젠",
        "source": "다나와 예시",
        "productName": "잔티젠 600mg 60캡슐 대용량",
        "brand": "Xanthigen",
        "price": 49800,
        "shippingFee": 3000,
        "currency": "KRW",
        "url": "https://example.com/danawa/xanthigen-60",
        "imageUrl": "https://placehold.co/240x240?text=Xanthigen+60",
        "packageSize": "60캡슐",
        "groupKey": "xanthigen-60caps",
        "matchConfidence": 0.91,
        "matchReason": "잔티젠 제품이지만 60캡슐 포장이라 30캡슐 그룹과 분리합니다.",
        "needsReview": false
      },
      {
        "id": "xan-005",
        "query": "잔티젠",
        "source": "개별 쇼핑몰 예시",
        "productName": "잔티젠 유사 포뮬러 30정",
        "brand": "Unknown",
        "price": 19900,
        "shippingFee": 3000,
        "currency": "KRW",
        "url": "https://example.com/shop/similar-xanthigen",
        "imageUrl": "https://placehold.co/240x240?text=Review+Needed",
        "packageSize": "30정",
        "groupKey": "review-needed-similar-formula",
        "matchConfidence": 0.54,
        "matchReason": "상품명에 잔티젠이 있으나 브랜드와 포장 정보가 불명확합니다.",
        "needsReview": true
      }
    ]
  }
  ```

- [ ] **Step 2: 샘플 데이터 JSON 파싱 확인**

  실행:

  ```powershell
  node -e "const data=require('./samples/products.json'); console.log(data.query, data.items.length)"
  ```

  기대 결과:

  ```text
  잔티젠 5
  ```

## Task 2: 리포트 생성 스크립트 테스트 작성

**Files:**

- Create: `scripts/generate-report.test.js`

- [ ] **Step 1: 실패하는 테스트 작성**

  `scripts/generate-report.test.js`를 만든다. 아직 `scripts/generate-report.js`가 없으므로 이 테스트는 처음 실행하면 실패해야 한다.

  ```javascript
  const assert = require("node:assert/strict");
  const {
    calculateTotalPrice,
    groupItems,
    selectBestOffer,
    buildReportModel,
    escapeHtml
  } = require("./generate-report");

  const sampleItems = [
    {
      id: "a",
      query: "잔티젠",
      source: "A몰",
      productName: "잔티젠 30캡슐",
      brand: "Xanthigen",
      price: 30000,
      shippingFee: 3000,
      currency: "KRW",
      url: "https://example.com/a",
      imageUrl: "https://placehold.co/120x120?text=A",
      packageSize: "30캡슐",
      groupKey: "xanthigen-30caps",
      matchConfidence: 0.9,
      matchReason: "30캡슐",
      needsReview: false
    },
    {
      id: "b",
      query: "잔티젠",
      source: "B몰",
      productName: "잔티젠 30캡슐",
      brand: "Xanthigen",
      price: 28000,
      shippingFee: 2500,
      currency: "KRW",
      url: "https://example.com/b",
      imageUrl: "https://placehold.co/120x120?text=B",
      packageSize: "30캡슐",
      groupKey: "xanthigen-30caps",
      matchConfidence: 0.89,
      matchReason: "30캡슐",
      needsReview: false
    },
    {
      id: "c",
      query: "잔티젠",
      source: "C몰",
      productName: "잔티젠 유사 제품",
      brand: "Unknown",
      price: 19000,
      shippingFee: 3000,
      currency: "KRW",
      url: "https://example.com/c",
      imageUrl: "https://placehold.co/120x120?text=C",
      packageSize: "30정",
      groupKey: "review-needed",
      matchConfidence: 0.5,
      matchReason: "브랜드 불명확",
      needsReview: true
    }
  ];

  assert.equal(calculateTotalPrice({ price: 28000, shippingFee: 2500 }), 30500);
  assert.equal(escapeHtml("<잔티젠 & 테스트>"), "&lt;잔티젠 &amp; 테스트&gt;");

  const groups = groupItems(sampleItems);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].groupKey, "xanthigen-30caps");
  assert.equal(groups[0].items.length, 2);
  assert.equal(groups[1].groupKey, "review-needed");
  assert.equal(groups[1].needsReview, true);

  const bestOffer = selectBestOffer(groups[0].items);
  assert.equal(bestOffer.id, "b");
  assert.equal(bestOffer.totalPrice, 30500);

  const model = buildReportModel({
    query: "잔티젠",
    notice: "샘플 데이터",
    items: sampleItems
  });
  assert.equal(model.query, "잔티젠");
  assert.equal(model.totalItems, 3);
  assert.equal(model.groups.length, 2);
  assert.equal(model.groups[0].bestOffer.id, "b");

  console.log("generate-report tests passed");
  ```

- [ ] **Step 2: 테스트 실패 확인**

  실행:

  ```powershell
  node scripts/generate-report.test.js
  ```

  기대 결과:

  ```text
  Error: Cannot find module './generate-report'
  ```

## Task 3: 리포트 생성 스크립트 구현

**Files:**

- Create: `scripts/generate-report.js`

- [ ] **Step 1: 최소 구현 작성**

  `scripts/generate-report.js`를 만든다.

  ```javascript
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
      totalPrice: calculateTotalPrice(item)
    };
  }

  function selectBestOffer(items) {
    return [...items].sort((a, b) => {
      const priceDiff = calculateTotalPrice(a) - calculateTotalPrice(b);
      if (priceDiff !== 0) return priceDiff;
      return String(a.source).localeCompare(String(b.source), "ko-KR");
    })[0];
  }

  function groupItems(items) {
    const groupsByKey = new Map();

    for (const item of items.map(normalizeItem)) {
      const groupKey = item.groupKey || `ungrouped-${item.id}`;
      if (!groupsByKey.has(groupKey)) {
        groupsByKey.set(groupKey, []);
      }
      groupsByKey.get(groupKey).push(item);
    }

    return [...groupsByKey.entries()]
      .map(([groupKey, groupedItems]) => {
        const sortedItems = [...groupedItems].sort(
          (a, b) => a.totalPrice - b.totalPrice
        );
        const bestOffer = selectBestOffer(sortedItems);
        return {
          groupKey,
          bestOffer,
          items: sortedItems,
          needsReview: sortedItems.some((item) => item.needsReview),
          averageConfidence:
            sortedItems.reduce((sum, item) => sum + Number(item.matchConfidence || 0), 0) /
            sortedItems.length
        };
      })
      .sort((a, b) => {
        if (a.needsReview !== b.needsReview) return Number(a.needsReview) - Number(b.needsReview);
        return a.bestOffer.totalPrice - b.bestOffer.totalPrice;
      });
  }

  function buildReportModel(data) {
    const groups = groupItems(data.items || []);
    return {
      query: data.query,
      notice: data.notice,
      generatedAt: new Date().toISOString(),
      totalItems: data.items.length,
      groups
    };
  }

  function renderOfferCard(item, isBestOffer) {
    const reviewBadge = item.needsReview
      ? '<span class="badge badge-review">검토 필요</span>'
      : '<span class="badge badge-ok">동일 제품 후보</span>';
    const bestBadge = isBestOffer ? '<span class="badge badge-best">대표 최저가</span>' : "";

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
        const offers = group.items
          .map((item) => renderOfferCard(item, item.id === group.bestOffer.id))
          .join("\n");
        const reviewText = group.needsReview ? "사람 검토 필요" : "자동 그룹 후보";

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
      .hero p { margin: 6px 0; color: var(--muted); }
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
      .group-summary span { color: var(--muted); font-size: 13px; }
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
      dt { color: var(--muted); }
      dd { margin: 0; font-weight: 700; }
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
    outputPath = path.join("outputs", "price-report.html")
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
    calculateTotalPrice,
    escapeHtml,
    formatWon,
    groupItems,
    selectBestOffer,
    buildReportModel,
    renderHtml,
    generateReport
  };
  ```

- [ ] **Step 2: 테스트 통과 확인**

  실행:

  ```powershell
  node scripts/generate-report.test.js
  ```

  기대 결과:

  ```text
  generate-report tests passed
  ```

## Task 4: HTML 리포트 생성과 출력 폴더 처리

**Files:**

- Create: `outputs/.gitkeep`
- Modify: `.gitignore`
- Generate: `outputs/price-report.html`

- [ ] **Step 1: 출력 폴더 보존 파일 만들기**

  `outputs/.gitkeep`을 만든다. 파일 내용은 비워둔다.

- [ ] **Step 2: 생성 HTML 제외 규칙 추가**

  `.gitignore`의 `# Local outputs` 아래를 다음처럼 바꾼다.

  ```gitignore
  # Local outputs
  outputs/*.html
  !outputs/.gitkeep
  ```

- [ ] **Step 3: HTML 리포트 생성**

  실행:

  ```powershell
  node scripts/generate-report.js
  ```

  기대 결과:

  ```text
  HTML report written to outputs\price-report.html
  Groups: 3, items: 5
  ```

- [ ] **Step 4: HTML 내용 확인**

  실행:

  ```powershell
  Select-String -Path outputs\price-report.html -Pattern '잔티젠 가격 후보 탐색 리포트|대표 최저가|검토 필요|샘플 데이터 안내' -Encoding UTF8
  ```

  기대 결과:

  - 네 표현이 모두 검색 결과에 나타난다.

## Task 5: Codex Skill 문서 작성

**Files:**

- Create: `skills/openprice-report/SKILL.md`

- [ ] **Step 1: Skill 문서 작성**

  `skills/openprice-report/SKILL.md`를 만든다.

  ````markdown
  ---
  name: openprice-report
  description: 잔티젠 같은 국내 쇼핑 상품 후보 데이터를 정리해, 같은 제품 후보를 묶고 배송비 포함 최저가 대표 후보를 HTML 리포트로 생성할 때 사용한다.
  ---

  # openprice-report

  국내 쇼핑 가격 후보를 한곳에서 비교하기 위한 Codex Skill입니다.

  ## 언제 쓰나

  사용자가 다음을 요청할 때 사용합니다.

  - 특정 상품의 여러 쇼핑몰 가격 후보를 비교하고 싶다.
  - 같은 제품으로 보이는 후보를 묶고 싶다.
  - 배송비 포함 최종가 기준으로 대표 최저가를 보고 싶다.
  - HTML 리포트로 보기 쉽게 정리하고 싶다.

  ## 현재 MVP 범위

  현재 MVP는 `잔티젠` 샘플 데이터로 동작합니다.

  아직 실제 쇼핑몰을 자동 수집하지 않습니다.

  ## 안전 원칙

  실제 외부 사이트와 연결하기 전에는 다음을 먼저 확인합니다.

  - 서비스 약관
  - `robots.txt`
  - 공개 API 제공 여부
  - 로그인 또는 회원 전용 가격 여부
  - 요청 빈도 제한
  - 출처 표시 조건

  ## 사용 흐름

  1. `samples/products.json`에서 후보 데이터를 확인합니다.
  2. 상품명, 브랜드, 포장 단위, 이미지 링크, 출처 링크가 충분한지 봅니다.
  3. 다음 명령으로 HTML 리포트를 생성합니다.

     ```powershell
     node scripts/generate-report.js
     ```

  4. `outputs/price-report.html`을 열어 대표 최저가와 검토 필요 후보를 확인합니다.
  5. 같은 제품 묶기가 이상하면 `groupKey`, `matchConfidence`, `needsReview`, `matchReason` 값을 조정합니다.

  ## 검토 기준

  - 같은 제품인데 다른 그룹으로 나뉘지 않았는가
  - 다른 제품인데 같은 그룹으로 묶이지 않았는가
  - 배송비 포함 최종가가 대표 후보 선정에 반영됐는가
  - 링크가 실제 후보 확인에 충분한가
  - 애매한 후보가 `검토 필요`로 표시됐는가
  ````

## Task 6: MVP 설명 문서와 README 업데이트

**Files:**

- Create: `docs/mvp-report-generator.md`
- Modify: `README.md`

- [ ] **Step 1: MVP 설명 문서 작성**

  `docs/mvp-report-generator.md`를 만든다.

  ````markdown
  # 잔티젠 가격 후보 탐색 리포트 MVP

  ## 무엇을 보여주는가

  이 MVP는 `잔티젠`을 기준 상품으로 고정하고, 여러 쇼핑몰에서 온 것처럼 구성한 샘플 후보를 한 HTML 리포트에서 비교합니다.

  핵심은 단순히 가격표를 만드는 것이 아니라, 같은 제품으로 보이는 후보를 묶고 배송비 포함 최종가 기준으로 대표 최저가 후보를 보여주는 것입니다.

  ## 왜 HTML인가

  Markdown보다 HTML이 상품 이미지, 가격, 링크, 검토 필요 표시를 한눈에 보여주기 좋습니다.

  소비자가 직접 확인해야 하는 가격 비교 결과는 표와 카드 형태의 HTML 리포트가 더 읽기 쉽습니다.

  ## 실행 방법

  Node.js가 설치되어 있으면 외부 패키지 설치 없이 실행할 수 있습니다.

  ```powershell
  node scripts/generate-report.js
  ```

  실행 후 다음 파일이 생성됩니다.

  ```text
  outputs/price-report.html
  ```

  ## 현재 한계

  - 실제 쇼핑몰 자동 수집 결과가 아닙니다.
  - 실시간 최저가를 보장하지 않습니다.
  - 이미지 인식 모델은 아직 연결하지 않았습니다.
  - 같은 제품 묶기는 샘플 데이터의 `groupKey`와 검토 필드에 기반합니다.

  ## 다음 확장 방향

  - 사용자가 제공한 URL 후보 추가
  - 공개 API 기반 후보 수집
  - 이미지 기반 상품 매칭
  - GPT 비전 기능을 활용한 후보 검토
  - 영양제 카테고리 확장
  ````

- [ ] **Step 2: README에 MVP 링크 추가**

  `README.md`의 `## 문서` 섹션을 다음처럼 바꾼다.

  ````markdown
  ## 문서

  - [프로젝트 방향](docs/vision.md)
  - [데이터 안전 원칙](docs/data-safety.md)
  - [잔티젠 가격 후보 탐색 리포트 MVP](docs/mvp-report-generator.md)
  ````

  `## 초기 MVP 방향` 뒤에 다음 섹션을 추가한다.

  ````markdown
  ## 첫 MVP 실행 방향

  첫 MVP는 `잔티젠` 샘플 데이터를 기준으로 HTML 가격 후보 탐색 리포트를 생성하는 방식입니다.

  ```powershell
  node scripts/generate-report.js
  ```

  생성되는 파일:

  ```text
  outputs/price-report.html
  ```

  자세한 설명은 [잔티젠 가격 후보 탐색 리포트 MVP](docs/mvp-report-generator.md)를 참고하세요.
  ````

## Task 7: 전체 검증과 커밋

**Files:**

- Inspect: `samples/products.json`
- Inspect: `scripts/generate-report.js`
- Inspect: `scripts/generate-report.test.js`
- Inspect: `skills/openprice-report/SKILL.md`
- Inspect: `docs/mvp-report-generator.md`
- Inspect: `README.md`
- Inspect: `.gitignore`
- Inspect: `outputs/.gitkeep`

- [ ] **Step 1: 테스트 실행**

  실행:

  ```powershell
  node scripts/generate-report.test.js
  ```

  기대 결과:

  ```text
  generate-report tests passed
  ```

- [ ] **Step 2: 리포트 생성 실행**

  실행:

  ```powershell
  node scripts/generate-report.js
  ```

  기대 결과:

  ```text
  HTML report written to outputs\price-report.html
  Groups: 3, items: 5
  ```

- [ ] **Step 3: 주요 HTML 문구 확인**

  실행:

  ```powershell
  Select-String -Path outputs\price-report.html -Pattern '잔티젠 가격 후보 탐색 리포트|대표 최저가|검토 필요|샘플 데이터 안내' -Encoding UTF8
  ```

  기대 결과:

  - 네 표현이 모두 검색 결과에 나타난다.

- [ ] **Step 4: 생성 HTML이 Git에서 제외되는지 확인**

  실행:

  ```powershell
  git check-ignore -v outputs\price-report.html
  ```

  기대 결과:

  - `.gitignore`의 `outputs/*.html` 규칙이 출력된다.

- [ ] **Step 5: Git 상태 확인**

  실행:

  ```powershell
  git status --short --branch
  ```

  기대 결과:

  - 새 소스, 샘플, 문서, Skill, `.gitignore`, `outputs/.gitkeep` 변경이 보인다.
  - `outputs/price-report.html`은 보이지 않는다.

- [ ] **Step 6: 커밋**

  실행:

  ```powershell
  git add samples/products.json scripts/generate-report.js scripts/generate-report.test.js skills/openprice-report/SKILL.md docs/mvp-report-generator.md README.md .gitignore outputs/.gitkeep
  git commit -m "feat: add xanthigen HTML report MVP"
  ```

  기대 결과:

  - 잔티젠 HTML 리포트 MVP 구현 커밋이 생성된다.

## 자체 점검

- 승인된 설계 문서의 핵심 범위를 모두 반영한다.
- 실제 쇼핑몰 크롤링은 추가하지 않는다.
- 외부 npm 패키지를 사용하지 않는다.
- Node.js 기본 기능만 사용한다.
- 같은 제품 후보 묶기, 최저가 대표 선택, 검토 필요 표시를 모두 검증한다.
- HTML 리포트는 생성 가능하지만 재생성 가능한 산출물이므로 기본 커밋 대상에서 제외한다.
- 문서는 한글 우선으로 작성한다.
