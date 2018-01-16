# Vega multi view

This library is a wrapper of the Vega runtime API that sets up a publish-subscribe mechanism for signals: this allows separate Vega views (views that live in different HTML elements) to communicate with each other. It is also possible to update each other's datasets. The wrapper accepts specs in json, cson, bson and notably the much leaner yaml format.

For documentation see the [wiki](https://github.com/abudaan/vega-multi-view/wiki) on Github.