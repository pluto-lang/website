const glob = require("glob");
const fs = require("fs-extra");

async function main() {
  // Copy assets to 'public' directory.
  console.log("Copy assets to 'public' directory.");
  fs.ensureDirSync("public/assets");
  fs.copySync("pluto/assets/", "public/assets/");

  console.log("Construct the cookbook.");
  await constructCookbook();

  // The documentation construction should come after creating the cookbook, as
  // there are certain paths related to assets within cookbooks that also need
  // modification.
  console.log("Construct the documentation.");
  await constructDocumentation();
}

async function constructCookbook() {
  // Copy assets from each example to the 'public/assets' directory.
  fs.ensureDirSync("public/assets");
  for (const filepath of await glob.glob("pluto/examples/*/assets")) {
    fs.copySync(filepath, "public/assets/");
  }

  // Copy the README from each example to the 'pages/cookbook' directory.
  fs.ensureDirSync("pages/cookbook");
  for (const filepath of await glob.glob("pluto/examples/*/README*.md")) {
    const parts = filepath.split("/");
    const filename = parts.pop();
    const dirname = parts.pop();

    const urlPrefix = `https://github.com/pluto-lang/pluto/tree/main/examples/${dirname}`;
    let content = fs.readFileSync(filepath, "utf8");
    // Replace relative links with absolute links to the GitHub repository.
    content = content.replace(
      /[^!](\[.*?\])\(((\.+\/)+.*)\)/g,
      `$1(${urlPrefix}/$2)`
    );

    const suffix = filename.endsWith("_zh.md") ? ".zh-CN.md" : ".en.md";
    const newFilename = dirname + suffix;
    fs.writeFileSync(`pages/cookbook/${newFilename}`, content, "utf8");
  }
}

async function constructDocumentation() {
  // Copy docs and README to 'pages' directory.
  fs.ensureDirSync("pages");
  fs.copySync("pluto/docs/", "pages/");
  fs.copyFileSync("pluto/README.md", "pages/index.en.md");
  fs.copyFileSync("pluto/README_zh.md", "pages/index.zh-CN.md");

  // Adjust some content to better fit the website.
  for (const filepath of await glob.glob("pages/**/*.+(md|mdx)")) {
    let content = fs.readFileSync(filepath, "utf8");
    // Replace `assets` with `public/assets` in .md files, preserving any preceding ../.
    content = content.replace(/((\.\/)+)assets/g, "$1public/assets");
    // When utilizing the img tag in Markdown and attempting to access assets via a relative path,
    // adjust it to an absolute path based on the public directory.
    content = content.replace(/src="((\.+\/)+)public\/assets/g, 'src="/assets');
    fs.writeFileSync(filepath, content, "utf8");
  }

  modifyReadme("pages/index.en.md");
  modifyReadme("pages/index.zh-CN.md");
}

function modifyReadme(filepath) {
  let content = fs.readFileSync(filepath, "utf8");
  // Disable the modification of website language through links in the text.
  content = content.replace(/\s*<br\/>\s*.*?简体中文 <\/a>/gs, "");
  // Remove the prefix `docs` from Pluto's README.
  content = content.replace(/\((\.\/)?docs\//g, "(");
  fs.writeFileSync(filepath, content, "utf8");
}

main();
