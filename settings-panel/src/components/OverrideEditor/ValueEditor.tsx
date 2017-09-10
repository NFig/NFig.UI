import * as React from 'react';
import { untracked } from 'mobx';
import { inject } from 'mobx-react';
import {
  ISetting,
  ValueEditorProps,
  ValueEditorType,
  IEditorSelector,
} from '../../interfaces';

import defaultEditorFor from '../DefaultEditors';

function ValueEditor({
  setting,
  value,
  onChange,
  editorSelector,
}: {
  setting: ISetting;
  editorSelector?: IEditorSelector;
} & ValueEditorProps) {
  let Editor: ValueEditorType;
  untracked(() => {
    if (!!editorSelector) {
      Editor = editorSelector(setting);
    }
    if (!Editor) {
      Editor = defaultEditorFor(setting);
    }
  });

  return <Editor setting={setting} value={value} onChange={onChange} />;
}

export default inject('editorSelector')(ValueEditor);
