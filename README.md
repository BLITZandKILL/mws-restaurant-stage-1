# Mobile Web Specialist Certification Course
---
#### _Three Stage Course Material Project - Restaurant Reviews_

## Project Overview: Stage 2

For the **Restaurant Reviews** projects, you will incrementally convert a static webpage to a mobile-ready web application. In **Stage One**, you will take a static design that lacks accessibility and convert the design to be responsive on different sized displays and accessible for screen reader use. You will also add a service worker to begin the process of creating a seamless offline experience for your users.

### Specification

You have been provided the code for a restaurant reviews website. The code has a lot of issues. It’s barely usable on a desktop browser, much less a mobile device. It also doesn’t include any standard accessibility features, and it doesn’t work offline at all. Your job is to update the code to resolve these issues while still maintaining the included functionality. 

### What do I do from here?

1. Start the Sails API server using node.

In a browser, check that the API server is running correctl yon port 1337 by navigating to `http://localhost:1337/restaurants`. If the page returns json data with 10 restaurants, all is working!

2. Edit your code from stage 1 to now fetch data from the API server running on port 1337 instead of from `/data/restaurants.json`.

3. With your server running, visit the site: `http://localhost:8000`.

4. Make sure your site is storing the restaurant data returned from the API into the indexedDb. Then, make sure your site is reading the information from that database when it is functioning in offline mode. (Tip: delete the restaurant.json file from the cache after going offline to make sure your app is reading from indexedDb instead of a cached data file.)

5. Pat yourself on the back and have a cold drink.

### Note about ES6

Most of the code in this project has been written to the ES6 JavaScript specification for compatibility with modern web browsers and future proofing JavaScript code. As much as possible, try to maintain use of ES6 in any additional JavaScript you write. 