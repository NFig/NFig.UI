import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { ISetting, ISettingValue, INewOverride } from '../../interfaces';
import { Store } from '../../store';
import { css, keyframes } from 'emotion';
import styled from 'emotion/react';
import * as Color from 'color';

import { Dictionary } from '../../interfaces';

import Markdown from '../common/Markdown';
import { Button } from '../common/Button';

import TierBanner from './TierBanner';
import ValueDisplay from './ValueDisplay';
import ValueEditor from './ValueEditor';
import ValuesList from './ValuesList';
import ErrorMessage from '../common/ErrorMessage';

import { UploadIcon, CloseIcon } from '../common/Icons';
import { Attributes } from '../common/Attributes';

import { smallWidth } from '../../responsive';

export interface OverrideEditorProps {
  store?: Store;
  setting: ISetting;
  tierColors?: Dictionary<string>;
}

function shouldShowDetails({ allOverrides, activeOverride }: ISetting) {
  if (!allOverrides || allOverrides.length === 0) {
    return false;
  }

  if (allOverrides.length >= 2) {
    return true;
  }

  // We have one override, but it's not active
  if (!activeOverride) {
    return true;
  }

  // Only override is the active one
  return false;
}

@inject('store', 'tierColors')
@observer
export default class OverrideEditor extends React.Component<
  OverrideEditorProps,
  INewOverride & { showDetails: boolean; editRawValue: boolean }
> {
  constructor(props: OverrideEditorProps) {
    super(props);
    this.state = {
      selectedDataCenter: null,
      newOverrideValue: '',
      showDetails: shouldShowDetails(props.setting),
      editRawValue: false,
    };
  }

  componentDidMount() {
    document.body.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    document.body.removeEventListener('keydown', this.onKeyDown);
  }

  onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    this.closeIfNotLoading();
  };

  onContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        this.closeIfNotLoading();
        e.stopPropagation();
        break;
    }
  };

  closeIfNotLoading() {
    if (!this.props.store.loading) {
      this.props.store.edit(null);
    }
  }

  selectDataCenter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { setting, store } = this.props;
    const selectedDataCenter = e.currentTarget.dataset.dc;
    let settingValue = setting.allOverrides.find(
      o => o.dataCenter === selectedDataCenter,
    );

    if (!settingValue) {
      settingValue = setting.allDefaults.find(
        o => o.dataCenter === selectedDataCenter && o.tier === store.tier,
      );
    }

    if (!settingValue) {
      settingValue = setting.activeOverride || setting.defaultValue;
    }

    const newOverrideValue = settingValue.value;

    this.setState({ selectedDataCenter, newOverrideValue });
  };

  onCancelEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    this.setState(() => ({
      selectedDataCenter: null,
      newOverrideValue: '',
      editRawValue: false,
    }));
  };

  onNewOverrideValueChange = (newOverrideValue: string) => {
    this.setState(() => ({ newOverrideValue }));
  };

  onSetNewOverride = async () => {
    const { setting, store } = this.props;
    await store.setOverride(setting, this.state);
    this.setState(() => ({
      selectedDataCenter: null,
      newOverrideValue: '',
      editRawValue: false,
    }));
  };

  onEditCurrentOverride = () => {
    const { value, dataCenter } = this.props.setting.activeOverride;
    this.setState({
      selectedDataCenter: dataCenter,
      newOverrideValue: value,
    });
  };

  onClearCurrentOverride = async () => {
    const { setting, store } = this.props;
    await store.clearOverride(setting, setting.activeOverride.dataCenter);
    this.setState(() => ({
      selectDataCenter: null,
      newOverrideValue: '',
    }));
  };

  onClearOverride = async (e: React.MouseEvent<HTMLElement>) => {
    const { setting, store } = this.props;
    const { dc: dataCenter } = e.currentTarget.dataset;
    await store.clearOverride(setting, dataCenter);
  };

  toggleDetails = () => {
    this.setState(prev => ({
      showDetails: !prev.showDetails,
    }));
  };

  clearError = () => {
    this.props.store.clearError();
  };

  onEditRawValueChange = () => {
    this.setState(({ editRawValue }) => ({ editRawValue: !editRawValue }));
  };

  render() {
    const { store, setting } = this.props;
    const {
      selectedDataCenter,
      newOverrideValue,
      showDetails,
      editRawValue,
    } = this.state;
    const { defaultValue, activeOverride } = setting;

    return (
      <Dialog onClick={this.onBackdropClick} loading={store.loading}>
        <Content onClick={this.onContentClick}>
          <SettingHeader>
            <h1>{setting.name}</h1>
            <div>
              <Markdown src={setting.description} />
            </div>
          </SettingHeader>

          <TierBanner tier={store.tier} />

          <EditorSection loading={store.loading}>
            <ValueSection>
              {activeOverride ? (
                <ValueDisplay
                  label="Active Override"
                  value={activeOverride}
                  setting={setting}
                  onEdit={this.onEditCurrentOverride}
                  onClear={this.onClearCurrentOverride}
                />
              ) : null}
              <ValueDisplay
                label="Default Value"
                value={defaultValue}
                setting={setting}
              />
            </ValueSection>

            <Attributes setting={setting} />

            <Section>
              <span>Set new override for:</span>
              {store.dataCenters.map(dc => (
                <Button
                  key={dc}
                  buttonSize="md"
                  selected={selectedDataCenter === dc}
                  data-dc={dc}
                  onClick={setting.allowsOverrides[dc] && this.selectDataCenter}
                  disabled={!setting.allowsOverrides[dc]}
                  title={
                    setting.allowsOverrides[dc] ? (
                      undefined
                    ) : (
                      `Overrides not allowed for Data Center '${dc}'`
                    )
                  }
                >
                  {dc}
                </Button>
              ))}
            </Section>

            {selectedDataCenter ? (
              [
                <Section key="edit">
                  <header
                    className={css`
                      margin-bottom: 1em;
                      padding-bottom: 0.2em;
                      font-weight: bold;
                      color: #07c;
                      border-bottom: 1px solid #ddd;
                    `}
                  >
                    New Value:
                  </header>
                  <ValueEditor
                    setting={setting}
                    value={newOverrideValue}
                    onChange={this.onNewOverrideValueChange}
                    editRawValue={editRawValue}
                    onEditRawValueChange={this.onEditRawValueChange}
                  />
                </Section>,
                <Section key="controls">
                  <Button buttonSize="lg" onClick={this.onSetNewOverride}>
                    <UploadIcon />
                    Set Override
                  </Button>
                  <Button buttonSize="lg" onClick={this.onCancelEdit}>
                    <CloseIcon />
                    Cancel
                  </Button>
                </Section>,
              ]
            ) : null}
            {!!store.error ? (
              <Section>
                <ErrorMessage>
                  <div
                    className={css`
                      float: right;
                      cursor: pointer;
                    `}
                    onClick={this.clearError}
                  >
                    <CloseIcon />
                  </div>
                  {store.error}
                </ErrorMessage>
              </Section>
            ) : null}
            <DetailsSection>
              <header
                className={css`
                  cursor: pointer;
                  color: #07c;
                  font-weight: bold;
                `}
                onClick={this.toggleDetails}
              >
                {showDetails ? 'Hide' : 'Show'} Details
              </header>
              <div
                className={css`
                  @media (min-width: ${smallWidth + 1}px) {
                    display: flex;
                    justify-content: space-between;
                  }
                `}
              >
                {showDetails ? (
                  [
                    <ValuesList
                      key="overrides"
                      label="Overrides:"
                      setting={setting}
                      values={setting.allOverrides}
                      onClear={this.onClearOverride}
                    />,
                    <ValuesList
                      key="defaults"
                      label="Defaults:"
                      setting={setting}
                      values={setting.allDefaults}
                    />,
                  ]
                ) : null}
              </div>
            </DetailsSection>
          </EditorSection>
        </Content>
      </Dialog>
    );
  }
}

type DialogProps = {
  loading: boolean;
  innerRef?(el: HTMLElement): void;
} & React.HTMLProps<HTMLDivElement>;

const Dialog: React.StatelessComponent<DialogProps> = styled.div`
  background-color: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(2px);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
  z-index: 99999;
  cursor: ${p => (p.loading ? 'wait' : 'default')};
  overflow: auto;
`;

const Content = styled.div`
  position: relative;
  background-color: white;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.5), 0 1px 4px rgba(0, 0, 0, 0.2);
  @media (min-width: ${smallWidth + 1}px) {
    max-width: 728px;
    margin: 100px auto 0;
  }
  @media (max-width: ${smallWidth}px) {
    margin: 50px 20px;
  }
  box-sizing: border-box;
  padding: 1em;
  font-size: 12px;
`;

const SettingHeader = styled.div`
  & h1 {
    color: #07c;
    margin: 0.3em 0;
    font-size: 16px;
    font-weight: bold;
    /* border-bottom: 1px solid #ccc; */
  }
  > div {
    color: #888;
    font-size: 12px;
  }
`;

type EditorSectionProps = {
  loading: boolean;
} & React.HTMLProps<HTMLElement>;

const EditorSection: React.StatelessComponent<
  EditorSectionProps
> = styled.section`
  opacity: ${p => (p.loading ? '0.5' : '1')};
  pointer-events: ${p => (p.loading ? 'none' : 'auto')};
  transition: opacity 0.1s ease-in-out;
`;

const SectionStyles = css`
  margin: 1em 0;
  &:last-child {
    margin-bottom: 0;
  }
`;

const Section = styled.section`composes: ${SectionStyles};`;

const ValueSection = styled.section`
  composes: ${SectionStyles};
  @media (min-width: ${smallWidth + 1}px) {
    display: flex;
  }
`;

const DetailsSection = styled.section`
  composes: ${SectionStyles};
  border-top: 1px solid #ddd;
  padding-top: 1em;
`;
