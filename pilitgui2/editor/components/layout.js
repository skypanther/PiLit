import Link from "next/link";
import { siteTitle } from "../common/constants";
import HtmlHead from "./htmlhead";

export default function Layout({ children }) {
  return (
    <div className="body-content bg-base-200">
      <HtmlHead />
      <div className="navbar mb-2 shadow-lg bg-neutral text-neutral-content">
        {/* <div className="flex-none">
          <button className="btn btn-square btn-ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-6 h-6 stroke-current"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        </div> */}
        <div className="flex-1 px-2 mx-2">
          <span className="text-lg font-bold">PiLit Editor</span>
        </div>
        <div className="flex-none">
          <span className="text-sm">&copy; 2021 @skypanther</span>
        </div>
      </div>

      <main className="main-content">{children}</main>
    </div>
  );
}
