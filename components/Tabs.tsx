// Modified from codesandbox/docs
import React, { useEffect, useState, ReactNode, useCallback } from "react";
import * as ReactDOMServer from "react-dom/server";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import styles from "./Tabs.module.css";
import { useRouter } from "next/router";

export const TabsContainer = TabsPrimitive.Root;
export const TabsList = TabsPrimitive.List;
export const TabsTrigger = TabsPrimitive.Trigger;
export const TabsContent = TabsPrimitive.Content;

interface WrapContentProps {
  children: ReactNode;
}

export function WrapContent({ children }: WrapContentProps) {
  return <>{children}</>;
}

interface TabsProps {
  children: ReactNode[];
  tabs: string[];
}

export function Tabs({ children, tabs }: TabsProps) {
  const router = useRouter();
  const [tab, setTab] = useState<string | undefined>(undefined);

  useEffect(() => {
    setTab(router.query.tab as string | undefined);
  }, [router.query]);

  const checkContentMatch = useCallback(
    (url: string, pushURL: boolean) => {
      const match = url.split("#")[1];
      let checkMatch: number | false = false;
      for (let i = 0; i < children.length; i++) {
        const content = ReactDOMServer.renderToString(children[i]);

        if (content.includes(match)) {
          checkMatch = i;
          break;
        }
      }

      if (checkMatch !== false) {
        if (pushURL) {
          let newurl = url.replace(
            /tab=(.*?)(\#|\s)/,
            `tab=${slugify(tabs[checkMatch])}#`
          );

          router.push(newurl, undefined, {
            shallow: true,
          });
        }
        setTab(slugify(tabs[checkMatch]));
      }
    },
    [children, router, tabs]
  );

  const onHashChanged = useCallback(
    (event: HashChangeEvent) => {
      checkContentMatch(event.newURL, true);
    },
    [checkContentMatch]
  );

  useEffect(() => {
    window.addEventListener("hashchange", onHashChanged);

    if (router.asPath.includes("#")) {
      checkContentMatch(router.asPath, false);
    }

    return () => {
      window.removeEventListener("hashchange", onHashChanged);
    };
  }, [router, onHashChanged, checkContentMatch]);

  const handleValueChange = (value: string) => {
    router.push(
      {
        query: { tab: value },
      },
      undefined,
      {
        scroll: false,
        shallow: true,
      }
    );
  };

  return (
    <TabsContainer
      value={tab}
      defaultValue={slugify(tabs[0])}
      className={styles.container}
      onValueChange={handleValueChange}
    >
      <TabsList className={styles.tabList}>
        {tabs.map((title, index) => (
          <TabsTrigger
            value={slugify(title)}
            className={styles.tabTrigger}
            key={`tab-${slugify(title)}-${index}`}
          >
            {title}
          </TabsTrigger>
        ))}
      </TabsList>
      {children.map((child, index) => (
        <TabsContent
          value={slugify(tabs[index])}
          className={styles.tabContent}
          key={`content-${slugify(tabs[index])}-${index}`}
        >
          {child}
        </TabsContent>
      ))}
    </TabsContainer>
  );
}

export const slugify = (text: string): string =>
  text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
