FROM node:18
WORKDIR /app
COPY dist/ ./
COPY  package*.json ./
EXPOSE 80
ENV NODE_OPTIONS=--max_old_space_size=4096  
RUN npm install --only=production
CMD [ "npm", "start" ]

