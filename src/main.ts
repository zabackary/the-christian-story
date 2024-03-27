async function main() {
  const progress = document.querySelector<HTMLDivElement>("#loading-progress")!;
  progress.style.setProperty("--progress", "0");
  const Game = (await import("./framework/Game")).default;
  progress.style.setProperty("--progress", "0.2");
  const gameRoot = (await import("./game/gameRoot")).default;
  progress.style.setProperty("--progress", "0.4");
  const canvas = document.querySelector("canvas")!;
  const game = new Game(canvas, gameRoot);
  game.loadAssets((value) => {
    progress.style.setProperty("--progress", (0.4 + value * 0.6).toString());
  });
  game.start();
}

window.addEventListener("load", main);
