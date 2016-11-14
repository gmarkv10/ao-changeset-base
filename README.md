# Ao-changeset-base

The AnchorOps changeset-base Mixin abstracts the application of changes and handling of changeset validation errors. An extending component is endowed with two actions onSave and onClose which will handle the corresponding 'positive' and 'negative' interactions in ember, leverage the changeset methods, and then continue bubbling those actions up the component chain.

## Installation

* `git clone` this repository
* `npm install`
* `bower install`

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `npm test` (Runs `ember try:testall` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://ember-cli.com/](http://ember-cli.com/).
