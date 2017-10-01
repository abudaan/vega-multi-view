// import { addViews, removeViews } from '../../src/js/index';
// const vmv = require('../../src/js/index');
const { addViews, removeViews } = require('../../src/index');

addViews('http://localhost:3000/test-spec/').then((result) => {
    console.log(result);
}).catch((error) => {
    console.error(error);
});
