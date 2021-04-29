import {settings,select, classNames, templates} from './settings.js';
import Product from './components/Product';
import Cart from './components/Cart';

const app = {
  initMenu: function () {
    const thisApp = this;

    for (let productData in thisApp.data.products) {
      new Product(productData, thisApp.data.products[productData]);
    }
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
      app.cart.add(event.detail.product);
    });
  },
  init: function () {
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);

    thisApp.initData();
    thisApp.initMenu();
    thisApp.initCart();
  },
};


app.init();
app.initCart();

