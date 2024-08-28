import React from "react";

const MenuItem = ({ title, id }) => {
  return (
    <div className="context-menu-item" key={id}>
      {title}
    </div>
  );
};
export default MenuItem;
