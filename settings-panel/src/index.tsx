import * as React from 'react';
import { render } from 'react-dom';
import styled from 'emotion/react';
import { observer, Provider } from 'mobx-react';
import { Store } from './store';
import { Dictionary } from './interfaces';

import FilterBox from './components/FilterBox';
import SettingsList from './components/SettingsList';
import OverrideEditor from './components/OverrideEditor';

import { SettingsPanelConfig } from './interfaces';

let DevTools = null;
if (process.env.NODE_ENV !== 'production') {
  DevTools = require('mobx-react-devtools').default;
}

const Wrapper = styled.div`
  font-family: sans-serif;
  font-size: 14px;
`;

function requireProps(obj, ...props: string[]) {
  const errors = [];
  for (const prop of props) {
    if (!obj[prop]) {
      errors.push(` -> missing required property '${prop}'`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Configuration has errors:\n${errors.join('\n')}`);
  }
}

@observer
class SettingsPanel extends React.Component<SettingsPanelConfig> {
  constructor(props: SettingsPanelConfig) {
    super(props);
    requireProps(
      props,
      'settingsJsonUrl',
      'setOverrideUrl',
      'clearOverrideUrl',
      'tierColors',
    );
    const { setOverrideUrl, clearOverrideUrl } = props;
    this.store = new Store(setOverrideUrl, clearOverrideUrl);
  }

  store: Store;

  componentDidMount() {
    this.store.load(this.props.settingsJsonUrl);
  }

  componentWillUnmount() {
    this.store.dispose();
  }

  render() {
    return (
      <Provider
        store={this.store}
        tierColors={this.props.tierColors}
        editorSelector={this.props.editorSelector}
        viewerSelector={this.props.viewerSelector}
      >
        <Wrapper>
          <FilterBox />
          <SettingsList />
          {this.store.editing && (
            <OverrideEditor setting={this.store.editing} />
          )}

          {DevTools && <DevTools />}
        </Wrapper>
      </Provider>
    );
  }
}

function mount(target: string, props: SettingsPanelConfig) {
  const container = document.getElementById(target);
  if (!container) {
    throw new Error(`Could not find element with id #${target}`);
  }

  return render(<SettingsPanel {...props} />, container);
}

export { SettingsPanel, mount, SettingsPanelConfig };
