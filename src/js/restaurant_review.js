let restaurant;
/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initReview();
});


initReview = ()=>{
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
    console.log(restaurant);

    /* save formData */
    let form = document.forms.namedItem("reviewForm");
    form.addEventListener('submit', event => {
      
      const id = getParameterByName('id'),
            oData = new FormData(form);

      console.log(restaurant.id + " oData : "+ oData.get('name'))
      fetch(`http://localhost:1337/reviews/${restaurant.id}`,{
        method: 'PUT',
        body: oData
      }).then(response => response.json())
      .catch(error => console.error('Error:', error))
      .then(response => console.log('Success:', JSON.stringify(response)));

      event.preventDefault();
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