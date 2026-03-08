---
name: self-improvement-directive
description: Úsalo siempre que resuelvas un bug complejo, encuentres un nuevo patrón de diseño en el código, o necesites mejorar las funciones de la aplicación.
---

# Directiva de Automejora y Bucle de Aprendizaje

## Objetivo
Tu tarea es actuar como el "Jardinero" (Gardener) del código. No solo debes programar las nuevas funciones que el usuario pide, sino que debes aprender de tus errores y actualizar tu propia base de conocimientos para no repetirlos en el futuro.

## Instrucciones de Bucle Continuo

- **Validación:** Después de escribir el código para una nueva función (ej. Agente de Ventas o Búsqueda Semántica), DEBES ejecutar comandos de validación (`npm run build` o `npm test`).

- **Reflexión:** Si encuentras un error o un cuello de botella en el rendimiento, registra el problema. Analiza por qué la lógica falló.

- **Aprendizaje (Actualización de Memoria):** Si descubres una solución eficiente, un nuevo patrón de UI que funcione bien, o una regla de negocio nueva, DEBES abrir los archivos dentro de la carpeta `.agent/rules/` o `.agent/skills/` y escribir ese nuevo conocimiento directamente en ellos.

- **Creación de Nuevas Skills:** Si desarrollas una función modular excelente (ej. un visor 3D perfecto), crea un nuevo archivo `SKILL.md` dedicado a esa función para que sepas cómo replicarla instantáneamente la próxima vez sin tener que pensarla desde cero.
