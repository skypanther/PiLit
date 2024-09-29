import React, { useState, useEffect } from "react";

const MenuContext = ({
  channelName,
  channelIndex,
  handleDeleteChannel,
  handleChannelEdit,
  mqttName,
}) => {
  const [clicked, setClicked] = useState(false);
  const [points, setPoints] = useState({
    x: 0,
    y: 0,
  });
  useEffect(() => {
    const handleClick = () => setClicked(false);
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, []);
  return (
    <div className="channel-title">
      <div
        onContextMenu={(e) => {
          e.preventDefault();
          setClicked(true);
          setPoints({
            x: e.pageX,
            y: e.pageY,
          });
          setTimeout(() => {
            document.getElementById("cm_" + channelName).style.top = 20;
            document.getElementById("cm_" + channelName).style.left = 20;
            document.getElementById("cm_" + channelName).style.display =
              "block";
          }, 0);
        }}
      >
        <div
          className="channel-title-text"
          onClick={() => {
            handleChannelEdit(channelIndex, channelName, mqttName);
          }}
        >
          {channelName}
        </div>
      </div>
      {clicked && (
        <div className="context-menu-container" id={"cm_" + channelName}>
          <ul>
            <li>Copy</li>
            <li>Paste</li>
            <li
              onClick={(e) => {
                // if (confirm("There's no undo... Delete this channel?")) {
                handleDeleteChannel(channelIndex);
                // }
              }}
            >
              Delete
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
export default MenuContext;
