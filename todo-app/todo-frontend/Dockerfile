FROM node:16 AS test-stage
WORKDIR /usr/src/app
COPY . .
ENV CI=true
RUN npm ci
RUN npm test

FROM node:16 AS build-stage
WORKDIR /usr/src/app
COPY --from=test-stage /usr/src/app .
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}
RUN npm run build

FROM nginx:1.20-alpine
COPY --from=build-stage /usr/src/app/build /usr/share/nginx/html
