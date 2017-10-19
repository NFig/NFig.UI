import * as React from 'react';
import { ValueViewerType } from '../../interfaces';
import styled from 'react-emotion';

const Wrapper = styled.span`
  font-size: 12px;
  font-weight: bold;
`;

const Name = styled.span``;

const Value = styled.span`
  &:before {
    content: ' - (';
  }
  &:after {
    content: ')';
  }
`;

const EnumViewer: ValueViewerType = ({
  value,
  setting,
  showExtraInfo = false,
}) => (
  <Wrapper>
    <Name>{setting.enumNames[value.value].name}</Name>
    {showExtraInfo ? <Value>{value.value}</Value> : null}
  </Wrapper>
);

export default EnumViewer;
