const assert = require("node:assert/strict");
const {
  calculateTotalPrice,
  escapeHtml,
  groupItems,
  selectBestOffer,
  buildReportModel,
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
    needsReview: false,
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
    needsReview: false,
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
    needsReview: true,
  },
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
  items: sampleItems,
});
assert.equal(model.query, "잔티젠");
assert.equal(model.totalItems, 3);
assert.equal(model.groups.length, 2);
assert.equal(model.groups[0].bestOffer.id, "b");

console.log("generate-report tests passed");
