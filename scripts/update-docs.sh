#!/bin/bash

echo "Clone the Pluto main repository."
# git clone https://github.com/pluto-lang/pluto.git
# if [[ $? -ne 0 ]]; then 
#     echo "Failed to clone."
#     exit 1
# fi
rsync -a ../pluto ./ --exclude-from=../pluto/.gitignore

echo "Move all docs and asserts to the pages directory."
mkdir -p pages/
cp -r pluto/docs/* pages/
cp pluto/README.md pages/index.en.md
cp pluto/README_zh.md pages/index.zh-CN.md

mkdir -p public/
cp -r pluto/assets public/

echo "Remove the Pluto repo directory."
rm -rf pluto/


echo "Adjust some content to better fit the website."
pushd pages
# Replace `assets` with `public/assets` in .md files, preserving any preceding ../.
find . -type f -name "*.md" -exec sed -i '' -E 's@((\.\./)+)assets@\1public/assets@g' {} +

# When utilizing the img tag in Markdown and attempting to access assets via a relative path, 
# adjust it to an absolute path based on the public directory.
find . -type f -name "*.md" -exec sed -i '' -E 's@src="((\.\./)+)public/assets@src="/assets@g' {} +

# Disable the modification of website language through links in the text.
perl -i -0pe 's@\s*<br/>\s*.*?简体中文 </a>@@gs' ./index.en.md ./index.zh-CN.md

# Remove the `docs` from Pluto's README.
sed -i '' -E 's@\((./)?docs/@\(@g' ./index.en.md ./index.zh-CN.md
popd

