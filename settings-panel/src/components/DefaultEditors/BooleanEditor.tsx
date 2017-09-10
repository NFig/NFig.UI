import * as React from 'react';
import ToggleSwitch from '../common/ToggleSwitch';

import { ValueEditorProps } from '../../interfaces';

export default class BooleanEditor extends React.Component<ValueEditorProps> {
  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onChange(e.currentTarget.checked ? 'True' : 'False');
  };

  render() {
    const { value } = this.props;
    return (
      <ToggleSwitch
        checked={value === 'True'}
        onChange={this.onChange}
        label={value || 'False'}
      />
    );
  }
}
