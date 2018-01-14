---
layout: page
---

## Data binding between views.

You can send a dataset or a manipulation of a dataset between separate views by adding a key `dataset` to you view specific configuration (vmv config). There are 5 possible actions that you can perform on a dataset:

 - change fields in selected data rows in a dataset
 - remove fields selected data rows in a dataset
 - add new data rows to a dataset
 - replace a complete dataset
 - remove a complete dataset


### Change field in a selected data

{% include example.html id="example9a" vmvconfig="assets/vmvconfig/example9a.yaml" %}



The vmv config:

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
```

As you can see the `action` is set to "change"; now the `dataset` object behaves like a sort of SQL query that selects rows and updates values of fields in the selected rows.

The `select` object tells us how to select the right data row in the dataset. In this example we want to select a row by category so `field` is set to "category" and `test` is set to "==". The value that we are going to test against will be provided by the signal, see below.

Then we have an `update` object, in this object we list the field(s) in the data row that will be replaced by the new value(s). These values will be provided by the signal as well. In this case we have only 2 fields in a data row and we only want to update the field "amount" of the selected category.

Now let's have a look at the spec to see how the signal sets the necessary values:

```yaml
signals:
- name: exportData
  value: {}
  'on':
  - events:
      signal: changeAmount
    update: "[[category, changeAmount.amount], ['A', changeAmount.amount * 0.2]]"
```

Let's break down the last line into json:

```json
[
  [
    "category",
    "changeAmount.amount"
  ],
  [
    "A",
    "changeAmount.amount * 0.2"
  ]
]
```
and into yaml:
```yaml
- - category
  - changeAmount.amount
- - A
  - changeAmount.amount * 0.2
```

Now you can clearly see the signal is an array of tuples.

The first value of every tuple is the value that will be used for the test. The second and subsequent values are the new values of the fields that will be updated. In this example we only update the `amount` field, so the tuples have only 2 values.

In the first tuple we test against the value of the `category` signal which is the currently selected category. In the second tuple we simply select category "A".

In the first tuple we set the value of the currently selected category to the current value of the `amount` key of the `changeAmount` signal. In the second tuple we set the amount of category A to a fraction of this value.

As you can see, the vmv config provides the logic and the spec provides the values that this logic acts upon.



### 1. Remove a complete dataset



### 2. replace a complete dataset


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

### 2. change selected values

The vmv config:

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
```

As you can see the `action` is set to "change"; now the `dataset` object behaves like a sort of SQL query that selects rows and updates values of fields in the selected rows.

The `select` object tells us how to select the right data row in the dataset. In this example we want to select a row by category so `field` is set to "category" and `test` is set to "==". The value that we are going to test against will be provided by the signal, see below.

Then we have an `update` object, in this object we list the field(s) in the data row that will be replaced by the new value(s). These values will be provided by the signal as well. In this case we have only 2 fields in a data row and we only want to update the field "amount" of the selected category.

Now let's have a look at the spec to see how the signal sets the necessary values:

```yaml
signals:
- name: exportData
  value: {}
  'on':
  - events:
      signal: changeAmount
    update: "[[category, changeAmount.amount], ['A', changeAmount.amount * 0.2]]"
```

Let's break down the last line into json:

```json
[
  [
    "category",
    "changeAmount.amount"
  ],
  [
    "A",
    "changeAmount.amount * 0.2"
  ]
]
```
and into yaml:
```yaml
- - category
  - changeAmount.amount
- - A
  - changeAmount.amount * 0.2
```

Now you can clearly see the signal is an array of tuples.

The first value of every tuple is the value that will be used for the test. The second and subsequent values are the new values of the fields that will be updated. In this example we only update the `amount` field, so the tuples have only 2 values.

In the first tuple we test against the value of the `category` signal which is the currently selected category. In the second tuple we simply select category "A".

In the first tuple we set the value of the currently selected category to the current value of the `amount` key of the `changeAmount` signal. In the second tuple we set the amount of category A to a fraction of this value.

As you can see, the vmv config provides the logic and the spec provides the values that this logic acts upon.
