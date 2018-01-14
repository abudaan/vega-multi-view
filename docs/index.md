---
layout: page
---

# Data binding between views.

You can send a dataset or a manipulation of a dataset between separate views by adding a key `dataset` to you view specific configuration (vmv config). There are 5 possible actions that you can perform on a dataset:

 - change fields in selected data rows of a dataset
 - remove fields in selected data rows of a dataset
 - add new data rows to a dataset
 - replace a complete dataset
 - remove a complete dataset

The data binding can be defined by adding a `dataset` key to a published signal. You can do this both in the global configuration file or in the view specific configuration file:

```yaml
  publish:
    - signal: exportData
      as: updateFromView1
      dataset: # define data binding by adding a dataset object
        name: table
        action: change
        select:
            field: category
            test: ==
        update:
            fields:
              - amount
              - color
```

Below the type definition of a dataset. The `test` key in the `select` object is only required when `action` is set to "change" or "remove".

```javascript
type DatasetType = {
    [name: string]: string,
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

Take a look at the example below. You can click on the bars and the dots and adjust the values; as you see the values stay in sync between the 2 views. Another thing you'll notice is that if you drag a bar on the left side the values of categories A and B change as well.

{% include example.html id="example9a" vmvconfig="assets/vmvconfig/example9a.yaml" %}

In the example above I have used a global configuration, below an excerpt of this file:

```yaml
publish:
- signal: exportData
  as: updateDataFromView1
  dataset:
    name: table
    action: change
    select:
      field: category
      test: "=="
    update:
      fields:
      - amount
      - color
```

The `dataset` object behaves like a sort of SQL query where `name` tells us in which dataset the changes will be applied.

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

The first value of every tuple is the value that will be used for the test. The second and subsequent values are the new values of the fields that will be updated. In this example we can update the fields "amount" and "color" because they are defined in the `dataset` key of the published signal. This doesn't mean however that we have to provide a value for both fields. In the spec above you see that the first tuple has only 2 values, but the 2nd and 3rd tuple have 3 values. Note that the order of values should match the order of the fields: in case you only want to provide a value for "color" you must pass `null` as the first value.

In the first tuple we test against the value of the `selectedCategory` signal which holds the datum that is coupled to the bar or dot as soon as we start dragging it. In this datum the `category` key gives us the name of the currently selected category. In the 2nd tuple we simply select category "A", and in the 3rd tuple category "B" is selected.

In the first tuple we set the value of the currently selected category to the current value of the `amount` key of the `changeAmount` signal. In the 2nd and 3rd tuple we set the amount to a fraction of this value and we set a different color when this value surpasses a certain value. Note that these changes only occur in the view(s) that are subscribed to the "exportData" signal.

We can draw the following conclusion: the vmv config provides the logic and the spec provides the values that this logic acts upon.

## Replace a complete dataset

Your vmv config would look something like this:

```yaml
publish:
- signal: exportData
  as: updateDataFromView1
  dataset:
    name: table
    action: replace_all
```

And your then `exportData` signal should hold the complete `table` dataset:

```yaml
signals:
- name: exportData
  value: {}
  'on':
  - events:
      signal: changeAmount
    update: "data('table')"
```