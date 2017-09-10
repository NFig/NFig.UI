import * as React from 'react';
import { css, keyframes } from 'emotion';
import styled from 'emotion/react';
import { smallWidth } from '../../responsive';

const shimmer = keyframes`
  from {
    background-position: -200px 0;
  }
  to {
    background-position: calc(100% + 200px) 0;
  }
`;

const FakeHeader = styled.p`
  animation: ${shimmer} 1s ease-in-out infinite;
  background-color: #eee;
  background-image: linear-gradient(
    to right,
    rgba(221, 221, 221, 0) 0,
    rgba(221, 221, 221, 1) 100px,
    rgba(221, 221, 221, 0) 200px
  );
  background-repeat: no-repeat;
  background-size: 200px 100%;
  color: #666;
  margin: 0.5em 0;
  @media (max-width: ${smallWidth + 1}px) {
    margin-top: 1em;
  }
  padding: 0.5em 0.5rem 0.3em;
  font-weight: bold;
  font-size: 16px;
  color: #444;
  text-align: left;
`;

export default function() {
  return <FakeHeader>Loading&hellip;</FakeHeader>;
}
