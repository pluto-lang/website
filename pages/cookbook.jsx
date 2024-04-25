import { useRouter } from "next/router";
import React, { useState } from "react";
import { Cards } from "nextra/components";
import { getPagesUnderRoute } from "nextra/context";
import { Tags } from "components/tag";
import { ExampleCard } from "components/example-card";

const titleLocaleMap = {
  "zh-CN": "案例",
  en: "Cookbook",
};

const descLocaleMap = {
  "zh-CN": "使用 Pluto 构建的应用案例，提供端到端的实践指导。",
  en: "Examples for building applications with Pluto, emphasizing practical and comprehensive use cases.",
};

const langTagLocaleMap = {
  "zh-CN": "语言",
  en: "Language",
};

const platTagLocaleMap = {
  "zh-CN": "平台",
  en: "Platform",
};

const otherTagLabelLocaleMap = {
  "zh-CN": "其他",
  en: "Other",
};

function CookbookHeader() {
  const { locale } = useRouter();
  return (
    <div className="max-w-screen-lg mx-auto pt-4 pb-8 mb-16 border-b border-gray-400 border-opacity-20">
      <h1>
        <span className="font-bold leading-tight lg:text-5xl">
          {titleLocaleMap[locale]}
        </span>
      </h1>
      <p className="text-center text-gray-500 dark:text-gray-400 font-space-grotesk">
        {descLocaleMap[locale]}
      </p>
    </div>
  );
}

function CookbookTags({ setSelectedTags, selectedTags }) {
  const pages = getPagesUnderRoute("/cookbook").filter(notHidden);
  const tags = pages.map((page) => flatTags(page.frontMatter?.tags)).flat();
  const uniqueTags = [];
  tags.forEach((tag) => {
    if (!uniqueTags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      uniqueTags.push(tag);
    }
  });

  const langTags = ["TypeScript", "Python"];
  const platformTags = ["AWS", "Kubernetes", "AliCloud"];
  const otherTags = uniqueTags.filter((tag) => {
    return (
      langTags.every((t) => t.toLowerCase() !== tag.toLowerCase()) &&
      platformTags.every((t) => t.toLowerCase() !== tag.toLowerCase())
    );
  });

  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const { locale } = useRouter();
  return (
    <>
      <table className="block">
        <tbody>
          <tr>
            <td className="font-bold pr-2">{langTagLocaleMap[locale]}:</td>
            <td>
              <Tags tags={langTags} onClick={handleTagClick} />
            </td>
          </tr>
          <tr>
            <td className="font-bold pr-2">{platTagLocaleMap[locale]}:</td>
            <td>
              <Tags tags={platformTags} onClick={handleTagClick} />
            </td>
          </tr>
          <tr>
            <td className="font-bold pr-2">
              {otherTagLabelLocaleMap[locale]}:
            </td>
            <td>
              <Tags tags={otherTags} onClick={handleTagClick} />
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

function CookbookIndex({ selectedTags }) {
  const cards = [];
  const pages = getPagesUnderRoute("/cookbook").filter(notHidden);
  for (const page of pages) {
    const tags = flatTags(page.frontMatter?.tags);
    if (
      selectedTags.length === 0 ||
      selectedTags.every((tag) => tags.includes(tag))
    ) {
      cards.push(
        <ExampleCard
          key={page.route}
          title={page.meta?.title || page.frontMatter?.title || page.name}
          description={page.frontMatter?.description}
          href={page.route}
          deployUrl={page.frontMatter?.deployUrl}
          tags={tags}
        />
      );
    }
  }
  return cards;
}

export default function Cookbook() {
  const [selectedTags, setSelectedTags] = useState([]);

  return (
    <>
      <CookbookHeader />
      <CookbookTags
        setSelectedTags={setSelectedTags}
        selectedTags={selectedTags}
      />
      <Cards num="1">
        <CookbookIndex selectedTags={selectedTags} />
      </Cards>
    </>
  );
}

function flatTags(tags) {
  if (!tags) {
    return [];
  }

  let flattenTags = [];
  if (Array.isArray(tags)) {
    flattenTags = tags;
  } else {
    flattenTags = Object.keys(tags).reduce((acc, key) => {
      if (Array.isArray(tags[key])) {
        return acc.concat(tags[key]);
      } else {
        return acc.concat([tags[key]]);
      }
    }, []);
  }
  return flattenTags.map((t) => t.trim());
}

function notHidden(page) {
  return !(page.meta?.display === "hidden");
}
