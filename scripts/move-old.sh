#!/usr/bin/env bash
# 移动 Controller、Route、Component
mv src/controllers/*.js api/controllers/
mv src/routes/*.js       api/routes/
mv components/*Form.tsx   components/{{module}}/Form.tsx   # 这个按模块名自己改
