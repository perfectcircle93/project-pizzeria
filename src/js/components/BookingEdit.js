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
    thisBooking.datePicker.plugin.setDate(booking.date);
    thisBooking.hourPicker.value = utils.hourToNumber(booking.hour);
    thisBooking.peopleAmount.value = booking.ppl;
    thisBooking.hoursAmount.value = booking.duration;
    thisBooking.dom.phone.value = booking.phone;
    thisBooking.dom.email.value = booking.email;
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
}

export default BookingEdit;