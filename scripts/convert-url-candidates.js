const fs = require("node:fs");
const path = require("node:path");

function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function isFiniteNumber(value) {
  return Number.isFinite(Number(value));
}

function validateUrlCandidates(data) {
  const errors = [];

  if (!data || typeof data !== "object") {
    return ["input must be an object"];
  }

  if (!hasValue(data.query)) {
    errors.push("query is required");
  }

  if (!Array.isArray(data.candidates) || data.candidates.length === 0) {
    errors.push("candidates must include at least one candidate");
    return errors;
  }

  data.candidates.forEach((candidate, index) => {
    for (const field of [
      "candidateId",
      "mallName",
      "productName",
      "productUrl",
      "packageSize",
      "unitType",
      "groupKey",
      "matchReason",
    ]) {
      if (!hasValue(candidate?.[field])) {
        errors.push(`candidates[${index}].${field} is required`);
      }
    }

    for (const field of ["price", "shippingFee", "unitCount", "dailyServingCount"]) {
      if (!isFiniteNumber(candidate?.[field])) {
        errors.push(`candidates[${index}].${field} must be a finite number`);
      }
    }

    if (
      hasValue(candidate?.productUrl) &&
      !/^https?:\/\//.test(String(candidate.productUrl))
    ) {
      errors.push(`candidates[${index}].productUrl must start with http:// or https://`);
    }

    if (
      hasValue(candidate?.productImageUrl) &&
      !/^https?:\/\//.test(String(candidate.productImageUrl))
    ) {
      errors.push(
        `candidates[${index}].productImageUrl must start with http:// or https://`,
      );
    }
  });

  return errors;
}

function convertUrlCandidates(data) {
  const errors = validateUrlCandidates(data);
  if (errors.length > 0) {
    throw new Error(errors.join("; "));
  }

  const query = data.query;
  const noticeParts = [
    data.notice || "사용자가 직접 제공한 URL 후보입니다.",
    "자동 크롤링 결과가 아닙니다. 가격과 배송비는 사용자가 확인한 시점의 값입니다.",
  ];

  return {
    query,
    notice: noticeParts.join(" "),
    items: data.candidates.map((candidate) => ({
      id: candidate.candidateId,
      query,
      source: candidate.mallName,
      productName: candidate.productName,
      brand: candidate.brand || "",
      ingredientId: candidate.ingredientId || "",
      price: Number(candidate.price),
      shippingFee: Number(candidate.shippingFee),
      currency: candidate.currency || "KRW",
      url: candidate.productUrl,
      imageUrl:
        candidate.productImageUrl ||
        `https://placehold.co/120x120?text=${encodeURIComponent(candidate.mallName)}`,
      packageSize: candidate.packageSize,
      unitType: candidate.unitType,
      unitCount: Number(candidate.unitCount),
      dailyServingCount: Number(candidate.dailyServingCount),
      activeIngredientLabel: candidate.activeIngredientLabel || "",
      groupKey: candidate.groupKey,
      matchConfidence:
        candidate.matchConfidence == null ? 0.5 : Number(candidate.matchConfidence),
      matchReason: candidate.matchReason,
      needsReview: candidate.needsReview !== false,
    })),
  };
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeConvertedReportInput({
  inputPath = path.join("samples", "url-candidates.json"),
  outputPath = path.join("outputs", "url-candidates-products.json"),
} = {}) {
  const raw = fs.readFileSync(inputPath, "utf8");
  const data = JSON.parse(raw);
  const converted = convertUrlCandidates(data);

  ensureDirectory(path.dirname(outputPath));
  fs.writeFileSync(outputPath, `${JSON.stringify(converted, null, 2)}\n`, "utf8");

  return { outputPath, model: converted };
}

if (require.main === module) {
  const inputPath = process.argv[2] || path.join("samples", "url-candidates.json");
  const outputPath =
    process.argv[3] || path.join("outputs", "url-candidates-products.json");
  const result = writeConvertedReportInput({ inputPath, outputPath });
  console.log(`URL candidate input written to ${result.outputPath}`);
  console.log(`Items: ${result.model.items.length}`);
}

module.exports = {
  convertUrlCandidates,
  validateUrlCandidates,
  writeConvertedReportInput,
};
