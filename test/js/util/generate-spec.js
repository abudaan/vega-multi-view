export default (spec) => {
    // const json = encodeURIComponent(JSON.stringify(TestSpec4));
    // window.open(`data:application/json, ${json}`, '_blank');
    const json = JSON.stringify(spec, null, 4);
    const w = window.open();
    w.document.open();
    w.document.write(`<html><body><pre>${json}</pre></body></html>`);
    w.document.close();
};
