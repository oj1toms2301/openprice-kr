# 영양제 가격 후보 탐색 리포트 MVP

## 무엇을 보여주는가

이 MVP는 `잔티젠`과 `비타민 D3` 샘플을 기준으로, 여러 쇼핑몰에서 온 것처럼 구성한 후보를 한 HTML 리포트에서 비교합니다.

핵심은 단순히 가격표를 만드는 것이 아니라, 같은 제품으로 보이는 후보를 묶고 배송비 포함 최종가 기준으로 대표 최저가 후보를 보여주는 것입니다.

리포트는 가격 비교와 함께 간단한 영양제 근거 요약, 국내 기능성 원료 인정 여부, 1개당 가격, 하루 비용, 1정 또는 1캡슐당 주요 함량도 보여줍니다.

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

비타민 D3 샘플 리포트는 다음처럼 생성합니다.

```powershell
node scripts/generate-report.js samples/vitamin-d3-products.json outputs/vitamin-d3-price-report.html
```

실행 후 다음 파일이 생성됩니다.

```text
outputs/vitamin-d3-price-report.html
```

## 사용자가 직접 제공한 URL 후보 비교

자동 크롤링을 하기 전에는 사용자가 직접 확인한 상품 URL, 가격, 배송비를 입력 파일로 정리해서 비교할 수 있습니다.

저장소 루트에서 실행합니다.

```powershell
cd C:\vcoding-projects\openprice-kr
node scripts/convert-url-candidates.js samples/url-candidates.json outputs/url-candidates-products.json
node scripts/generate-report.js outputs/url-candidates-products.json outputs/url-candidates-report.html
```

생성되는 파일:

```text
outputs/url-candidates-products.json
outputs/url-candidates-report.html
```

`samples/url-candidates.json`은 실제 쇼핑몰 자동 수집 결과가 아닙니다. 사용자가 직접 확인한 상품명, 쇼핑몰, 가격, 배송비, URL을 기존 리포트 입력 형식으로 바꾸는 샘플입니다.

## 포함된 샘플

- `samples/products.json`: 잔티젠 샘플 상품 후보
- `samples/vitamin-d3-products.json`: 비타민 D3 샘플 상품 후보
- `samples/url-candidates.json`: 사용자가 직접 확인한 URL 후보 입력 샘플
- `samples/ingredients.json`: 영양제 원료별 간단한 효능/근거 요약

## 현재 한계

- 실제 쇼핑몰 자동 수집 결과가 아닙니다.
- 실시간 최저가를 보장하지 않습니다.
- 이미지 인식 모델은 아직 연결하지 않았습니다.
- 같은 제품 묶기는 샘플 데이터의 `groupKey`와 검토 필드에 기반합니다.
- 비타민 D3의 IU, mg 같은 함량 단위는 샘플 데이터에 직접 입력한 값을 표시합니다.
- 영양제 근거 요약은 의학적 조언이 아닙니다.
- 국내 기능성 원료 인정 여부는 공식 자료로 확인해야 합니다.
- 후기 반응은 개인 경험이며 효능 근거로 볼 수 없습니다.

## 다음 확장 방향

- 사용자가 제공한 URL 후보 추가
- 공개 API 기반 후보 수집
- 이미지 기반 상품 매칭
- GPT 비전 기능을 활용한 후보 검토
- 영양제 카테고리 확장
