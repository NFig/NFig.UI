import * as React from 'react';
import autosize from 'autosize';
import { css } from 'emotion';

import { ValueEditorProps } from '../../interfaces';

class AutosizeTextArea extends React.Component<
  React.HTMLProps<HTMLTextAreaElement>
> {
  static defaultProps = {
    rows: 1,
  };

  private el: HTMLTextAreaElement;

  componentDidMount() {
    autosize(this.el);
    this.el.focus();
    this.el.select();
  }

  componentWillUnmount() {
    this.dispatchEvent('autosize:destroy');
  }

  componentWillReceiveProps(nextProps) {
    this.dispatchEvent('autosize:update');
  }

  dispatchEvent(type: string) {
    const event = new CustomEvent(type, { bubbles: true, cancelable: false });
    this.el.dispatchEvent(event);
  }

  render() {
    return (
      <textarea
        {...this.props}
        ref={el => {
          this.el = el;
        }}
      />
    );
  }
}

export default class RawEditor extends React.Component<ValueEditorProps> {
  onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.props.onChange(e.currentTarget.value);
  };

  render() {
    const { value } = this.props;
    return (
      <AutosizeTextArea
        className={css`
          box-sizing: border-box;
          display: block;
          width: 100%;
          font-size: 11px;
          font-family: monospace;
        `}
        value={value || ''}
        onChange={this.onChange}
      />
    );
  }
}
