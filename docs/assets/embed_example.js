const examples = document.getElementsByClassName('example');
const addViews = window.vmv.addViews;

Array.from(examples).forEach((example) => {
    const restApiUrl = example.dataset.url;
    addViews(restApiUrl)
        .then((result) => {
            console.log(result);
        }).catch((error) => {
            console.error(error);
        });
});

