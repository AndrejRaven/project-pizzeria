import {settings, templates, classNames, select} from '../settings.js';
import CartProduct from './CartProduct.js';
import {utils} from '../utils.js';


class Cart {
  constructor(element) {
    const thisCart = this;
  
    thisCart.getElements(element);
    thisCart.initActions();
    thisCart.update();
  }
  
  getElements(element) {
    const thisCart = this;
  
    thisCart.dom = {};
    thisCart.products = [];
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(
      select.cart.address
    );
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
  }
  initActions() {
    const thisCart = this;
  
    thisCart.dom.toggleTrigger.addEventListener('click', (event) => {
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', (event) => thisCart.remove(event.detail.cartProduct));
    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }
  
  add(menuProduct) {
    const thisCart = this;
  
    /* generate HTML based on template */
    const generatedHTML = templates.cartProduct(menuProduct);
    /* create element using utils.createElementFromHTML */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    /* add element to menu */
    thisCart.dom.productList.appendChild(generatedDOM);
  
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    console.log('products',thisCart.products);
    thisCart.update();
  }
  update() {
    const thisCart = this;
  
    const deliveryFree = settings.cart.defaultDeliveryFee;
    let totalNumber = 0;
    let subtotalPrice = 0;
  
    for (let product of thisCart.products) {
      totalNumber += product.amount;
      subtotalPrice += product.price;
    }
    if (totalNumber > 0 && subtotalPrice > 0) {
      thisCart.totalPrice = subtotalPrice + deliveryFree;
      thisCart.dom.deliveryFee.innerHTML = deliveryFree;
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      thisCart.dom.totalNumber.innerHTML = totalNumber;
      for (let totalPriceElem of thisCart.dom.totalPrice) {
        totalPriceElem.innerHTML = thisCart.totalPrice;
      }
    } else {
      thisCart.totalPrice = subtotalPrice;
      thisCart.dom.deliveryFee.innerHTML = 0;
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      thisCart.dom.totalNumber.innerHTML = totalNumber;
      for (let totalPriceElem of thisCart.dom.totalPrice) {
        totalPriceElem.innerHTML = thisCart.totalPrice;
      }
    }
  }

  remove(cartProduct) {
    console.log(cartProduct);
    const thisCart = this;
    const removeIndex = thisCart.products.indexOf(cartProduct);
    thisCart.products.splice(removeIndex, 1);
    cartProduct.dom.wrapper.remove();
    thisCart.update();
  }

  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order;
    //console.log('url:',url);

    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subTotalPrice: thisCart.subTotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };

    for (let product of thisCart.products) {
      payload.products.push(product.getData());
    }
    //console.log('payload:',payload);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .catch((error) => {
        console.error('Error:', error);
      });
  }
}

export default Cart;