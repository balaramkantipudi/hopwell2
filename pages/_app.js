import { SessionProvider } from "next-auth/react";
import Layout from "@/components/Layout";
import Head from "next/head";  // Import the Head component
import "@/styles/globals.css";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <SessionProvider session={session}>
      <Head>
        {/* Add your meta tags here */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {getLayout(
        <>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </>
      )}
    </SessionProvider>
  );
}
