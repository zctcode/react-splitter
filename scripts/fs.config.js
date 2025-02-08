const fs = require("fs");
const path = require("path");
const pkg = require("../package.json");

/** 删除文件 */
function removeFiles(sourceDir) {
  if (fs.existsSync(sourceDir)) {
    const files = fs.readdirSync(sourceDir);

    files.forEach((file) => {
      const filePath = path.join(sourceDir, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        // 递归删除子目录
        removeFiles(filePath);
      } else {
        // 删除文件
        fs.unlinkSync(filePath);
      }
    });

    if (fs.readdirSync(sourceDir).length === 0) {
      // 删除空目录
      fs.rmdirSync(sourceDir);
    }
  }
}

/** 复制文件到指定目录 */
function copyFiles(sourceDir, targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const files = fs
    .readdirSync(sourceDir)
    .filter((file) => !file.endsWith(".ts") && !file.endsWith(".tsx") && !file.endsWith('.jsx') && !file.endsWith('.scss') && !file.endsWith('.sass') && !file.endsWith('.less'));

  files.forEach((file) => {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);

    const stats = fs.statSync(sourcePath);

    if (stats.isFile()) {
      fs.copyFileSync(sourcePath, targetPath);
    } else if (stats.isDirectory()) {
      copyFiles(sourcePath, targetPath);
    }
  });
}

(function () {
  const args = process.argv.slice(2);
  const cmd = args[0];

  const sourceRootDir = "src/components";
  const targetRootDir = "@ihatecode";

  if (cmd === "rm") {
    removeFiles("@ihatecode");
  }

  if (cmd === "cp") {
    copyFiles(sourceRootDir, `${targetRootDir}/react-splitter/lib`);

    const rootFiles = fs
      .readdirSync("./")
      .filter((file) =>
        ["LICENSE", "README.md", "package.json"].includes(file)
      );

    rootFiles.forEach((file) => {
      const stats = fs.statSync(file);

      if (stats.isFile()) {
        fs.copyFileSync(file, `${targetRootDir}/react-splitter/${file}`);
      }
    });

    const packageJson = {
      ...pkg,
      scripts: {},
      dependencies: {
        "react": pkg.dependencies.react,
        "classnames": pkg.dependencies.classnames,
      },
      devDependencies: {}
    };

    const packageJsonString = JSON.stringify(packageJson, null, 2);
    const packageJsonPath = path.resolve(__dirname, '../@ihatecode/react-splitter/package.json');

    fs.writeFile(packageJsonPath, packageJsonString, (err) => {
      if (err) {
        console.error('写入 package.json 文件时出错:', err);
        return;
      }
    });
  }
})();
