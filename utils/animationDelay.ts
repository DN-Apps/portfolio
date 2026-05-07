export function animationDelay(seconds: number): string {
  // CSS erwartet Delay-Werte als String mit Einheit, deshalb wird das zentral
  // hier gebaut statt mehrfach inline im JSX.
  return `${seconds}s`;
}

export function staggeredSeconds(index: number, stepSeconds: number): number {
  // Der Index bestimmt die Staffelung, damit Listen nacheinander erscheinen.
  return index * stepSeconds;
}

export function staggeredAnimationDelay(
  index: number,
  stepSeconds: number,
  baseSeconds = 0,
): string {
  // Diese Hilfsfunktion verbindet beide Schritte, damit Komponenten lesbarer
  // bleiben und nur noch Index + Abstand + optionalen Basiswert angeben müssen.
  return animationDelay(baseSeconds + staggeredSeconds(index, stepSeconds));
}
