import { LightningElement, api, wire } from 'lwc';
import getSimilarBoats from '@salesforce/apex/BoatDataService.getSimilarBoats';
import { NavigationMixin } from 'lightning/navigation';
export default class SimilarBoats extends NavigationMixin(LightningElement) {
    // Private
    relatedBoats;
    boatId;
    error;
    selectedBoatId;
    
    // public
    @api
    get recordId() {
        // returns the boatId
        return this.boatId;
    }
    set recordId(value) {
        // sets the boatId value
        this.boatId = value;
        // sets the boatId attribute
        this.setAttribute('boatId', value);
        console.log('similar boatId :' + this.boatId);
    }
    
    // public
    @api
    similarBy;
    
    // Wire custom Apex call, using the import named getSimilarBoats
    // Populates the relatedBoats list
    @wire(getSimilarBoats, { boatId: '$boatId', similarBy: '$similarBy' })
    similarBoats({ error, data }) { 
        if(data) {
            this.relatedBoats = data;
            console.log(this.relatedBoats);
        }else {
            this.error = error;
            console.log('similar boat have a error:' + error);
        }
    }

    get getTitle() {
      return 'Similar boats by ' + this.similarBy;
    }

    get noBoats() {
      return !(this.relatedBoats && this.relatedBoats.length > 0);
    }
    
    // Navigate to record page
    openBoatDetailPage(event) { 
        this.selectedBoatId = event.detail.boatId;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: event.detail.boatId,
                actionName: 'view'
            },
        });
    }
  }
  