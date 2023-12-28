import React from "react";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";

const App = ({ Component, pageProps }) => {
  return (
    <>
      {/* Google Analytics */}
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-0EPVGPJ5WD" />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-0EPVGPJ5WD');
        `}
      </Script>
      {/* Vercel Analytics */}
      <Analytics />

      <Component {...pageProps} />
    </>
  );
};

export default App;
