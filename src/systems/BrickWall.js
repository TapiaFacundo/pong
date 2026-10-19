import {
  ARCADE_BRICK_WIDTH,
  ARCADE_BRICK_HEIGHT,
  ARCADE_BRICK_GAP,
  ARCADE_WALL_TOP,
  ARCADE_WALL_BACK_GAP,
  ARCADE_MAX_BALL_ANGLE,
  ARCADE_BRICK_COLORS,
} from "../config.js";
import Brick from "../entities/Brick.js";

// Muro de ladrillos del Arcade, contra el lado derecho de la cancha (con un
// espacio detrás para que la pelota pueda meterse). Arma el muro de cada
// nivel, hace rebotar las pelotas en los ladrillos, avisa cada golpe y, en
// los niveles que lo piden, avanza hacia el jugador.
//
// onBrickHit(brick, broken): después de cada golpe (broken: si se rompió).
// onBallHit(ball, brick, { piercing }): opcional, decide qué le hace la pelota
//   al ladrillo (por defecto, un golpe). La usan los power-ups del Arcade.
// isPiercing(ball): opcional; si devuelve true, la pelota atraviesa los
//   ladrillos que no son de metal en vez de rebotar (pelota de fuego).
export default class BrickWall {
  constructor(scene, field, { onBrickHit, onBallHit, isPiercing }) {
    this.scene = scene;
    this.field = field;
    this.onBrickHit = onBrickHit;
    this.onBallHit = onBallHit ?? ((_ball, brick) => this.damage(brick));
    this.isPiercing = isPiercing ?? (() => false);
    this.group = scene.physics.add.staticGroup();
    this.bricks = [];
    this.colliders = new Map(); // pelota -> su choque con el muro
  }

  // level.bricks: una lista por columna (la 0, la más cercana al jugador) con
  // los golpes de cada ladrillo por fila (0: sin ladrillo; METAL: no se rompe).
  // Ver data/arcade.js.
  build(level) {
    this.clear();

    const columns = level.bricks.length;
    const lastColumnX = this.field.width - ARCADE_WALL_BACK_GAP - ARCADE_BRICK_WIDTH / 2;

    level.bricks.forEach((column, columnIndex) => {
      // Contadas desde el fondo, así cada columna conserva su color aunque el muro crezca.
      const fromBack = columns - 1 - columnIndex;
      const x = lastColumnX - fromBack * (ARCADE_BRICK_WIDTH + ARCADE_BRICK_GAP);
      const columnColor = ARCADE_BRICK_COLORS[fromBack % ARCADE_BRICK_COLORS.length];

      column.forEach((hits, row) => {
        if (!hits) return;

        const y = ARCADE_WALL_TOP + ARCADE_BRICK_HEIGHT / 2 + row * (ARCADE_BRICK_HEIGHT + ARCADE_BRICK_GAP);
        const brick = new Brick(this.scene, x, y, { hits, columnColor });
        this.group.add(brick.rect);
        this.bricks.push(brick);
      });
    });
  }

  registerBall(ball) {
    const collider = this.scene.physics.add.collider(
      ball.circle,
      this.group,
      (_ballCircle, rect) => this.handleBounce(ball, rect.brick),
      (_ballCircle, rect) => this.shouldBounce(ball, rect.brick)
    );
    this.colliders.set(ball, collider);
  }

  unregisterBall(ball) {
    this.colliders.get(ball)?.destroy();
    this.colliders.delete(ball);
  }

  // Antes del choque: una pelota que atraviesa (fuego) golpea el ladrillo sin rebotar.
  shouldBounce(ball, brick) {
    if (brick.isMetal || !this.isPiercing(ball)) return true;

    this.onBallHit(ball, brick, { piercing: true });
    return false;
  }

  handleBounce(ball, brick) {
    this.keepAdvancing(ball);
    this.onBallHit(ball, brick, { piercing: false });
  }

  // Le saca golpes a un ladrillo y avisa.
  damage(brick, hits = 1) {
    if (brick.isBroken) return;
    this.onBrickHit(brick, brick.hit(hits));
  }

  // Lo rompe entero, sin importar cuántos golpes le quedaban (el metal no).
  smash(brick) {
    if (!brick.isMetal) this.damage(brick, brick.hits);
  }

  // El ladrillo y los 8 que lo rodean se rompen enteros (el metal no).
  // Devuelve los ladrillos que explotaron.
  explode(center) {
    const columnStep = ARCADE_BRICK_WIDTH + ARCADE_BRICK_GAP;
    const rowStep = ARCADE_BRICK_HEIGHT + ARCADE_BRICK_GAP;
    const blasted = this.breakableBricks.filter(
      (brick) => Math.abs(brick.x - center.x) <= columnStep + 1 && Math.abs(brick.y - center.y) <= rowStep + 1
    );
    blasted.forEach((brick) => this.smash(brick));
    return blasted;
  }

  // Un rebote en la esquina de un ladrillo puede dejar la pelota casi
  // vertical, rebotando entre el techo y el piso sin avanzar: se la endereza
  // hasta el ángulo máximo, sin cambiarle el sentido.
  keepAdvancing(ball) {
    const { x, y } = ball.circle.body.velocity;
    if (Math.atan2(Math.abs(y), Math.abs(x)) <= ARCADE_MAX_BALL_ANGLE) return;

    ball.setDirection((Math.sign(x) || -1) * Math.cos(ARCADE_MAX_BALL_ANGLE), Math.sign(y) * Math.sin(ARCADE_MAX_BALL_ANGLE));
  }

  // Ladrillos que faltan romper (el metal no cuenta).
  get breakableBricks() {
    return this.bricks.filter((brick) => !brick.isMetal && !brick.isBroken);
  }

  get remaining() {
    return this.breakableBricks.length;
  }

  // Borde izquierdo del ladrillo rompible más adelantado (el que se acerca a la línea de peligro).
  get frontX() {
    return Math.min(...this.breakableBricks.map((brick) => brick.x - ARCADE_BRICK_WIDTH / 2));
  }

  // Todo el muro (también el metal) da un paso, una columna, hacia el jugador.
  advance() {
    this.bricks.forEach((brick) => (brick.rect.x -= ARCADE_BRICK_WIDTH + ARCADE_BRICK_GAP));
    this.group.refresh();
  }

  clear() {
    this.colliders.forEach((collider) => collider.destroy());
    this.colliders.clear();
    this.group.clear(true, true);
    this.bricks = [];
  }
}
