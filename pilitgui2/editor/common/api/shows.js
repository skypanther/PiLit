import axios from "axios";
import { baseUrl } from "../constants";

export const getShows = async () =>
  await axios
    .get(`${baseUrl}/shows/`)
    .then((res) => ({
      error: false,
      data: res.data,
    }))
    .catch(() => ({
      error: true,
      data: null,
    }));

export const getShow = async (show_id) =>
  await axios
    .get(`${baseUrl}/shows/${show_id}`)
    .then((res) => ({
      error: false,
      data: res,
    }))
    .catch(() => ({
      error: true,
      data: null,
    }));
