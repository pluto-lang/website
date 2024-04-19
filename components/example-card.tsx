import cn from "clsx";
import type { ReactNode } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { AiOutlineCloud } from "react-icons/ai";
import { Tags } from "./tag";

const defaultIcon = <AiOutlineCloud />;

interface ExampleCardProps {
  title: string;
  description: string;
  href: string;
  tags?: string[];
  icon?: ReactNode;
  deployUrl?: string;
  disableIcon?: boolean;
}

export function ExampleCard({
  title,
  description,
  icon,
  href,
  tags,
  deployUrl,
  disableIcon,
  ...props
}: ExampleCardProps) {
  icon = icon ?? defaultIcon;
  disableIcon = disableIcon ?? false;

  const { locale } = useRouter();
  const readMoreText = locale === "en" ? "Read More" : "阅读更多";
  const deployNowText = locale === "en" ? "Deploy Now" : "立即部署";

  return (
    <>
      <div className="relative flex flex-col block overflow-hidden shadow-lg card-main  rounded-xl dark:bg-opacity-0 no-underline text-black dark:nx-text-white">
        <div className={cn("px-8 pt-8", deployUrl ? "pb-2" : "pb-8")}>
          <NextLink
            href={href}
            target="_blank"
            {...props}
            style={{ textDecoration: "none" }}
          >
            <div className="inline-flex items-center space-x-3 mb-1">
              {!disableIcon && (
                <div className="flex items-center justify-center bg-black rounded-lg bg-opacity-5 w-9 h-9 icon-circle">
                  {icon}
                </div>
              )}
              <h3 className="m-0 text-lg font-semibold leading-6 tracking-tight text-gray-900 dark:nx-text-white">
                {title}
              </h3>
            </div>
          </NextLink>

          {tags && (
            <div className="my-1">
              <Tags tags={tags} />{" "}
            </div>
          )}

          <NextLink
            href={href}
            target="_blank"
            {...props}
            style={{ textDecoration: "none" }}
          >
            <div>
              <p className="mt-1 text-base font-medium leading-7 text-gray-500 dark:nx-text-gray-400 line-clamp-4">
                {description}
              </p>
            </div>
          </NextLink>
        </div>

        <div className="card-btns mt-auto flex w-full flex-row justify-center self-end text-center text-base text-gray-500 dark:nx-text-gray-400 nx-border-t">
          <button className="card-btn nx-border-r flex-1 font-medium rounded-none p-4 hover:text-gray-900 dark:hover:nx-text-gray-100">
            <NextLink
              href={href}
              target="_blank"
              {...props}
              style={{ textDecoration: "none" }}
            >
              {readMoreText} →
            </NextLink>
          </button>
          {deployUrl && (
            <button className="card-btn border-l flex-1 font-medium rounded-none p-4 hover:text-gray-900 dark:hover:nx-text-gray-100">
              <NextLink
                href={deployUrl}
                target="_blank"
                {...props}
                style={{ textDecoration: "none" }}
              >
                {deployNowText} →
              </NextLink>
            </button>
          )}
        </div>
      </div>
      <style jsx global>{`
        .card-main {
          background-color: #fff;
        }

        .card-btns {
          border-color: #dfdfdf;
        }

        .card-btn {
          border-color: #dfdfdf;
        }

        .dark .card-main {
          background-color: #1a202c;
        }

        .dark .card-btns {
          border-color: #2d3748;
        }

        .dark .card-btn {
          border-color: #2d3748;
        }

        .link {
          text-decoration: none;
        }

        html .icon-circle {
          background: linear-gradient(
            180deg,
            rgba(50, 134, 241, 0.3) 0%,
            rgba(195, 58, 195, 0.2) 100%
          );
        }
      `}</style>
    </>
  );
}
