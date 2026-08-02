# 🪂 배틀리딩그라운드 (Battle Reading Ground)

> **5학년 온책읽기 프로젝트 (Firebase & Vercel 연동 버전)**

인기 게임 '배틀그라운드(PUBG)'의 재미있는 보급상자, 파밍, 칭호, 3레벨 삼뚝 헬멧 요소를 활용한 **5학년 온책읽기 및 개인 독서기록장 웹 애플리케이션**입니다.

![배틀리딩그라운드 캡처](assets/battle_reading_ground_banner_1785634103116.jpg)

---

## ✨ 핵심 기능

1. **온책 표지 & 22인 스티커 현황판**:
   - 도서별 표지 이미지 하단 1~22번 스티커 칸
   - 클릭 시 **[단순 완독 (+100 XP)]** 또는 **[독서감상문 직접 타이핑 작성 (+300 XP + 보급상자)]** 선택 가능
2. **🔐 Firebase Google & 익명(게스트) 로그인**:
   - 구글 계정 또는 익명(게스트) 로그인 지원
   - 사용자별 개인 독서기록 관리
3. **⌨️ 직접 타이핑 독서감상문 에디터**:
   - 책 제목, 인상 깊은 장면, 내 생각과 느낌, 다짐 직접 입력
   - 저장 시 붉은 보급상자(Air Drop) 스티커와 +300 XP 획득
4. **📖 나만의 독서기록장 (My Journal)**:
   - 내가 작성한 감상문 모음집 관리 (수정, 삭제, 전체보기)
   - 내 독서 포트폴리오 PDF 및 인쇄 기능
5. **🏆 실시간 보상 현황표 & 랭킹**:
   - 학급 TOP 3 명예의 전당 및 22명 생존 티어(브론즈~리딩 마스터) 대시보드

---

## 🚀 1. GitHub 업로드 방법

터미널을 열고 아래 명령어를 순서대로 실행하세요:

```bash
# 1. Git 저장소 초기화 및 전체 파일 스테이징
git init
git add .

# 2. 커밋 생성
git commit -m "Feat: 배틀리딩그라운드 5학년 온책읽기 웹 앱 완성"

# 3. GitHub에서 생성한 레포지토리 주소 연결 (예시)
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/battle-reading-ground.git

# 4. 푸시
git push -u origin main
```

---

## 🔥 2. Firebase 설정 가이드 (Google & 익명 Auth + Firestore)

1. [Firebase Console](https://console.firebase.google.com/) 접속 후 새 프로젝트 생성.
2. **Authentication (인증)** 탭 진입 ➔ `Get Started` ➔ **[Google]** 및 **[익명(Anonymous)]** 로그인 공급업체 **활성화(Enable)**.
3. **Firestore Database** 탭 진입 ➔ `Create Database` ➔ **테스트 모드(Test Mode)**로 데이터베이스 생성.
4. 프로젝트 설정(Project Settings) ➔ `General` 하단의 **Web App (</>) 추가** ➔ Firebase SDK 객체 복사.
5. 본 프로젝트의 `firebase-config.js` 파일의 `firebaseConfig` 객체에 키값 덮어쓰기:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456"
};
```

---

## ⚡ 3. Vercel으로 1초 만에 무료 배포하기

1. [Vercel](https://vercel.com)에 가입 후 GitHub 계정과 연동합니다.
2. **[Add New...]** ➔ **[Project]** 클릭 후 방금 올린 `battle-reading-ground` GitHub 레포지토리를 선택(Import)합니다.
3. 별도의 빌드 설정 없이 **[Deploy]** 버튼을 누르면 몇 초 내로 무료 전용 도메인 (예: `https://battle-reading-ground.vercel.app`)으로 배포가 완료됩니다! 🎉

---

## 📄 라이선스
MIT License. 자유롭게 초등학교 학급 온책읽기 프로젝트에 수정하여 활용하세요!
