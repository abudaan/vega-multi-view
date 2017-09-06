export default () => {
    let dataPath = `${window.location.protocol}//${window.location.host}/test/data/`;
    let imagePath = `${window.location.protocol}//${window.location.host}/test/img/`;

    if (window.location.hostname.indexOf('github') !== -1) {
        dataPath = `${window.location.protocol}//${window.location.host}/vega-specs/public/data/`;
        imagePath = `${window.location.protocol}//${window.location.host}/vega-specs/public/img/`;
    } else if (window.location.hostname.indexOf('abumarkub') !== -1) {
        dataPath = `${window.location.protocol}//${window.location.host}/fffact/public/data/`;
        imagePath = `${window.location.protocol}//${window.location.host}/fffact/public/img/`;
    }

    return {
        dataPath,
        imagePath,
    };
};
