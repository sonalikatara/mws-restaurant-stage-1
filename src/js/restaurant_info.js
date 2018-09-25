let restaurant;
let reviews;
var newMap;
let store;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initData();
  initMap();
});

initData = () =>{
/**
 * Look for offline reviews in the indexed db and push them to the server
 */
store = {
  db: null,
 
  init: () => {
    if (store.db) { return Promise.resolve(store.db); }
    return idb.open('reviews', 1, function(upgradeDb) {
      upgradeDb.createObjectStore('outbox', { autoIncrement : true, keyPath: 'id' });
    }).then(function(db) {
      return store.db = db;
    });
  },
 
  outbox: mode => {
    return store.init().then(function(db) {
      return db.transaction('outbox', mode).objectStore('outbox');
    })
  }
}

storeOfflineData = () => {
  store.outbox('readonly').then(outbox => {
    return outbox.getAll();
  }).then(function (reviews) {
    return Promise.all(reviews.map(review =>{
      return fetch('http://localhost:1337/reviews/', {
        method: 'POST',
        body: JSON.stringify(review)
      }).then(response => {
        return response.json();
      }).then(data => {
       // if (data.result === 'success') {
          return store.outbox('readwrite').then(outbox => {
           // console.log("delete reviews from idb "+ review.id)
            return outbox.delete(review.id);
          });
        //}
      })
    }).then(
      window.location.reload()
    ).catch(error => { console.error("error while saving reviews data from idb" + error); })
    )
  })
}

window.addEventListener('online',function(){
  console.log(" window : The app is running online")
  storeOfflineData();
}, false);

}
/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1Ijoic29uYWxpayIsImEiOiJjamxnNGptMGcwZzdoM3Fud2JwejhxYnBxIn0.bu5d4lUUaRQZiTu1A2MAnQ',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'    
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}  
 
/* window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
} */

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

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  //console.log(restaurant);
  const lnkReview = document.getElementById('lnkReview');
  lnkReview.href = `./reviews.html?id=${restaurant.id}`;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  const imageurlBase = DBHelper.imageUrlForRestaurant(restaurant).split(".")[0];
  /* responsive images using srcset */
  const imageurlLarge = imageurlBase + "_large.jpg";
  const imageurlMedium = imageurlBase + "_medium.jpg";
  /* end responsive images additions */
  image.src = imageurlMedium;
  image.srcset = `${imageurlMedium} 500w, ${imageurlLarge} 800w`;
  image.alt = "Image of " + restaurant.name;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  /* is Favorite */
  const favBotton = document.getElementById("favButton");
  favBotton.style.backgroundColor = 'black';
  favBotton.style.color = restaurant.is_favorite?'red':'white';
  favBotton.addEventListener('click', event =>{
    event.preventDefault();
    const id = getParameterByName('id');
    let newIsFav;
    newIsFav=(favBotton.style.color==='red')?false:true
   fetch(`http://localhost:1337/restaurants/${id}/?is_favorite=${newIsFav}`,{
      method: 'PUT'
    });
    favBotton.style.color =  newIsFav?'red':'white';
   }); 
   /* end is Favorite */
  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (error, callback) => {
  //console.log("in get reviews restaurantinfo")
  if (self.reviews) { // restaurant reviews already fetched!
    callback(null, self.reviews)
    return;
  }
  const id = getParameterByName('id');

  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);


  DBHelper.fetchRestaurantReviewsById(id, (error,reviews)=>{
    if (error) {
      console.error(error);
    } else {
    if (!reviews || reviews.length===0) {
      const noReviews = document.createElement('p');
      noReviews.innerHTML = 'No reviews yet!';
      container.appendChild(noReviews);
      return;
    } else{
      self.reviews = reviews
      const ul = document.getElementById('reviews-list');
      //console.log("reviews"+JSON.stringify(reviews))
      reviews.forEach(review => {
        ul.appendChild(createReviewHTML(review));
      });
      container.appendChild(ul);
    }

    }
   
   
  });
}
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('h3');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = new Date(review.updatedAt);
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
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
