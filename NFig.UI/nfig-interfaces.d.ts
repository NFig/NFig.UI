declare module NFig {

interface ISettingsModel<TTier, TDataCenter> {
    settings?: ISetting<TTier, TDataCenter>[];
    availableDataCenters?: TDataCenter[];
    currentTier: TTier;
}

interface ISetting<TTier, TDataCenter> {
    name?: string;
    description?: string;
    activeOverride?: ISettingValue<TTier, TDataCenter>;
    defaultValue?: ISettingValue<TTier, TDataCenter>;
    typeName?: string;
    isEnum: boolean;
    requiresRestart: boolean;
    allowsOverrides?: { [k: string]: boolean };
    allDefaults?: ISettingValue<TTier, TDataCenter>[];
    allOverrides?: ISettingValue<TTier, TDataCenter>[];
    enumNames?: { [k: string]: IEnumName<TTier, TDataCenter> };
}

interface IEnumName<TTier, TDataCenter> {
    name?: string;
    description?: string;
}

interface ISettingValue<TTier, TDataCenter> {
    name?: string;
    value?: string;
    tier: TTier;
    dataCenter: TDataCenter;
    isDefault: boolean;
    allowsOverrides: boolean;
    isOverride: boolean;
    hasTier: boolean;
    hasDataCenter: boolean;
}

}

