import React from "react";
import { useRouter } from "next/router";
import { DocsThemeConfig } from "nextra-theme-docs";

const PLUTO_MAIN_REPO_URL = "https://github.com/pluto-lang/pluto";

const config: DocsThemeConfig = {
  head: (
    <>
      <link rel="pluto icon" href="/favicon.png" />
    </>
  ),
  logo: (
    <>
      <span style={{ marginLeft: ".4em", fontWeight: 800 }}>Pluto</span>
    </>
  ),
  project: {
    link: PLUTO_MAIN_REPO_URL,
  },
  chat: {
    link: "https://plutolang.slack.com/",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 54 54"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="none">
          <path
            d="M19.712.133a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386h5.376V5.52A5.381 5.381 0 0 0 19.712.133m0 14.365H5.376A5.381 5.381 0 0 0 0 19.884a5.381 5.381 0 0 0 5.376 5.387h14.336a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386"
            fill="#44BEDF"
          ></path>
          <path
            d="M53.76 19.884a5.381 5.381 0 0 0-5.376-5.386 5.381 5.381 0 0 0-5.376 5.386v5.387h5.376a5.381 5.381 0 0 0 5.376-5.387m-14.336 0V5.52A5.381 5.381 0 0 0 34.048.133a5.381 5.381 0 0 0-5.376 5.387v14.364a5.381 5.381 0 0 0 5.376 5.387 5.381 5.381 0 0 0 5.376-5.387"
            fill="#2EB67D"
          ></path>
          <path
            d="M34.048 54a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386h-5.376v5.386A5.381 5.381 0 0 0 34.048 54m0-14.365h14.336a5.381 5.381 0 0 0 5.376-5.386 5.381 5.381 0 0 0-5.376-5.387H34.048a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386"
            fill="#ECB22E"
          ></path>
          <path
            d="M0 34.249a5.381 5.381 0 0 0 5.376 5.386 5.381 5.381 0 0 0 5.376-5.386v-5.387H5.376A5.381 5.381 0 0 0 0 34.25m14.336-.001v14.364A5.381 5.381 0 0 0 19.712 54a5.381 5.381 0 0 0 5.376-5.387V34.25a5.381 5.381 0 0 0-5.376-5.387 5.381 5.381 0 0 0-5.376 5.387"
            fill="#E01E5A"
          ></path>
        </g>
      </svg>
    ),
  },
  docsRepositoryBase: PLUTO_MAIN_REPO_URL,
  footer: {
    text: "The pluto documentation.",
  },
  search: {
    placeholder: () => {
      const { locale } = useRouter();
      switch (locale) {
        case "zh-CN":
          return "搜索文档...";
        default:
          return "Search documentation...";
      }
    },
  },
  i18n: [
    { locale: "en", text: "English" },
    { locale: "zh-CN", text: "简体中文" },
  ],
  useNextSeoProps() {
    return {
      titleTemplate: "%s – Pluto",
    };
  },
  editLink: {
    component: ({ children, ...props }) => {
      const mainRepoPath = props.filePath.replace("pages", "docs");
      const editUrl = `${PLUTO_MAIN_REPO_URL}/${mainRepoPath}`;
      return (
        <a
          href={editUrl}
          target="_blank"
          rel="noreferrer"
          className="nx-text-xs nx-font-medium nx-text-gray-500 hover:nx-text-gray-900 dark:nx-text-gray-400 dark:hover:nx-text-gray-100 contrast-more:nx-text-gray-800 contrast-more:dark:nx-text-gray-50"
        >
          Edit this page
        </a>
      );
    },
  },
  feedback: {
    labels: "documentation&template=general-question.md",
  },
};

export default config;
