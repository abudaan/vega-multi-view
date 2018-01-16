---
layout: page
---

# Data binding between views.

You can send a dataset or a manipulation of a dataset between separate views by defining data binding in the `query` object of a published signal. You can do this both in the global configuration file or in the view specific configuration file:

```yaml
  publish:
    - signal: exportData
      as: updateFromView1
      query: # define data binding by adding a query object
        dataset: table
        action: change
        select:
            field: category
            test: ==
        update:
            fields:
              - amount
              - color
```

There are 5 possible actions that you can perform on a dataset:

 - change fields in selected data rows of a dataset
 - remove fields in selected data rows of a dataset
 - add new data rows to a dataset
 - replace a complete dataset
 - remove a complete dataset

Below the type definition of a query object. The `test` key in the `select` object is only required when `action` is set to "change" or "remove".

```javascript
type QueryType = {
    [dataset: string]: string,
    [action: string]: ActionUnionType
    [select: string]?: {
        [field: string]: string,
        [test: string]?: TestUnionType,
    },
    [update: string]?: {
        [fields: string]: Array<string>,
    },
};

type ActionUnionType =
    | 'change'
    | 'remove'
    | 'insert'
    | 'replace_all'
    | 'remove_all'
;

type TestUnionType =
    | '=='
    | '!='
    | '<'
    | '>'
;
```

## Change fields in a selected data row

Take a look at the example below. You can click on the bars and the dots and adjust the values; as you will see the values stay in sync between the 2 views. Another thing you'll notice is that if you drag for instance the bar of category H on the left side, the values of categories A and B change as well.

{% include example.html id="example9a" vmvconfig="assets/vmvconfig/example9a.yaml" %}

In the example above I have used a global configuration, below an excerpt of this file:

```yaml
publish:
- signal: exportData
  as: updateDataFromView1
  query:
    dataset: table
    action: change
    select:
      field: category
      test: "=="
    update:
      fields:
      - amount
      - color
```

The `query` object behaves like a sort of SQL query where `dataset` tells us in which dataset the changes will be applied.

The `select` object tells us how to select the right data row in the dataset. In this example we want to select a row by category so `field` is set to "category" and `test` is set to "==". The value that we are going to test against will be provided by the signal, see below.

Then we have an `update` object, in this object we list the field(s) in the data row that will be replaced by the new value(s). These new values will be provided by the signal as well. In this case we want to update the fields "amount" and "color".

Now let's have a look at the spec to see how the signal sets the necessary values:

```yaml
signals:
- name: exportData
  value: {}
  on:
  - events:
      signal: changeAmount
    update: "[
        [selectedCategory.category, changeAmount.amount],
        ['A', changeAmount.amount * 0.5, changeAmount.amount > 50 ? 'red' : 'steelblue'],
        ['B', changeAmount.amount * 0.25, changeAmount.amount < 150 ? 'lightgreen' : 'steelblue'],
    ]"
```

As you can see the signal is an array of tuples.

The first value of every tuple is the value that will be used for the test. The second and subsequent values are the new values of the fields that will be updated. In this example we can update the fields "amount" and "color" because they are defined in the `query.update.fields` key of the published signal. This doesn't mean however that we have to provide a value for both fields. In the spec above you see that the first tuple has only 2 values, but the 2nd and 3rd tuple have 3 values. Note that the order of values should match the order of the fields: in case you only want to provide a value for "color" you must pass `null` as the first value.

In the first tuple we test against the value of the `selectedCategory` signal which holds the datum that is coupled to the bar or dot as soon as we start dragging it. In this datum the `category` key gives us the name of the currently selected category. In the 2nd tuple we simply select category "A", and in the 3rd tuple category "B" is selected.

In the first tuple we set the value of the currently selected category to the current value of the `amount` key of the `changeAmount` signal. In the 2nd and 3rd tuple we set the amount to a fraction of this value and we set a different color when this value surpasses a certain value. Note that these changes only occur in the view(s) that are subscribed to the "exportData" signal.

We can draw the following conclusion: a global or view specific configuration provides the logic and the signal of a spec provides the values that this logic acts upon.

> Source files of this example:
 - [data](https://github.com/abudaan/vega-multi-view/blob/master/docs/assets/data/table-data.yaml){:target="_blank"}
 - [bars view](https://github.com/abudaan/vega-multi-view/blob/master/docs/assets/specs/example9a_bars.yaml){:target="_blank"}
 - [dots view](https://github.com/abudaan/vega-multi-view/blob/master/docs/assets/specs/example9a_dots.yaml){:target="_blank"}
 - [global config file](https://github.com/abudaan/vega-multi-view/blob/master/docs/assets/vmvconfig/example9a.yaml){:target="_blank"}


## Replace a complete dataset

The example below is a more 'brute force' solution for keeping the values of the categories in sync between the 2 views: every time you change a value by dragging a dot or a bar, the complete dataset is copied over to the other view.

{% include example.html id="example9b" vmvconfig="assets/vmvconfig/example9b.yaml" %}

Your vmv config would look something like this:

```yaml
publish:
- signal: exportData
  as: updateDataFromView3
  query:
    dataset: table
    action: replace_all
```

And your then `exportData` signal should hold the complete `table` dataset:

```yaml
signals:
- name: exportData
  value: {}
  on:
  - events:
      signal: changeAmount
    update: "{data: data('table')}"
```
Note that the dataset is wrapped in an object; this seems useless but if we sent the plain dataset like this `update: "data('table')"`, then Vega doesn't recognize that the value of the signal has changed for some reason.

> Source files of this example:
 - [data](https://github.com/abudaan/vega-multi-view/blob/master/docs/assets/data/table-data.yaml){:target="_blank"}
 - [bars view](https://github.com/abudaan/vega-multi-view/blob/master/docs/assets/specs/example9b_bars.yaml){:target="_blank"}
 - [dots view](https://github.com/abudaan/vega-multi-view/blob/master/docs/assets/specs/example9b_dots.yaml){:target="_blank"}
 - [global config file](https://github.com/abudaan/vega-multi-view/blob/master/docs/assets/vmvconfig/example9b.yaml){:target="_blank"}

## Remove fields in selected data rows

When the value of a category is less than 10, this category will be removed in the other view. Click on [reset] to restore the original data.

{% include example.html id="example9c" vmvconfig="assets/vmvconfig/example9c.yaml" %}

Excerpt of the vmv config:

```yaml
publish:
- signal: exportData
    as: updateFromView5
    query:
    dataset: table
    action: remove
    select:
        field: category
        test: ==
```

And the `exportData` signal:

```yaml
signals:
- name: exportData
  value: {}
  on:
  - events:
      signal: changeAmount
    update: "changeAmount.amount < 10 ? [
        [selectedCategory.category],
    ] : {}"
```
> Source files of this example:
 - [data](https://github.com/abudaan/vega-multi-view/blob/master/docs/assets/data/table-data.yaml){:target="_blank"}
 - [bars view](https://github.com/abudaan/vega-multi-view/blob/master/docs/assets/specs/example9c_bars.yaml){:target="_blank"}
 - [dots view](https://github.com/abudaan/vega-multi-view/blob/master/docs/assets/specs/example9c_dots.yaml){:target="_blank"}
 - [reset button](https://github.com/abudaan/vega-multi-view/blob/master/docs/assets/specs/example9c_reset.yaml){:target="_blank"}
 - [global config file](https://github.com/abudaan/vega-multi-view/blob/master/docs/assets/vmvconfig/example9c.yaml){:target="_blank"}

## Insert new data rows

When the value of a category is 101 or 102, a new category will be added to the other view. Click on [reset] to restore the original data.

{% include example.html id="example9d" vmvconfig="assets/vmvconfig/example9d.yaml" %}

Excerpt of the vmv config:

```yaml
publish:
- signal: exportData
    as: updateFromView7
    query:
    dataset: table
    action: insert
```

And the `exportData` signal:

```yaml
signals:
- name: exportData
  value: {}
  on:
  - events:
      signal: changeAmount
    update: "(changeAmount.amount > 100 && changeAmount.amount < 103)? [
        {'category': selectedCategory.category + '-' + changeAmount.amount, 'amount': 30, 'color': 'yellow'},
    ] : {}"
```

> Source files of this example:
 - [data](https://github.com/abudaan/vega-multi-view/blob/master/docs/assets/data/table-data.yaml){:target="_blank"}
 - [bars view](https://github.com/abudaan/vega-multi-view/blob/master/docs/assets/specs/example9d_bars.yaml){:target="_blank"}
 - [dots view](https://github.com/abudaan/vega-multi-view/blob/master/docs/assets/specs/example9d_dots.yaml){:target="_blank"}
 - [reset button](https://github.com/abudaan/vega-multi-view/blob/master/docs/assets/specs/example9d_reset.yaml){:target="_blank"}
 - [global config file](https://github.com/abudaan/vega-multi-view/blob/master/docs/assets/vmvconfig/example9d.yaml){:target="_blank"}

## Remove a complete data set

Click on [remove data] to remove the complete dataset in both views.

{% include example.html id="example9e" vmvconfig="assets/vmvconfig/example9e.yaml" %}

In the vmv config the signals of the toggle button remove/add data are published:

```yaml
publish:
    - signal: removeData
    query:
        dataset: table
        action: remove_all
    - signal: addData
    query:
        dataset: table
        action: replace_all
```
And in the spec of the toggle button the signals are defined as follows:
```yaml
- name: addData
  on:
  - events: "@add_data_button:click"
    update: "buttonLabel === '[add data]' ? {data: data('table')} : {}"
- name: removeData
  on:
  - events: "@add_data_button:click"
    update: "buttonLabel === '[remove data]' ? true : false"
- name: buttonLabel
  value: '[remove data]'
  on:
    - events:
        signal: addData
      update: "buttonLabel === '[add data]' ? '[remove data]' : '[add data]'"
```
As you can see, the state of the toggle is based on the value of the label on the button. The signal `removeData` sends a boolean and the signal `addData` sends either an empty object or the complete dataset. Note that both signals change on every button click; it would have been much neater if the button only triggers one signal change per click. This can be done if we use `replace_all` and send an empty dataset which effectively removes the dataset as well. In the vmv config:

```yaml
publish:
    - signal: toggleData
    query:
        dataset: table
        action: remove_all
```

And in the toggle button spec:

```yaml
- name: toggleData
  on:
  - events: "@add_data_button:click"
    update: "buttonLabel === '[add data]' ? {data: data('table')} : {}"
```

Obviously this is a better solution but of course the purpose of this example was to demonstrate the use of `remove_all`.

> Source files of this example:
 - [data](https://github.com/abudaan/vega-multi-view/blob/master/docs/assets/data/table-data.yaml){:target="_blank"}
 - [bars view](https://github.com/abudaan/vega-multi-view/blob/master/docs/assets/specs/example9e_bars.yaml){:target="_blank"}
 - [dots view](https://github.com/abudaan/vega-multi-view/blob/master/docs/assets/specs/example9e_dots.yaml){:target="_blank"}
 - [remove/add data button](https://github.com/abudaan/vega-multi-view/blob/master/docs/assets/specs/example9e_reset.yaml){:target="_blank"}
 - [global config file](https://github.com/abudaan/vega-multi-view/blob/master/docs/assets/vmvconfig/example9e.yaml){:target="_blank"}
