# Wall Comments

K사 팬사인회용 인터랙티브 Wall Comment 앱 데모입니다.

방문객이 키보드로 한마디를 입력하고 Enter를 누르면, 화면 위에 말풍선(글래스 버블)이
떠오르며 다른 방문객들의 메시지와 함께 벽을 채웁니다. 버블을 좌클릭하면 메시지를
크게 볼 수 있고, 우클릭하면 수정/삭제/속성 메뉴가 뜹니다.

## 스택

Next.js (App Router) · React · TypeScript · better-sqlite3 · Zustand · PM2

Three.js/WebGL 없이 순수 HTML/CSS/DOM 애니메이션으로 구현했습니다. 외부
서비스(Supabase, Firebase, 별도 DB 서버 등) 없이 로컬 SQLite 파일 하나로
동작합니다.

## 실행

```bash
npm install
cp .env.example .env.local   # ADMIN_PASSWORD 값 설정
npm run build
npm run start                 # http://localhost:6000 (ecosystem.config.js 기준)
```

`/admin`은 운영자 페이지입니다 (`ADMIN_PASSWORD`로 로그인, 메인 화면에는 링크 없음).

## PM2로 상시 구동

```bash
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup      # 재부팅 후 자동 실행 설정 (안내되는 명령어 그대로 실행)
```

## 데이터

- `data/*.db` — SQLite 파일, git에는 커밋 안 됨
- 관리자 페이지의 백업 버튼으로 `backup/`에 스냅샷 저장 가능
- "화면 초기화"는 화면만 비우고 DB는 유지, "전체 제거"/"삭제"는 DB에서도 영구 삭제

## 프로젝트 구조

- `src/app` — 페이지, API 라우트
- `src/components/wall` — 메인 화면 UI (로고, 입력창, 카운터, 각종 모달)
- `src/components/pink-drop` — 버블 애니메이션/풀 관리 로직
- `src/lib` — DB, 검증, 보안, 설정값(`config.ts`)
