import * as React from 'react';
import { inject } from 'mobx-react';
import {
  ISetting,
  ValueEditorProps,
  ValueEditorType,
  IEditorSelector,
} from '../../interfaces';
import { css } from 'emotion';

import defaultEditorFor from '../DefaultEditors';
import RawEditor from '../DefaultEditors/RawEditor';

@inject('editorSelector')
export default class ValueEditor extends React.Component<
  {
    setting: ISetting;
    editorSelector?: IEditorSelector;
    editRawValue: boolean;
    onEditRawValueChange();
  } & ValueEditorProps
> {
  render() {
    const {
      setting,
      editorSelector,
      value,
      onChange,
      editRawValue,
      onEditRawValueChange,
    } = this.props;

    let CustomEditor: ValueEditorType;
    if (!!editorSelector) {
      CustomEditor = editorSelector(setting);
    }

    if (!CustomEditor) {
      CustomEditor = defaultEditorFor(setting);
    }

    if (!editRawValue && CustomEditor !== RawEditor) {
      return (
        <div>
          <CustomEditor setting={setting} value={value} onChange={onChange} />
          <div
            className={css`
              padding: 0.5em;
              font-size: 10px;
              text-align: right;
              cursor: pointer;
              & a {
                text-decoration: none;
                color: #07f;
                &:hover {
                  text-decoration: underline;
                }
              }
            `}
          >
            <a onClick={onEditRawValueChange}>Edit raw value</a>
          </div>
        </div>
      );
    }

    return <RawEditor setting={setting} value={value} onChange={onChange} />;
  }
}
