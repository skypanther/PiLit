import Head from "next/head";

import Layout from "../components/layout";

const Editor = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <Head>
          <title>PiLit Show Editor</title>
        </Head>
        <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
          Edit your show here...
        </main>
      </div>
    </Layout>
  );
};

export default Editor;
