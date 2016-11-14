import Ember from 'ember';
const ZERO = 0;
export default Ember.Mixin.create({
	init(){
		this._super(...arguments);
		this.set('context', this);
	},
	actions: {
		onSave(force){
			const beforeSave = this.get('beforeSave');
			let forceClose;
			/**
			 * There are 4 outcomes when a beforeSave function is given in the extending component
			 * They depenend on what is returned by beforeSave (the beforeSaveResult)
			 * 
			 * 1. beforeSaveResult = false : Stop propagation of any actions
			 * 2. beforeSaveResult = {force: false} : Fall through to bubbling the save action, no force
			 * 3. beforeSaveResult = {force: true} : Fall through to bubbling the save action, with force
			 * 4. beforeSaveResult = undefined : Run the rest of the save action (as if no beforeSave was called)
			 */
			if(beforeSave !== undefined){
				if(beforeSave === false){
					return false;
				}
				if(typeof beforeSave === 'object'){
					forceClose = beforeSave.force;
				}
			}

			if(forceClose === undefined){
				let changeset = this.get(`${this.get('changeset')}`);
				changeset.validate();
				if(changeset.get('errors.length')){
					let changesetErrors = changeset.get('errors').map((err) => {
						return err.validation[ZERO]; 
					}); 
					if(this.get('displayErrors') && this.get('displayErrors').display){
						this.get('displayErrors').display(changesetErrors);
					}
					return false;
				}
				changeset.execute();
			}
			Ember.run.schedule('actions', this, function() {
				this.sendAction('onSave', forceClose || force); //eslint-disable-line no-invalid-this
			});	
			return false;
		},
		onClose(force){
			let changeset = this.get(`${this.get('changeset')}`);
			if(this.get('checkRouteForDirty')){
				this.set('needsConfirm', this.get('checkRouteForDirty')());
			} else {
				this.set('needsConfirm', changeset.get('changes.length') > ZERO);
			}
			if (this.get('isDirty')){
				this.set('needsConfirm', true);	
			}			
			changeset.validate();
			if(changeset.get('errors.length')){
				this.set('isInvalid', true);
				let changesetErrors = changeset.get('errors').map((err) => {
					return err.validation[ZERO]; 
				}); 
				this.set('errorList', changesetErrors);
			} else {
				changeset.execute();
				this.set('needsConfirm', changeset.get('changes.length') > ZERO);
			}
			if (force || (!this.get('needsConfirm') && !this.get('isInvalid')) ){
				Ember.$('.ui.modal').modal('hide');
				Ember.run.schedule('actions', this, function() {
					this.sendAction('onCancel'); //eslint-disable-line no-invalid-this
				});	
			}
			return false;
		}
	}
});
