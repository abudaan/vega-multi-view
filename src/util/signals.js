// @no-flow
import R from 'ramda';
import xs from 'xstream';
import { changeset } from 'vega';

let streamId = 0;

const publishSignal = (data) => {
    const {
        vmvConfig,
        view,
    } = data;
    const streams = {};

    if (R.isNil(vmvConfig.publish)) {
        return streams;
    }

    let publishes = vmvConfig.publish;
    if (Array.isArray(publishes) === false) {
        publishes = [publishes];
    }

    R.forEach((publish) => {
        // console.log(publish);
        try {
            const s = xs.create({
                start(listener) {
                    view.addSignalListener(publish.signal, (name, value) => {
                        listener.next(value);
                    });
                },
                stop() {
                    view.removeSignalListener(publish.signal);
                },

                id: streamId,
            });
            streamId += 1;
            streams[publish.as || publish.signal] = s;
        } catch (e) {
            console.error(e.message);
        }
    }, publishes);

    return streams;
};


const subscribeToSignal = (data, streams) => {
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
            next: (value) => {
                if (typeof value.dataset !== 'undefined') {
                    const {
                        dataset,
                        action,
                        values,
                    } = value;

                    if (action === 'replace_all' || action === 'replaceAll') {
                        view.remove(dataset, () => true).run();
                        view.insert(dataset, values).run();
                    } else if (action === 'change') {
                        const cs = changeset();
                        values.forEach((v) => {
                            const {
                                select,
                                update,
                            } = v;
                            if (select.test === '==') {
                                cs.modify(d => d[select.field] === select.value, update.field, update.value);
                            }
                        });
                        view.change(dataset, cs).run();
                    } else if (action === 'remove') {
                        const cs = changeset();
                        values.forEach((v) => {
                            const {
                                field,
                                value,
                            } = v;
                            cs.remove(d => d[field] === value, field, value);
                        });
                        view.change(dataset, cs).run();
                    } else if (action === 'removeAll') {
                        view.remove(dataset, () => true).run();
                    } else if (action === 'insert') {
                        const cs = changeset();
                        values.forEach((v) => {
                            const {
                                field,
                                value,
                            } = v;
                            cs.remove(d => d[field] === value, field, value);
                        });
                        view.change(dataset, cs).run();
                    }
                } else if (R.isEmpty(value) === false) {
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

const connectSignals = (data) => {
    let streams = {};
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
};

export default connectSignals;
