# 초기 프로젝트 문서 작성 구현 계획

**Goal:** `openprice-kr`를 한국 사용자와 기여자가 이해하기 쉬운 문서 중심 오픈소스 저장소로 준비한다.

**Architecture:** 이번 단계는 실행 코드가 없는 문서 중심 구조다. 루트에는 첫 방문자가 보는 기본 문서를 두고, `docs/`에는 프로젝트 방향과 데이터 안전 원칙을 분리해서 둔다.

**Tech Stack:** Markdown, Git, UTF-8, MIT License text

---

## 파일 구조

이번 계획에서 만들거나 수정할 파일은 다음과 같다.

- 생성: `README.md`
  - 역할: GitHub 첫 화면에서 프로젝트 목적, 현재 단계, MVP 방향, 안전 원칙을 설명한다.
- 생성: `.gitignore`
  - 역할: 운영체제, 편집기, Node/Python 실험 과정에서 생길 수 있는 임시 파일을 Git에서 제외한다.
- 생성: `LICENSE`
  - 역할: MIT License 원문을 제공한다.
- 생성: `docs/vision.md`
  - 역할: 프로젝트의 문제의식, 대상 사용자, 초기 MVP 범위, 제외 범위를 설명한다.
- 생성: `docs/data-safety.md`
  - 역할: 가격 데이터 수집과 크롤링 관련 주의사항을 문서화한다.
- 수정하지 않음: 앱 코드, 크롤러 코드, 데이터베이스, 배포 설정

## Task 1: README 작성

**Files:**

- Create: `README.md`

- [ ] **Step 1: `README.md` 작성**

  다음 내용을 기준으로 `README.md`를 만든다.

  ```markdown
  # openprice-kr

  국내 쇼핑 가격 비교를 더 투명하게 실험하기 위한 오픈소스 프로젝트입니다.

  `openprice-kr`는 다나와, 네이버 가격비교 같은 기존 서비스만으로 부족할 수 있는 지점을 살펴보고, 가격 후보를 더 명확하게 비교하는 작은 도구를 목표로 합니다.

  현재는 완성된 서비스가 아니라 초기 MVP를 준비하는 단계입니다.

  ## 목표

  - 여러 쇼핑몰의 가격 후보를 비교할 수 있는 구조를 만든다.
  - 배송비를 포함한 최종 가격을 중요하게 다룬다.
  - 가격 출처 링크를 함께 보여주는 방향을 우선한다.
  - 데이터 수집 방식의 법적, 약관상 리스크를 문서로 먼저 정리한다.

  ## 현재 단계

  이 저장소는 아직 초기 문서화 단계입니다.

  아직 포함하지 않는 것:

  - 실제 쇼핑몰 크롤링 코드
  - 실제 상품 가격 데이터셋
  - 웹 앱 또는 백엔드 서버
  - 배포 설정

  ## 초기 MVP 방향

  첫 MVP는 다음 방향을 우선 검토합니다.

  - 상품명 또는 상품 후보 입력
  - 여러 가격 후보 비교
  - 배송비 포함 최종 가격 표시
  - 가격 출처 링크 표시
  - 샘플 데이터 또는 허가된 데이터 출처 기반 실험

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

  ## 라이선스

  이 프로젝트는 MIT License를 사용할 예정입니다. 자세한 내용은 [LICENSE](LICENSE)를 참고하세요.
  ```

- [ ] **Step 2: README 자체 점검**

  다음 표현이 없는지 확인한다.

  - 이미 완성된 서비스처럼 보이는 표현
  - 실제 크롤링이 이미 구현된 것처럼 보이는 표현
  - 특정 쇼핑몰 데이터를 허가 없이 수집한다고 보일 수 있는 표현

## Task 2: Git 제외 파일 설정

**Files:**

- Create: `.gitignore`

- [ ] **Step 1: `.gitignore` 작성**

  다음 내용을 사용한다.

  ```gitignore
  # OS files
  .DS_Store
  Thumbs.db
  desktop.ini

  # Editor files
  .vscode/
  .idea/
  *.swp
  *.swo

  # Logs
  *.log
  logs/

  # Environment files
  .env
  .env.*
  !.env.example

  # Node experiments
  node_modules/
  dist/
  build/
  .next/
  .vite/

  # Python experiments
  __pycache__/
  *.py[cod]
  .pytest_cache/
  .venv/
  venv/

  # Local outputs
  outputs/
  ```

- [ ] **Step 2: 제외 범위 확인**

  `.omx/`와 `.omc/`는 이번 계획에서 바로 제외하지 않는다. 이 둘은 프로젝트 작업 기록일 수 있으므로, 포함 여부를 나중에 따로 판단한다.

## Task 3: 라이선스 작성

**Files:**

- Create: `LICENSE`

- [ ] **Step 1: MIT License 작성**

  `LICENSE`에는 표준 MIT License 원문을 사용한다.

  ```text
  MIT License

  Copyright (c) 2026 openprice-kr contributors

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
  ```

- [ ] **Step 2: README와 라이선스 표현 맞추기**

  `README.md`의 라이선스 문장이 `LICENSE` 파일과 맞는지 확인한다.

## Task 4: 프로젝트 방향 문서 작성

**Files:**

- Create: `docs/vision.md`

- [ ] **Step 1: `docs/vision.md` 작성**

  다음 구조로 작성한다.

  ```markdown
  # 프로젝트 방향

  ## 왜 만드는가

  국내 쇼핑 가격 비교는 이미 여러 서비스가 있지만, 사용자가 원하는 방식으로 가격 후보와 조건을 투명하게 비교하기 어려운 경우가 있습니다.

  `openprice-kr`는 이런 문제를 오픈소스 방식으로 작게 실험합니다.

  ## 해결하고 싶은 문제

  - 배송비 포함 최종 가격이 한눈에 보이지 않는 문제
  - 가격 출처와 비교 기준이 불명확한 문제
  - 특정 서비스 화면 안에서만 비교가 가능한 문제
  - 사용자가 직접 검증하거나 확장하기 어려운 문제

  ## 초기 대상 사용자

  - 국내 온라인 쇼핑 가격을 더 꼼꼼히 비교하고 싶은 사용자
  - 가격 비교 흐름을 직접 실험해보고 싶은 개발자
  - 오픈소스 기여 이력으로 발전시킬 수 있는 작은 프로젝트를 찾는 사람

  ## 초기 MVP 범위

  첫 MVP는 다음 기능을 우선 검토합니다.

  - 상품 후보 입력
  - 가격 후보 목록 정리
  - 배송비 포함 최종 가격 계산
  - 가격 출처 링크 보관
  - 샘플 데이터 기반 비교 결과 출력

  ## 이번 단계에서 제외하는 것

  - 대규모 쇼핑몰 크롤링
  - 실시간 가격 보장
  - 결제, 주문, 회원 기능
  - 가격 알림 기능
  - 운영 서비스 수준의 배포

  ## 다음 결정

  다음 단계에서는 첫 데모 형태를 정해야 합니다.

  후보:

  - CLI 도구
  - 간단한 웹 화면
  - 정적 리포트 생성기
  ```

- [ ] **Step 2: README와 방향 일치 확인**

  `README.md`의 목표, 현재 단계, MVP 방향이 `docs/vision.md`와 충돌하지 않는지 확인한다.

## Task 5: 데이터 안전 문서 작성

**Files:**

- Create: `docs/data-safety.md`

- [ ] **Step 1: `docs/data-safety.md` 작성**

  다음 구조로 작성한다.

  ```markdown
  # 데이터 안전 원칙

  ## 기본 입장

  `openprice-kr`는 가격 비교를 목표로 하지만, 초기 단계에서 무리한 대규모 크롤링을 전제로 하지 않습니다.

  가격 데이터는 쇼핑몰의 약관, `robots.txt`, 저작권, 트래픽 부담, 데이터 재사용 조건과 관련될 수 있습니다.

  ## 우선 검토할 데이터 출처

  - 공개 API
  - 사용자가 직접 제공한 URL
  - 직접 만든 샘플 데이터
  - 사용 조건이 명확한 공개 데이터
  - 허가를 받은 데이터 출처

  ## 조심해야 할 방식

  - 로그인 뒤에만 볼 수 있는 정보를 자동 수집하는 방식
  - 약관에서 금지한 자동화 수집
  - 짧은 시간에 많은 요청을 보내는 방식
  - 출처 표시 없이 가격 데이터를 재배포하는 방식
  - 개인정보나 주문 정보를 다루는 방식

  ## 초기 구현 원칙

  첫 구현은 가능하면 샘플 데이터나 사용자가 직접 입력한 데이터로 시작합니다.

  실제 외부 사이트와 연결하기 전에는 다음을 확인합니다.

  - 해당 사이트의 이용약관
  - `robots.txt`
  - 공개 API 제공 여부
  - 요청 빈도 제한
  - 출처 표시 방식

  ## 아직 법률 자문이 아님

  이 문서는 개발 방향을 정리한 문서이며 법률 자문이 아닙니다. 실제 서비스 운영이나 대규모 데이터 수집 전에는 별도의 검토가 필요합니다.
  ```

- [ ] **Step 2: 과한 약속 제거 확인**

  다음 표현이 없는지 확인한다.

  - 모든 쇼핑몰을 수집한다
  - 실시간 최저가를 보장한다
  - 약관 문제 없이 수집할 수 있다

## Task 6: 전체 검증

**Files:**

- Inspect: `README.md`
- Inspect: `.gitignore`
- Inspect: `LICENSE`
- Inspect: `docs/vision.md`
- Inspect: `docs/data-safety.md`

- [ ] **Step 1: 파일 존재 확인**

  실행:

  ```powershell
  Get-ChildItem -Force
  Get-ChildItem -Path docs -Force
  ```

  기대 결과:

  - 루트에 `README.md`, `.gitignore`, `LICENSE`가 있다.
  - `docs/`에 `vision.md`, `data-safety.md`가 있다.

- [ ] **Step 2: 빈칸 표시 확인**

  실행:

  ```powershell
  Select-String -Path README.md,docs\vision.md,docs\data-safety.md -Pattern 'TBD|TODO|FIXME|\?\?' -Encoding UTF8
  ```

  기대 결과:

  - 출력이 없어야 한다.

- [ ] **Step 3: Git 변경 확인**

  실행:

  ```powershell
  git status --short --branch
  ```

  기대 결과:

  - 새 문서 파일들이 변경 목록에 보인다.
  - 앱 코드나 크롤링 코드는 추가되지 않는다.

- [ ] **Step 4: 커밋**

  실행:

  ```powershell
  git add README.md .gitignore LICENSE docs/vision.md docs/data-safety.md AGENTS.md docs/specs/2026-06-01-initial-project-docs-design.md docs/plans/2026-06-01-initial-project-docs.md
  git commit -m "docs: add initial Korean project documentation"
  ```

  기대 결과:

  - 초기 한글 문서와 한글 문서 작성 규칙이 커밋된다.

## 자체 점검

- 설계 문서의 범위를 모두 포함한다.
- 실행 코드, 크롤링 코드, 데이터베이스, 배포 설정은 추가하지 않는다.
- 문서는 한글 우선으로 작성한다.
- 영어가 필요한 부분은 라이선스 원문, 파일명, 명령어, 개발자 용어로 제한한다.
- `TBD`, `TODO`, `FIXME`, `??` 같은 빈칸 표시는 남기지 않는다.
