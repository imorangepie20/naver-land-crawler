# NAS용 Dockerfile - Chrome + Xvfb + noVNC 통합
FROM node:20-slim AS builder

# 빌드에 필요한 패키지 설치
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 의존성 설치 (dev 포함 - 빌드에 필요)
COPY package*.json ./
RUN npm ci --include=dev

# 소스 복사 및 빌드
COPY . .
RUN npm run build

# 프로덕션 의존성만 남기기
RUN npm prune --omit=dev

# ============================================
# Production Stage
# ============================================
FROM node:20-slim

# 런타임 패키지 설치
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
    chromium \
    xvfb \
    x11vnc \
    novnc \
    websockify \
    supervisor \
    fonts-nanum \
    fonts-nanum-coding \
    fonts-nanum-extra \
    && rm -rf /var/lib/apt/lists/*

# 환경 변수 설정
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    DISPLAY=:99 \
    VNC_PORT=5900 \
    NOVNC_PORT=6080 \
    NODE_ENV=production

WORKDIR /app

# 빌드된 파일 복사
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src
COPY --from=builder /app/next.config.ts ./next.config.ts

# Supervisor 설정
COPY supervisord.nas.conf /etc/supervisor/conf.d/supervisord.conf

# 포트 노출
EXPOSE 3000 6080

# 시작
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
