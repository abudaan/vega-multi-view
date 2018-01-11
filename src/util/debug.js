import R from 'ramda';

const addDebug = (datas) => {
    console.log(datas);
    R.forEach((d) => {
        const {
            spec,
            view,
        } = d;

        R.forEach((signal) => {
            view.addSignalListener(signal.name, (signalName, signalData) => {
                console.log('[SIGNAL] %s %s %O', spec.description || ' - ', signalName, signalData);
            });
        }, spec.signals || []);
    }, datas);

    const promises = R.map(d => new Promise((resolve) => {
        const {
            spec,
            view,
        } = d;
        if (R.isNil(spec.data) || spec.data.length === 0) {
            resolve();
        }
        const numDataSources = spec.data.length;
        let numLoaded = 0;
        const dataPoller = setInterval(() => {
            R.forEach((data) => {
                const loaded = view.data(data.name);
                if (loaded !== null) {
                    console.log('[DATA] %s %s %O', spec.description || ' - ', data.name, loaded);
                    numLoaded += 1;
                }
                if (numLoaded === numDataSources) {
                    // console.log('all data loaded');
                    clearInterval(dataPoller);
                    resolve();
                }
            }, spec.data);
        }, 10);
    }), datas);

    return Promise.all(promises);
};

export default addDebug;
