import { select, templates, settings, classNames } from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidget();
    thisBooking.getData();
    thisBooking.selectedTable = null;
  }

  render(element) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget(element);

    thisBooking.dom = {};

    thisBooking.dom.wrapper = document.querySelector(select.containerOf.booking);
    
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.tablesWrapper = thisBooking.dom.wrapper.querySelector(select.containerOf.tables);
  }

  initWidget() {
    const thisBooking = this;

    thisBooking.peopleAmmount = new AmountWidget(thisBooking.dom.peopleAmmount); 
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function() {
      thisBooking.updateDOM();
      thisBooking.removeSelected();
    });
    thisBooking.dom.tablesWrapper.addEventListener('click', function(event) {
      if(thisBooking.active == true) {
        thisBooking.removeSelected();
        thisBooking.active = false;
      } else {
        thisBooking.initTables(event);
      }
    });
  }

  initTables(event) {
    const thisBooking = this;

    const clickedElement = event.target;
    const tableId = clickedElement.getAttribute('data-table');

    if(tableId) {
      if(!clickedElement.classList.contains(classNames.booking.tableBooked)) {
        thisBooking.selectedTable = tableId;
      } else {
        alert('this table is reserved');
      }

      for(let table of thisBooking.dom.tables) {
        table.classList.remove(classNames.booking.tableSelected);
        if(
          clickedElement.classList.contains('table') &&
          thisBooking.selectedTable == tableId
        ){
          clickedElement.classList.add(classNames.booking.tableSelected);
          thisBooking.selectedTable = tableId;
          thisBooking.active = true;
        } else {
          thisBooking.selectedTable = null;
          clickedElement.classList.remove(classNames.booking.tableSelected);
        }
        
      }
      if(!clickedElement.classList.contains(classNames.booking.tableSelected)) {
        thisBooking.selectedTable = null;
      }
    }

  }

  removeSelected() {
    const thisBooking = this;

    const selectedTables = document.querySelectorAll('.selected');

    for(let selected of selectedTables) {
      selected.classList.remove(classNames.booking.tableSelected);
    }

    thisBooking.selectedTable = null;
  }

  getData() {
    const thisBooking = this;

    const startDayParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDayParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDayParam,
        endDayParam,
      ],
      eventCurrent: [
        settings.db.notRepeatParam,
        startDayParam,
        endDayParam
      ],
      eventRepeat: [
        settings.db.repeatParam,
        endDayParam,
      ],
    };

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventCurrent.join('&'),
      eventRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventCurrent),
      fetch(urls.eventRepeat),
    ])
      .then(function(allResponse){
        const bookingResponse = allResponse[0];
        const eventsCurrentResponse = allResponse[1];
        const evntsRepeatResponse = allResponse[2];
        return Promise.all([
          bookingResponse.json(),
          eventsCurrentResponse.json(),
          evntsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat) {
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }  
    }

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

}

export default Booking;