import { ISetting, ValueViewerType } from '../../interfaces';

import BooleanViewer from './BooleanViewer';
import RawViewer from './RawViewer';
import EnumViewer from './EnumViewer';

export default function defaultViewerFor(setting: ISetting): ValueViewerType {
  if (setting.isEnum) {
    return EnumViewer;
  }

  switch (setting.typeName) {
    case 'System.Boolean':
      return BooleanViewer;
    default:
      return RawViewer;
  }
}
