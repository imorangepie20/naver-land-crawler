# 🚀 Synology NAS 배포 가이드 (Container Manager)

## 📋 필수 조건
- Synology NAS (DS220+ 이상 권장)
- Container Manager 패키지 설치 ✅
- 최소 4GB RAM

---

## 1️⃣ 프로젝트 파일 NAS로 복사

### File Station 사용
1. DSM 웹에서 **File Station** 열기
2. `docker` 폴더로 이동 (없으면 생성)
3. **우클릭 → 폴더 만들기** → `naver-land-crawler`
4. 이 프로젝트 폴더의 **모든 파일**을 업로드:
   - `docker-compose.nas.yml`
   - `Dockerfile.nas`
   - `supervisord.nas.conf`
   - `package.json`, `package-lock.json`
   - `src/` 폴더 전체
   - `next.config.ts`
   - 기타 모든 파일

---

## 2️⃣ Container Manager에서 프로젝트 설정

### Step 1: Container Manager 열기
1. DSM 메인 메뉴 → **Container Manager** 클릭

### Step 2: 프로젝트 생성
1. 왼쪽 메뉴 → **프로젝트** 클릭
2. **생성** 버튼 클릭
3. 설정:
   - **프로젝트 이름**: `naver-land-crawler`
   - **경로**: `/docker/naver-land-crawler` 선택
   - **소스**: `docker-compose.nas.yml 업로드` 또는 `기존 docker-compose.yml 사용`

### Step 3: Docker Compose 파일 선택
1. **기존 docker-compose.yml 사용** 선택
2. 파일 선택: `docker-compose.nas.yml`
3. **다음** 클릭

### Step 4: 빌드 시작
1. **프로젝트 빌드** 체크
2. **적용** 클릭
3. ⏱️ 빌드 대기 (10-20분 소요)

---

## 3️⃣ 컨테이너 실행 확인

### Container Manager에서 확인
1. **프로젝트** → `naver-land-crawler` 클릭
2. 상태가 **실행 중**인지 확인
3. 로그 탭에서 에러 확인

### 포트 확인
| 서비스 | 포트 | 용도 |
|--------|------|------|
| Next.js | 3000 | 웹 UI |
| noVNC | 6080 | 원격 브라우저 |

---

## 4️⃣ 접속하기

### 웹 UI (메인 앱)
```
http://[NAS-IP]:3000
```
예: `http://192.168.1.100:3000`

### 원격 브라우저 (noVNC)
```
http://[NAS-IP]:6080/vnc.html
```
예: `http://192.168.1.100:6080/vnc.html`

---

## 5️⃣ 사용 방법

1. **noVNC 접속** (`http://NAS-IP:6080/vnc.html`)
2. Chrome 브라우저에서 **네이버 부동산** 접속
3. 원하는 단지/지역 탐색
4. **웹 UI** (`http://NAS-IP:3000/interactive`)에서 **데이터 수집** 클릭

---

## 🔧 Container Manager 관리

### 컨테이너 중지
1. Container Manager → 프로젝트
2. `naver-land-crawler` 선택
3. **작업** → **중지**

### 컨테이너 재시작
1. **작업** → **다시 시작**

### 로그 확인
1. 프로젝트 선택 → **로그** 탭

---

## ⚠️ 트러블슈팅

### "빌드 실패" 오류
- `Dockerfile.nas` 파일이 프로젝트 폴더에 있는지 확인
- Container Manager → 이미지 → 기존 이미지 삭제 후 재빌드

### "포트 사용중" 오류
- 다른 컨테이너가 3000 또는 6080 포트를 사용 중인지 확인
- `docker-compose.nas.yml`에서 포트 변경:
  ```yaml
  ports:
    - "3001:3000"   # 3000 → 3001로 변경
    - "6081:6080"   # 6080 → 6081로 변경
  ```

### noVNC 화면이 안 보임
- 빌드가 완료될 때까지 기다리기
- 로그에서 `novnc` 프로세스 상태 확인
