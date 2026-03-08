---
name: n8n-webhook-integration
description: "Úsalo cada vez que necesites enviar datos de formularios del frontend (como valoraciones de permuta, capturas de leads o solicitudes de contacto) hacia el backend de automatización de n8n."
---

# Integración de Webhooks con n8n para Leads Automotrices

## Goal

Capturar de forma segura los eventos del frontend, estructurar la carga útil (payload) y transmitirla de forma asíncrona a n8n para alimentar el CRM y el sistema de tasación.

## Instructions

1. Escucha el evento `onSubmit` del formulario de React.
2. Extrae los datos del usuario (Nombre, Email, Teléfono), los datos del vehículo (VIN, Kilometraje) y las URLs de las imágenes adjuntas.
3. Empaqueta estos datos en un formato JSON estricto.
4. Utiliza `fetch` o `axios` para enviar un **POST asíncrono** a la URL del webhook de n8n correspondiente.
5. Maneja los estados de carga (loading) y muestra un mensaje de éxito o error al usuario.

## Constraints

- **NO** expongas **NUNCA** las URLs de los webhooks de n8n ni las claves de API en el código del lado del cliente.
- **DEBES** utilizar variables de entorno (ej. `process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL`) para todas las rutas de integración.
- Siempre envía los datos a través de una **API Route interna** de Next.js (`/api/webhook`) que actúe como proxy seguro.
