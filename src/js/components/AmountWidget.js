import { select, settings } from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget {
  constructor(element){
    /* call to the constructor of the parents class(BaseWidget) */
    super(element, settings.amountWidget.defaultValue); 

    const thisWidget = this;
    thisWidget.limit = {
      min: settings.amountWidget.defaultMin,
      max: settings.amountWidget.defaultMax
    };

    thisWidget.getElements(element);
    //thisWidget.value = settings.amountWidget.defaultValue;
    //thisWidget.setValue(thisWidget.input.value);
    thisWidget.initActions();

    //console.log('AmountWidget:', thisWidget);
    //console.log('constructor arguments:', element);
  }

  setLimit(min, max) {
    const thisWidget = this;
    thisWidget.limit = {
      min: min,
      max: max
    };
    this.setValue(thisWidget.limit.min);
  }

  resetLimit() {
    const thisWidget = this;
    thisWidget.limit = {
      min: settings.amountWidget.defaultMin,
      max: settings.amountWidget.defaultMax
    };
    this.setValue(thisWidget.limit.min);
  }

  getElements(){
    const thisWidget = this;

    //thisWidget.element = element;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  isValid(value){
    return !isNaN(value)
      && value >= this.limit.min
      && value <= this.limit.max;
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions() {
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function () {
      //thisWidget.setValue(thisWidget.input.value);
      thisWidget.value = thisWidget.dom.input.value;
    });

    thisWidget.dom.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }

}

export default AmountWidget;