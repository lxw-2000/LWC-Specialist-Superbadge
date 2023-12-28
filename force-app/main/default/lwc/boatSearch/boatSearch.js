import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
export default class BoatSearch extends NavigationMixin (LightningElement) {
    isLoading = false;
    
    // Handles loading event
    handleLoading() {
      this.isLoading = true;
    }
    
    // Handles done loading event
    handleDoneLoading() { 
      this.isLoading = false;
    }
    
    // Handles search boat event
    // This custom event comes from the form
    searchBoats(event) {
      this.template.querySelector('c-Boat-Search-Results').searchBoats(event.detail.boatTypeId);
      this.handleDoneLoading();
    }
    
    createNewBoat() { 
      this[NavigationMixin.Navigate]({
        type: 'standard__objectPage',
        attributes: {
            objectApiName: 'Boat__c',
            actionName: 'new'
        }
      });
    }

  }
  