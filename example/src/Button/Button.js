import React from 'react';
import PropTypes from 'prop-types';

import './Button.css';

const Button = ({ label, handleClick }) => (
  <button className="Button" type="button" onClick={handleClick}>
    {label}
  </button>
);

Button.propTypes = {
  label: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired,
};

export default Button;
