## AGENTS.md

## Proyecto
Pong con power-ups — Trabajo Práctico Módulo #7. Pong local (1 jugador vs CPU, o 2 jugadores en el mismo teclado) con power-ups que alteran tamaño/velocidad de pala y controles.

## Stack
- JavaScript
- Node.js
- Vite
- Phaser 3

## Objetivo
Desarrollar el juego aplicando buenas prácticas de organización de código y desarrollo asistido por agentes, siguiendo `docs/GDD.pdf` como referencia de diseño.

## Arquitectura
```
src/
├── main.js       # punto de entrada, config de Phaser
├── config.js     # constantes globales (cancha, velocidades, colores, teclas)
├── scenes/       # una escena por archivo (MenuScene.js, GameScene.js, etc.)
├── entities/     # clases jugables/objetos (Paddle.js, Ball.js, PowerUp.js)
├── systems/      # lógica que no es una entidad (PowerUpSpawner.js, ScoreManager.js, AI.js)
├── patterns/     # implementaciones de patrones de diseño usados en el proyecto
└── assets/       # assets importados desde código
public/           # assets estáticos servidos directo
docs/
└── GDD.pdf
```

## Convenciones de nombres
- Archivos de clases/escenas: `PascalCase.js` (ej. `GameScene.js`, `Paddle.js`)
- Variables y funciones: `camelCase`
- Constantes globales: `UPPER_SNAKE_CASE` (ej. `PADDLE_SPEED`)
- Assets: `kebab-case` (ej. `paddle-big.png`)

## Reglas para el agente
- Usar JavaScript. No agregar TypeScript.
- Un archivo = una responsabilidad (una escena, una entidad o un sistema; no mezclar).
- Mantener las clases pequeñas y con responsabilidades claras.
- Evitar concentrar toda la lógica en GameScene.
- Evitar lógica duplicada y variables globales innecesarias.
- No agregar dependencias externas sin justificar su necesidad.
- No hace falta explicar cómo crear scripts, escenas o carpetas.
- Priorizar soluciones comprensibles y respetar la arquitectura existente.

## Flujo de trabajo
- Un sistema a la vez: analizar/planear antes de implementar, implementar, probar y validar antes de pasar al siguiente. Nada de pedir "hacé todo el juego" de una.
- Al indicar trabajo en un archivo: 1) nombre y tipo de archivo, 2) carpeta donde va, 3) contenido (código completo si es nuevo), 4) qué probar en el navegador como siguiente paso.
- Si se corrige un script existente: aclarar si se pasa el archivo entero o solo un fragmento, y qué parte reemplaza a cuál.
- Commit por sistema/feature terminado y funcionando. Mensajes cortos en español, en modo imperativo (ej. "agrega power-up de pala grande").

## Comandos
- Instalar dependencias: `npm install`
- Ejecutar: `npm run dev`
- Build: `npm run build`

---
*Este archivo se puede ampliar durante el desarrollo a medida que se tomen nuevas decisiones de arquitectura, convenciones o nombres.*
