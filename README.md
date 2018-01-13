# Vega multi view

This library is a wrapper of the Vega runtime API that allows you to add multiple Vega views to a HTML page that can listen to each other's signals and share datasets or manipulations thereof, despite the fact that each view lives in a separate HTML element.

Connecting signals of separate Vega views is setup using a publish-subscribe mechanism: a Vega view can publish signals for other views to subscribe to, and subscribe to signals that have been published by other views. There is no limit in the number of signals that a view can publish or subscribe to.

For documentation see the [wiki](https://github.com/abudaan/vega-multi-view/wiki)

