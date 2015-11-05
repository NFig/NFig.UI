import React, { Component } from 'react';
import Portal from 'react-portal';
import marked from 'marked';
import Keys from './keys';
import AutosizeTextArea from './AutosizeTextArea';

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
        this.setState({newOverrideValue: e.target.value});
    }

    canSetOverride() {
        if (!this.state.selectedDataCenter)
            return false;

        const { setting: { isBool } } = this.props;

        return !isBool || !!this.state.newOverrideValue;
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
        const {activeOverride: override, defaultValue: defval} = setting;
        const {selectedDataCenter} = this.state;

        return (
            <Portal isOpened={true} >
                <Modal  className={this.props.className} onRequestClose={_ => this.handleClose()}>
                    <div className={`${this.props.className}-header`}>
                        <button type="button" className="close" onClick={() => this.handleClose()}>
                            <span aria-hidden="true">&times;</span>
                            <span className="sr-only">Close</span>
                        </button>
                        <h3>{setting.name}</h3>
                        <p dangerouslySetInnerHTML={{__html:marked(setting.description)}} />
                    </div>
                    <div className={`${this.props.className}-body`}>
                        <div className="values">
                            {override ?
                            <div className="override active">
                                <h5>Active Override</h5>
                                <p>Data Center: <strong>{override.dataCenter}</strong></p>
                                <pre className="setting-value">{override.value}</pre>
                                <a className="edit-override" onClick={() => this.selectDataCenter(override.dataCenter)}>Edit</a>
                                <span>&nbsp;</span>
                                <a className="clear-override" onClick={() => this.clearOverride(override.dataCenter)}>Clear</a>
                            </div> : null}
                            <div className="default">
                                <h5>Default Value</h5>
                                <p>Data Center: <strong>{defval.dataCenter}</strong></p>
                                <pre className="setting-value">{defval.value}</pre>
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

class DataCenterSelector extends Component {
    render() {
        const {selectedValue, onChange, dataCenters} = this.props;

        return (
            <RadioButtonGroup
                {...this.props}
                className="spaced"
                name="newOverrideValue">
                {dataCenters.map(dc =>
                    <RadioButton key={dc} value={dc}>{dc}</RadioButton>
                )}
            </RadioButtonGroup>
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

class SettingEditor extends Component {
    render() {
        return this.props.setting.isBool
            ? <BoolEditor {...this.props} />
            : <TextEditor {...this.props} />;
    }
}

class BoolEditor extends Component {
    render() {
        return (
            <p>
                <RadioButtonGroup name="overrideBool" selectedValue={this.props.value} onChange={this.props.onChange}>
                    <RadioButton value="True">True</RadioButton>
                    <RadioButton value="False">False</RadioButton>
                </RadioButtonGroup>
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
            <label className={classNames.join(' ')}>
                <input
                    type="radio"
                    value={value}
                    name={name}
                    checked={active}
                    onChange={onChange} />
                {children}
            </label>
        );
    }
}

class RadioButtonGroup extends Component {
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

// vim: sw=4 ts=4 et
