import * as React from 'react';
import { ValueViewerType } from '../../interfaces';

import ToggleSwitch from '../common/ToggleSwitch';

const BooleanViewer: ValueViewerType = ({ value, showExtraInfo = false }) => (
  <ToggleSwitch
    readOnly
    checked={value.value === 'True'}
    label={showExtraInfo ? value.value : undefined}
  />
);

export default BooleanViewer;
