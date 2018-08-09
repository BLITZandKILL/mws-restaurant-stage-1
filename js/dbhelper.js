var results;

const dbPromise = idb.open('database', 1, upgradeDB => {
  upgradeDB.createObjectStore('restaurants', {
    keyPath: 'id'
  });
});

const idbKeyval = {
  get(key) {
    return dbPromise.then(db => {
      return db.transaction('restaurants')
        .objectStore('restaurants').get(key);
    });
  },
  set(key, val) {
    return dbPromise.then(db => {
      const tx = db.transaction('restaurants', 'readwrite');
      tx.objectStore('restaurants').put(val, key);
      return tx.complete;
    });
  },
  delete(key) {
    return dbPromise.then(db => {
      const tx = db.transaction('restaurants', 'readwrite');
      tx.objectStore('restaurants').delete(key);
      return tx.complete;
    });
  },
  clear() {
    return dbPromise.then(db => {
      const tx = db.transaction('restaurants', 'readwrite');
      tx.objectStore('restaurants').clear();
      return tx.complete;
    });
  },
  keys() {
    return dbPromise.then(db => {
      const tx = db.transaction('restaurants');
      const keys = [];
      const store = tx.objectStore('restaurants');

      // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
      // openKeyCursor isn't supported by Safari, so we fall back
      (store.iterateKeyCursor || store.iterateCursor).call(store, cursor => {
        if (!cursor) return;
        keys.push(cursor.key);
        cursor.continue();
      });

      return tx.complete.then(() => keys);
    });
  }
};

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

  static add2db(data) {
    dbPromise.then(db => {
      const tx = db.transaction('restaurants', 'readwrite');
      var store = tx.objectStore('restaurants');
      data.forEach(function(request) {
        store.put(request);
      });
      return store.complete;
    });
  }

  static fetchIdbRestaurants(db) {
    dbPromise.then(db => {
      const restaurants = db.transaction('restaurants')
        .objectStore('restaurants').getAll();
      callback(null, restaurants);
    });
  }

  static fetchApiRestaurants(callback) {
    fetch(DBHelper.DATABASE_URL)
      .then( response => response.json() )
      .catch( err => DBHelper.fetchIdbRestaurants() )
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
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    var restuarants = DBHelper.fetchApiRestaurants();
    callback(null, restaurants);
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