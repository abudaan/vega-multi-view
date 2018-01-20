const syncPromises = promises => new Promise((resolve, reject) => {
    let index = 0;
    const max = promises.length;
    const errors = [];
    const results = [];

    const startPromise = (promise, cb) => {
        const {
            func,
            args,
        } = promise;
        func(...args)
            .then((result) => {
                results.push(result);
                cb();
            })
            .catch((error) => {
                errors.push(error);
                cb();
            });
    };

    const next = () => {
        index += 1;
        if (index < max) {
            startPromise(promises[index], next);
        } else if (errors.length === max) {
            reject(new Error('None of the config files could be loaded'));
        } else if (errors.length === 0) {
            resolve(results[0]);
        } else {
            resolve({
                errors,
                result: results[0],
            });
        }
    };

    startPromise(promises[index], next);
});

export {
    syncPromises,
};

