import * as React from 'react';
import styled from 'emotion/react';
import { darken } from '../../color-manip';

export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  // emotion innerRef
  innerRef?(el: HTMLButtonElement);

  color?: string;
  bgcolor?: string;
  bordercolor?: string;

  buttonSize?: ButtonSize;
} & React.HTMLProps<HTMLButtonElement>;

export type ButtonType = React.StatelessComponent<ButtonProps>;

const paddings = {
  sm: '0.3em 0.8em',
  md: '0.5em 1em',
  lg: '0.7em 1.3em',
};

const fontSizes = {
  sm: '90%',
  md: '100%',
  lg: '110%',
};

export const Button: ButtonType = styled.button`
  font-size: ${p => fontSizes[p.buttonSize]} !important;
  &,
  &:hover {
    background-color: ${p =>
      p.selected ? darken(p.bgcolor, 0.05) : p.bgcolor} !important;
    color: ${p => p.color || '#444'} !important;
  }
  border-radius: 2px;
  border: 1px solid ${p =>
      darken(p.bgcolor, p.selected ? 0.25 : 0.15)} !important;
  margin: 0 0.3em;
  padding: 0.3em 0.8em;

  box-shadow: ${p =>
    p.selected
      ? 'inset 0 3px 10px -5px rgba(0, 0, 0, 0.5)'
      : 'none'} !important;

  transition: all 0.1s ease-in-out;

  position: relative;
  top: 0;

  &:hover {
    cursor: pointer;
    box-shadow: ${p =>
      p.selected ? undefined : '0 1px 5px rgba(117, 198, 255, 0.2)'} !important;
    border-color: #b3dfff !important;
  }

  &:disabled,
  &:disabled:hover {
    cursor: not-allowed;
    box-shadow: none !important;
    opacity: 0.75;
    border-color: ${p =>
      darken(p.bgcolor, p.selected ? 0.25 : 0.15)} !important;
  }

  &:active {
    transform: ${p => (p.selected ? 'none' : 'translateY(1px)')};
    box-shadow: ${p =>
      p.selected ? undefined : '0 -1px 2px rgba(0, 0, 0, 0.2)'} !important;
  }

  &:first-child {
    margin-left: 0;
  }
`;

Button.defaultProps = {
  buttonSize: 'md',
  bgcolor: '#fff',
  color: '#666',
};
