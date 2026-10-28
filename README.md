# 홍길동 포트폴리오 예시

HTML, CSS, JavaScript로 구성한 반응형 정적 사이트입니다. 프로젝트 상세, 분류 필터, 기록·소식지 열람, 테마 전환, 문의 초안 다운로드를 제공합니다.

## 실행

이 디렉터리에서 `npm run dev`를 실행하고 http://127.0.0.1:4173 에 접속합니다. 별도 패키지 설치 없이 실행됩니다. HTML 파일을 직접 열어도 주요 기능을 사용할 수 있습니다.

## 수정

- `content.js`: 예시 프로젝트, 개발 기록, 소식지 내용
- `index.html`: 이름, 소개, 메뉴, 문의 영역
- `styles.css`: 색상, 배치, 반응형 스타일
- `app.js`: 필터, 상세 대화상자, 테마, 문의 초안 다운로드

## 예시 콘텐츠와 미연결 기능

홍길동은 가상 인물입니다. 예약노트와 리포트 플로우는 화면·사례 구성 예시이며 실제 출시 또는 성과를 주장하지 않습니다. 실제 공개 전 콘텐츠를 교체하고 본인의 역할과 검증 가능한 결과를 입력하세요.

문의 기능은 입력 내용을 사용자의 기기에 텍스트 파일로 저장합니다. 이메일 발송, 서버 저장, 실제 상담 접수는 하지 않습니다. 이메일 구독은 연결하지 않았습니다. 뉴스는 RSS 수집 결과를 표시하며 GitHub Actions에서 매일 갱신합니다.

Google Fonts를 불러옵니다. 외부 연결이 안 되면 시스템 글꼴로 표시됩니다. 문의 내용은 외부로 전송하지 않습니다. 테마 설정만 브라우저 로컬 저장소에 보관합니다.

## 데일리 뉴스

- 수집 출처: GitHub Blog, Cloudflare Blog, Google AI Blog의 공식 RSS
- 수집 범위: 최근 72시간에 발행된 글, 최대 12개
- 실행 예정: 매일 오전 7시 17분 KST (`17 22 * * *`, UTC)
- 보관: 한국 날짜 기준 최근 30일 수집본. 같은 날 재실행하면 해당 날짜 수집본을 갱신합니다.
- 모든 출처에 새 글이 없거나 수집이 모두 실패하면 기존 뉴스와 보관본을 유지하고 실패 상태를 기록합니다.
- 일부 출처 실패 시 정상 출처의 결과를 사용하고 화면과 실행 보고서에 표시합니다.
- 발행일이 없거나 미래인 글은 제외합니다. URL의 추적 파라미터와 중복 제목을 제거합니다.
- 기본 설명은 RSS 제공 내용의 짧은 발췌문이며, 원문 전체를 읽거나 AI로 작성한 요약으로 표시하지 않습니다.

### 로컬 실행

```sh
npm run news
npm run check
npm run build
npm run dev
```

파이썬 3.10 이상과 Node.js가 필요합니다. 패키지 설치는 필요하지 않습니다. 수집은 인터넷 연결이 필요하며, 정적 파일 미리보기는 `http://127.0.0.1:4173`에서 볼 수 있습니다. UI의 뉴스 조회는 HTTP 서버로 실행해야 합니다.

### 수정할 파일

- `news.config.json`: RSS 출처, 수집 기간, 개수, 보관 기간
- `scripts/collect_news.py`: RSS/Atom 수집, 선택적 AI 요약, 날짜별 저장
- `news.js`: 날짜별 조회, 원문 링크, 갱신·실패 상태
- `.github/workflows/daily-news.yml`: 예약 실행과 GitHub Pages 배포
- `data/news/`: 최신 뉴스, 수집 날짜별 뉴스, 목록, 수집 상태

### GitHub 설정

이 디렉터리의 파일을 저장소 루트에 올립니다. `.github/workflows/`도 포함해야 합니다.

1. 기본 브랜치를 `main`으로 설정합니다.
2. 저장소 Settings → Pages → Build and deployment의 Source를 **GitHub Actions**로 설정합니다.
3. Actions에서 **Daily news and site deployment**를 수동 실행합니다.
4. 수집 결과와 Pages 주소가 확인되면 이후 매일 예약 실행됩니다.

워크플로는 테스트, 수집, 뉴스 데이터 커밋, 정적 사이트 생성, Pages 배포를 순서대로 실행합니다. 자동 커밋은 같은 워크플로 안에서 배포하므로 별도 push 트리거에 의존하지 않습니다. 뉴스 전체 수집 실패 시에도 기존 수집본을 배포하고 실행을 실패로 표시해 GitHub 알림 설정에 따라 확인할 수 있습니다. 브랜치 보호 규칙이 자동 커밋을 막으면 데이터 저장 방식을 별도로 조정해야 합니다.

GitHub 예약 실행은 부하에 따라 지연될 수 있으며 정확한 시각을 보장하지 않습니다. 공개 저장소의 장기간 비활동 등으로 예약이 비활성화될 수 있으므로 Actions의 최근 실행과 마지막 수집 시각을 확인하세요.

### 선택적 자동 한국어 번역·요약

별도 API 키 없이도 뉴스 수집과 표시는 동작합니다. AI 요약을 원하면 저장소 Settings → Secrets and variables → Actions에 다음 두 항목을 설정합니다.

- Secret `OPENAI_API_KEY`: 본인의 OpenAI API 키
- Variable `OPENAI_MODEL`: API에서 이용 가능한 텍스트 모델 ID

둘 다 설정한 경우에만 Responses API를 호출합니다. API 비용이 발생하며 ChatGPT 구독과 별도입니다. 공개 RSS 제목과 발췌문을 전송해 한국어 제목과 요약을 만들고, 화면에는 AI 요약임을 표시합니다. 키와 모델을 지정하지 않으면 출처 발췌문을 사용합니다. 키는 브라우저나 사이트 배포물에 포함하지 않습니다. 요약 실패·불완전 응답 시 발췌문으로 대체하고 상태 보고서에 남깁니다. 이번 구현에서는 실제 API 키를 사용한 호출은 검증하지 않았습니다.

### 공식 문서

- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://developers.openai.com/api/docs/guides/text

기본 수집본의 한국어 번역은 `data/translations.ko.json`에서 관리합니다. 이후 새 뉴스의 자동 번역은 위 API 설정이 필요합니다. 키가 없으면 새 글은 원문으로 표시되며, 각 글의 한국어로 원문 읽기 링크에서 Google 번역을 이용할 수 있습니다.
