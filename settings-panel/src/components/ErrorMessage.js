import React from 'react';

import { connect } from 'react-redux';


const ErrorMessage = ({error,editing,className}) => (
  <div>
    <div 
      display-if={error && !editing} 
      className={`${className || 'settings-panel'}-error`}>
      {error}
    </div>
  </div>
);

export default connect(
  state => ({
    error: state.error,
    editing: state.editing !== null
  })
)(ErrorMessage);
