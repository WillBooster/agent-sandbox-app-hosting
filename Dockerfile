# https://hub.docker.com/r/oven/bun
FROM oven/bun:1.3.10-slim AS build

WORKDIR /app

ENV NODE_ENV=production \
    HUSKY=0 \
    WB_ENV=production \
    MISE_EXPERIMENTAL=true \
    MISE_INSTALL_PATH="/usr/local/bin/mise" \
    MISE_TRUSTED_CONFIG_PATHS="/app"

RUN apt-get update \
    && apt-get -y --no-install-recommends install \
        curl ca-certificates build-essential python3 \
    && rm -rf /var/lib/apt/lists/* \
    && curl https://mise.run | sh

COPY dist/package.json dist/bun.lock ./

RUN bun install --frozen-lockfile

COPY .env* drizzle.config.ts entrypoint.sh mise*.toml next* postcss.config.mjs tsconfig.json bunfig.toml ./
COPY drizzle ./drizzle
COPY src ./src

ARG WB_ENV=production
ARG NEXT_PUBLIC_BASE_URL
ENV WB_ENV=$WB_ENV

RUN mise run db:migrate \
    && if [ -n "$NEXT_PUBLIC_BASE_URL" ]; then NEXT_PUBLIC_BASE_URL="$NEXT_PUBLIC_BASE_URL" mise run build; else mise run build; fi \
    && rm -rf drizzle/mount

# https://hub.docker.com/r/oven/bun
FROM oven/bun:1.3.10-slim

WORKDIR /app

ENV PORT=8080 \
    NODE_ENV=production \
    TZ=Asia/Tokyo \
    WB_ENV=production \
    MISE_EXPERIMENTAL=true \
    MISE_INSTALL_PATH="/usr/local/bin/mise" \
    MISE_TRUSTED_CONFIG_PATHS="/app"

RUN apt-get update \
    && apt-get -y --no-install-recommends install ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /usr/local/bin/mise /usr/local/bin/mise
COPY --from=build /app /app

ARG WB_ENV=production
ENV WB_ENV=$WB_ENV

CMD ["./entrypoint.sh"]
