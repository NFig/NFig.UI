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
  color: ${p => (Color(p.color).light() ? '#333' : '#fff')};
  font-size: 85%;
  text-transform: lowercase;
  background-color: ${p => p.color};
  border: 1px solid ${p => darken(p.color, 0.1)};
  display: inline-block;
  border-radius: 3px;
`;

export type AttributesProps = {
  setting: ISetting;
  currentTier: string;
};

export const Attributes: React.StatelessComponent<AttributesProps> = ({
  setting,
  currentTier,
}: AttributesProps) => (
  <div className={css`margin: 0.5em 0;`}>
    {setting.requiresRestart ? (
      <Tag color="#248f6b">Requires Restart</Tag>
    ) : null}
    {setting.allowsOverrides[currentTier] ? null : (
      <Tag
        color="#931515"
        title={`Overrides are not allowed on tier ${currentTier}`}
      >
        Not Overridable
      </Tag>
    )}
  </div>
);
