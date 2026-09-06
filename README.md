### Pong con Power-ups

Pong clásico (1 jugador vs CPU o 2 jugadores en el mismo teclado) con 18 power-ups que agrandan/achican palas, invierten controles, duplican puntos, multiplican pelotas y más, según lo definido en `docs/GDD.pdf`.

## Integrantes

- Facundo Tapia
- Valentino Batiston

## Tecnologías

- JavaScript
- Node.js
- Vite
- Phaser 3

## Instalación

```
npm install
```

## Ejecutar

```
npm run dev
```

## Build

```
npm run build
```

## Gameplay

### Objetivo

Ganar el punto llevando la pelota más allá de la pala rival. Gana la partida quien primero llega al puntaje elegido (5 o 10).

### Mecánicas principales

- Pong de 1 jugador (vs CPU, con 3 niveles de dificultad) o 2 jugadores en el mismo teclado.
- 18 power-ups (amarillo/verde/rojo) que aparecen en el centro de la cancha y se activan al tocarlos con la pelota: agrandar/achicar pala, acelerarla/frenarla, invertir controles, punto doble, pelota extra, turbo, pelota errática o invisible, paleta central, entre otros.
- IA con velocidad, tiempo de reacción, margen de error y anticipación configurables por dificultad.
- Pantalla de tutorial antes de cada partida, pausa en cualquier momento y pantalla de victoria al terminar.

## Controles

| Acción | Control |
|---|---|
| Mover pala Jugador 1 | W / S |
| Mover pala Jugador 2 | ↑ / ↓ |
| Elegir modo de juego (menú) | 1 (1 jugador) / 2 (2 jugadores) |
| Elegir puntaje de partida (menú) | 5 / 0 |
| Elegir dificultad de la CPU | 1 (Fácil) / 2 (Normal) / 3 (Difícil) |
| Confirmar / avanzar de pantalla | Enter (o clic) |
| Pausar / reanudar | Esc / Enter |
| Volver al menú desde pausa | M |

## Arquitectura

```
MenuScene → DifficultyScene (solo 1 jugador) → TutorialScene → GameScene → PauseScene / pantalla de victoria → MenuScene

GameScene
 ├── BallManager
 │    └── Ball (una o más, según power-ups activos)
 ├── Paddle (x2) — controlada por PlayerController o AI
 ├── PowerUpSpawner → PowerUp
 ├── PowerUpEffects / BallEffects / CenterPaddleEffect
 └── ScoreManager
```

### Patrón utilizado

El proyecto no tiene una carpeta `patterns/` separada: usa un **patrón Manager/composición**. Cada sistema (`BallManager`, `PowerUpSpawner`, `PowerUpEffects`, `ScoreManager`, `AI`) es dueño de un conjunto de entidades y expone una API simple a `GameScene`, que no conoce los detalles internos de cada uno. El flujo entre pantallas (menú → dificultad → tutorial → partida → pausa/victoria) usa el sistema de Scenes de Phaser como una **máquina de estados** del juego.

## Agentes de OpenCode utilizados

- Claude Code (Claude Sonnet 5).

## Principales instrucciones o prompts empleados

Ejemplos reales usados con Claude Code durante el desarrollo del juego:

- **Arranque del proyecto**: "lee los archivos que hay en la carpeta, hay que realizar un juego en phaser node.js y vite".
- **Reporte de bug con pasos y comportamiento esperado**: "iba ganando 4 a 2, toco el power up de bola extra y anote la bola extra, quedando 5 a 2. pero el juego no termino hasta que se anoto la otra, en este caso donde se llego al puntaje maximo deberia terminar el juego".
- **Feature con comportamiento esperado explícito**: "quiero también un sonido cuando se golpea la pelota y cuando se anota un punto, que sean distintos al agarrar un power up".
- **Ajuste de una regla puntual de balance**: "el power up de aumento de velocidad debe poder romper el limite de 700px/s si ya se esta jugando a esta velocidad".
- **Actualización de contenido a partir de un cambio en el GDD**: "en el gdd se agregaron nuevos power ups, ahora toca agregarlos. hazlo".

## Problemas encontrados y soluciones aplicadas

- El partido no terminaba al llegar al puntaje configurado cuando había más de una pelota en cancha a la vez (por el power-up de bola extra) — se corrigió la condición de victoria para que se revise apenas se anota cada punto, sin esperar a que salgan todas las pelotas.
- Ese mismo arreglo expuso un crash: `BallManager` recorría la lista de pelotas mientras `showWinner()` la vaciaba a mitad de camino (el partido terminaba mientras todavía se estaban evaluando otras pelotas del mismo frame) — se solucionó iterando sobre una copia y comprobando que cada pelota siguiera en juego antes de procesarla.
- Al agregar soporte para más de una pelota en cancha, agregar cada pelota a un `Phaser.Physics.Group` (para simplificar la detección de colisiones con power-ups) rompía silenciosamente el rebote contra los bordes superior e inferior: el `Group` resetea `collideWorldBounds` y `bounce` a sus valores por defecto al agregar un cuerpo físico ya configurado. Se solucionó sacando el `Group` y registrando las colisiones pelota↔power-up directamente por par.
- Al instalar dependencias en Windows, la política de ejecución de PowerShell bloqueaba el script `npm.ps1` (error "no se puede cargar... la ejecución de scripts está deshabilitada"). Se resolvió corriendo `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` (alternativa rápida sin tocar la política: usar `npm.cmd` en vez de `npm`).
