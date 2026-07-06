@echo off
cd /d "%~dp0"
npm config set registry https://registry.npmjs.org/ --location=project
npm config set registry https://registry.npmjs.org/ --location=user
npm config delete proxy --location=user
npm config delete https-proxy --location=user
npm cache clean --force
npm install --registry=https://registry.npmjs.org/ --no-audit --no-fund
npm run dev
pause
