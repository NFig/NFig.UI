import * as React from 'react';
import { untracked } from 'mobx';
import { inject } from 'mobx-react';
import {
  ISetting,
  IViewerSelector,
  ValueViewerProps,
  ValueViewerType,
} from '../../interfaces';
import defaultViewerFor from '../DefaultViewers';

function ValueViewer({
  setting,
  value,
  viewerSelector,
  showExtraInfo = false,
}: ValueViewerProps & {
  viewerSelector?: IViewerSelector;
}) {
  let Viewer: ValueViewerType;
  untracked(() => {
    if (!!viewerSelector) {
      Viewer = viewerSelector(setting);
    }
    if (!Viewer) {
      Viewer = defaultViewerFor(setting);
    }
  });
  return (
    <Viewer value={value} showExtraInfo={showExtraInfo} setting={setting} />
  );
}

export default inject('viewerSelector')(ValueViewer);
