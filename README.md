# Ao-changeset-base

The AnchorOps changeset-base Mixin abstracts the application of changes and handling of changeset validation errors. An extending component is endowed with two actions onSave and onClose which will handle the corresponding 'positive' and 'negative' interactions in ember, leverage the changeset methods, and then continue bubbling those actions up the component chain.

##Making Hooks from Computed Properties 

The onSave and onClose actions set properties on the extending component that Ember’s Computed Properties can observe. By optionally defining the following properties in each component, you dictate behavior for parts of the save and close routines. 

##onSave
###beforeValidate

This property is invoked every time a save action is called regardless of a force. It is run before any validation is done on the changeset. The return value of this Computed Property is meaningful for how the onSave action continues:

**Return Value** | **Significance**

undefined      | Continue through save action (this happens if no beforeValidate is present)

false          | Stop the action from executing further

{force: false} | Fall through the rest of the Mixin’s save action and bubble save action, no force 

{force: true}  | Fall through the rest of the Mixin’s save action with force flag in first argument



###beforeSave
This property is run after the changeset is validated (will not run if there are errors), and before it is pushed to the actual Ember Model. The return value of this Computed Property is meaningful, see the table of return values for beforeValidate. 

###handleOnSaveErrors
When an onSave action finds errors, it will set a property on the Component called changesetErrors, an Array of strings that represent the errors, then use this property to handle them. The return value of this property is not used.

Example of how these hooks might be used

```
   //client/app/components/mymodel/edit-page/component.js


    import Ember from 'ember'; 

    import ChangeSetMixin from 'client/mixins/changeset-base';


    export default Ember.Component.extend(ChangeSetMixin, { 

      beforeSave: Ember.computed(‘onSaveFired’, function(){

        this.set(‘mymodel.name’,this.get(‘mymodel.name).capitalize());

    }),

    handleOnSaveErrors: Ember.computed('changesetErrors', function(){

        this.get('changesetErrors').forEach(() => {

                this.display(err);

      }) 

    });
```
*The bold and underlined arguments for the Computed Properties are required for Ember to run these functions consistently. If you do not pass a property name for the Computed Property to observe it will execute the function once and use a cached version of it any time after that. By specifying ‘onSaveFired’ (reset every time by the Mixin) you are guaranteed the function will run each time. If you have other properties relevant to your specific implementation, you can use those as arguments just like with a regular Computed Property. 

##onClose
###handleOnCloseErrors 
Use this property just like the handleOnSaveErrors hook. The validations will set the same property, changesetErrors, with the error collection. If handleOnCloseErrors is called, the isInvalid property of the Component is set to true. This is one failsafe so that a user does not close a page with edited data that isn’t valid

###isDirty
This property is called after the validations, it is another failsafe so that a user does not leave a page with unsaved changes. If isInvalid or isDirty is set to true and there is no force flag present, the onClose action will not continue to bubble up. The two properties should be used to show markup that prompts the user to fix their errors or persist their unsaved changes.


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
