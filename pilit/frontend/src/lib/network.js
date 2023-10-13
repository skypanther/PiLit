// Library for accessing the PiLit backend API.

import axios from "axios";

class Network {
  baseUrl = "http://127.0.0.1:8000";

  async _raw_get(url) {
    try {
      const response = await axios.get(url);
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  async getShows() {
    let url = `${this.baseUrl}/shows`;
    return await this._raw_get(url);
  }

  async getShowById(id) {
    let url = `${this.baseUrl}/shows/${id}`;
    return await this._raw_get(url);
  }

  async getChannelsByShowId(showId) {
    let url = `${this.baseUrl}/channels/${showId}`;
    return await this._raw_get(url);
  }

  _build_channel(channelObj, clips) {
    let channel = {
      id: channelObj.id,
      name: channelObj.name,
      description: channelObj.description,
      mqtt_name: channelObj.mqtt_channel,
      show_id: channelObj.show_id,
      channel_type_id: channelObj.channel_type_id,
      icon: channelObj.icon,
      sort_index: channelObj.sort_index,
      clips: clips,
    };
    return channel;
  }

  async getChannelsAndClipsForShow(showId) {
    let show = {
      channels: [],
    };
    let res = await this.getChannelsByShowId(showId);
    res.data.forEach(async (channel) => {
      let clips_res = await this.getClipsByChannelId(channel.id);
      show.channels.push(this._build_channel(channel, clips_res.data));
    });
    return show;
  }

  async getChannelById(showId, channelId) {
    let url = `${this.baseUrl}/channels/${showId}/${channelId}`;
    return await this._raw_get(url);
  }

  async getClipsByChannelId(channelId) {
    let url = `${this.baseUrl}/clips/${channelId}`;
    return await this._raw_get(url);
  }

  async getClipById(channelId, clipId) {
    let url = `${this.baseUrl}/clips/${channelId}/${clipId}`;
    return await this._raw_get(url);
  }

  // Not used currently; animation params are coded in front-end & nodes
  // async getAnimationTypeById(id) {}

  // Not used currently since the schedule for now is needed by the player
  // async getScheduleById(id) {}
}

export default network = new Network();
