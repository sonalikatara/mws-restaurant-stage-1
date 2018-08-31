# Mobile Web Specialist Certification Course
---

#### Restaurant Reviews: Stage 1

For the **Restaurant Reviews** projects, I converted a static webpage to a mobile-ready web application. 

I added accessibility and converted the design to be responsive on different sized displays and accessible for screen reader use. 

![Home Page](./screenshots/homePage.png)

![Restaurant Page](./screenshots/restaurantPage.png)


Also added a service worker to begin the process of creating a seamless offline experience for your users.

![Service worker](./screenshots/serviceworker.png)


### How to run the project

## Download or Clone 

 Download or clone this repository. In the root folder, start up a simple HTTP server to serve up the site files on your local computer. Python has some simple tools to do this, and you don't even need to know Python. For most people, it's already installed on your computer. 


## Leaflet.js and Mapbox:

This repository uses [leafletjs](https://leafletjs.com/) with [Mapbox](https://www.mapbox.com/). You need to replace `<your MAPBOX API KEY HERE>` with a token from [Mapbox](https://www.mapbox.com/). Mapbox is free to use, and does not require any payment information. 

## Running the project
In a terminal, check the version of Python you have: `python -V`. If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 8000` (or some other port, if port 8000 is already in use.) For Python 3.x, you can use `python3 -m http.server 8000`. If you don't have Python installed, navigate to Python's [website](https://www.python.org/) to download and install the software.

2. With your server running, visit the site: `http://localhost:8000`


### License

The contents of this repository are covered under the MIT License.


