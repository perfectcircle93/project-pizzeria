import Booking from './Booking.js';
import { settings } from './../settings.js';
import { utils } from './../utils.js';

class BookingEdit extends Booking {
  constructor(element) {
    super(element);
    const thisBooking = this;

    thisBooking.loadBooking();
  }

  prepareData(booking) {
    const thisBooking = this;

    const event = new CustomEvent('input', {
      bubbles: true
    });

    thisBooking.datePicker.plugin.setDate(booking.date);
    thisBooking.datePicker.value = booking.date;
    thisBooking.hourPicker.dom.input.value = utils.hourToNumber(booking.hour);
    thisBooking.hourPicker.dom.input.dispatchEvent(event);
    thisBooking.peopleAmount.value = booking.ppl;
    thisBooking.hoursAmount.value = booking.duration;
    thisBooking.dom.phone.value = booking.phone;
    thisBooking.dom.email.value = booking.email;

    for(const starter of booking.starters) {
      thisBooking.dom.wrapper.querySelector('input[type="checkbox"][value="' + starter + '"]').checked = true;
    }

    // remove booking table from thisBooking.booked
    const hourTables = thisBooking.booked[booking.date][utils.hourToNumber(booking.hour)];
    hourTables.splice(hourTables.indexOf(booking.table), 1);
    thisBooking.updateDOM();
    
    // simulate picking this table on the floor 
    const table = thisBooking.dom.wrapper.querySelector('[data-table="'+ booking.table +'"');
    table.dispatchEvent(new CustomEvent('click'));
  }

  loadBooking() {
    const thisBooking = this;
    const bookingId = window.location.hash.replace('#/booking/', '');
    const url = settings.db.url + '/' + settings.db.booking + '/' + bookingId;

    fetch(url)
      .then(function(res) {
        return res.json();
      })
      .then(function(res) {
        if(!res) window.location = '/#';
        else thisBooking.prepareData(res);
      });
  }

  sendReservation(){
    const thisBooking = this;

    const bookingId = window.location.hash.replace('#/booking/', '');
    const url = settings.db.url + '/' + settings.db.booking + '/' + bookingId;

    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: parseInt(thisBooking.tableNumber),
      duration: thisBooking.hoursAmount.value,
      ppl: thisBooking.peopleAmount.value,
      phone: thisBooking.dom.phone.value,
      email: thisBooking.dom.email.value,
      starters: [],
    };

    for(let starter of thisBooking.dom.starters){
      if(starter.checked == true){
        payload.starters.push(starter.value);
      }
    }

    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      }) .then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
        thisBooking.getData();
      });

  }
}

export default BookingEdit;