// Library for accessing the PiLit backend API.

import axios from "axios";

class Network {
  baseUrl = "http://127.0.0.1:8000";

  async getSavedShowList() {
    let url = `${this.baseUrl}/shows`;
    try {
      const response = await axios.get(url);
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  async getShowById(id) {
    let url = `${this.baseUrl}/shows/${id}`;
    try {
      const response = await axios.get(url);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
}

export default network = new Network();
