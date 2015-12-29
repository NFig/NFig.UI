import React, { Component, PropTypes } from 'react';
import Portal from 'react-portal';
import { render } from './marked-renderer';
import AutosizeTextArea from './AutosizeTextArea';

import checkImg from './setting-true.png';

class Modal extends Component {

    onOverlayClick(e) {
        const { onRequestClose } = this.props;
        onRequestClose && onRequestClose();
    }

    render() {
        return (
            <div className={`${this.props.className}-modal`} onClick={e => this.onOverlayClick(e)}>
                <div className={`${this.props.className}-dialog`} onClick={e => e.stopPropagation()}>
                    <div className={`${this.props.className}-content`}>{this.props.children}</div>
                </div>
            </div>
        );
    }
}

export default class EditorModal extends Component {

    static propTypes = {
        onClose: PropTypes.func.isRequired,
        onSetOverride: PropTypes.func.isRequired,
        onClearOverride: PropTypes.func.isRequired,
        onClearError: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedDataCenter: null,
            newOverrideValue: null
        };
    }

    handleClose() {
        this.props.onClose();
    }

    showDetails() { this.setState({showDetails: true}); }
    hideDetails() { this.setState({showDetails: false}); }

    shouldShowDetails(props) {
        const { setting: { allOverrides, activeOverride } } = props;

        if (!allOverrides || allOverrides.length == 0) 
            return false;

        if (allOverrides.length > 1) 
            return true;

        if (!activeOverride)
            return true;

        // single override, and an active, it's probably the active one
        return false;
    }

    clearOverride(dc) {
        const {
            state: { selectedDataCenter: dataCenter, showDetails },
            props: { setting: { name: settingName } }
        } = this;

        if (showDetails === false) 
            this.setState({showDetails: null});

        const data = {settingName:this.props.setting.name, dataCenter:dc};
        this.props.onClearOverride(data);
    }

    selectDataCenter(e) {
        const selectedDataCenter = e.target ? e.target.value : e;

        const override = this.props.setting.allOverrides.find(o => o.dataCenter === selectedDataCenter);

        this.setState({selectedDataCenter, newOverrideValue: override && override.value || ''});
    }

    handleOverrideChange(e) {
        const val = e.target ? e.target.value : e;
        this.setState({newOverrideValue: val});
    }


    setNewOverride() {

        const {
            state: { newOverrideValue: value, selectedDataCenter: dataCenter, showDetails },
            props: { setting: { name: settingName } }
        } = this;

        if (showDetails === false) 
            this.setState({showDetails: null});
        
        this.props.onSetOverride({ settingName, dataCenter, value });
    }

    cancelNewOverride() {
        this.setState({selectedDataCenter: null});
        this.props.onClearError();
    }

    componentWillReceiveProps(newProps) {
        if (!newProps.error) {
            this.setState({selectedDataCenter: null, newOverrideValue: null});
        }
    }

    render() {
        const {setting, dataCenters, className, error} = this.props;
        const {activeOverride: override, defaultValue: defval, isEnum, allowsOverrides} = setting;
        const {selectedDataCenter} = this.state;
        const enumNames = setting.enumNames || {};
        const SettingEditor = EditorFor(setting);

        let {showDetails} = this.state;

        if (showDetails === undefined || showDetails === null)
            showDetails = this.shouldShowDetails(this.props);


        return (
            <Portal isOpened={true} >
                <Modal  className={className} onRequestClose={_ => this.handleClose()}>
                    <div className={`${className}-header`}>
                        <button type="button" className="close" onClick={() => this.handleClose()}>
                            <span aria-hidden="true">&times;</span>
                            <span className="sr-only">Close</span>
                        </button>
                        <h3>{setting.name}</h3>
                        <p dangerouslySetInnerHTML={{__html:render(setting.description)}} />
                    </div>
                    <div className={`${className}-body`}>
                        <div className="values">
                            {override ?
                            <div className="override active">
                                <h5>Active Override</h5>
                                <p>Data Center: <strong>{override.dataCenter}</strong></p>
                                <ValueDisplay value={override.value} isEnum={setting.isEnum} enumName={enumNames[override.value]} />
                                <button className="edit-override" onClick={() => this.selectDataCenter(override.dataCenter)}>Edit</button>
                                <span>&nbsp;</span>
                                <button className="clear-override" onClick={() => this.clearOverride(override.dataCenter)}>Clear</button>
                            </div> : null}
                            <div className="default">
                                <h5>Default Value</h5>
                                <p>Data Center: <strong>{defval.dataCenter}</strong></p>
                                <ValueDisplay value={defval.value} isEnum={setting.isEnum} enumName={enumNames[defval.value]} />
                            </div>
                        </div>
                        <div className="newoverride">
                            <p>
                                <span>Set new override for&nbsp;</span>
                                <DataCenterSelector
                                    selectedValue={this.state.selectedDataCenter}
                                    onChange={e => this.selectDataCenter(e)}
                                    dataCenters={dataCenters}
                                    allowsOverrides={allowsOverrides}
                                />
                            </p>
                            {selectedDataCenter ?
                            <div>
                                <p display-if={setting.requiresRestart} className="requires-restart">Changes will not take effect until application is restarted.</p>
                                <SettingEditor {...this.props} value={this.state.newOverrideValue} onChange={e => this.handleOverrideChange(e)}/>
                                <p>
                                    <button className="set-override" onClick={() => this.setNewOverride()}>Set Override</button>
                                    <span>&nbsp;</span>
                                    <button className="cancel-override" onClick={() => this.cancelNewOverride()}>Cancel</button>
                                </p>
                            </div>
                            : null}
                        </div>
                        {error ?
                            <p className={`${className}-error`}>{error}</p>
                        : null}
                    </div>
                    <div className={`${className}-body show-details`}>
                        <a display-if={!showDetails} className="toggle" style={{cursor:"pointer"}} onClick={() => this.showDetails()}>Show Details</a>
                        <a display-if={showDetails} className="toggle" style={{cursor:"pointer"}} onClick={() => this.hideDetails()}>Hide Details</a>
                        <div display-if={showDetails} className="details">
                            <div className="overrides">
                                <h5>Overrides</h5>
                                <ValueTable {...this.props} propName="allOverrides" onClear={dc => this.clearOverride(dc)} />
                            </div>
                            <div className="defaults">
                                <h5>Defaults</h5>
                                <ValueTable {...this.props} propName="allDefaults" />
                            </div>
                        </div>
                    </div>
                </Modal>
            </Portal>
        );
    }
}

const ValueDisplay = props => {
    const { value, isEnum, enumName } = props;

    if (isEnum) {

        const desc = enumName.description
            ? <div dangerouslySetInnerHTML={{__html: render(enumName.description)}} />
            : null;

        return (
            <div>
                <div className="setting-value">
                    <strong>{`${enumName.name} (${value})`}</strong>
                    {desc}
                </div>
            </div>
        );
    }

    return (<pre className="setting-value">{value}</pre>)
};

class DataCenterSelector extends Component {
    render() {
        const {selectedValue, onChange, dataCenters, allowsOverrides} = this.props;

        return (
            <ButtonGroup
                {...this.props}
                className="spaced"
                name="newOverrideValue">
                {dataCenters.map(dc =>
                    <RadioButton key={dc} value={dc} disabled={!allowsOverrides[dc]}>{dc}</RadioButton>
                )}
            </ButtonGroup>
        );
    }
}

class ValueTable extends Component {

    render() {
        const {setting, propName, onClear} = this.props;
        const values = setting[propName];
        return (
            <table className="value-list table-striped">
                <thead>
                    <tr>
                        <th>Tier</th>
                        <th>Data Center</th>
                        <th>Value</th>
                        {onClear ? <th></th> : null}
                    </tr>
                </thead>
                <tbody>
                    {values.map(v =>
                        <tr key={`${v.tier}|${v.dataCenter}`}>
                            <td>{v.tier}</td>
                            <td>{v.dataCenter}</td>
                            <td className="value">{v.value}</td>
                            {onClear ?
                            <td>
                                <button type="button"
                                        className="clear-override"
                                        title="Clear this override"
                                        onClick={() => onClear(v.dataCenter)}>
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

function EditorFor(setting) {
    if (setting.isEnum)
        return EnumEditor;

    return {
        'System.Boolean': BoolEditor
    }[setting.typeName] || TextEditor;
}

class BoolEditor extends Component {
    render() {
        return (
            <p>
                <ButtonGroup name="overrideBool" selectedValue={this.props.value} onChange={this.props.onChange}>
                    <RadioButton value="True">True</RadioButton>
                    <RadioButton value="False">False</RadioButton>
                </ButtonGroup>
            </p>
        );
    }
}

class RadioButton extends Component {
    render() {
        const {value, className, onChange, name, children, active, disabled} = this.props;

        const classNames = (className && className.split(' ')) || [];
        classNames.push('label-button');
        if (active)
            classNames.push('active');

        let title = null;
        if (disabled)
            title = "Overrides not allowed for this data center and tier";

        return (
            <button className={classNames.join(' ')} value={value} onClick={onChange} disabled={disabled} title={title}>
                {children}
            </button>
        );
    }
}

class ButtonGroup extends Component {
    render() {
        const {name, selectedValue, onChange, children} = this.props;

        const mapped = React.Children.map(children, child => {
            const {value} = child.props;
            return React.cloneElement(child, {name, active: value === selectedValue, onChange});
        })

        return (
            <span className="radio-button-group">
                {mapped}
            </span>
        );
    }
}

const TextEditor = props => (
    <pre className="value">
        <AutosizeTextArea
            {...props}
            className="quick-editor"
            spellCheck={false}
            name="value"
            style={{height: "1em"}}
        />
    </pre>
);

class EnumEditor extends Component {
    render() {
        const { setting: {enumNames}, value, onChange } = this.props;
        return (
            <EnumSelector selectedValue={value} onChange={onChange}>
                {Object.keys(enumNames).map(key =>
                    <EnumSelectorItem
                        key={key}
                        value={key}
                        name={enumNames[key].name}
                        description={enumNames[key].description}
                    />
                )}
            </EnumSelector>
        );
    }
}

class EnumSelector extends Component {
    render() {
        const { selectedValue, onChange, children } = this.props;
        const mapped = React.Children.map(children, child =>
            React.cloneElement(child, { active: child.props.value === selectedValue, onChange, ...child.props })
        );

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

    render() {
        const { onChange, name, value, description, active } = this.props;
        return (
            <tr className={`${active ? 'active' : ''} selector-item`} onClick={e => onChange(value)}>
                <td className="status">{active ?
                    <img src={checkImg} alt="selected" />
                    : null
                }</td>
                <th>{`${name} (${value})`}</th>
                <td>{description && <span dangerouslySetInnerHTML={{__html:render(description)}} />}</td>
            </tr>
        )
    }
}

// vim: sw=4 ts=4 et
