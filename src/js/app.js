import {settings,select, classNames, templates} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import Home from './components/Home.js';

const app = {
  initPages: function() {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    thisApp.buttons = document.querySelectorAll(select.nav.buttons);

    const idFromHash = window.location.hash.replace('#/', '');
    let pageMatchingHash = thisApp.pages[0].id;

    for(let page of thisApp.pages) {
      if(page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }
    thisApp.activatePage(pageMatchingHash);

    for(let link of thisApp.navLinks) {
      link.addEventListener('click', function(event) {
        const clickedElement = this;
        event.preventDefault();
        const id = clickedElement.getAttribute('href').replace('#', '');

        thisApp.activatePage(id);
        window.location.hash = '#/' + id;
      });
    }

    for (let button of thisApp.buttons){
      button.addEventListener('click', function(event){
        const clickedElement=this;
        event.preventDefault ();
        const id = clickedElement.getAttribute('href').replace('#','');
        thisApp.activatePage(id);
        window.location.hash ='#/' + id;
      });
    }
  },
  activatePage: function(pageId) {
    const thisApp = this;

    for(let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    for(let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active, 
        link.getAttribute('href') == '#' + pageId
      );
    }
  },
  initMenu: function () {
    const thisApp = this;

    for (let productData in thisApp.data.products) {
      new Product(productData, thisApp.data.products[productData]);
    }
  },
  initBooking: function() {
    const thisApp = this;
    thisApp.bookingWidget = document.querySelector(select.containerOf.booking);

    new Booking(thisApp.bookingWidget);
  },
  initHome: function () {
    const thisApp = this;
    thisApp.homeWidget = document.querySelector(select.containerOf.home);
    
    new Home(thisApp.homeWidget);
  },
  initData: function () {
    const thisApp = this;

    thisApp.data = {};
    const url = `${settings.db.url}/${settings.db.product}`;
    
    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponce){
        console.log('parsedResponce', parsedResponce);

        thisApp.data.products = parsedResponce;

        thisApp.initMenu();
      });
  },
  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function(event) {
      app.cart.add(event.detail.product.prepareCartProduct());
    });
  },
  init: function () {
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);
    
    thisApp.initHome();
    thisApp.initData();
    thisApp.initPages();
    thisApp.initBooking();
  },
};


app.init();
app.initCart();

