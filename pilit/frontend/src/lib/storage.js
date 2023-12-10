
export const saveShow = (show) => {
  /*
    Sample saved show structure
    "PiLitShows" : [
      {
        "showName": "foobar",
        "show": JSON.stringify(show)
      },
      ...
    ]
    */
  let showName = show.showName;
  let savedShowsRaw = localStorage.getItem("PiLit");
  let savedShows = [];
  if (savedShowsRaw) {
    savedShows = JSON.parse(savedShowsRaw);
  }
  let showToSave = savedShows.find((show) => (show.showName = showName));
  if (showToSave) {
    showToSave.show = show;
  } else {
    savedShows.push({
      showName: showName,
      show: show,
    });
  }
  localStorage.setItem("PiLit", JSON.stringify(savedShows));
};

export const getSavedShowList = () => {
    // Returns a list of saved shows that could be loaded by the user
}

export const getShowByName = (name) => {
  let savedShowsRaw = localStorage.getItem("PiLit");
  if (!savedShowsRaw) {
    return;
  }
  let savedShows = JSON.parse(savedShowsRaw);
  return savedShows[0];
};

export const exportShow = (show) => {
  let filename = show.showName + ".json";
  let contentType = "application/json;charset=utf-8;";
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    var blob = new Blob(
      [decodeURIComponent(encodeURI(JSON.stringify(show)))],
      { type: contentType }
    );
    navigator.msSaveOrOpenBlob(blob, filename);
  } else {
    var a = document.createElement("a");
    a.download = filename;
    a.href =
      "data:" +
      contentType +
      "," +
      encodeURIComponent(JSON.stringify(show));
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};
