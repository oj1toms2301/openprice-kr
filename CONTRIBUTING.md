# 기여 안내

`openprice-kr`에 관심을 가져주셔서 감사합니다.

이 프로젝트는 아직 초기 MVP 단계입니다. 작은 문서 개선, 샘플 데이터 정리, 리포트 생성기 개선처럼 검토하기 쉬운 변경을 환영합니다.

## 작업 전 확인

먼저 저장소 루트에서 현재 상태를 확인합니다.

```powershell
git status --short --branch
```

여러 파일을 바꾸는 작업은 별도 브랜치에서 진행하는 것을 권장합니다.

```powershell
git checkout -b my-change
```

## 테스트

외부 패키지 설치 없이 Node.js 기본 기능으로 테스트할 수 있습니다.

```powershell
node scripts/generate-report.test.js
```

리포트 생성은 다음 명령으로 확인합니다.

```powershell
node scripts/generate-report.js
```

생성 결과:

```text
outputs/price-report.html
```

## 샘플 데이터

가격 후보 샘플은 다음 파일에 있습니다.

```text
samples/products.json
```

영양제 성분 요약 샘플은 다음 파일에 있습니다.

```text
samples/ingredients.json
```

샘플 데이터는 실제 실시간 최저가가 아닙니다. 리포트 구조를 검증하기 위한 예시 데이터입니다.

## 데이터 안전

실제 쇼핑몰 자동 수집 코드를 추가하기 전에는 먼저 이 문서를 확인해 주세요.

```text
docs/data-safety.md
```

특히 다음 정보는 저장소에 넣지 않습니다.

- 로그인 뒤에만 볼 수 있는 정보
- 개인정보, 주문 정보, 회원 정보
- 출처나 사용 조건이 불명확한 대량 가격 데이터
- 긴 리뷰 원문, 닉네임, 사진 등 개인 식별 가능 정보

## Pull Request

Pull Request에는 다음을 적어 주세요.

- 무엇을 바꿨는지
- 왜 바꿨는지
- 어떤 명령으로 확인했는지

예시:

```text
검증:
- node scripts/generate-report.test.js
- node scripts/generate-report.js
```
