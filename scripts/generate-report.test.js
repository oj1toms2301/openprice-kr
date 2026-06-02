const assert = require("node:assert/strict");
const {
  buildReportModel,
  calculateDailyCost,
  calculateDaysCovered,
  calculateTotalPrice,
  calculateUnitPrice,
  escapeHtml,
  groupItems,
  selectBestOffer,
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
  claims: [
    {
      claim: "체지방 감소 관련",
      evidenceLevel: "검토 필요",
      summary: "효능을 단정하지 않고 근거 확인이 필요한 항목으로 표시합니다.",
    },
  ],
  cautions: ["개인 상태에 따라 전문가 상담이 필요할 수 있습니다."],
  reviewSummary: {
    title: "후기에서 자주 보이는 반응",
    summary: "복용 편의성과 개인별 체감 차이가 함께 언급됩니다.",
    caution: "후기는 개인 경험이므로 효능 근거로 해석하지 않습니다.",
  },
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
  items: sampleItems,
  ingredients: [sampleIngredient],
});
assert.equal(model.query, "잔티젠");
assert.equal(model.totalItems, 3);
assert.equal(model.groups.length, 2);
assert.equal(model.groups[0].bestOffer.id, "b");
assert.equal(model.ingredient.nameKo, "잔티젠");
assert.equal(model.ingredient.functionalIngredientStatusLabel, "확인 필요");
assert.equal(model.ingredient.claims[0].claim, "체지방 감소 관련");
assert.equal(model.ingredient.reviewSummary.title, "후기에서 자주 보이는 반응");

console.log("generate-report tests passed");
