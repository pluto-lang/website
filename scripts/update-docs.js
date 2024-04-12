const glob = require("glob");
const fs = require("fs-extra");
const url = require("url");

async function main() {
  // Clean existing files.
  console.log("Clean existing files.");
  cleanExistingFiles();

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

function cleanExistingFiles() {
  fs.removeSync("public/assets");
  fs.removeSync("pages/blogs");
  fs.removeSync("pages/cookbook");
  fs.removeSync("pages/dev_guide");
  fs.removeSync("pages/documentation");
}

async function constructCookbook() {
  fs.ensureDirSync("public/assets");
  fs.ensureDirSync("pages/cookbook");

  for (const exampleDir of await glob.glob("pluto/examples/*")) {
    if (fs.statSync(exampleDir).isFile()) {
      continue;
    }

    const readmePaths = await glob.glob(`${exampleDir}/README*.md`);
    if (readmePaths.length === 0) {
      continue;
    }

    const exampleName = exampleDir.split("/").pop();
    // Copy the README file to the 'pages/cookbook' directory.
    for (const readmePath of readmePaths) {
      const filename = readmePath.split("/").pop();

      const urlPrefix = `https://github.com/pluto-lang/pluto/tree/main/examples/${exampleName}`;

      let content = fs.readFileSync(readmePath, "utf8");
      // // Replace relative links with absolute links to the GitHub repository.
      const matches = content.matchAll(/([^!]\[.*?\])\(((\.+\/)+.*?)\)/g);
      for (const match of matches) {
        const prefixText = match[1];
        const relativePath = match[2];
        const absoluteLink = url.resolve(urlPrefix + "/", relativePath);
        content = content.replace(match[0], `${prefixText}(${absoluteLink})`);
      }

      // Add the title to the frontmatter.
      if (!content.trim().startsWith("---")) {
        // Get the title with prefix "#"
        const title = content.match(/^# (.*)$/m)[1];
        if (title) {
          content = `---\ntitle: ${title}\n---\n\n${content}`;
        }
      }

      // Replace `./assets/*` with `./assets/${exampleName}/*`. This change is
      // needed because the assets get copied to the
      // `public/assets/${exampleName}` directory, and these paths will be
      // adjusted during the documentation build process.
      content = content.replace(/(["\(]\.\/assets\/)/g, `$1${exampleName}/`);

      const suffix = filename.endsWith("_zh.md") ? ".zh-CN.md" : ".en.md";
      const newFilename = exampleName + suffix;
      fs.writeFileSync(`pages/cookbook/${newFilename}`, content, "utf8");
    }

    // Copy assets from each example to the 'public/assets' directory.
    const assetsDir = `${exampleDir}/assets`;
    if (fs.existsSync(assetsDir)) {
      fs.ensureDirSync(`public/assets/${exampleName}`);
      fs.copySync(assetsDir, `public/assets/${exampleName}`);
    }
  }

  replaceDocLinksInWebsite();
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
}

async function replaceDocLinksInWebsite() {
  for (const filepath of await glob.glob("pages/**/*.+(md|mdx)")) {
    let content = fs.readFileSync(filepath, "utf8");

    // Replace the github links to the documentation with website links.
    content = content.replace(
      /\(https:\/\/github.com\/pluto-lang\/pluto\/tree\/main\/docs\/(.*?)\)/g,
      `(/$1)`
    );
    // Replace the relative links to the documentation with website links.
    content = content.replace(/\((\.+\/)*docs\/(.*?)\)/g, `(/$2)`);

    fs.writeFileSync(filepath, content, "utf8");
  }
}

main();
