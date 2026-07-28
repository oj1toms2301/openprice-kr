# openprice-kr

국내 쇼핑 가격 비교를 더 투명하게 실험하기 위한 오픈소스 프로젝트입니다.

`openprice-kr`는 다나와, 네이버 가격비교 같은 기존 서비스만으로 부족할 수 있는 지점을 살펴보고, 가격 후보를 더 명확하게 비교하는 작은 도구를 목표로 합니다.

현재는 완성된 서비스가 아니라, 샘플 데이터로 정적 HTML 리포트를 생성하는 초기 MVP 단계입니다.

## 목표

- 여러 쇼핑몰의 가격 후보를 비교할 수 있는 구조를 만든다.
- 배송비를 포함한 최종 가격을 중요하게 다룬다.
- 가격 출처 링크를 함께 보여주는 방향을 우선한다.
- 데이터 수집 방식의 법적, 약관상 리스크를 문서로 먼저 정리한다.

## 현재 구현

현재 포함된 MVP는 `잔티젠`과 `비타민 D3` 샘플 데이터를 기준으로 가격 후보 탐색 리포트를 생성합니다.

리포트는 다음 정보를 보여줍니다.

- 배송비 포함 최종가
- 같은 제품으로 보이는 후보 묶기
- 대표 최저가 후보
- 1정 또는 1캡슐당 가격
- 하루 복용량 기준 비용
- 간단한 영양제 근거 요약
- 국내 기능성 원료 인정 여부
- 후기에서 자주 보이는 반응

아직 포함하지 않는 것:

- 실제 쇼핑몰 크롤링 코드
- 실제 상품 가격 데이터셋
- 웹 앱 또는 백엔드 서버
- 배포 설정

## 다음 개선 방향

다음 단계에서는 샘플 데이터에서 실제 사용 흐름으로 조금씩 확장합니다.

- 사용자가 직접 제공한 URL 후보 비교
- 공개 API 또는 허가된 데이터 출처 검토
- 이미지 기반 상품 매칭
- 영양제 카테고리 확장
- 리포트의 가독성과 검토 표시 개선

## 첫 MVP 실행 방향

첫 MVP는 영양제 샘플 데이터를 기준으로 HTML 가격 후보 탐색 리포트를 생성하는 방식입니다.

저장소 루트에서 실행합니다.

```powershell
node scripts/generate-report.js
```

생성되는 파일:

```text
outputs/price-report.html
```

비타민 D3 샘플 리포트는 다음처럼 생성합니다.

```powershell
node scripts/generate-report.js samples/vitamin-d3-products.json outputs/vitamin-d3-price-report.html
```

사용자가 직접 확인한 상품 URL 후보를 비교하려면 먼저 URL 후보 입력을 리포트 입력 형식으로 변환합니다.

```powershell
cd C:\vcoding-projects\openprice-kr
node scripts/convert-url-candidates.js samples/url-candidates.json outputs/url-candidates-products.json
node scripts/generate-report.js outputs/url-candidates-products.json outputs/url-candidates-report.html
```

사용하는 공개 요약 샘플 데이터:

```text
samples/products.json
samples/vitamin-d3-products.json
samples/url-candidates.json
samples/ingredients.json
```

자세한 설명은 [영양제 가격 후보 탐색 리포트 MVP](docs/mvp-report-generator.md)를 참고하세요.

## 데이터 수집 원칙

이 프로젝트는 초기 단계에서 무리한 대규모 크롤링을 목표로 하지 않습니다.

먼저 다음 방식을 검토합니다.

- 공개 API
- 사용자가 직접 제공한 URL
- 샘플 데이터
- 허가 또는 이용 조건이 명확한 출처
- 서비스 약관과 `robots.txt` 확인

자세한 내용은 [데이터 안전 원칙](docs/data-safety.md)을 참고하세요.

## 문서

- [프로젝트 방향](docs/vision.md)
- [데이터 안전 원칙](docs/data-safety.md)
- [영양제 근거자료 작성 원칙](docs/supplement-evidence.md)
- [영양제 가격 후보 탐색 리포트 MVP](docs/mvp-report-generator.md)
- [기여 안내](CONTRIBUTING.md)

## Codex Skill

이 저장소에는 선택적으로 사용할 수 있는 Codex Skill 문서가 포함되어 있습니다.

```text
skills/openprice-report/SKILL.md
```

이 문서는 Codex 앱에서 샘플 데이터 확인, 리포트 생성, 후보 묶기 검토를 도울 때 사용합니다. 일반 사용자는 README의 실행 방법만 따라도 됩니다.

## 라이선스

이 프로젝트는 MIT License를 사용할 예정입니다. 자세한 내용은 [LICENSE](LICENSE)를 참고하세요.
