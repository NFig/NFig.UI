import React, { Component, PropTypes } from 'react';
import Portal from 'react-portal';
import AutosizeTextArea from '../AutosizeTextArea';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { render } from '../../marked-renderer';
import { 
    setEditing,
    setOverrideValue,
    setOverrideDataCenter,
    showOverrideDetails,
    setNewOverride,
    clearOverride,
    cancelOverride
} from '../../actions';

import Modal from '../Modal';
import ButtonGroup from '../ButtonGroup';
import RadioButton from '../RadioButton';
import pick from 'lodash/pick';
import autobind from 'autobind-decorator';
import { createSelector } from 'reselect';

import checkImg from '../../assets/setting-true.png';

/* export default connect(
    state => pick(state, 'error', 'editing', 'dataCenters', 'override')
)(EditorModal);
 */

const mapStateToProps = createSelector(
    state => state.error,
    state => state.editing,
    state => state.dataCenters,
    state => state.override,
    (error, editing, dataCenters, override) => ({
        error, editing, dataCenters, override
    })
);

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        setEditing,
        setOverrideValue,
        setOverrideDataCenter,
        showOverrideDetails,
        setNewOverride,
        clearOverride,
        cancelOverride
    }, dispatch);
}

@connect(mapStateToProps, mapDispatchToProps)
export default class EditorModal extends Component {

    static propTypes = {
        editing               : PropTypes.object,
        className             : PropTypes.string.isRequired,
        override              : PropTypes.object.isRequired,
        dataCenters           : PropTypes.array.isRequired,
        error                 : PropTypes.string,

        setEditing            : PropTypes.func.isRequired,
        setOverrideValue      : PropTypes.func.isRequired,
        setOverrideDataCenter : PropTypes.func.isRequired,
        showOverrideDetails   : PropTypes.func.isRequired,
        setNewOverride        : PropTypes.func.isRequired,
        clearOverride         : PropTypes.func.isRequired,
        cancelOverride        : PropTypes.func.isRequired,
    };


    shouldShowDetails({ allOverrides, activeOverride }) {

        if (!allOverrides || allOverrides.length == 0) 
            return false;

        if (allOverrides.length > 1) 
            return true;

        if (!activeOverride)
            return true;

        // single override, and an active, it's probably the active one
        return false;
    }

    @autobind
    selectDataCenter(e) {
        const { editing: setting } = this.props;

        const selectedDataCenter = e.target ? e.target.value : e;
        this.props.setOverrideDataCenter(selectedDataCenter);

        const override = setting.allOverrides.find(o => o.dataCenter === selectedDataCenter);
        this.props.setOverrideValue((override && override.value) || ''); 
    }
    
    @autobind
    handleClose() {
        this.props.setEditing(null);
    }

    @autobind
    handleOverrideChange(e) {
        const val = e.target ? e.target.value : e;
        this.props.setOverrideValue(val);
    }

    @autobind
    editOverride() {
        const { 
            editing: { 
                activeOverride: { dataCenter } 
            }
        } = this.props;

        this.selectDataCenter(dataCenter);
    }

    @autobind
    clearActiveOverride() {
        const { 
            editing: { 
                activeOverride: { dataCenter } 
            }, 
            clearOverride
        } = this.props;

        clearOverride(dataCenter);
    }

    @autobind
    showDetails() {
        this.props.showOverrideDetails(true);
    }

    @autobind
    hideDetails() {
        this.props.showOverrideDetails(false);
    }

    @autobind
    clearOverride(e) {
        this.props.clearOverride(e.currentTarget.value);
    }

    render() {

        const { className, error, editing:setting, dataCenters, override } = this.props;

        if (!setting)
            return null;

        const { 
            activeOverride,
            defaultValue: defval,
            isEnum,
            allowsOverrides
        } = setting;

        const enumNames = setting.enumNames || {};


        let { dataCenter: selectedDataCenter, overrideValue, showDetails } = override;

        if (showDetails === undefined || showDetails === null)
            showDetails = this.shouldShowDetails(setting);

        const SettingEditor = EditorFor(setting);
 
        return (
            <Portal isOpened={true} >
                <Modal  className={className} onRequestClose={this.handleClose}>
                    <div className={`${className}-header`}>
                        <button type="button" className="close" onClick={this.handleClose}>
                            <span aria-hidden="true">&times;</span>
                            <span className="sr-only">Close</span>
                        </button>
                        <h3>{setting.name}</h3>
                        <p dangerouslySetInnerHTML={{__html:render(setting.description)}} />
                    </div>
                    <div className={`${className}-body`}>
                        <div className="values">
                            <div className="override active" display-if={activeOverride}>
                                <h5>Active Override</h5>
                                <p>Data Center: <strong>{activeOverride.dataCenter}</strong></p>
                                <ValueDisplay value={activeOverride.value} isEnum={setting.isEnum} enumName={enumNames[activeOverride.value]} />
                                <button className="edit-override" onClick={this.editOverride}>Edit</button>
                                <span>&nbsp;</span>
                                <button className="clear-override" onClick={this.clearActiveOverride}>Clear</button>
                            </div>
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
                                    selectedValue={selectedDataCenter}
                                    onChange={this.selectDataCenter}
                                    dataCenters={dataCenters}
                                    allowsOverrides={allowsOverrides}
                                />
                            </p>
                            <div display-if={selectedDataCenter}>
                                <p display-if={setting.requiresRestart} className="requires-restart">Changes will not take effect until application is restarted.</p>
                                <SettingEditor {...this.props} value={overrideValue} onChange={this.handleOverrideChange}/>
                                <p>
                                    <button className="set-override" onClick={this.props.setNewOverride}>Set Override</button>
                                    <span>&nbsp;</span>
                                    <button className="cancel-override" onClick={this.props.cancelOverride}>Cancel</button>
                                </p>
                            </div>
                        </div>
                        <p display-if={error} className={`${className}-error`}>{error}</p>
                    </div>
                    <div className={`${className}-body show-details`}>
                        <a display-if={!showDetails} className="toggle" style={{cursor:"pointer"}} onClick={this.showDetails}>Show Details</a>
                        <a display-if={showDetails} className="toggle" style={{cursor:"pointer"}} onClick={this.hideDetails}>Hide Details</a>
                        <div display-if={showDetails} className="details">
                            <div className="overrides">
                                <h5>Overrides</h5>
                                <ValueTable {...this.props} propName="allOverrides" onClear={this.clearOverride} />
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




class ValueDisplay extends Component {

    static propTypes = {
        value    : PropTypes.string,
        isEnum   : PropTypes.bool.isRequired,
        enumName : PropTypes.object,
    };
    
    render() {
        const { value, isEnum, enumName } = this.props;

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
    }
}

class DataCenterSelector extends Component {

    static propTypes = {
        selectedValue   : PropTypes.string,
        onChange        : PropTypes.func.isRequired,
        dataCenters     : PropTypes.array.isRequired,
        allowsOverrides : PropTypes.object.isRequired
    };

    render() {
        const {selectedValue, onChange, dataCenters, allowsOverrides} = this.props;


        return (
            <ButtonGroup
                {...this.props}
                className="spaced"
                name="newOverrideValue">
                {dataCenters.map(dc => {
                    const disabled = !allowsOverrides[dc];
                    const title = disabled ? 'Overrides not allowed for this data center and tier' : null;
                    return (<RadioButton key={dc} value={dc} disabled={disabled} title={title}>{dc}</RadioButton>);
                })}
            </ButtonGroup>
        );
    }
}

class ValueTable extends Component {

    static propTypes = {
        editing  : PropTypes.object.isRequired,
        propName : PropTypes.string.isRequired,
        onClear  : PropTypes.func,
    };


    render() {
        const {editing:setting, propName, onClear} = this.props;
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
                                        value={v.dataCenter}
                                        onClick={onClear}>
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

    static propTypes = {
        editing  : PropTypes.object.isRequired,
        value    : PropTypes.string.isRequired,
        onChange : PropTypes.func.isRequired
    };

    shouldComponentUpdate(nextProps) {
        return (nextProps.value !== this.props.value) ||
            (nextProps.onChange !== this.props.onChange) ||
            (nextProps.editing !== this.props.editing);
    }

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



class TextEditor extends Component {

    static propTypes = {
        editing  : PropTypes.object.isRequired,
        value    : PropTypes.string.isRequired,
        onChange : PropTypes.func.isRequired
    };

    shouldComponentUpdate(nextProps) {
        return (nextProps.value !== this.props.value) ||
            (nextProps.onChange !== this.props.onChange) ||
            (nextProps.editing !== this.props.editing);
    }


    render() {
        return (
            <pre className="value">
                <AutosizeTextArea
                    {...this.props}
                    className="quick-editor"
                    spellCheck={false}
                    name="value"
                    style={{height: "1em"}}
                />
            </pre>
        );
    }
}

class EnumEditor extends Component {
    static propTypes = {
        editing  : PropTypes.object,
        value    : PropTypes.string,
        onChange : PropTypes.func
    };

    render() {
        const { editing: {enumNames}, value, onChange } = this.props;
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
    static propTypes = {
        selectedValue : PropTypes.string,
        onChange      : PropTypes.func,
        children      : PropTypes.node
    };


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

    static propTypes = {
        onChange    : PropTypes.func,
        name        : PropTypes.string.isRequired,
        value       : PropTypes.any.isRequired,
        description : PropTypes.string,
        active      : PropTypes.bool
    };

    @autobind
    handleClick(e) {
        this.props.onChange(this.props.value);
    }

    render() {
        const { onChange, name, value, description, active } = this.props;
        return (
            <tr className={`${active ? 'active' : ''} selector-item`} onClick={this.handleClick}>
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
