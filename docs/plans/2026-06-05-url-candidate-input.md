# 사용자 제공 URL 후보 입력 Implementation Plan

**Goal:** 사용자가 직접 찾은 상품 URL 후보를 기존 가격 후보 리포트 입력으로 변환할 수 있게 한다.

**Architecture:** 자동 크롤링은 하지 않는다. 별도 입력 파일에 사용자가 확인한 상품명, 쇼핑몰, 가격, 배송비, URL을 넣고, 작은 변환 스크립트가 기존 `items` 형식으로 바꾼다. 기존 HTML 리포트 생성기는 그대로 재사용한다.

**Tech Stack:** Node.js 기본 모듈, JSON 샘플 데이터, 기존 정적 HTML 리포트 생성기.

---

## 파일 구조

이번 계획에서 만들거나 수정할 파일은 다음과 같다.

- `samples/url-candidates.json`: 사용자가 직접 제공한 URL 후보 샘플
- `scripts/convert-url-candidates.js`: URL 후보 입력을 기존 리포트 입력 JSON으로 변환
- `scripts/convert-url-candidates.test.js`: 변환 검증 테스트
- `.gitignore`: `outputs/*.json` 변환 산출물을 저장소에서 제외
- `docs/mvp-report-generator.md`: 사용 방법 문서 업데이트
- `README.md`: 실행 예시 업데이트

이번 계획에서 하지 않는 것:

- 실제 쇼핑몰 자동 크롤링
- 로그인 필요한 가격 수집
- 외부 npm 패키지 설치
- 실시간 최저가 보장
- 이미지 인식 기반 상품 매칭

## Task 1: URL 후보 입력 스키마와 변환 스크립트

- [x] **Step 1: 실패 테스트 작성**

`scripts/convert-url-candidates.test.js`에 다음 동작을 검증한다.

- 입력 `query`, `notice`, `candidates`를 읽는다.
- 각 후보를 기존 리포트의 `items` 배열 형식으로 바꾼다.
- `price`, `shippingFee`, `unitCount`, `dailyServingCount`가 숫자가 아니면 오류를 낸다.
- URL은 `http://` 또는 `https://`만 허용한다.

- [x] **Step 2: 실패 확인**

```powershell
node scripts/convert-url-candidates.test.js
```

예상: `Cannot find module './convert-url-candidates'` 또는 함수 없음 오류.

- [x] **Step 3: 최소 구현**

`scripts/convert-url-candidates.js`를 만든다.

필수 공개 함수:

- `convertUrlCandidates(data)`
- `validateUrlCandidates(data)`
- `writeConvertedReportInput({ inputPath, outputPath })`

- [x] **Step 4: 통과 확인**

```powershell
node scripts/convert-url-candidates.test.js
```

예상: `convert-url-candidates tests passed`

## Task 2: 샘플 입력과 리포트 연결

- [x] **Step 1: 샘플 입력 추가**

`samples/url-candidates.json`에 잔티젠 URL 후보 예시를 넣는다. 실제 쇼핑몰 자동 수집 결과가 아니라 사용자가 직접 확인한 값이라는 안내를 포함한다.

- [x] **Step 2: 변환 실행**

```powershell
node scripts/convert-url-candidates.js samples/url-candidates.json outputs/url-candidates-products.json
```

예상: 기존 리포트 생성기가 읽을 수 있는 JSON 파일이 만들어진다.

- [x] **Step 3: HTML 생성**

```powershell
node scripts/generate-report.js outputs/url-candidates-products.json outputs/url-candidates-report.html
```

예상: URL 후보 기반 HTML 리포트가 만들어진다.

## Task 3: 문서와 최종 검증

- [x] **Step 1: README와 MVP 문서 업데이트**

사용자가 실행할 경로를 포함해 PowerShell 명령어를 적는다.

- [x] **Step 2: 전체 검증**

```powershell
node --check scripts/convert-url-candidates.js
node --check scripts/convert-url-candidates.test.js
node scripts/convert-url-candidates.test.js
node scripts/generate-report.test.js
node scripts/convert-url-candidates.js samples/url-candidates.json outputs/url-candidates-products.json
node scripts/generate-report.js outputs/url-candidates-products.json outputs/url-candidates-report.html
```

예상: 모든 명령이 오류 없이 끝난다.
