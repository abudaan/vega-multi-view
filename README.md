# Vega multi view

This library is a wrapper of the [Vega](https://github.com/vega/vega) runtime API that sets up a publish-subscribe mechanism for signals: this allows separate Vega views (views that live in different HTML elements) to communicate with each other.

It is also possible to update each other's datasets. The wrapper accepts specs in json, cson, bson and notably the much leaner yaml format. For documentation see the [wiki](https://github.com/abudaan/vega-multi-view/wiki) on Github.

You can clone the Github repository or embed the library using [Rawgit](https://rawgit.com/) urls:

for development:
```
https://rawgit.com/abudaan/vega-multi-view/v1.1.9/build/vmv.css
https://rawgit.com/abudaan/vega-multi-view/v1.1.9/build/vmv.js
https://rawgit.com/abudaan/vega-multi-view/v1.1.9/build/vmv.min.js
```
for production:
```
https://cdn.rawgit.com/abudaan/vega-multi-view/v1.1.9/build/vmv.css
https://cdn.rawgit.com/abudaan/vega-multi-view/v1.1.9/build/vmv.js
https://cdn.rawgit.com/abudaan/vega-multi-view/v1.1.9/build/vmv.min.js
```

## Acknowledgements

Special thanks to [Ronald Vendelmans](https://vendel.home.xs4all.nl/) and [Richard Bastiaans](https://ministryofdata.nl/): Ronald for the original idea of connecting Vega signals using publish-subscribe and both Richard and Ronald for their highly constructive thinking along.