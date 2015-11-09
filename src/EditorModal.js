import React, { Component } from 'react';
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

    constructor(props) {
        super(props);
        const { setting: { allOverrides, activeOverride } } = props;
        this.state = {
            showDetails: allOverrides && allOverrides.length && !activeOverride,
            selectedDataCenter: null,
            newOverrideValue: null
        };
    }

    handleClose(e) {
        this.props.events.trigger('cancel-edit');
    }

    showDetails() { this.setState({showDetails: true}); }
    hideDetails() { this.setState({showDetails: false}); }

    clearOverride(dc) {
        const {
            state: { selectedDataCenter: dataCenter },
            props: { setting: { name: settingName } }
        } = this;
        this.cancelNewOverride();
        const data = {settingName:this.props.setting.name, dataCenter:dc};
        this.props.events.trigger('clear-override', data);
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

    canSetOverride() {
        if (!this.state.selectedDataCenter)
            return false;

        const { setting: { isBool, isEnum } } = this.props;

        return (!isBool && !isEnum) || !!this.state.newOverrideValue;
    }

    setNewOverride() {

        const {
            state: { newOverrideValue: value, selectedDataCenter: dataCenter },
            props: { setting: { name: settingName } }
        } = this;

        this.props.events.trigger('new-override', { settingName, dataCenter, value });
        this.setState({selectedDataCenter: null});
    }

    cancelNewOverride() {
        this.setState({selectedDataCenter: null});
    }

    render() {
        const {setting, dataCenters} = this.props;
        const {activeOverride: override, defaultValue: defval, isEnum} = setting;
        const {selectedDataCenter} = this.state;
        const enumNames = setting.enumNames || {};


        return (
            <Portal isOpened={true} >
                <Modal  className={this.props.className} onRequestClose={_ => this.handleClose()}>
                    <div className={`${this.props.className}-header`}>
                        <button type="button" className="close" onClick={() => this.handleClose()}>
                            <span aria-hidden="true">&times;</span>
                            <span className="sr-only">Close</span>
                        </button>
                        <h3>{setting.name}</h3>
                        <p dangerouslySetInnerHTML={{__html:render(setting.description)}} />
                    </div>
                    <div className={`${this.props.className}-body`}>
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
                                />
                            </p>
                            {selectedDataCenter ?
                            <div>
                                <SettingEditor {...this.props} value={this.state.newOverrideValue} onChange={e => this.handleOverrideChange(e)}/>
                                {this.canSetOverride() ?
                                <p>
                                    <button className="set-override" onClick={() => this.setNewOverride()}>Set Override</button>
                                    <span>&nbsp;</span>
                                    <button className="cancel-override" onClick={() => this.cancelNewOverride()}>Cancel</button>
                                </p> : null}
                            </div>
                            : null}
                        </div>
                    </div>
                    <div className={`${this.props.className}-body show-details`}>
                        {this.state.showDetails
                        ? <a className="toggle" style={{cursor:"pointer"}} onClick={() => this.hideDetails()}>Hide Details</a>
                        : <a className="toggle" style={{cursor:"pointer"}} onClick={() => this.showDetails()}>Show Details</a>
                        }
                        <div className="details" style={this.state.showDetails ? {} : {display:'none'}}>
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
                    <strong>{enumName.name}</strong>
                    {desc}
                </div>
                <div className="raw">
                    Raw Value:
                    <pre className="setting-value">{value}</pre>
                </div>
            </div>
        );
    }

    return (<pre className="setting-value">{value}</pre>)
};

class DataCenterSelector extends Component {
    render() {
        const {selectedValue, onChange, dataCenters} = this.props;

        return (
            <ButtonGroup
                {...this.props}
                className="spaced"
                name="newOverrideValue">
                {dataCenters.map(dc =>
                    <RadioButton key={dc} value={dc}>{dc}</RadioButton>
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

const SettingEditor = props => {
        const { setting } = props;
        return setting.isBool
            ? <BoolEditor {...props} />
            : setting.isEnum
                ? <EnumEditor {...props} />
                : <TextEditor {...props} />;
};

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
        const {value, className, onChange, name, children, active} = this.props;

        const classNames = (className && className.split(' ')) || [];
        classNames.push('label-button');
        if (active)
            classNames.push('active');

        return (
            <button className={classNames.join(' ')} value={value} onClick={onChange}>
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
            <TableSelector selectedValue={value} onChange={onChange}>
                {Object.keys(enumNames).map(key =>
                    <TableSelectorItem
                        key={key}
                        value={key}
                        name={enumNames[key].name}
                        description={enumNames[key].description}
                    />
                )}
            </TableSelector>
        );
    }
}

class TableSelector extends Component {
    render() {
        const { selectedValue, onChange, children } = this.props;
        const mapped = React.Children.map(children, child =>
            React.cloneElement(child, { active: child.props.value === selectedValue, onChange, ...child.props })
        );

        return (
            <table className="table-selector">
                <tbody>
                    {mapped}
                </tbody>
            </table>
        );
    }
}

class TableSelectorItem extends Component {

    render() {
        const { onChange, name, value, description, active } = this.props;
        return (
            <tr className={`${active ? 'active' : ''} selector-item`} onClick={e => onChange(value)}>
                <td className="status">{active ?
                    <img src={checkImg} alt="selected" />
                    : null
                }</td>
                <th>{name}</th>
                <td>{description && <span dangerouslySetInnerHTML={{__html:render(description)}} />}</td>
            </tr>
        )
    }
}

// vim: sw=4 ts=4 et
