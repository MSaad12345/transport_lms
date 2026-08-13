FROM node:20-alpine AS base

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./

ENV NEXT_PUBLIC_API_URL=http://localhost:5000
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app/frontend

COPY --from=base /app/frontend/package*.json ./
COPY --from=base /app/frontend/.next ./.next
COPY --from=base /app/frontend/public ./public
COPY --from=base /app/frontend/node_modules ./node_modules
COPY --from=base /app/frontend/next.config.mjs ./next.config.mjs
COPY --from=base /app/frontend/postcss.config.mjs ./postcss.config.mjs
COPY --from=base /app/frontend/jsconfig.json ./jsconfig.json
COPY --from=base /app/frontend/next-env.d.ts ./next-env.d.ts

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
