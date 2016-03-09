import agent from 'superagent-promise';
import Promise from 'bluebird';
import superagent from 'superagent';
export default agent(superagent, Promise);
