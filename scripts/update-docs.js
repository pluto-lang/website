const url = require("url");
const glob = require("glob");
const fs = require("fs-extra");
const yaml = require("js-yaml");

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

  const zhMeta = {};
  const enMeta = {};
  for (const exampleDir of await glob.glob("pluto/examples/*")) {
    if (fs.statSync(exampleDir).isFile()) {
      continue;
    }

    const readmePaths = await glob.glob(`${exampleDir}/README*.+(md|mdx)`);
    if (readmePaths.length === 0) {
      continue;
    }

    const exampleName = exampleDir.split("/").pop();
    // Copy the README file to the 'pages/cookbook' directory.
    for (const readmePath of readmePaths) {
      const filename = readmePath.split("/").pop();

      const urlPrefix = `https://github.com/pluto-lang/pluto/tree/main/examples/${exampleName}`;

      let content = fs.readFileSync(readmePath, "utf8");

      // Add the title to the frontmatter.
      if (!content.trim().startsWith("---")) {
        // Get the title with prefix "#"
        const title = content.match(/^# (.*)$/m)[1];
        if (title) {
          content = `---\ntitle: ${title}\n---\n\n${content}`;
        }
      }

      // Fetch tags from frontmatter, and add the tags and code link before the H1 title.
      const frontMatter = content.match(/^---\n([\s\S]*?)\n---\n/);
      // parse the yaml
      const metadata = yaml.load(frontMatter[1]);
      const tags = metadata.tags || [];
      const tagsString = tags.map((tag) => `#${tag}`).join(" ");
      const codeLink = `[${urlPrefix}](${urlPrefix})`;
      content = content.replace(
        /^# (.*)$/m,
        `
**Tags**: ${tagsString}  
**Code**: ${codeLink}

--- 
# $1`
      );

      // Replace relative links with absolute links to the GitHub repository.
      const matches = content.matchAll(/([^!]\[.*?\])\(((\.+\/)+.*?)\)/g);
      for (const match of matches) {
        const prefixText = match[1];
        const relativePath = match[2];
        const absoluteLink = url.resolve(urlPrefix + "/", relativePath);
        content = content.replace(match[0], `${prefixText}(${absoluteLink})`);
      }

      // Replace `./assets/*` with `/assets/${exampleName}/*`. This change is
      // needed because the assets get copied to the
      // `public/assets/${exampleName}` directory.
      content = content.replace(
        /(["\(])(\.\/)?assets\//g,
        `$1/assets/${exampleName}/`
      );

      const fileType = filename.split(".").pop();
      const langType = /_zh.mdx?$/g.test(filename) ? "zh-CN" : "en";
      const newFilename = `${exampleName}.${langType}.${fileType}`;
      fs.writeFileSync(`pages/cookbook/${newFilename}`, content, "utf8");

      if (langType === "zh-CN") {
        zhMeta[exampleName] = getTitleFromContent(content);
        if (readmePaths.length === 1) {
          enMeta[exampleName] = { display: "hidden" };
        }
      } else {
        enMeta[exampleName] = getTitleFromContent(content);
        if (readmePaths.length === 1) {
          zhMeta[exampleName] = { display: "hidden" };
        }
      }
    }

    // Copy assets from each example to the 'public/assets' directory.
    const assetsDir = `${exampleDir}/assets`;
    if (fs.existsSync(assetsDir)) {
      fs.ensureDirSync(`public/assets/${exampleName}`);
      fs.copySync(assetsDir, `public/assets/${exampleName}`);
    }
  }

  // Generate the metadata for the cookbook.
  fs.writeFileSync(
    `pages/cookbook/_meta.zh-CN.json`,
    JSON.stringify(zhMeta, null, 2),
    "utf8"
  );
  fs.writeFileSync(
    `pages/cookbook/_meta.en.json`,
    JSON.stringify(enMeta, null, 2),
    "utf8"
  );

  replaceDocLinksInWebsite();
}

function getTitleFromContent(content) {
  // parse the front matter metadata
  const frontMatter = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!frontMatter) {
    return;
  }
  const metadata = frontMatter[1];

  const titleMatch = metadata.match(/title:(.*)/);
  if (!titleMatch) {
    return;
  }
  return titleMatch[1].trim();
}

async function constructDocumentation() {
  // Copy docs and README to 'pages' directory.
  fs.ensureDirSync("pages");
  fs.copySync("pluto/docs/", "pages/");

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
