import {settings, select, classNames, templates} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {
  initPages: function(){ //run when refresh the page
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');
    

    let pageMatchingHash = thisApp.pages[0].id;

    for(let page of thisApp.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }
    //console.log('pageMatchingHash', pageMatchingHash);
    //thisApp.activatePage(thisApp.pages[0].id); // refresh settings
    // thisApp.activatePage(idFromHash); // the same
    thisApp.activatePage(pageMatchingHash); //the same 3


    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();

        /* get page id from href attribute */
        const id = clickedElement.getAttribute('href').replace('#', '');

        /* run thisApp.activatePage with that id */
        thisApp.activatePage(id);

        /* change URL hash */
        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function(pageId){
    const thisApp = this;

    /* add class "active" to matching pages, remove from non-matching */
    for(let page of thisApp.pages){
      //if(page.id == pageId){
      //  page.classList.add(classNames.pages.active);
      //} else {
      //  page.classList.remove(classNames.pages.active);
      //}

      page.classList.toggle(classNames.pages.active, page.id == pageId);

    }

    /* add class "active" to matching links, remove from non-matching */
    for(let link of thisApp.navLinks){
      link.classList.toggle(
        classNames.nav.active, 
        link.getAttribute('href') == '#'+ pageId
      );

    }
  },

  initMenu: function(){
    const thisApp = this;
    //console.log('thisApp.data:', thisApp.data);

    for(let productData in thisApp.data.products){
      //new Product(productData, thisApp.data.products[productData]);
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function(){
    const thisApp = this;

    thisApp.data ={};

    const url = settings.db.url + '/' + settings.db.product;

    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        //console.logconsole.log('parsedResponse: ', parsedResponse);

        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;

        /* execute initMenu method */
        thisApp.initMenu();
      });

    //console.log('thisApp.data', JSON.stringify(thisApp.data));

  },

  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },

  initBooking: function(){
    const thisApp = this;

    const bookingElem = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(bookingElem);

  },

  initCarousel() {
    
    const review = [];

    review[0] = {
      title: 'DELICIOUS FOOD!',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam egestas vivera tortor, eu ullamcorper dui imerdied nec. Nunc sed dolor at elit labortis sodales.',
      author: '- Angelina J.',
    };
    review[1] = {
      title: 'FAST DELIVERY!',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam egestas vivera tortor, eu ullamcorper dui imerdied nec. Nunc sed dolor at elit labortis sodales.',
      author: '- Brad P.',
    };
    review[2] = {
      title: 'NICE JOB!',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam egestas vivera tortor, eu ullamcorper dui imerdied nec. Nunc sed dolor at elit labortis sodales.',
      author: '- Clark K.',
    };

    let i = 0;

    const dots = document.querySelectorAll('.carousel-dots i');

    function changeTitle(){
      const title = document.querySelector('.review-title');
      const content = document.querySelector('.reviev-content');
      const author = document.querySelector('.review-author');

      for(let dot of dots) {
        if(dot.id == i + 1) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
        title.innerHTML = review[i].title;
        content.innerHTML = review[i].content;
        author.innerHTML = review[i].author;
      }

      if(i < review.length -1) {
        i++;
      } else {
        i=0;
      }
    }
    changeTitle();

    setInterval(() => {
      changeTitle();
    }, 3000);
  },

  init: function(){
    const thisApp = this;
    //console.log('*** App starting ***');
    //console.log('thisApp:', thisApp);
    //console.log('classNames:', classNames);
    //console.log('settings:', settings);
    console.log('templates:', templates);

    thisApp.initPages();
    thisApp.initData();
    //thisApp.initMenu();
    thisApp.initCart();
    thisApp.initBooking();
    thisApp.initCarousel();
  },


};

app.init();

