import { IEditorSelector, ISetting, ValueEditorType } from '../../interfaces';

import BooleanEditor from './BooleanEditor';
import RawEditor from './RawEditor';
import EnumEditor from './EnumEditor';

export default function defaultEditorFor(setting: ISetting): ValueEditorType {
  if (setting.isEnum) {
    return EnumEditor;
  }

  switch (setting.typeName) {
    case 'System.Boolean':
      return BooleanEditor;
    default:
      return RawEditor;
  }
}
