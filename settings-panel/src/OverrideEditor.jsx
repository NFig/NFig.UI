import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Portal from 'react-portal';
import { markdown } from './utils';
import * as selectors from './selectors';
import * as thunks from './thunks';
import * as actions from './actions';
import { List, Map } from 'immutable';

import ButtonGroup from './ButtonGroup';
import RadioButton from './RadioButton';
import AutosizeTextArea from './AutosizeTextArea';

import imgTrue from './assets/setting-true.png';
import imgFalse from './assets/setting-false.png';


function shouldShowDetails(setting) {
    const allOverrides = setting.get('allOverrides');
    const activeOverride = setting.get('activeOverride');

    if (!allOverrides || allOverrides.size == 0)
        return false;

    if (allOverrides.size > 1)
        return true;

    if (!activeOverride)
        return true;

    // single override, and an active, it's probably the active one
    return false;
}

function mapState(state) {
    return {
        currentTier: state.currentTier
    };
}

@connect(mapState)
export default class OverrideEditor extends Component {
    static propTypes = {
        setting     : PropTypes.instanceOf(Map),
        dataCenters : PropTypes.instanceOf(List),
        currentTier : PropTypes.string
    };

    static contextTypes = {
        className : PropTypes.string
    };

    onEditActive = () => {
        const { setting } = this.props;
        const active = setting.get('activeOverride');

        this.refs.newOverride.selectDataCenter(active.get('dataCenter'));
    };

    onClearActive = () => {
        const { setting } = this.props;
        const active = setting.get('activeOverride');
        this.onClearOverride(active.get('dataCenter'));
    };

    onClearOverride = (e) => {
        const dataCenter = e.target ? e.currentTarget.value : e;
        this.props.dispatch(
            thunks.clearOverride(
                this.props.setting.get('name'),
                dataCenter,
                () => {}
            )
        );
    };

    setOverride = (dataCenter, value) => {
        this.props.dispatch(
            thunks.setOverride(
                this.props.setting.get('name'),
                dataCenter,
                value,
                () => {
                    this.refs.newOverride.reset();
                }
            )
        );
    };

    render() {

        const { setting, dataCenters, currentTier } = this.props;
        const { className } = this.context;

        const activeOverride = setting.get('activeOverride');

        const show = shouldShowDetails(setting);

        return (
            <div>

                <div className={`${className}-header`}>

                    <button type="button" className="close" onClick={this.props.closeDialog}>
                        <span aria-hidden="true">&times;</span>
                        <span className="sr-only">Close</span>
                    </button>

                    <h3>{setting.get('name')}</h3>
                    <p dangerouslySetInnerHTML={{
                        __html: markdown(setting.get('description'))
                    }} />

                </div>

                {currentTier ?
                    <div className={`${className}-body tier-banner tier-${currentTier.toLowerCase()}`}>
                        <strong>{currentTier}</strong>
                    </div>
                : null}

                <div className={`${className}-body`}>
                    <div className="values">
                        {activeOverride
                            ?   <ActiveOverride
                                    setting={setting}
                                    onEdit={this.onEditActive}
                                    onClear={this.onClearActive}
                                />
                            : null}
                        <DefaultValue setting={setting} />
                    </div>
                    <div className="newoverride">
                        <NewOverride
                            setting={setting}
                            dataCenters={dataCenters}
                            onSetOverride={this.setOverride}
                            ref="newOverride"
                        />
                    </div>
                </div>

                <SettingDetails
                    setting={setting}
                    show={show}
                    onClearOverride={this.onClearOverride}
                />
            </div>
        );

    }
}

const ActiveOverride = ({ setting, onEdit, onClear }) => {
    const isEnum = setting.get('isEnum');

    const override = setting.get('activeOverride');
    const dataCenter = override.get('dataCenter');
    const value = override.get('value');

    const enumNames = setting.get('enumNames');
    const enumName = enumNames ? enumNames.get(value) : {};

    return (
        <div className="override active">
            <h5>Active Override</h5>
            <p>
                Data Center:
                <strong>{dataCenter}</strong>
            </p>

            <ValueDisplay value={value} isEnum={isEnum} enumName={enumName} />

            <button className="edit-override" onClick={onEdit}>
                Edit
            </button>
            {' '}
            <button className="clear-override" onClick={onClear}>
                Clear
            </button>
        </div>
    );
};




const DefaultValue = ({setting}) => {
    const defval = setting.get('defaultValue');
    const value = defval.get('value');
    const isEnum = setting.get('isEnum');
    const enumNames = setting.get('enumNames');
    const enumName = enumNames ? enumNames.get(value) : {};

    return (
        <div className="default">
            <h5>Default Value</h5>
            <p>
                Data Center:
                <strong>{defval.get('dataCenter')}</strong>
            </p>
            <ValueDisplay
                value={value}
                isEnum={isEnum}
                enumName={enumName}
            />
        </div>
    );
};


class ValueDisplay extends Component {

    static propTypes = {
        value    : PropTypes.string,
        isEnum   : PropTypes.bool.isRequired,
        enumName : PropTypes.object,
    };

    render() {
        const { value, isEnum, enumName } = this.props;

        if (isEnum) {
            const enumDesc = enumName.get('description');

            const desc = enumDesc
                ? <div dangerouslySetInnerHTML={{__html: markdown(enumDesc)}} />
                : null;

                return (
                    <div>
                        <div className="setting-value">
                            <strong>{`${enumName.get('name')} (${value})`}</strong>
                            {desc}
                        </div>
                    </div>
                );
        }

        return (<pre className="setting-value">{value}</pre>)
    }
}

class NewOverride extends Component {

    static propTypes = {
        setting : PropTypes.instanceOf(Map).isRequired,
        onSetOverride : PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.state = NewOverride.initialState;
    }

    reset() {
        this.setState(NewOverride.initialState);
    }

    static initialState = {
        selectedDataCenter: null,
        overrideValue: null
    };


    selectDataCenter = e => {
        const { setting } = this.props;
        const overrides = setting.get('allOverrides');
        const value = overrides.find(o => o.get('dataCenter') === e);
        const overrideValue = value
            ? value.get('value')
            : setting.get('defaultValue').get('value');

        this.setState({
            selectedDataCenter: e,
            overrideValue
        });
    };


    setOverrideValue = (e) => {
        this.setState({overrideValue: e.target ? e.target.value : e});
    };

    onCancel = () => {
        this.setState(NewOverride.initialState);
    };

    onSetOverrideClick = (e) => {
        this.props.onSetOverride(
            this.state.selectedDataCenter,
            this.state.overrideValue
        );
    };

    render() {
        const { selectedDataCenter } = this.state;
        const { dataCenters, setting } = this.props;

        const allowsOverrides = setting.get('allowsOverrides');
        const requiresRestart = setting.get('requiresRestart');

        const activeOverride = setting.get('activeOverride');
        const defaultValue = setting.get('defaultValue');
        const value = this.state.overrideValue;

        const SettingEditor = EditorFor(setting);

        return (
            <div className="newoverride">
                <DataCenterSelector
                    selectedValue={selectedDataCenter}
                    onChange={this.selectDataCenter}
                    dataCenters={dataCenters}
                    allowsOverrides={allowsOverrides}
                />
                {selectedDataCenter ?
                <div>
                    {requiresRestart ?
                        <p className="requires-restart">
                            Changes will not take effect until application is restarted.
                        </p>
                    : null}
                    <SettingEditor
                        value={value}
                        onChange={this.setOverrideValue}
                        enumNames={setting.get('enumNames')}
                    />
                    <p>
                        <button className="set-override" onClick={this.onSetOverrideClick}>
                            Set Override
                        </button>
                        {' '}
                        <button className="cancel-override" onClick={this.onCancel}>
                            Cancel
                        </button>
                    </p>
                </div>
                : null }
            </div>
        );
    }
}

class DataCenterSelector extends Component {

    static propTypes = {
        selectedValue   : PropTypes.string,
        onChange        : PropTypes.func.isRequired,
        dataCenters     : PropTypes.instanceOf(List),
        allowsOverrides : PropTypes.object.isRequired
    };

    render() {
        const {
            selectedValue,
            onChange,
            dataCenters,
            allowsOverrides
        } = this.props;


        return (
            <p>
                <span>Set new override for&nbsp;</span>
                <ButtonGroup
                    {...this.props}
                    className="spaced"
                    name="newOverrideValue">
                    {dataCenters.map(dc => {
                        const disabled = !allowsOverrides.get(dc);

                        if (disabled) {
                            return (
                                <span
                                    className="label-button"
                                    disabled
                                    title="Overrides not allowed for this data center and tier"
                                >{dc}</span>
                            );
                        }

                        return (<RadioButton key={dc} value={dc}>{dc}</RadioButton>);
                    })}
                </ButtonGroup>
            </p>
        );
    }
}


function EditorFor(setting) {
    if (setting.get('isEnum'))
       return EnumEditor;

    return {
        'System.Boolean': BoolEditor
    }[setting.get('typeName')] || TextEditor;
}



class TextEditor extends Component {

    static propTypes = {
        value    : PropTypes.string.isRequired,
        onChange : PropTypes.func.isRequired
    };

    render() {

        return (
            <pre className="value">
                <AutosizeTextArea
                    {...this.props}
                    spellCheck={false}
                    name="value"
                    style={{height: "1em"}}
                />
            </pre>
        );
    }
}

class BoolEditor extends Component {

    static propTypes = {
        value    : PropTypes.string.isRequired,
        onChange : PropTypes.func.isRequired
    };

    render() {
        const { value, onChange } = this.props;

        return (
            <p>
                <ButtonGroup name="overrideBool" selectedValue={value} onChange={onChange}>
                    <RadioButton value="True"><img src={imgTrue} />{' '}True</RadioButton>
                    <RadioButton value="False"><img src={imgFalse} />{' '}False</RadioButton>
                </ButtonGroup>
            </p>
        );
    }
}



class SettingDetails extends Component {

    static contextTypes = {
        className: PropTypes.string
    };

    constructor(props) {
        super(props);

        this.state = {
            show: props.show
        };
    }

    showDetails = () => {
        this.setState({show: true});
    };


    hideDetails = () => {
        this.setState({show: false});
    };

    render() {
        const { className } = this.context;
        const { setting, onClearOverride } = this.props;
        const { show } = this.state;

        return (

            <div className={`${className}-body show-details`}>
                {show
                    ?  <a className="toggle" style={{cursor:"pointer"}} onClick={this.hideDetails}>Hide Details</a>
                    :  <a className="toggle" style={{cursor:"pointer"}} onClick={this.showDetails}>Show Details</a>
                }

                {show ?
                <div className="details">

                    <div className="overrides">
                        <h5>Overrides</h5>
                        <ValueTable values={setting.get('allOverrides')} onClearOverride={onClearOverride} />
                    </div>

                    <div className="defaults">
                        <h5>Defaults</h5>
                        <ValueTable values={setting.get('allDefaults')} />
                    </div>

                </div>
                : null}
            </div>

        );
    }
}


class ValueTable extends Component {

    render() {
        const { onClearOverride, values } = this.props;

        return (
            <table className="value-list table-striped">
                <thead>
                    <tr>
                        <th>Tier</th>
                        <th>Data Center</th>
                        <th>Value</th>
                        {onClearOverride ? <th></th> : null}
                    </tr>
                </thead>
                <tbody>
                    {values.map(v =>
                        <tr key={`${v.get('tier')}|${v.get('dataCenter')}`}>
                            <td>{v.get('tier')}</td>
                            <td>{v.get('dataCenter')}</td>
                            <td className="value">{v.get('value').trim()}</td>
                            {onClearOverride ?
                            <td>
                                <button type="button"
                                        className="clear-override"
                                        title="Clear this override"
                                        value={v.get('dataCenter')}
                                        onClick={onClearOverride}>
                                    <span aria-hidden="true">&times;</span>
                                    <span className="sr-only">Clear</span>
                                </button>
                            </td>
                            : null}
                        </tr>
                    )}
                </tbody>
            </table>
        );
    }
}


class EnumEditor extends Component {
    static propTypes = {
        value    : PropTypes.string,
        onChange : PropTypes.func,
        enumNames: PropTypes.object.isRequired,
    };

    render() {
        const { value, onChange, enumNames } = this.props;
        return (
            <EnumSelector selectedValue={value} onChange={onChange}>
                {enumNames.entrySeq().map(([key, value]) =>
                    <EnumSelectorItem
                        key={key}
                        value={key}
                        name={value.get('name')}
                        description={value.get('description')}
                    />
                )}
            </EnumSelector>
        );
    }
}

class EnumSelector extends Component {
    static propTypes = {
        selectedValue : PropTypes.string,
        onChange      : PropTypes.func,
        children      : PropTypes.node
    };


    render() {
        const { selectedValue, onChange, children } = this.props;

        const mapped = React.Children.map(children, child => (

            React.cloneElement(child, {
                active: child.props.value === selectedValue,
                onChange,
                ...child.props
            })

        ));

        return (
            <table className="enum-selector">
                <tbody>
                    {mapped}
                </tbody>
            </table>
        );
    }
}

class EnumSelectorItem extends Component {

    static propTypes = {
        onChange    : PropTypes.func,
        name        : PropTypes.string.isRequired,
        value       : PropTypes.any.isRequired,
        description : PropTypes.string,
        active      : PropTypes.bool
    };

    handleClick = (e) => {
        this.props.onChange(this.props.value);
    };

    render() {
        const { onChange, name, value, description, active } = this.props;
        return (
            <tr className={`${active ? 'active' : ''} selector-item`} onClick={this.handleClick}>
                <td className="status">{active ?
                    <img src={imgTrue} alt="selected" />
                    : null
                }</td>
                <th>{`${name} (${value})`}</th>
                <td>{description && <span dangerouslySetInnerHTML={{__html:markdown(description)}} />}</td>
            </tr>
        )
    }
}
