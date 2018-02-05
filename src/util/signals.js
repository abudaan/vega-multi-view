// @no-flow
import R from 'ramda';
import xs from 'xstream';
import { change, remove, insert, replaceDataset, removeDataset } from './process';

let streamId = 0;
let streams = {};
let logDebugMessages = false;

const publishSignal = (data) => {
    const {
        vmvConfig,
        view,
    } = data;

    if (R.isNil(vmvConfig.publish)) {
        return streams;
    }

    let publishes = vmvConfig.publish;
    if (Array.isArray(publishes) === false) {
        publishes = [publishes];
    }

    R.forEach((publish) => {
        const alias = publish.as || publish.signal;
        if (R.isNil(streams[alias]) === false) {
            console.error(`There is already a stream published as "${alias}", skipping this one. Please use another name or unpublish this signal first`);
        } else {
            try {
                const s = xs.create({
                    start(listener) {
                        view.addSignalListener(publish.signal, (name, value) => {
                            listener.next({ query: publish.query, value });
                        });
                    },
                    stop() {
                        view.removeSignalListener(publish.signal);
                    },
                    id: streamId,
                });
                streamId += 1;
                if (logDebugMessages) {
                    console.log(`publishing signal ${publish.signal} as ${alias} with stream id ${streamId}`);
                }
                streams[alias] = s;
            } catch (e) {
                console.error(e.message);
            }
        }
    }, publishes);
    return streams;
};


const subscribeToSignal = (data) => {
    const {
        view,
        spec,
        vmvConfig,
    } = data;

    if (R.isNil(vmvConfig.subscribe)) {
        return;
    }

    let subscribes = vmvConfig.subscribe;
    if (Array.isArray(subscribes) === false) {
        subscribes = [subscribes];
    }

    R.forEach((subscribe) => {
        const s = streams[subscribe.signal];
        if (R.isNil(s)) {
            console.error(`no stream for signal "${subscribe.signal}"`);
            return;
        }
        s.addListener({
            next: (d) => {
                const {
                    query,
                    value,
                } = d;
                let action = null;
                if (query) {
                    ({ action } = query);
                }
                if (action === 'replace_all' || action === 'replaceAll') {
                    replaceDataset(view, query, value);
                } else if (action === 'remove_all' || action === 'removeAll') {
                    removeDataset(view, query, value);
                } else if (action === 'change') {
                    change(view, query, value);
                } else if (action === 'remove') {
                    remove(view, query, value);
                } else if (action === 'insert') {
                    insert(view, query, value);
                } else { // if (R.isEmpty(value) === false) {
                    const signalName = subscribe.as || subscribe.signal;
                    if (R.isNil(R.find(R.propEq('name', signalName))(spec.signals))) {
                        console.error(`no signal "${signalName}" found in spec`);
                    } else {
                        view.signal(signalName, value).run();
                    }
                }
            },
            error: (err) => {
                console.error(`Stream ${s.id} error: ${err}`);
            },
            complete: () => {
                console.log(`Stream ${s.id} is done`);
            },
        });
    }, subscribes);
};

const connectSignals = (data, debug) => {
    logDebugMessages = debug;
    R.forEach((d) => {
        if (d.view !== null) {
            streams = { ...streams, ...publishSignal(d) };
        }
    }, R.values(data));

    R.forEach((d) => {
        if (d.view !== null) {
            subscribeToSignal(d, streams);
        }
    }, R.values(data));
    // console.log(streams);
};

export default connectSignals;
