import { select, templates } from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(element){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();
    //console.log('generatedHTML', generatedHTML);

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper = utils.createDOMFromHTML(generatedHTML);

    const bookingWrapper = document.querySelector(select.containerOf.booking);
    bookingWrapper.appendChild(thisBooking.dom.wrapper);
    
    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);

    thisBooking.dom.datePicker = document.querySelector(select.widgets.datePicker.wrapper);

  }

  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);

  }
}

export default Booking;