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
    console.log(thisCart.products);
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
}

export default Cart;