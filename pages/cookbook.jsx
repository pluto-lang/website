import { useRouter } from "next/router";
import React, { useState } from "react";
import { Cards } from "nextra/components";
import { getPagesUnderRoute } from "nextra/context";
import { Tags } from "components/tag";
import { ExampleCard } from "components/example-card";

const title = {
  "zh-CN": "案例",
  en: "Cookbook",
};

const description = {
  "zh-CN": "使用 Pluto 构建的应用案例，提供端到端的实践指导。",
  en: "Examples for building applications with Pluto, emphasizing practical and comprehensive use cases.",
};

const programmingLang = {
  "zh-CN": "语言",
  en: "Language",
};

const platform = {
  "zh-CN": "平台",
  en: "Platform",
};

const other = {
  "zh-CN": "其他",
  en: "Other",
};

function CookbookHeader() {
  const { locale } = useRouter();
  return (
    <div className="max-w-screen-lg mx-auto pt-4 pb-8 mb-16 border-b border-gray-400 border-opacity-20">
      <h1>
        <span className="font-bold leading-tight lg:text-5xl">
          {title[locale]}
        </span>
      </h1>
      <p className="text-center text-gray-500 dark:text-gray-400 font-space-grotesk">
        {description[locale]}
      </p>
    </div>
  );
}

function CookbookTags({ setSelectedTags, selectedTags }) {
  function TagBlock({ label, tags, onClick }) {
    return (
      <tr>
        <td className="font-bold pr-2">{label}:</td>
        <td>
          <Tags tags={tags} onClick={onClick} />
        </td>
      </tr>
    );
  }

  const pages = getPagesUnderRoute("/cookbook");
  const tags = pages.map((page) => flatTags(page.frontMatter?.tags)).flat();
  const uniqueTags = [];
  tags.forEach((tag) => {
    if (!uniqueTags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      uniqueTags.push(tag);
    }
  });

  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const langTags = ["TypeScript", "Python"];
  const platformTags = ["AWS", "Kubernetes", "AliCloud"];
  const others = uniqueTags.filter((tag) => {
    return (
      langTags.every((t) => t.toLowerCase() !== tag.toLowerCase()) &&
      platformTags.every((t) => t.toLowerCase() !== tag.toLowerCase())
    );
  });

  const { locale } = useRouter();
  return (
    <>
      <table className="block">
        <tbody>
          <TagBlock
            label={programmingLang[locale]}
            tags={langTags}
            onClick={handleTagClick}
          />
          <TagBlock
            label={platform[locale]}
            tags={platformTags}
            onClick={handleTagClick}
          />
          <TagBlock
            label={other[locale]}
            tags={others}
            onClick={handleTagClick}
          />
        </tbody>
      </table>
    </>
  );
}

function CookbookIndex({ selectedTags }) {
  const cards = [];
  const pages = getPagesUnderRoute("/cookbook");
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
