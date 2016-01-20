
export default function (type, ...argNames) {
    return function(...args) {
        const action = { type };
        argNames.forEach((arg, i) => {
            action[argNames[i]] = args[i];
        });
        return action;
    }
}

