import { select, templates } from '../settings.js';
// import { utils } from '../utils.js';

class Home {
  constructor(element) {
    const thisHome = this;

    thisHome.render(element);
    
  }

  render(element) {
    const thisHome = this;
    const generatedHTML = templates.homeWidget(element);
    thisHome.dom = {};

    thisHome.dom.wrapper = document.querySelector(select.containerOf.home);
    thisHome.dom.wrapper.innerHTML = generatedHTML;
    
  }



}

export default Home;