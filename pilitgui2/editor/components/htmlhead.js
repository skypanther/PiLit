import Head from "next/head";
import { siteDescription } from "../common/constants";

export default function HtmlHead() {
  return (
    <Head>
      <meta name="description" content={siteDescription} />
    </Head>
  );
}
