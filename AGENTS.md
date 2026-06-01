# AGENTS.md - openprice-kr

## 사용자 설명 방식
나는 비개발자다. 설명할 때는 쉬운 한국어로 먼저 설명하고, 필요한 개발자 용어를 옆에 함께 표시한다.

예시:
- 쉬운 말: GitHub에 올릴 프로젝트 폴더
- 개발자 용어: repository root

## 프로젝트 목표
`openprice-kr`는 국내 쇼핑몰 최저가 비교 오픈소스 프로젝트다.
다나와/네이버 가격비교만으로 부족한 부분을 보완하는 실용적인 가격 비교 도구를 목표로 한다.

초기 목표는 완성 제품보다, GitHub에 공개 가능한 작고 명확한 MVP를 만드는 것이다.

## 문서 작성 언어
이 프로젝트의 문서는 기본적으로 한글로 작성한다.

이유:
- 사용자가 직접 검토하기 쉬워야 한다.
- 한국 사람을 대상으로 한 저장소다.
- README, 기획 문서, 설계 문서, 데이터 안전 문서는 한글을 우선한다.

예외:
- 코드, 설정 키, 명령어, 파일명, 라이선스 원문처럼 영어가 관례이거나 도구가 요구하는 부분은 영어를 사용할 수 있다.
- 필요하면 한글 설명 옆에 개발자 용어를 영어로 함께 적는다.

## Codex 작업 방식
이 프로젝트에서는 Codex를 메인 개발 도구로 사용한다.
OMX와 Superpowers를 함께 사용해 체계적으로 개발한다.

기본 원칙:
- 바로 코딩하지 말고, 먼저 목표와 범위를 짧게 확인한다.
- 큰 작업은 계획을 먼저 세운다.
- 구현 후에는 실제로 실행하거나 테스트해서 확인한다.
- 완료 보고에는 무엇을 했고, 무엇을 검증했고, 남은 일이 무엇인지 구분한다.

## Superpowers 사용 방침
Superpowers는 적극적으로 사용한다.
다만 사용자가 비개발자이므로, 각 skill이 왜 필요한지 쉬운 말로 설명한다.

권장 사용:
- 아이디어/기획: brainstorming
- 구현 계획: writing-plans
- 기능 구현: test-driven-development, executing-plans
- 문제 해결: systematic-debugging
- 코드 검토: requesting-code-review, receiving-code-review
- 작업 마무리: finishing-a-development-branch

주의:
- TDD는 기본값으로 사용하되, 초기 실험 코드, 문서 작성, 설정 파일 작업은 사용자에게 설명하고 예외로 둘 수 있다.
- Superpowers 지침이 너무 강하게 느껴질 경우, 사용자의 직접 지시를 우선한다.

## Council 사용 방침
중요한 결정은 전역 `council` 스킬을 사용해 Claude/Gemini/Codex 자문단 방식으로 검토할 수 있다.
Council은 자문 전용이며, 실제 파일 수정/삭제/커밋/푸시/배포는 사용자 확인 후 Codex가 진행한다.
Council은 Quick Mode를 기본으로 사용한다. Full Mode는 중요한 결정에서만 사용한다.

Mode 기준:
- Quick Mode: 일반 궁금증, 작은 판단, 초기 브레인스토밍, 낮은 리스크의 Superpowers 진행 단계
- Full Mode: MVP 범위, 구조 결정, 크롤링/약관 리스크, 데이터베이스/인증/배포 선택, GitHub 공개, PR 리뷰

Full Mode 결과는 markdown 원본과 함께 사용자가 읽기 쉬운 `report.html`도 생성한다. Quick Mode에서는 HTML 리포트가 꼭 필요할 때만 만든다.

권장 사용:
- MVP 범위 결정
- 크롤링/스크래핑 약관 및 데이터 출처 리스크 검토
- PRD/README/OSS 방향 검토
- 큰 구조 변경 전 반대 의견 확인
- PR 생성 전 코드 리뷰

## OMX 사용 방침
OMX는 Codex 작업을 보조하는 도구로 사용한다.
계획, 리뷰, 병렬 작업, 장기 작업에 도움이 될 때 사용한다.

주의:
- Windows 환경에서는 OMX Explore Harness 일부가 제한될 수 있다.
- 이 경우 일반 Codex 탐색, PowerShell, `omx sparkshell` 등을 사용한다.
- 이 경고는 작업 불가 문제가 아니다.

## Windows / UTF-8 / 한글 경로 방침
이 프로젝트는 Windows 환경에서 작업한다. 사용자 계정명과 일부 경로에 한글이 포함되어 있으므로, 경로와 인코딩 문제를 항상 먼저 의심하고 예방한다.

기본 원칙:
- 기본 문자 인코딩은 UTF-8로 다룬다.
- PowerShell 5.1의 기본 `Get-Content`는 UTF-8 파일을 잘못 표시할 수 있다. 파일 내용을 확인할 때는 가능하면 `[System.IO.File]::ReadAllText(path, [System.Text.Encoding]::UTF8)` 또는 `Get-Content -Encoding UTF8`을 사용한다.
- 새 스크립트, 산출물, 캐시, 로컬 도구 경로는 가능하면 ASCII 경로를 우선한다. 예: `C:\vcoding\...`, `C:\vcoding-projects\...`, `C:\vcoding\codex-tools\...`
- 설정 파일, 스크립트, CLI 인자에 `C:\Users\한상협\...` 같은 한글 경로를 직접 박아 넣지 않는다. 꼭 필요하면 UTF-8로 읽고 쓰는지 검증한다.
- Windows에서 npm 전역 CLI는 `.cmd`/`.ps1` shim 문제를 일으킬 수 있다. Node에서 CLI를 호출할 때는 직접 바이너리 실행보다 `cmd.exe /d /s /c <tool>` 또는 검증된 wrapper를 우선한다.
- 한글이 깨져 보이면 먼저 파일 자체가 깨졌는지와 터미널 표시만 깨진 것인지 분리해서 확인한다.

## 안전 게이트
다음 작업은 반드시 먼저 사용자에게 쉬운 말로 설명하고 확인을 받은 뒤 진행한다.

- 파일/폴더 삭제
- 브랜치 삭제
- 작업 discard
- force push
- GitHub push
- Pull Request 생성
- merge
- 외부 서비스 배포
- npm 전역 설치 또는 공급망 위험이 있는 설치
- 크롤링/스크래핑처럼 법적/약관 리스크가 있는 작업

## Git/GitHub 방침
이 프로젝트는 독립 저장소다.

로컬 경로:
```text
C:\vcoding-projects\openprice-kr
```

기본 브랜치:
```text
main
```

아직 GitHub 원격 저장소는 연결하지 않았다.

## 다음 작업 참고
새 세션이 시작되면 먼저 `HANDOFF.md`를 읽고 현재 상황을 파악한다.
그다음 README, .gitignore, LICENSE, docs/vision.md 같은 초기 프로젝트 파일을 계획하고 만든다.
