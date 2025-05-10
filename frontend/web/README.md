📋 README - Sistema de Entregas con Drones (Frontend)
🚀 Visión General
Aplicación frontend para gestión inteligente de flotas de drones de última milla, desarrollada con:

React 18 + TypeScript 5 para componentes tipados y escalables

Tailwind CSS 3 para diseño responsive

WebSockets para tracking en tiempo real

Docker para containerización

Desplegado en AWS ECS con auto-scaling

🛠 Stack Tecnológico
Frontend
React 18

TypeScript 5

Tailwind CSS 3

React Router 6

Socket.io (WebSockets)

Infraestructura
Docker + Docker Compose

AWS ECS (Fargate)

AWS Load Balancer

CloudWatch para monitoreo

⚙️ Configuración
Variables de Entorno
Crear archivo .env:

env
VITE_API_URL=https://tu-api.com/v1
VITE_WS_URL=wss://tu-websocket.com
VITE_MAPBOX_KEY=tu_api_key
Ejecución con Docker
bash

# Construir imagen

docker build -t drone-frontend .

# Ejecutar contenedor

docker run -p 3000:3000 --env-file .env drone-frontend
Despliegue AWS ECS
Construir imagen y subir a ECR

Crear task definition en ECS

Configurar load balancer

Implementar CI/CD (GitHub Actions o AWS CodePipeline)

📌 Roadmap
✅ Implementado

Sistema de autenticación JWT

Tracking en tiempo real con WebSockets

Dashboard de gestión de pedidos

Despliegue automático en AWS

🔜 Próximas Features

Integración con sistema de baterías

Optimización de rutas con IA

Versión PWA para repartidores

🌐 Demo
Disponible en: https://tudominio.com

📜 Licencia
Apache 2.0

¿Cómo contribuir?
Haz fork del proyecto

Crea tu rama (git checkout -b feature/nueva-funcionalidad)

Haz commit de tus cambios (git commit -m "Add nueva funcionalidad")

Haz push a la rama (git push origin feature/nueva-funcionalidad)

Abre un Pull Request
