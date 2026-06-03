const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  buildReportModel,
  calculateDailyCost,
  calculateDaysCovered,
  calculateTotalPrice,
  calculateUnitPrice,
  escapeHtml,
  groupItems,
  renderHtml,
  selectBestOffer,
  validateIngredients,
} = require("./generate-report");

const sampleItems = [
  {
    id: "a",
    query: "잔티젠",
    source: "A몰",
    productName: "잔티젠 30캡슐",
    brand: "Xanthigen",
    ingredientId: "xanthigen",
    price: 30000,
    shippingFee: 3000,
    currency: "KRW",
    url: "https://example.com/a",
    imageUrl: "https://placehold.co/120x120?text=A",
    packageSize: "30캡슐",
    unitType: "캡슐",
    unitCount: 30,
    dailyServingCount: 2,
    activeIngredientLabel: "1캡슐당 잔티젠 600mg",
    groupKey: "xanthigen-30caps",
    matchConfidence: 0.9,
    matchReason: "30캡슐",
    needsReview: false,
  },
  {
    id: "b",
    query: "잔티젠",
    source: "B몰",
    productName: "잔티젠 30캡슐",
    brand: "Xanthigen",
    ingredientId: "xanthigen",
    price: 28000,
    shippingFee: 2500,
    currency: "KRW",
    url: "https://example.com/b",
    imageUrl: "https://placehold.co/120x120?text=B",
    packageSize: "30캡슐",
    unitType: "캡슐",
    unitCount: 30,
    dailyServingCount: 2,
    groupKey: "xanthigen-30caps",
    matchConfidence: 0.89,
    matchReason: "30캡슐",
    needsReview: false,
  },
  {
    id: "c",
    query: "잔티젠",
    source: "C몰",
    productName: "잔티젠 유사 제품",
    brand: "Unknown",
    ingredientId: "xanthigen",
    price: 19000,
    shippingFee: 3000,
    currency: "KRW",
    url: "https://example.com/c",
    imageUrl: "https://placehold.co/120x120?text=C",
    packageSize: "30정",
    unitType: "정",
    unitCount: 30,
    dailyServingCount: 2,
    groupKey: "review-needed",
    matchConfidence: 0.5,
    matchReason: "브랜드 불명확",
    needsReview: true,
  },
];

const sampleIngredient = {
  ingredientId: "xanthigen",
  nameKo: "잔티젠",
  nameEn: "Xanthigen",
  summary: "잔티젠 가격 비교 샘플에서 사용하는 원료 설명입니다.",
  functionalIngredientStatus: "needs_review",
  functionalIngredientStatusLabel: "확인 필요",
  functionalIngredientNote: "공식 자료 확인이 필요한 샘플 원료입니다.",
  regulatoryStatus: {
    krMfds: {
      title: "한국 식약처",
      label: "국내 기능성 원료 인정 여부 확인 필요",
      explanation:
        "한국 건강기능식품에서 기능성 표시가 공식 인정됐는지 보는 기준입니다.",
      note: "공식 자료 확인이 필요한 샘플 원료입니다.",
      sources: ["식약처 기능성 원료 자료"],
    },
    usFda: {
      title: "미국 FDA",
      label: "FDA 승인 건강표시 확인 필요",
      defaultVisible: false,
      consumerQuestion: "FDA에 효능 근거가 있다는 뜻인가요?",
      consumerAnswer: "아닙니다. FDA는 일반 영양제를 약처럼 사전 승인하지 않습니다.",
      buyerValue: "FDA 승인이라는 표현을 과하게 믿지 않도록 도와줍니다.",
      explanation:
        "미국 FDA는 일반 영양제를 의약품처럼 사전 승인하지 않으며, 여기서는 건강표시 유형을 확인합니다.",
      note: "Authorized Health Claim 또는 Qualified Health Claim 해당 여부를 확인합니다.",
      sources: ["FDA Authorized Health Claims", "FDA Qualified Health Claims"],
    },
    nihOds: {
      title: "미국 NIH ODS",
      label: "원료별 공공 자료 확인 필요",
      explanation:
        "미국 국립보건원 산하 영양제 정보 자료로, 성분별 Fact Sheet가 있으면 근거 요약에 참고합니다.",
      note: "원료별 Fact Sheet 존재 여부를 확인합니다.",
      sources: ["NIH ODS Fact Sheets"],
    },
    usFtc: {
      title: "미국 FTC",
      label: "광고 표현 근거 확인 필요",
      defaultVisible: false,
      explanation:
        "미국 광고 규제 기관 기준으로, 효능을 강하게 주장하는 광고가 충분한 근거를 갖췄는지 봅니다.",
      note: "체중감량 효과를 단정하는 광고 표현은 별도 근거 확인이 필요합니다.",
      sources: ["FTC Health Products Compliance Guidance"],
    },
  },
  claims: [
    {
      claim: "체지방 감소 관련",
      evidenceLevel: "검토 필요",
      summary: "효능을 단정하지 않고 근거 확인이 필요한 항목으로 표시합니다.",
    },
  ],
  priorityCautions: ["질환, 임신, 수유, 약물 복용 중이면 먼저 전문가 상담이 필요합니다."],
  cautions: ["개인 상태에 따라 전문가 상담이 필요할 수 있습니다."],
  reviewSummary: {
    title: "후기에서 자주 보이는 반응",
    summary: "복용 편의성과 개인별 체감 차이가 함께 언급됩니다.",
    caution: "후기는 개인 경험이므로 효능 근거로 해석하지 않습니다.",
  },
  references: [
    {
      title: "공식 기능성 원료 자료 확인 예정",
      source: "공식 자료",
      url: "https://example.com/reference-placeholder",
      note: "실제 공개 전 공식 출처로 교체합니다.",
    },
  ],
};

assert.equal(calculateTotalPrice({ price: 28000, shippingFee: 2500 }), 30500);
assert.equal(calculateUnitPrice({ totalPrice: 30000, unitCount: 30 }), 1000);
assert.equal(calculateDailyCost({ unitPrice: 1000, dailyServingCount: 2 }), 2000);
assert.equal(calculateDaysCovered({ unitCount: 30, dailyServingCount: 2 }), 15);
assert.equal(calculateUnitPrice({ totalPrice: 30000, unitCount: 0 }), null);
assert.equal(calculateDailyCost({ unitPrice: null, dailyServingCount: 2 }), null);
assert.equal(calculateDaysCovered({ unitCount: 30, dailyServingCount: 0 }), null);
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
assert.equal(bestOffer.unitPrice, 1017);
assert.equal(bestOffer.dailyCost, 2034);
assert.equal(bestOffer.daysCovered, 15);

const model = buildReportModel({
  query: "잔티젠",
  notice: "샘플 데이터",
  evidenceSchemaVersion: "supplement-evidence-v1",
  items: sampleItems,
  ingredients: [sampleIngredient],
});
assert.equal(model.query, "잔티젠");
assert.equal(model.evidenceSchemaVersion, "supplement-evidence-v1");
assert.equal(model.totalItems, 3);
assert.equal(model.groups.length, 2);
assert.equal(model.groups[0].bestOffer.id, "b");
assert.equal(model.ingredient.nameKo, "잔티젠");
assert.equal(model.ingredient.functionalIngredientStatusLabel, "확인 필요");
assert.equal(model.ingredient.claims[0].claim, "체지방 감소 관련");
assert.equal(model.ingredient.reviewSummary.title, "후기에서 자주 보이는 반응");
assert.equal(model.ingredient.regulatoryStatus.usFda.title, "미국 FDA");

assert.deepEqual(validateIngredients([sampleIngredient]), []);
assert.throws(
  () =>
    buildReportModel({
      query: "잔티젠",
      items: sampleItems,
      ingredients: [
        {
          ingredientId: "broken",
          nameKo: "깨진 샘플",
        },
      ],
    }),
  /ingredients\[0\]\.summary is required/,
);

const html = renderHtml(model);
assert.match(html, /영양제 근거 요약/);
assert.match(html, /근거자료 스키마 v1/);
assert.match(html, /supplement-evidence-v1/);
assert.match(html, /의료 조언이 아님/);
assert.match(html, /국내 기능성 원료 인정 여부/);
assert.match(html, /공식 기준 확인 결과/);
assert.match(html, /한국 식약처/);
assert.match(html, /한국 건강기능식품에서 기능성 표시가 공식 인정됐는지 보는 기준입니다/);
assert.doesNotMatch(html, /미국 FDA/);
assert.doesNotMatch(html, /FDA에 효능 근거가 있다는 뜻인가요/);
assert.match(html, /미국 NIH ODS/);
assert.match(html, /성분별 Fact Sheet가 있으면 근거 요약에 참고합니다/);
assert.doesNotMatch(html, /미국 FTC/);
assert.match(html, /먼저 확인할 주의사항/);
assert.match(html, /질환, 임신, 수유, 약물 복용 중이면 먼저 전문가 상담이 필요합니다/);
assert.match(html, /후기에서 자주 보이는 반응/);
assert.match(html, /하루 비용/);
assert.match(html, /1캡슐당/);
assert.match(html, /주요 함량/);
assert.match(html, /1캡슐당 잔티젠 600mg/);
assert.doesNotMatch(html, /외부 상세 문서/);

const sampleRoot = path.join(__dirname, "..", "samples");
const ingredientData = JSON.parse(
  fs.readFileSync(path.join(sampleRoot, "ingredients.json"), "utf8"),
);
const vitaminD3Data = JSON.parse(
  fs.readFileSync(path.join(sampleRoot, "vitamin-d3-products.json"), "utf8"),
);
const vitaminD3Model = buildReportModel({
  ...vitaminD3Data,
  evidenceSchemaVersion: ingredientData.evidenceSchemaVersion,
  ingredients: ingredientData.ingredients,
});
const vitaminD3Html = renderHtml(vitaminD3Model);
const xanthigenModel = buildReportModel({
  query: "잔티젠",
  notice: "샘플 데이터",
  evidenceSchemaVersion: ingredientData.evidenceSchemaVersion,
  items: sampleItems,
  ingredients: ingredientData.ingredients,
});
const xanthigenHtml = renderHtml(xanthigenModel);
assert.deepEqual(validateIngredients(ingredientData.ingredients), []);
assert.equal(xanthigenModel.ingredient.ingredientId, "xanthigen");
assert.match(xanthigenHtml, /미역 등 복합추출물\(잔티젠\)/);
assert.match(xanthigenHtml, /제2013-10호/);
assert.match(xanthigenHtml, /체지방 감소에 도움을 줄 수 있음/);
assert.match(xanthigenHtml, /생리활성기능 2등급/);
assert.match(xanthigenHtml, /600 mg\/일/);
assert.match(xanthigenHtml, /임산부 및 수유부/);
assert.match(xanthigenHtml, /석류에 알레르기가 있는 사람/);
assert.match(xanthigenHtml, /에스트로겐 호르몬에 민감한 사람/);
assert.doesNotMatch(xanthigenHtml, /미국 NIH ODS/);
assert.doesNotMatch(xanthigenHtml, /체지방 감소 효과/);
assert.equal(vitaminD3Model.ingredient.ingredientId, "vitamin-d3");
assert.equal(vitaminD3Model.groups.length, 3);
assert.match(vitaminD3Html, /비타민 D3 가격 후보 탐색 리포트/);
assert.match(vitaminD3Html, /1정당 비타민 D3 2,000 IU/);
assert.match(vitaminD3Html, /식약처 기능성 내용 확인/);
assert.match(vitaminD3Html, /칼슘과 인이 흡수되고 이용되는데 필요/);
assert.match(vitaminD3Html, /뼈의 형성과 유지에 필요/);
assert.match(vitaminD3Html, /골다공증 발생 위험 감소에 도움을 줌/);
assert.match(vitaminD3Html, /비타민 D 공공 자료 확인됨/);
assert.match(vitaminD3Html, /먼저 확인할 주의사항/);
assert.match(vitaminD3Html, /고칼슘혈증/);
assert.match(vitaminD3Html, /신장 질환/);
assert.doesNotMatch(vitaminD3Html, /FDA에 효능 근거가 있다는 뜻인가요/);
assert.doesNotMatch(vitaminD3Html, /미국 FTC/);
assert.match(vitaminD3Html, /NIH ODS Vitamin D Fact Sheet/);

console.log("generate-report tests passed");
