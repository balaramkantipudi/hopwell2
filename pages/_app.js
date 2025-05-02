// import { SessionProvider } from "next-auth/react";
// import Layout from "@/components/Layout";
// import Head from "next/head";  // Import the Head component
// import "@/styles/globals.css";

// export default function App({
//   Component,
//   pageProps: { session, ...pageProps },
// }) {
//   const getLayout = Component.getLayout || ((page) => page);

//   return (
//     <SessionProvider session={session}>
//       <Head>
//         {/* Add your meta tags here */}
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//       </Head>
//       {getLayout(
//         <>
//           <Layout>
//             <Component {...pageProps} />
//           </Layout>
//         </>
//       )}
//     </SessionProvider>
//   );
// }


// pages/_app.js
import { SessionProvider } from "next-auth/react";
import Layout from "@/components/Layout";
import Head from "next/head";
import "@/styles/globals.css";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout || ((page) => (
    <Layout>
      {page}
    </Layout>
  ));

  return (
    <SessionProvider session={session}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {getLayout(<Component {...pageProps} />)}
    </SessionProvider>
  );
}