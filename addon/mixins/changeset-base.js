import Ember from 'ember';
const ZERO = 0;
export default Ember.Mixin.create({
	getSimpleError(){
		let changeset = this.get(`${this.get('changeset')}`);
		changeset.validate();
		let simpleChangesetError = {};
		let changesetError = changeset.get('error');

		let changesetErrorKeys = Object.keys(changesetError);
		//set the property to be used for proof of concept
		this.set('changesetErrorKeys', changesetErrorKeys); 
		changesetErrorKeys.forEach(function(key){
			if( changesetError.hasOwnProperty(key) ){ 
				simpleChangesetError[key] = changesetError[key].validation[ZERO];
			} 
		});
		//return a collection of keys that map to their errors
		return simpleChangesetError;
	},
	actions: {
		revalidate(){
			let changeset = this.get(`${this.get('changeset')}`);
			changeset.validate();
			let simpleChangesetError = {};
			let changesetError = changeset.get('error');

			let changesetErrorKeys = Object.keys(changesetError);
			//set the property to be used for proof of concept
			this.set('changesetErrorKeys', changesetErrorKeys); 
			changesetErrorKeys.forEach(function(key){
				if( changesetError.hasOwnProperty(key) ){ 
					simpleChangesetError[key] = changesetError[key].validation[ZERO];
				} 
			});
			//return a collection of keys that map to their errors
			return simpleChangesetError;
		},
		/**
		 * There are 4 outcomes when a beforeSave/Validate function is given in the extending component
		 * They depenend on what is returned by beforeSave/Validate)
		 * 
		 * 1. beforeSave/Validate = false : Stop propagation of any actions
		 * 2. beforeSave/Validate = {force: false} : Fall through to bubbling the save action, no force
		 * 3. beforeSave/Validate = {force: true} : Fall through to bubbling the save action, with force
		 * 4. beforeSave/Validate = undefined : Run the rest of the save action (as if no beforeSave was called)
		 */
		onSave(force){
			this.notifyPropertyChange('onSaveFired');
			
			let changeset = this.get(`${this.get('changeset')}`);
			let forceClose;

			const beforeValidate = this.get('beforeValidate');
			if(beforeValidate !== undefined){
				if(beforeValidate === false){
					return false; //stop propagation
				}
				if(typeof beforeValidate === 'object'){
					forceClose = beforeValidate.force;
				}
			}

			if(!forceClose && !force){
				
				changeset.validate();
				if(!changeset.get('errors.length')){		
					const beforeSave = this.get('beforeSave');
			
					if(beforeSave !== undefined){
						if(beforeSave === false){
							return false; //stop propagation
						}
						if(typeof beforeSave === 'object'){
							forceClose = beforeSave.force;
						}
					}

					changeset.validate(); //must vaildate possible changes in beforeSave
				}
				if(changeset.get('errors.length')){ //not an else b/c its a new test after validate call above
					let changesetErrors = changeset.get('errors').map((err) => {
						return err.validation[ZERO]; 
					});
					let changesetErrorKeys = Object.keys(changeset.get('error'));
					this.set('changesetErrors', changesetErrors);
					this.set('changesetErrorKeys', changesetErrorKeys); 
					this.get('handleOnSaveErrors');
					return false; //stop propagation
					//changeset.rollback(); ?
				}
			}
			this.set('changesetErrorKeys', []);
			changeset.execute(); //this is safe, won't result in any changes if there are errors
			Ember.run.schedule('actions', this, function() {
				this.sendAction('onSave', forceClose || force); 
			});	
			return false; //stop propagation, use explicit send action above
		},
		onClose(force){
			this.notifyPropertyChange('onCloseFired');
			
			let changeset = this.get(`${this.get('changeset')}`);
				
			changeset.validate();
			if(changeset.get('errors.length')){
				this.set('isInvalid', true);
				let changesetErrors = changeset.get('errors').map((err) => {
					return err.validation[ZERO]; 
				});
				let changesetErrorKeys = Object.keys(changeset.get('error'));
				this.set('changesetErrors', changesetErrors);
				this.set('changesetErrorKeys', changesetErrorKeys); 
				this.get('handleOnCloseErrors');
			} else {
				this.set('changesetErrorKeys', []);
				changeset.execute();
				//changeset.rollback(); ?
			}
			if (force || (!this.get('isDirty') && !this.get('isInvalid')) ){
				Ember.$('.ui.modal').modal('hide');
				Ember.run.schedule('actions', this, function() {
					this.sendAction('onCancel'); 
				});	
			}
			return false;
		}
	}
});
