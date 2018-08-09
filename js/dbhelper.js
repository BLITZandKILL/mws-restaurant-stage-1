var results;

/**
 * Common database helper functions.
 */
class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  static get dbPromise() {
    return this.openDb();
  }

  static openDb() {
    var idb = window.indexedDB;
    //check for support
    if (!('indexedDB' in window)) {
      return Promise.resolve();
    }
    return idb.open('database', 1, upgradeDb => {
      upgradeDb.createObjectStore('restaurants', {
        keyPath: 'id'
      });
    });
  }

  static add2db(data) {
    var db;
    results = data;
    var idb = window.indexedDB;
    var dbPromise = idb.open("database", 1);
    dbPromise.onupgradeneeded = function(e) {
      db = e.target.result;
      if (!db.objectStoreNames.contains("restaurants")) {
        var storeOS = db.createObjectStore("restaurants", {
          keyPath: "id"
        });
      }
    };
    dbPromise.onsuccess = function(e) {
      db = e.target.result;
      var transaction = db.transaction(["restaurants"], "readwrite");
      var store = transaction.objectStore("restaurants");
      data.forEach(function(request) {
        store.put(request);
      });
    };
    dbPromise.onerror = function(e) {
      console.dir(e);
    };
  }

  static fetchIdbRestaurants(db) {
    const idb = db.transaction('restaurants');
    const store = idb.objectStore('restaurants');
    store.getAll().then(restaurants => {
      this.restaurants = restaurants;
    });
    return idb.complete;
  }

  static fetchApiRestaurants(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.DATABASE_URL);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        const json = JSON.parse(xhr.responseText);
        DBHelper.add2db(json);
        callback(null, results);
      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);
      }
    };
    xhr.send();
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    fetch(DBHelper.DATABASE_URL)
      .then( response => response.json() )
      .catch( err => console.log(`Error fetching data from API: ${err}`) )
      .then( response => {
        const restaurants = response;
        DBHelper.add2db(restaurants);
        callback(null, restaurants);
      })
      .catch( err => { 
        const error = err;
        callback(error, null); 
      })
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.DATABASE_URL + '/' + id);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        const json = JSON.parse(xhr.responseText);
        const restaurant = json;
        callback(null, restaurant);
      } else { // Oops!. Got an error from server.
        callback('Restaurant does not exist', null);
      }
    };
    xhr.send();
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    fetchIdbRestaurants((error, restaurants) => {
      if (!error){
        const results = restaurants.filter(r => r.cuisine_type == cusine);
        callback(null, results);
      }
    });
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        if (restaurants)
        {
          // Get all neighborhoods from all restaurants
          const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
          // Remove duplicates from neighborhoods
          const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
          callback(null, uniqueNeighborhoods);
        } else {
          console.log('No restaurants in array... ' + restaurants);
        }
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        if (restaurants)
        {
          // Get all cuisines from all restaurants
          const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
          // Remove duplicates from cuisines
          const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
          callback(null, uniqueCuisines);
        } else {
          console.log('No restaurants in array... ' + restaurants);
        }
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    if (w < 201) {
      return (`/img/${restaurant.id}_200.jpg`);
    } else if (w < 551) {
      return (`/img/${restaurant.id}_550.jpg`);
    } else if (w < 801) {
      return (`/img/${restaurant.id}_800.jpg`);
    } else {
      return (`/img/${restaurant.id}.jpg`);
    }
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
    marker.options.keyboard = false;
      marker.addTo(newMap);
    return marker;
  } 
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

}