import * as React from 'react';
import { css } from 'emotion';
import styled from 'emotion/react';

export type IIconProps = {
  fill?: string;
  iconSize?: string;
  offsetTop?: string;
} & React.HTMLProps<SVGElement>;

export type IconType = React.StatelessComponent<IIconProps>;

const IconSvg: IconType = ({
  children,
  fill = '#666',
  iconSize = '1em',
  offsetTop = '2px',
  className,
}: IIconProps) => (
  <svg
    className={css`
      composes: ${className};
      display: inline;
      vertical-align: baseline;
      position: relative;
      top: ${offsetTop};
      margin-right: 0.2em;
      fill: ${fill} !important;
    `}
    fill={fill}
    height={iconSize}
    width={iconSize}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    {children}
  </svg>
);

export const EditIcon: IconType = (props: IIconProps) => (
  <IconSvg fill="#0a0" {...props}>
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    <path d="M0 0h24v24H0z" fill="none" />
  </IconSvg>
);

export const CloseIcon: IconType = (props: IIconProps) => (
  <IconSvg fill="#a00" {...props}>
    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
    <path d="M0 0h24v24H0z" fill="none" />
  </IconSvg>
);

export const UploadIcon: IconType = (props: IIconProps) => (
  <IconSvg fill="#0a0" {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
  </IconSvg>
);

export const LabelIcon: IconType = (props: IIconProps) => (
  <IconSvg fill="#07c" {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z" />
  </IconSvg>
);
