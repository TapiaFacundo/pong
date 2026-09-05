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

_Completar: qué agente/modelo se usó durante el desarrollo._

## Principales instrucciones o prompts empleados

_Completar con 2-3 ejemplos reales de prompts de Plan y de Build usados durante el desarrollo (ver plantilla recomendada en el enunciado)._

## Problemas encontrados y soluciones aplicadas

- El partido no terminaba al llegar al puntaje configurado cuando había más de una pelota en cancha a la vez (por el power-up de pelota extra) — se corrigió la condición de victoria para que revise el puntaje sin depender de cuántas pelotas sigan activas.
- _Completar con otros problemas reales que hayan surgido durante el desarrollo._
