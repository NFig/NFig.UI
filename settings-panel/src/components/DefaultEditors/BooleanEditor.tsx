import * as React from 'react';

import {BooleanDisplay} from '../DefaultViewers/BooleanViewer';
import { Button } from '../common/Button';

import { ValueEditorProps } from '../../interfaces';

export default class BooleanEditor extends React.Component<ValueEditorProps> {
  onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    this.props.onChange(e.currentTarget.dataset.value);
  };

  render() {
    const { value } = this.props;
    return (
      <div>
        <Button selected={value === 'True'} data-value='True' onClick={this.onClick}>
          <BooleanDisplay value={true} />
        </Button>
        <Button selected={value === 'False'} data-value='False' onClick={this.onClick} >
          <BooleanDisplay value={false} />
        </Button>
      </div>
    );
  }
}
