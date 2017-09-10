import * as React from 'react';
import { expr, untracked } from 'mobx';
import { inject, observer } from 'mobx-react';
import { ISetting, ISettingValue } from '../../interfaces';
import { Store } from '../../store';

import { css } from 'emotion';
import styled from 'emotion/react';
import { smallWidth } from '../../responsive';

import OverridesSummary from './OverridesSummary';
import LoadingBar from './LoadingBar';
import Markdown from '../common/Markdown';
import ValueViewer from '../common/ValueViewer';
import ErrorMessage from '../common/ErrorMessage';
import { Attributes } from '../common/Attributes';
import { darken, lighten } from '../../color-manip';

const groupName = (name: string) => {
  const idx = name.lastIndexOf('.');
  return idx === -1 ? name : name.substring(0, idx);
};

@inject('store')
@observer
class SettingListItem extends React.Component<{
  setting: ISetting;
  store?: Store;
  display: boolean;
}> {
  onClick = (e: React.MouseEvent<HTMLElement>) => {
    this.props.store.edit(this.props.setting);
  };

  componentDidMount() {
    this.ensureVisible();
  }

  componentDidUpdate() {
    this.ensureVisible();
  }

  ensureVisible = () => {
    if (this.currentlySelected && this.isOffscreen) {
      untracked(() => {
        this.element['scrollIntoViewIfNeeded'](true);
      });
    }
  };

  private get currentlyEditing() {
    return this.props.store.editing === this.props.setting;
  }

  private get currentlySelected() {
    return this.props.store.selectedSetting === this.props.setting;
  }

  private get isOffscreen() {
    if (this.element === null) return false;
    const rect = this.element.getBoundingClientRect();
    const html = document.documentElement;
    return !(
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || html.clientHeight) &&
      rect.right <= (window.innerWidth || html.clientWidth)
    );
  }

  private element: HTMLElement;

  render() {
    const { setting, store, display } = this.props;
    const { name, description, typeName } = setting;
    const value = setting.activeOverride || setting.defaultValue;

    return (
      <ListItemContainer
        display={display}
        onClick={this.onClick}
        hasOverride={!!setting.activeOverride}
        selected={expr(() => this.currentlySelected)}
        innerRef={e => {
          this.element = e;
        }}
      >
        <SettingInfo>
          <label>{name}</label>
          <Markdown src={description} />
          <Attributes setting={setting} currentTier={store.tier} />
        </SettingInfo>

        <SettingValue>
          <ValueViewer setting={setting} value={value} showExtraInfo={false} />
          <OverridesSummary setting={setting} />
        </SettingValue>
      </ListItemContainer>
    );
  }
}

@inject('store')
@observer
export default class SettingsList extends React.Component<{ store?: Store }> {
  state = {
    selected: null,
  };

  node: HTMLElement;

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('click', this.onDocumentClick);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('click', this.onDocumentClick);
  }

  onDocumentClick = (e: MouseEvent) => {
    let el = e.target as HTMLElement;
    while (el !== document.documentElement) {
      if (el === this.node) {
        return;
      }

      el = el.parentElement;
    }

    this.props.store.selectNone();
  };

  onKeyDown = (e: KeyboardEvent) => {
    if (!!this.props.store.editing) {
      return;
    }

    let prevent = true;
    switch (e.key) {
      case 'Escape':
        this.props.store.selectNone();
        break;
      case 'ArrowUp':
        this.props.store.selectPrev();
        break;
      case 'ArrowDown':
        this.props.store.selectNext();
        break;
      default:
        prevent = false;
    }

    if (prevent) e.preventDefault();
  };

  render() {
    const { store } = this.props;

    if (store.error && !store.editing) {
      return <ErrorMessage>{store.error}</ErrorMessage>;
    }

    if (store.settings === null) {
      return store.loading ? <LoadingBar /> : null;
    }

    return (
      <SettingsListContainer
        ref={e => {
          this.node = e;
        }}
      >
        {this.getGroupedListItems()}
      </SettingsListContainer>
    );
  }

  // Doing it this way to avoid overly nested data structures,
  // which make things like tracking selected items much more complicated
  getGroupedListItems() {
    const children: React.ReactNode[] = [];
    const { store } = this.props;
    const { settings } = store;

    let groupIndex: number = 0;
    let showGroup: boolean = false;
    let groupCount: number = 0;

    for (let i = 0; i < settings.length; i++) {
      const setting = settings[i];
      const displaySetting = store.isVisible(setting);

      children.push(
        <SettingListItem
          key={setting.name}
          setting={setting}
          display={displaySetting}
        />,
      );

      const thisGroup = groupName(setting.name);
      const prevGroup = i > 0 ? groupName(settings[i - 1].name) : null;

      if (thisGroup !== prevGroup && i > 0) {
        // Add the group header at the beginning of the current group set
        children.splice(
          groupIndex + groupCount,
          0,
          <SettingGroup
            key={prevGroup}
            style={{ display: showGroup ? 'block' : 'none' }}
            className="nfig-group-header"
          >
            {prevGroup}
          </SettingGroup>,
        );

        groupCount++;
        groupIndex = i;
        showGroup = false;
      }

      showGroup = showGroup || displaySetting;
    }

    // Add the last group
    if (settings.length > 0) {
      const lastGroupName = groupName(settings[settings.length - 1].name);
      children.splice(
        groupIndex + groupCount,
        0,
        <SettingGroup
          key={lastGroupName}
          style={{ display: showGroup ? 'block' : 'none' }}
        >
          {lastGroupName}
        </SettingGroup>,
      );
    }

    return children;
  }
}

const SettingsListContainer = styled.div`
  margin-top: 0.5em;
  position: relative;
  @media (min-width: ${smallWidth + 1}px) {
    border-width: 1px;
    border-style: none solid solid;
    border-color: #eee;
  }
`;

const ListItem = css`
  margin: 0 0;
  padding: 0.5em 0.5rem 0.3em;
`;

const SettingGroup = styled.p`
  composes: ${ListItem};
  font-size: 16px;
  font-weight: bold;
  background-color: #eee;
  @media (min-width: ${smallWidth + 1}px) {
    border-top: 1px solid #eee;
  }
  @media (max-width: ${smallWidth}px) {
    margin-top: 1em;
  }

  position: sticky;
  top: 0;
`;

const listItemColors = {
  normal: '#fff',
  override: '#ecf6fb',
  hover: '#f2f6fd',
  overrideHover: '#d9edf7',
};

const valueColors = Object.keys(listItemColors).reduce(
  (o, key) => {
    o[key] = darken(listItemColors[key], 0.025);
    return o;
  },
  {} as typeof listItemColors,
);

const ListItemContainer: React.StatelessComponent<
  {
    display: boolean;
    hasOverride: boolean;
    selected: boolean;
    innerRef?(el: HTMLElement);
  } & React.HTMLProps<HTMLDivElement>
> = styled.div`
  @media (min-width: ${smallWidth + 1}px) {
    display: ${p => (p.display ? 'flex' : 'none')};
    border-top: 1px solid #eee;
  }

  @media (max-width: ${smallWidth}px) {
    display: ${p => (p.display ? 'block' : 'none')};
    margin-top: 1em;
  }

  font-size: 0.9em;
  cursor: pointer;
  box-sizing: border-box;

  box-shadow: ${p =>
    p.selected ? '0px 0px 2px 1px hsla(194, 60%, 60%, 1)' : 'none'};
  position: ${p => (p.selected ? 'relative' : 'static')};
  z-index: ${p => (p.selected ? 1 : 0)};

  > :first-child {
    background-color: ${p =>
      p.selected
        ? p.hasOverride ? listItemColors.overrideHover : listItemColors.hover
        : p.hasOverride ? listItemColors.override : listItemColors.normal};
  }
  > :last-child {
    background-color: ${p =>
      p.selected
        ? p.hasOverride ? listItemColors.overrideHover : listItemColors.hover
        : p.hasOverride ? valueColors.override : valueColors.normal};
  }

  &:hover {
    > :first-child {
      background-color: ${p =>
        p.hasOverride ? listItemColors.overrideHover : listItemColors.hover};
    }
    > :last-child {
      background-color: ${p =>
        p.hasOverride ? listItemColors.overrideHover : listItemColors.hover};
    }
  }
`;

const SettingInfo = styled.div`
  composes: ${ListItem};
  @media (min-width: ${smallWidth + 1}px) {
    width: 50%;
  }
  overflow-wrap: break-word;
  font-size: 90%;
  line-height: 1.2;

  & label {
    font-size: 14px;
    font-weight: bold;
    color: #07c;
    cursor: pointer;

    span {
    }
  }
  & div {
    color: #666;
  }
`;

const SettingValue = styled.div`
  composes: ${ListItem};
  @media (min-width: ${smallWidth + 1}px) {
    width: 50%;
  }
  & pre {
    font-size: 90%;
    margin: 0;
    word-break: break-all;
    word-wrap: break-word;
    white-space: pre-wrap;
  }
`;
