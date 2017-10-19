import * as React from 'react';
import { ValueEditorProps } from '../../interfaces';

import { css } from 'emotion';
import styled from 'emotion/react';
import { LabelIcon } from '../common/Icons';

const Wrapper = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const EnumItem = styled.li`
  display: flex;
  background-color: ${p => (p.isSelected ? '#ecf6fb' : 'none')};
  padding: 0.2em 0.5em;
  margin: 0;
  cursor: pointer;
  color: #444;
  &:hover {
    background-color: #ecf6fb;
  }
`;

const Description = styled.div`
  font-size: 11px;
  color: #666;
`;

class EnumEditor extends React.Component<ValueEditorProps> {
  onSelect = (e: React.MouseEvent<HTMLLIElement>) => {
    this.props.onChange(e.currentTarget.dataset.value);
  };

  render() {
    const { value } = this.props;
    const { enumNames } = this.props.setting;

    return (
      <Wrapper>
        {Object.keys(enumNames).map(ev => {
          const { name, description } = enumNames[ev];
          return (
            <EnumItem
              key={ev}
              isSelected={ev === value}
              onClick={this.onSelect}
              data-value={ev}
            >
              <div>
                <LabelIcon
                  className={css`
                    height: 12px;
                    width: 12px;
                    display: inline-block;
                    visibility: ${ev == value ? 'visible' : 'hidden'};
                  `}
                />
                {name} = {ev}
              </div>
              {!!description && (
                <Description>{enumNames[value].description}</Description>
              )}
            </EnumItem>
          );
        })}
      </Wrapper>
    );
  }
}

export default EnumEditor;
