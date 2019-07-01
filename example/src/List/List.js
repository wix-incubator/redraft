import React from 'react';
import PropTypes from 'prop-types';
import { CSSTransitionGroup } from 'react-transition-group';
import './List.css';

const List = ({ ordered, children }) => (
  <CSSTransitionGroup
    component={ordered ? 'ol' : 'ul'}
    className="List"
    transitionName="animatedList"
    transitionEnterTimeout={1000}
    transitionLeaveTimeout={1000}
  >
    {children}
  </CSSTransitionGroup>
);
List.propTypes = {
  ordered: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

List.defaultProps = {
  ordered: false,
};

export default List;
