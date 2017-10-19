import * as React from 'react';
import { ValueViewerType } from '../../interfaces';
import styled from 'emotion/react';

import {
  CheckCircleIcon as TrueIcon,
  XIcon as FalseIcon,
} from '../common/Icons';

const BooleanLabel = styled.span`
  font-variant: small-caps;
  font-weight: bold;
`;

export const BooleanDisplay = ({ value }) => {
  const Icon = value ? TrueIcon : FalseIcon;
  const fill = value ? '#0a0' : '#a00';
  const label = value ? 'true' : 'false';
  const top = value ? undefined : '3px';

  return (
    <span>
      <Icon style={{ top }} />
      <BooleanLabel style={{ color: fill }}>{label}</BooleanLabel>
    </span>
  );
};

export default ({ value }) => <BooleanDisplay value={value.value === 'True'} />;
