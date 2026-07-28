const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  convertUrlCandidates,
  validateUrlCandidates,
  writeConvertedReportInput,
} = require("./convert-url-candidates");

const sampleInput = {
  query: "잔티젠",
  notice: "사용자가 직접 확인한 URL 후보입니다.",
  candidates: [
    {
      candidateId: "wisely-xanthigen-001",
      mallName: "와이즐리",
      productName: "잔티젠 30캡슐",
      brand: "Xanthigen",
      ingredientId: "xanthigen",
      price: 24900,
      shippingFee: 0,
      productUrl: "https://example.com/wisely/xanthigen",
      productImageUrl: "https://placehold.co/120x120?text=Wisely",
      packageSize: "30캡슐",
      unitType: "캡슐",
      unitCount: 30,
      dailyServingCount: 2,
      activeIngredientLabel: "1캡슐당 잔티젠 600mg",
      groupKey: "xanthigen-30caps",
      matchConfidence: 0.82,
      matchReason: "사용자 제공 URL 후보, 상품명과 규격이 일치합니다.",
      needsReview: true,
    },
  ],
};

assert.deepEqual(validateUrlCandidates(sampleInput), []);

const converted = convertUrlCandidates(sampleInput);
assert.equal(converted.query, "잔티젠");
assert.match(converted.notice, /사용자가 직접 확인한 URL 후보/);
assert.match(converted.notice, /자동 크롤링 결과가 아닙니다/);
assert.equal(converted.items.length, 1);
assert.deepEqual(converted.items[0], {
  id: "wisely-xanthigen-001",
  query: "잔티젠",
  source: "와이즐리",
  productName: "잔티젠 30캡슐",
  brand: "Xanthigen",
  ingredientId: "xanthigen",
  price: 24900,
  shippingFee: 0,
  currency: "KRW",
  url: "https://example.com/wisely/xanthigen",
  imageUrl: "https://placehold.co/120x120?text=Wisely",
  packageSize: "30캡슐",
  unitType: "캡슐",
  unitCount: 30,
  dailyServingCount: 2,
  activeIngredientLabel: "1캡슐당 잔티젠 600mg",
  groupKey: "xanthigen-30caps",
  matchConfidence: 0.82,
  matchReason: "사용자 제공 URL 후보, 상품명과 규격이 일치합니다.",
  needsReview: true,
});

assert.deepEqual(
  validateUrlCandidates({
    query: "잔티젠",
    candidates: [
      {
        ...sampleInput.candidates[0],
        productUrl: "javascript:alert(1)",
      },
    ],
  }),
  ["candidates[0].productUrl must start with http:// or https://"],
);

assert.deepEqual(
  validateUrlCandidates({
    query: "잔티젠",
    candidates: [
      {
        ...sampleInput.candidates[0],
        price: "비공개",
      },
    ],
  }),
  ["candidates[0].price must be a finite number"],
);

assert.deepEqual(
  validateUrlCandidates({
    query: "잔티젠",
    candidates: [],
  }),
  ["candidates must include at least one candidate"],
);

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "openprice-url-candidates-"));
const inputPath = path.join(tmpDir, "url-candidates.json");
const outputPath = path.join(tmpDir, "products.json");
fs.writeFileSync(inputPath, JSON.stringify(sampleInput, null, 2), "utf8");
const result = writeConvertedReportInput({ inputPath, outputPath });
const written = JSON.parse(fs.readFileSync(outputPath, "utf8"));
assert.equal(result.outputPath, outputPath);
assert.equal(written.items[0].source, "와이즐리");
assert.equal(written.items[0].url, "https://example.com/wisely/xanthigen");

console.log("convert-url-candidates tests passed");
