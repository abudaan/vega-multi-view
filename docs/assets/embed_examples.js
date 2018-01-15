const addMultipleConfigs = window.vmv.addMultipleConfigs;
const examples = document.getElementsByClassName('example');
const configUrls = [];
Array.from(examples).forEach((example) => {
    configUrls.push(example.dataset.url);
});
console.log('embedding examples');
addMultipleConfigs(configUrls)
    .then((results) => {
        console.log(results);
    }).catch((errors) => {
        console.error(errors);
    });

