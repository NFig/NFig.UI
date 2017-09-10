import * as React from 'react';
import { ValueViewerType } from '../../interfaces';
import { css } from 'emotion';

const RawViewer: ValueViewerType = ({ value }) => (
  <pre
    className={css`
      border: none;
      margin: 0;
      padding: 0;
      background: none;
    `}
  >
    {value && value.value}
  </pre>
);

export default RawViewer;
