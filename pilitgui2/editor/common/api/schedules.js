import axios from "axios";
import { baseUrl } from "../constants";

export const getSchedules = async () =>
  await axios
    .get(`${baseUrl}/schedules/`)
    .then((res) => ({
      error: false,
      data: res.data,
    }))
    .catch(() => ({
      error: true,
      data: null,
    }));

export const getSchedule = async (schedule_id) =>
  await axios
    .get(`${baseUrl}/schedules/${schedule_id}`)
    .then((res) => ({
      error: false,
      data: res,
    }))
    .catch(() => ({
      error: true,
      data: null,
    }));
