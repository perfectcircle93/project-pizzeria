import { select, templates, settings, classNames } from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);



    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    //console.log('getData params', params);

    const urls = {
      booking:        settings.db.url + '/' + settings.db.booking 
                                      + '?' + params.booking.join('&'),
      eventsCurrent:  settings.db.url + '/' + settings.db.event 
                                      + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:   settings.db.url + '/' + settings.db.event 
                                      + '?' + params.eventsRepeat.join('&'),
    };

    //console.log('getData urls', urls);
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ]) 
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    //console.log('thisBooking.booked', thisBooking.booked);

    thisBooking.updateDOM();
    
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    //for(let index = 0; index < 3; index++){
    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      //console.log('loop', hourBlock);

      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    thisBooking.peopleAmount.resetLimit();

    let allAvailable = false;

    /* checking the availability of the tables */
    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      /* checking if not all the tables are available */
      if(
        !allAvailable
        &&
        /* if the table is booked for the day check the hour of the reservation */
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else { 
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
    thisBooking.rangeSlider();
  }



  render(element){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.element = utils.createDOMFromHTML(generatedHTML);

    thisBooking.dom.wrapper.appendChild(thisBooking.element);
    
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

    //TABLE RESERVATION
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    console.log('phone', thisBooking.dom.phone);
    thisBooking.dom.email = thisBooking.dom.wrapper.querySelector(select.booking.email);
    console.log('email', thisBooking.dom.email);
    thisBooking.dom.submit = thisBooking.dom.wrapper.querySelector(select.booking.submit);
    console.log('submit', thisBooking.dom.submit);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
    console.log('starters', thisBooking.dom.starters);
  }

  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.hourPicker.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    thisBooking.dom.datePicker.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    thisBooking.dom.submit.addEventListener('click', function(){
      event.preventDefault();
      thisBooking.sendReservation();
    });

    thisBooking.checkTables();
  }

  checkTables() {
    const thisBooking = this;

    for(let table of thisBooking.dom.tables){
      table.addEventListener('click', function(event){
        event.preventDefault();
        
        if(table.classList.contains(classNames.booking.tableBooked)) {
          return window.alert('PLEASE TRY AGAIN');
        } else {
          table.classList.add(classNames.booking.tableBooked);
          thisBooking.clickedElement = event.target;
          thisBooking.tableNumber = thisBooking.clickedElement.getAttribute(settings.booking.tableIdAttribute);

          const limits = settings.tables[thisBooking.tableNumber];
          thisBooking.peopleAmount.setLimit(limits.min, limits.max);
        }
      });
    }
  }

  sendReservation(){
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;
    

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
      method: 'POST',
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


  rangeSlider(){
    const thisBooking = this;
    const bookedRange = thisBooking.booked[thisBooking.date];
    const rangeSlider  = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.rangeSlider);

    const hours = [];
    const colors = [];

    /* 12-05-2020 {
      12: [1]
      12.5: []
      13: [1, 2]
    }*/

    for(let hour = settings.hours.open; hour <= settings.hours.close; hour=hour+0.5) {
      hours.push(hour === 24 ? 0 : hour);
    }

    const acc = 100 / hours.length; //4
    let startValue = 0; //8
    let endValue = acc; //12

    for(let hour of hours) {
      if(!bookedRange[hour] || bookedRange[hour].length === 0 || bookedRange[hour].length === 1) {
        colors.push(`green ${startValue}% ${endValue}%`);
      }
      else if (bookedRange[hour].length === 2) {
        colors.push(`orange ${startValue}% ${endValue}%`);
      } else {
        colors.push(`red ${startValue}% ${endValue}%`);
      }

      startValue += acc;
      endValue += acc;
    }

    const pushedColors = colors.join(', '); // 'red 20%, orange 20% 40%, yellow 40% 60%, green 60% 80%, blue 80%'; //
    const test = 'linear-gradient(to right, ' + pushedColors + ')';
    rangeSlider.style.background = test;
    console.log(rangeSlider);

  }

}

export default Booking;