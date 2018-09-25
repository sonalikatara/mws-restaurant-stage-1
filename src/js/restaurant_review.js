let restaurant;
let isOnline;
/**
 * Initialize restaurant details  as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initReview();
});


initReview = ()=>{
  isOnline = window.navigator.onLine;
  console.log(isOnline);

  window.addEventListener("offline", function(){
   // alert("Network is offline");
    isOnline = false;
  }, false);

  fetchRestaurantFromURL((error, restaurant) => {
      if (error) { // Got an error!
        console.error(error);
      } else {
        fillBreadcrumb();
      }
  });
} 

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
    if (self.restaurant) { // restaurant already fetched!
      callback(null, self.restaurant)
      return;
    }    
    const id = getParameterByName('id');
    if (!id) { // no id found in URL
      error = 'No restaurant id in URL'
      callback(error, null);
    } else {
      DBHelper.fetchRestaurantById(id, (error, restaurant) => {
        self.restaurant = restaurant;
        if (!restaurant) {
          console.error(error);
          return;
        }
        fillRestaurantHTML();
        callback(null, restaurant)
      });
    }
  }

  fillRestaurantHTML = (restaurant = self.restaurant) => {
    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;
   // console.log(restaurant);

    /* save formData */
    let form = document.forms.namedItem("reviewForm");
    form.addEventListener('submit', event => {
      event.preventDefault();
      const id = getParameterByName('id'),
            oData = new FormData(form);
      oData.append("restaurant_id", restaurant.id);
     // console.log(restaurant.id + " oData : "+ oData.get('name') + " comments : "  + oData.get('restaurant_id'))
      if (isOnline){
       // console.log("online")
        fetch(`http://localhost:1337/reviews/`,{
          method: 'POST',
          body: oData
        }).then(response => response.json())
        .then(response => window.location.href =`./restaurant.html?id=${restaurant.id}`)
        .catch(error => console.error('Error:', error))
       
        //.then(response => console.log('Success:', JSON.stringify(response)));
      } else {
       // console.log("offline")
      //  console.log(restaurant.id + " oData : "+ oData.get('name') + " comments : "  + oData.get('comments'))

        let newReview = {
          restaurant_id : oData.get('restaurant_id'),
          name : oData.get('name'),
          rating : oData.get('rating'),
          comments : oData.get('comments')
        };
        
        idb.open('reviews', 1, function(upgradeDb) {
          upgradeDb.createObjectStore('outbox', { autoIncrement : true, keyPath: 'id' });
        }).then(db => {
          let tx = db.transaction('outbox', 'readwrite');
          let reviewStore =  tx.objectStore('outbox');
           console.log("add data to restaurantstore" + newReview);
          reviewStore.put(newReview);      
        }).then(() => {
          window.location.href =`./restaurant.html?id=${newReview.restaurant_id}`
         // console.log('Your new review has been stored locally and will be sent to the server when network connection returns');
        }).catch(error => {
          console.error(error);
        });
      }
     
    })    
    /* end save formData */
  }

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href =`./restaurant.html?id=${restaurant.id}`
    a.innerHTML = restaurant.name;
    li.appendChild(a);
    breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
    if (!url)
      url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
      results = regex.exec(url);
    if (!results)
      return null;
    if (!results[2])
      return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }