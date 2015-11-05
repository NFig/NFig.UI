import autosize from 'autosize';


export default class AutosizeTextArea extends Component {

    static defaultProps = {
        rows: 1
    };

    componentDidMount() {
        const textarea = this.refs.textarea;
        autosize(textarea);
        textarea.focus();
        textarea.select();
    }

    componentWillUnmount() {
        this.dispatchEvent('autosize:destroy');
    }

    dispatchEvent(TYPE, defer) {
        const event = document.createEvent('Event');
        event.initEvent(TYPE, true, false);
        const dispatch = () => this.refs.textarea.dispatchEvent(event);
        if (defer) {
            // Next tick
            setTimeout(dispatch);
        } else {
            dispatch();
        }
    }

    componentWillReceiveProps(nextProps) {
        this.dispatchEvent('autosize:update');
    }

    render() {
        return <textarea {...this.props} ref="textarea"></textarea>
    }
}
