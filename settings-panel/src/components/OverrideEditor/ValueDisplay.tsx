import * as React from 'react';
import { css } from 'emotion';
import styled from 'emotion/react';
import { observer, inject } from 'mobx-react';
import { ISetting, ISettingValue } from '../../interfaces';

import ValueViewer from '../common/ValueViewer';
import { Button } from '../common/Button';

import { EditIcon, CloseIcon } from '../common/Icons';
import { smallWidth } from '../../responsive';

export type ValueDisplayProps = {
  label: string;
  setting: ISetting;
  value: ISettingValue;
  onEdit?: React.MouseEventHandler<HTMLButtonElement>;
  onClear?: React.MouseEventHandler<HTMLButtonElement>;
};

export default function ValueDisplay({
  value,
  setting,
  label,
  onEdit,
  onClear,
}: ValueDisplayProps) {
  return (
    <Wrapper isOverride={value.isOverride}>
      <header>
        <label>{label}</label>
        <DataCenterIndicator>
          <dt>Data Center:</dt>
          <dd>{value.dataCenter}</dd>
        </DataCenterIndicator>
      </header>
      <div>
        <ValueViewer setting={setting} value={value} showExtraInfo={true} />
      </div>
      {value.isOverride ? (
        <div className={css`margin-top: 1em;`}>
          <Button buttonSize="sm" onClick={onEdit}>
            <EditIcon /> edit
          </Button>
          <Button buttonSize="sm" onClick={onClear}>
            <CloseIcon /> clear
          </Button>
        </div>
      ) : null}
    </Wrapper>
  );
}

const DataCenterIndicator = styled.dl`
  display: inline;
  font-size: 0.9em;

  &:before {
    content: '\\2013';
    padding: 0 0.5em;
  }

  & dt,
  & dd {
    display: inline;
    margin: 0;
  }

  & dd {
    font-weight: bold;
    padding-left: 0.5em;
  }
`;

type WrapperProps = {
  isOverride: boolean;
} & React.HTMLProps<HTMLDivElement>;

const Wrapper: React.StatelessComponent<WrapperProps> = styled.div`
  @media (min-width: ${smallWidth + 1}px) {
    flex-grow: 1;
    width: 50%;
  }
  box-sizing: border-box;

  padding: 0.5em 1em;

  background-color: ${p => (p.isOverride ? 'aliceblue' : 'transparent')};

  &:only-child {
    width: auto;
    padding: 0;
  }

  & header {
    margin-bottom: 0.5em;
    > label {
      font-size: 1.1em;
      font-weight: bold;
      color: steelblue;
    }
  }

  /* The default display is just <pre> */
  & pre {
    border: 1px solid #ddd;
    background-color: #eee;
    font-size: 11px;
    padding: 1em;
    margin: 0;
  }
`;
