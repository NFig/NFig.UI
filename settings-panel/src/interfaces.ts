/// <reference path="../../NFig.UI/nfig-interfaces.d.ts" />

export type ISettingsModel = NFig.ISettingsModel<string, string>;
export type ISetting = NFig.ISetting<string, string>;
export type ISettingValue = NFig.ISettingValue<string, string>;

export interface ValueViewerProps {
  setting: ISetting;
  value: ISettingValue;
  showExtraInfo?: boolean;
}

export type ValueViewerType = React.ComponentType<ValueViewerProps>;

export interface IEditorSelector {
  (setting: ISetting): ValueEditorType;
}

export interface ValueEditorProps {
  setting: ISetting;
  value: string;
  onChange(newValue: string);
}

export type ValueEditorType = React.ComponentType<ValueEditorProps>;

export interface IViewerSelector {
  (setting: ISetting): ValueViewerType;
}

export interface INewOverride {
  selectedDataCenter: string;
  newOverrideValue: string;
}

export interface Dictionary<T> {
  [key: string]: T;
}

export interface SettingsPanelConfig {
  settingsJsonUrl: string;
  setOverrideUrl: string;
  clearOverrideUrl: string;
  tierColors: Dictionary<string>;
  editorSelector?: IEditorSelector;
  viewerSelector?: IViewerSelector;
}
