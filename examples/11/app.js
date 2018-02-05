import { addViews, version as vmvVersion } from '../../src/index';


addViews('./vmvconfig.yaml').then((result) => {
    console.log(result);
}).catch((error) => {
    console.error(error);
});
