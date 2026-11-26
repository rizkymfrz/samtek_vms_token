import sharp from "sharp";

const size = 512;

const logo = await sharp("app/icon.svg", { density: 300 })
  .resize(size, size, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();

await sharp(logo).toFile("electron/icon.png");
