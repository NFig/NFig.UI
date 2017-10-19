import * as React from 'react';
import { css } from 'emotion';
import styled from 'react-emotion';

import { autorun, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Store } from '../../store';

import SearchIcon from './SearchIcon';

const Wrapper = styled.div`position: relative;`;

const SearchInput = styled.input`
  padding-left: 1.4em;
  display: block;
  box-sizing: border-box;
  width: 100%;
  font-size: 1em;
`;

@inject('store')
@observer
export default class FilterBox extends React.Component<{ store?: Store }> {
  private node: HTMLInputElement;

  private disposeFocusHandler: IReactionDisposer;

  onChange = (e: React.FormEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    this.props.store.setFilter(value);
  };

  onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Escape':
        const { store } = this.props;
        if (store.editing !== null) {
          return;
        }
        if (store.filter !== '') {
          store.setFilter('');
        }
        e.stopPropagation();
        break;
    }
  };

  onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    this.props.store.selectNone();
  };

  componentDidMount() {
    this.disposeFocusHandler = autorun(() => {
      if (!!this.props.store.editing || this.props.store.selected >= 0) {
        this.node.blur();
      }
    });

    document.addEventListener('keydown', this.handleUnfocusedEscape);
  }

  handleUnfocusedEscape = (e: KeyboardEvent) => {
    const { store } = this.props;
    if (
      (e.key === 'Escape' || (e.key === 'ArrowUp' && store.selected === 0)) &&
      document.activeElement !== this.node
    ) {
      this.node.focus();
      this.node.select();
    } else if (
      e.key === 'Escape' &&
      document.activeElement === this.node &&
      store.filter === ''
    ) {
      this.node.blur();
    }
  };

  componentWillUnmount() {
    this.disposeFocusHandler();
  }

  render() {
    return (
      <Wrapper>
        <SearchIcon />
        <SearchInput
          ref={node => {
            this.node = node;
          }}
          value={this.props.store.filter}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          onFocus={this.onFocus}
        />
      </Wrapper>
    );
  }
}
