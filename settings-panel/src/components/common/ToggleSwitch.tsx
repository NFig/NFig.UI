import * as React from 'react';
import styled from 'emotion/react';
import { css } from 'emotion';

const prop = (name: string) => (props: any) => props[name];
const toggleSize = prop('toggleSize');
const widthScale = prop('widthScale');
const borderRadiusScale = prop('borderRadiusScale');

const Toggle = styled.input`
  padding: 0;
  visibility: hidden;
  position: relative;
  cursor: ${p => (!p.onChange ? undefined : 'pointer')};
  font-size: inherit;
  display: inline-block;
  line-height: inherit;
  overflow: hidden;
  vertical-align: text-bottom;
  box-sizing: border-box;

  /* dyn */
  margin: 0 calc(${toggleSize} * 0.2) 0 0 !important;
  height: ${toggleSize};
  width: calc(${toggleSize} * ${widthScale});

  &::before {
    visibility: visible;
    display: inline-block;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    content: ' ';
    background-color: #a00;
    transition: background-color 0.15s ease-in;
    box-sizing: border-box;

    /* dyn */
    border-radius: calc(${toggleSize} * ${borderRadiusScale});
  }

  &::after {
    visibility: visible;
    background-color: #fff;
    content: ' ';
    position: absolute;
    left: 1px;
    top: 1px;
    box-sizing: border-box;
    transition: left 0.15s ease-in;

    /* dyn */
    border-radius: calc(${toggleSize} * ${borderRadiusScale} - 1px);
    height: calc(${toggleSize} - 2px);
    width: calc(${toggleSize} - 2px);
  }

  &:checked::before {
    background-color: #0a0;
  }
  &:checked::after {
    /* dyn */
    left: calc(${toggleSize} * (${p => p.widthScale - 1}) + 1px);
  }
`;

Toggle.defaultProps = {
  toggleSize: '1em',
  borderRadiusScale: 1,
  widthScale: 1.75,
};

export interface ToggleSwitchProps {
  label?: string;
  checked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  name?: string;
  value?: string;
  defaultChecked?: boolean;
  size?: string;
  borderRadiusScale?: number;
  widthScale?: number;
  readOnly?: boolean;
}

export interface ToggleSwitchState {
  checked: boolean;
}

export default class ToggleSwitch extends React.Component<
  ToggleSwitchProps,
  ToggleSwitchState
> {
  constructor(props: ToggleSwitchProps) {
    super(props);

    this.controlled = props.checked !== undefined;

    if (!this.controlled) {
      this.state = {
        checked: !!props.defaultChecked,
      };
    }
  }

  controlled: boolean;

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!this.controlled) {
      this.setState({ checked: e.currentTarget.checked });
    }

    this.props.onChange && this.props.onChange(e);
  };

  render() {
    const {
      name,
      value,
      label,
      checked,
      onChange,
      size,
      borderRadiusScale,
      widthScale,
    } = this.props;

    return (
      <span
        className={css`
          display: inline-block;
          position: relative;
        `}
      >
        <label
          className={css`
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            align-items: center;
            font-weight: normal;
            margin-bottom: unset;
          `}
        >
          <Toggle
            type="checkbox"
            name={name}
            value={value}
            checked={checked}
            onChange={!this.props.readOnly ? this.onChange : undefined}
            readOnly={this.props.readOnly}
            toggleSize={size}
            borderRadiusScale={borderRadiusScale}
            widthScale={widthScale}
          />
          <span
            className={css`
              display: inline-block;
              font-size: ${size};
              font-weight: normal;
            `}
          >
            {label}
          </span>
        </label>
      </span>
    );
  }
}
