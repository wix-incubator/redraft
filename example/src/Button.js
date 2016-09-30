import React, { PropTypes } from 'react';

import './Button.css';

const Button = ({ label, handleClick }) => (
  <button className="Button" onClick={handleClick} >{label}</button>
);

export default Button;
