import Head from "next/head";
import { getShows } from "../common/api/shows";

const Home = ({ shows, error }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <section>
          <header>
            <h1>List of shows</h1>
          </header>
          {error && <div>There was an error.</div>}
          {!error && !shows && <div>No shows to show</div>}
          {!error && shows && (
            <ul>
              {shows.map((show, key) => (
                <li key={key}>{show.name}</li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export const getServerSideProps = async () => {
  const data = await getShows();
  return {
    props: data,
  };
};

export default Home;
