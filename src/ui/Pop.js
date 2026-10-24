// "Salto" de un texto o ícono para llamar la atención sobre un cambio (un
// punto en el marcador, la opción recién marcada): se agranda de golpe y
// vuelve a su tamaño. baseScale es su tamaño normal (con la cámara alejada,
// los objetos ubicados con Field.placeOnScreen no tienen escala 1).
export function pop(scene, target, { baseScale = 1, from = 1.35, duration = 220 } = {}) {
  scene.tweens.killTweensOf(target);
  target.setScale(baseScale * from);
  scene.tweens.add({
    targets: target,
    scale: baseScale,
    duration,
    ease: "Back.easeOut",
  });
}

// Aparición de un panel o de una escena superpuesta: se funde desde transparente.
export function fadeIn(scene, target, duration = 160) {
  target.setAlpha(0);
  scene.tweens.add({ targets: target, alpha: 1, duration, ease: "Quad.easeOut" });
}
