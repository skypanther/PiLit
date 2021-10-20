import Head from "next/head";

import Layout from "../components/layout";

import { getShows } from "../common/api/shows";
import { getSchedules } from "../common/api/schedules";

const Home = ({ showData, scheduleData }) => {
  const { shows, showErrors } = showData;
  const { schedules, scheduleErrors } = scheduleData;
  const scheduleButtonDisabled = showErrors || scheduleErrors || !shows;
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <Head>
          <title>PiLit Editor</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="grid grid-flow-col auto-cols-auto w-10/12 text-neutral-content">
          <div className="flex justify-center box-border w-10/12">
            <div className="card lg:card-side bordered bg-neutral w-full">
              <div className="card-body">
                <h2 className="card-title">Shows</h2>
                {showErrors && <div>There was an error retrieving shows.</div>}
                {!showErrors && !shows && <div>No shows to show</div>}
                {!showErrors && shows && (
                  <ul>
                    {shows.map((show, key) => (
                      <li key={key}>{show.name}</li>
                    ))}
                  </ul>
                )}
                <div className="card-actions">
                  <button className="btn btn-primary">
                    <a href="#add-show-modal">Add a Show</a>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center box-border w-10/12">
            <div className="card lg:card-side bordered bg-neutral-focus w-full">
              <div className="card-body">
                <h2 className="card-title">Schedules</h2>
                {scheduleErrors && <div>There was an error.</div>}
                {!scheduleErrors && !schedules && !shows && (
                  <div>
                    No schedules. You must add a show before you can schedule
                    it.
                  </div>
                )}
                {!scheduleErrors && !schedules && shows && (
                  <div>No schedules to show</div>
                )}
                {!scheduleErrors && schedules && (
                  <ul>
                    {schedules.map((schedule, key) => (
                      <li key={key}>{schedule.name}</li>
                    ))}
                  </ul>
                )}
                <div className="card-actions">
                  <button
                    className="btn btn-primary"
                    disabled={scheduleButtonDisabled}
                  >
                    Schedule a Show
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="add-show-modal" className="modal">
          <div className="modal-box">
            <h2>Add Show</h2>
            <div className="flex justify-start">
              <label>Name</label>
              <input id="showNameField" className="input input-bordered ml-1" />
            </div>
            <div className="modal-action flex justify-between">
              <a href="#" className="btn">
                Cancel
              </a>
              <a href="/editor" className="btn btn-primary">
                Save
              </a>
            </div>
          </div>
        </div>

        <div id="add-show-modal" className="modal">
          <div className="modal-box">
            <p>
              Enim dolorem dolorum omnis atque necessitatibus. Consequatur aut
              adipisci qui iusto illo eaque. Consequatur repudiandae et. Nulla
              ea quasi eligendi. Saepe velit autem minima.
            </p>
            <div className="modal-action flex justify-between">
              <a href="#" className="btn">
                Cancel
              </a>
              <a href="/editor" className="btn btn-primary">
                Save
              </a>
            </div>
          </div>
        </div>

        <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center"></main>
      </div>
    </Layout>
  );
};

export const getServerSideProps = async () => {
  const showData = await getShows();
  const scheduleData = await getSchedules();
  return {
    props: { showData, scheduleData },
  };
};

export default Home;
