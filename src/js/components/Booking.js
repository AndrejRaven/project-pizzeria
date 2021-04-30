import { select, templates } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidget();
  }
  render(element) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget(element);

    thisBooking.dom = {};

    thisBooking.dom.wrapper = document.querySelector(select.containerOf.booking);
    
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    console.log(generatedHTML);
    thisBooking.dom.peopleAmmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    console.log(thisBooking.dom.peopleAmmount);
    console.log(thisBooking.dom.hoursAmount);
  }
  initWidget() {
    const thisBooking = this;

    thisBooking.peopleAmmount = new AmountWidget(thisBooking.dom.peopleAmmount); 
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    
    thisBooking.dom.wrapper.addEventListener('click', (event) => {
      event.preventDefault();
    });

  }
}

export default Booking;