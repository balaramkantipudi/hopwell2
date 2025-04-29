import React from "react";

const ButtonGradient = ({ title = "Gradient Button", onClick = () => {} }) => {
  return (
    <button className="btn bg-indigo-900 btn-gradient animate-shimmer" onClick={onClick}>
      {title}
    </button>
  );
};

export default ButtonGradient;
