import cn from "clsx";
import type { ReactNode } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { AiOutlineCloud } from "react-icons/ai";

const defaultIcon = <AiOutlineCloud />;

interface ExampleCardProps {
  title: string;
  description: string;
  href: string;
  icon?: ReactNode;
  deployUrl?: string;
}

export function ExampleCard({
  title,
  description,
  icon,
  href,
  deployUrl,
  ...props
}: ExampleCardProps) {
  icon = icon ?? defaultIcon;

  const { locale } = useRouter();
  const readMoreText = locale === "en" ? "Read More" : "阅读更多";
  const deployNowText = locale === "en" ? "Deploy Now" : "立即部署";

  return (
    <>
      <div className="relative flex flex-col block overflow-hidden shadow-lg card-main  rounded-xl dark:bg-opacity-0 no-underline text-black dark:nx-text-white">
        <div className={cn("px-8 pt-8", deployUrl ? "pb-2" : "pb-8")}>
          <NextLink href={href} target="_blank" {...props}>
            <div className="inline-flex items-center space-x-3">
              <div className="flex items-center justify-center bg-black rounded-full bg-opacity-5 w-9 h-9 icon-circle">
                {icon}
              </div>
              <h3 className="m-0 text-lg font-semibold leading-6 tracking-tight text-gray-900 dark:nx-text-white">
                {title}
              </h3>
            </div>

            <div>
              <p className="mt-2 text-base font-medium leading-7 text-gray-500 dark:nx-text-gray-400 line-clamp-4">
                {description}
              </p>
            </div>
          </NextLink>
        </div>

        <div className="card-btns mt-auto flex w-full flex-row justify-center divide-x divide-[#dfdfdf] self-end text-center text-base text-gray-500 dark:ndivide-black dark:nx-text-gray-400 nx-border-t">
          <button className="flex-1 font-medium rounded-none p-4 hover:text-gray-900 dark:hover:nx-text-gray-100">
            <NextLink href={href} target="_blank" {...props}>
              {readMoreText} →
            </NextLink>
          </button>
          {deployUrl && (
            <button className="flex-1 font-medium rounded-none p-4 hover:text-gray-900 dark:hover:nx-text-gray-100">
              <NextLink href={deployUrl} target="_blank" {...props}>
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

        .dark .card-main {
          background-color: #1a202c;
        }

        .dark .card-btns {
          border-color: #2d3748;
        }

        html .card-btn {
          outline-offset: 2px;
          outline: 2px solid blue;
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
