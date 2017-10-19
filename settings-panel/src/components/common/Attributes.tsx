import * as React from 'react';
import { css } from 'emotion';
import styled from 'emotion/react';
import { darken } from '../../color-manip';
import Color from 'color';
import { ISetting } from '../../interfaces';

export const Tag: React.StatelessComponent<
  {
    color: string;
  } & React.HTMLProps<HTMLSpanElement>
> = styled.span`
  font-weight: normal;
  margin-right: 0.2em;
  padding: 0.2em 0.5em 0.2em;
  color: ${p => (Color(p.color).light() ? darken(p.color, 0.5) : '#fff')};
  font-size: 85%;
  text-transform: lowercase;
  background-color: ${p => p.color};
  border: 1px solid ${p => darken(p.color, 0.1)};
  display: inline-block;
  border-radius: 3px;
`;

export type AttributesProps = {
  setting: ISetting;
};

export const Attributes: React.StatelessComponent<AttributesProps> = ({
  setting,
}: AttributesProps) => (
  <div className={css`margin: 0.5em 0;`}>
    {setting.requiresRestart ? (
      <Tag color="#dbe4f0">Requires Restart</Tag>
    ) : null}
    {Object.keys(setting.allowsOverrides).every(
      dc => !setting.allowsOverrides[dc],
    ) ? (
      <Tag color="#f9f2f4" title={`Overrides are not allowed`}>
        Not Overridable
      </Tag>
    ) : null}
  </div>
);
