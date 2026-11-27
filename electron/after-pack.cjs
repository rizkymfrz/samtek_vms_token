const fs = require("node:fs");
const path = require("node:path");

exports.default = async (context) => {
  const from = path.join(process.env.SAMTEK_DESKTOP_STAGE, "node_modules");
  const resources =
    context.electronPlatformName === "darwin"
      ? path.join(
          context.appOutDir,
          `${context.packager.appInfo.productFilename}.app`,
          "Contents",
          "Resources",
        )
      : path.join(context.appOutDir, "resources");
  fs.cpSync(from, path.join(resources, "app-server", "node_modules"), {
    recursive: true,
    verbatimSymlinks: true,
  });
};
