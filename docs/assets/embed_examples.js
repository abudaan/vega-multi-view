const examples = document.getElementsByClassName('example');
const addMultipleConfigs = window.vmv.addMultipleConfigs;

const configUrls = [];
Array.from(examples).forEach((example) => {
    configUrls.push(example.dataset.url);
});

addMultipleConfigs(configUrls)
    .then((results) => {
        console.log(results);
    }).catch((errors) => {
        console.error(errors);
    });
