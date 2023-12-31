import { LightningElement, api, track, wire } from 'lwc';
import getBoats from "@salesforce/apex/BoatDataService.getBoats";
import updateBoatList from "@salesforce/apex/BoatDataService.updateBoatList";
import { publish,MessageContext } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE = 'Error';
const ERROR_VARIANT = 'error';
export default class BoatSearchResults extends LightningElement {

  selectedBoatId;

  columns = [
    {label: 'Name', fieldName: 'Name', type: 'text', editable: true},
    {label: 'Length', fieldName: 'Length__c', type: 'number', editable: true},
    {label: 'Price', fieldName: 'Price__c', type: 'currency', editable: true},
    {label: 'Description ', fieldName: 'Description__c', type: 'text', editable: true},
  ];

  boatTypeId = '';

  @track
  boats;

  dataValue;

  isLoading = false;

  @track
  draftValues = [];
  
  // wired message context
  @wire(MessageContext)
  messageContext;

  // wired getBoats method 
  @wire(getBoats, {boatTypeId: '$boatTypeId'})
  wiredBoats(value) {
    this.dataValue = value;
    const {error, data} = value;
    if(data) {
      console.log(data);
      this.boats = data;
    }else {
      console.log('get boats error:' + JSON.stringify(error));
      console.log('something wrong!');
    }
  }
  
  // public function that updates the existing boatTypeId property
  // uses notifyLoading
  @api
  searchBoats(boatTypeId) { 
    this.isLoading = true;
    this.notifyLoading(this.isLoading);
    this.boatTypeId = boatTypeId;
  }
  
  // this public function must refresh the boats asynchronously
  // uses notifyLoading
  @api
  async refresh() { 
    this.isLoading = true;
    this.notifyLoading(this.isLoading);      
    await refreshApex(this.dataValue);
    this.isLoading = false;
    this.notifyLoading(this.isLoading);
  }
  
  // this function must update selectedBoatId and call sendMessageService
  updateSelectedTile(event) { 
    this.selectedBoatId = event.detail.boatId;
    this.sendMessageService(this.selectedBoatId);
  }
  
  // Publishes the selected boat Id on the BoatMC.
  sendMessageService(boatId) { 
    // explicitly pass boatId to the parameter recordId
    publish(this.messageContext, BOATMC, {recordId: boatId});
  }
  
  // The handleSave method must save the changes in the Boat Editor
  // passing the updated fields from draftValues to the 
  // Apex method updateBoatList(Object data).
  // Show a toast message with the title
  // clear lightning-datatable draft values
  handleSave(event) {
    // notify loading
    const updatedFields = event.detail.draftValues;
    console.log(updatedFields);
    // Update the records via Apex
    updateBoatList({data: updatedFields})
    .then(result => {
        this.dispatchEvent(new ShowToastEvent({
            title: SUCCESS_TITLE,
            message: MESSAGE_SHIP_IT,
            variant: SUCCESS_VARIANT
        }));
        this.draftValues = [];
        this.refresh();
    })
    .catch(error => {
        this.dispatchEvent(new ShowToastEvent({
            title: ERROR_TITLE,
            message: error.message,
            variant: ERROR_VARIANT
        }));

    })
    .finally(() => {});
  }

  // Check the current value of isLoading before dispatching the doneloading or loading custom event
  notifyLoading(isLoading) { 
    if(isLoading) {
        this.dispatchEvent(new CustomEvent('loading'));
    }else{
        this.dispatchEvent(new CustomEvent('doneloading'));
    }
  }

}