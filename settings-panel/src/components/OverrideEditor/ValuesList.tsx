import * as React from 'react';
import { css } from 'emotion';
import styled from 'emotion/react';
import { ISetting, ISettingValue } from '../../interfaces';
import { CloseIcon } from './Icons';
import ValueViewer from '../common/ValueViewer';
import { smallWidth } from '../../responsive';

export interface ValuesListProps {
  label: string;
  setting: ISetting;
  values: ISettingValue[];
  onClear?: React.MouseEventHandler<HTMLElement>;
}

const Table = styled.table`
  @media (min-width: ${smallWidth + 1}px) {
    width: 49%;
  }
  @media (max-width: ${smallWidth}px) {
    width: 100%;
    margin-top: 1em;
  }
  font-size: 80%;
  border-collapse: collapse;
  margin-top: 0.5em;
  box-sizing: border-box;
  & th,
  & td {
    padding: 0.2em 0.5em;
    height: 18px;
    text-align: left;
  }
  > thead {
    border-bottom: 1px solid #ddd;
  }
  > tbody tr:nth-child(odd) {
    background-color: #f8f8f8;
  }

  & pre {
    margin: 0;
  }
`;

export default function ValuesList({
  label,
  setting,
  values,
  onClear,
}: ValuesListProps) {
  const showClearColumn = values.every(v => v.isOverride);
  const showTierColumn = values.every(v => v.isDefault);
  return (
    <Table>
      <thead>
        <tr>
          <td colSpan={4}>{label}</td>
        </tr>
        <tr>
          {showTierColumn ? <th>Tier</th> : null}
          <th>Data Center</th>
          <th>Value</th>
          {showClearColumn ? (
            <th style={{ width: '10px', textAlign: 'right' }}>Clear</th>
          ) : null}
        </tr>
      </thead>
      <tbody>
        {values.map(v => (
          <tr key={`${v.tier}|${v.dataCenter}`}>
            {showTierColumn ? <td>{v.tier}</td> : null}
            <td>{v.dataCenter}</td>
            <td>
              <ValueViewer setting={setting} value={v} />
            </td>
            {showClearColumn ? (
              <td
                style={{ width: '10px', textAlign: 'right', cursor: 'pointer' }}
                data-dc={v.dataCenter}
                onClick={onClear}
              >
                <CloseIcon offsetTop="0" iconSize="1.2em" />
              </td>
            ) : null}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
