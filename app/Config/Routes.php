<?php

namespace Config;

// Create a new instance of our RouteCollection class.
$routes = Services::routes();

// Load the system's routing file first, so that the app and ENVIRONMENT
// can override as needed.
if (file_exists(SYSTEMPATH . 'Config/Routes.php'))
{
	require SYSTEMPATH . 'Config/Routes.php';
}

/**
 * --------------------------------------------------------------------
 * Router Setup
 * --------------------------------------------------------------------
 */
$routes->setDefaultNamespace('App\Controllers');
$routes->setDefaultController('Signin');
$routes->setDefaultMethod('index');
$routes->setTranslateURIDashes(false);
$routes->set404Override();
$routes->setAutoRoute(true);

/*
 * --------------------------------------------------------------------
 * Route Definitions
 * --------------------------------------------------------------------
 */

// TODO: Add pending routes for new sections

// We get a performance increase by specifying the default
// route since we don't have to scan directories.
$routes->get('/', 'Signin::index');

//Services
$routes->add("services/list", "Services::index/$1");
$routes->add("services/new", "Services::index/$1");
$routes->add("services/(:num)", "Services::update/$1");

//Channels
$routes->add("channels/list", "Channels::index/$1");
$routes->add("channels/new", "Channels::index/$1");
$routes->add("channels/(:num)", "Channels::update/$1");

//Destinations
$routes->add("destinations/list", "Destinations::index/$1");
$routes->add("destinations/new", "Destinations::index/$1");
$routes->add("destinations/(:num)", "Destinations::update/$1");

//Users
$routes->add("users/list", "Users::index/$1");
$routes->add("users/new", "Users::index/$1");
$routes->add("users/(:num)", "Users::update/$1");
$routes->add("users/permissions", "Users::permissions");

//Settings
$routes->add("profile", "Profile::index/$1");

// Resellers
$routes->add("resellers/list", "Resellers::index/$1");
$routes->add("resellers/new", "Resellers::index/$1");
$routes->add("resellers/(:num)", "Resellers::update/$1");

//bussines_unity
$routes->add("business/list", "Business::index/$1");
$routes->add("business/new", "Business::index/$1");
$routes->add("business/(:num)", "Business::update/$1");

//Roles
$routes->add("roles/list", "Roles::index/$1");
$routes->add("roles/new", "Roles::index/$1");
$routes->add("roles/(:num)", "Roles::update/$1");

//locations
$routes->add("locations/list", "Locations::index/$1");
$routes->add("locations/new", "Locations::index/$1");
$routes->add("locations/(:num)", "Locations::update/$1");

//ships
$routes->add("ships/list", "Ships::index/$1");
$routes->add("ships/new", "Ships::index/$1");
$routes->add("ships/(:num)", "Ships::update/$1");

//Api_keys
$routes->add("apikeys/list", "Apikeys::index/$1");
$routes->add("apikeys/new", "Apikeys::index/$1");
$routes->add("apikeys/(:num)", "Apikeys::update/$1");

//Services_equivalence
$routes->add("equivalences/list", "Equivalences::index/$1");
$routes->add("equivalences/new", "Equivalences::index/$1");
$routes->add("equivalences/(:num)", "Equivalences::update/$1");

//arrives
$routes->add("arrives/list", "Arrives::index/$1");
$routes->add("arrives/new", "Arrives::index/$1");
$routes->add("arrives/(:num)", "Arrives::update/$1");
$routes->add("arrives/listjson", "Arrives/dataJson/$1");
$routes->add("arrives/shiplist", "Arrives/shipList/$1");

//Allotments
$routes->add("allotments/new", "Allotments::create_configuration/$1");
$routes->add("allotments/configuration", "Allotments::configuration/$1");
$routes->add("allotments/configuration/(:num)", "Allotments::configuration_update/$1");
$routes->add("allotments/itinerary/(:num)", "Allotments::itinerary/$1");
$routes->add("allotments/dynamic_html/(:num)", "Allotments::get_dynamic_html/$1");

//Allotment reservation
$routes->add("allotments/reservation", "Allotment_reservations::index/$1");
$routes->add("allotments/reservation/(:num)", "Allotment_reservations::update/$1");

// Prices
$routes->add("prices/list", "Prices::index/$1");
$routes->add("prices/new", "Prices::index/$1");
$routes->add("prices/(:num)", "Prices::update/$1");

// Courtesies
$routes->add("courtesies/list", "Courtesies::index/$1");
$routes->add("courtesies/new", "Courtesies::index/$1");
$routes->add("courtesies/(:num)", "Courtesies::update/$1");

// Sales Reps
$routes->add("reps/list", "Reps::index/$1");
$routes->add("reps/new", "Reps::index/$1");
$routes->add("reps/(:num)", "Reps::update/$1");

// Booths
$routes->add("booths/list", "Booths::index/$1");
$routes->add("booths/new", "Booths::index/$1");
$routes->add("booths/(:num)", "Booths::update/$1");
$routes->add("booths/configuration", "Booths::configuration/$1");

//Upload layouts configuration
$routes->add("layouts/download", "Layouts::index/$1");
$routes->add("layouts/export", "Layouts::export/$1");

// Diary
$routes->add("diary/print/(:num)", "Diary::print/$1");

//Sale locations
$routes->add("sale-locations/list", "Sale_locations::index/$1");
$routes->add("sale-locations/new", "Sale_locations::index/$1");
$routes->add("sale-locations/(:num)", "Sale_locations::update/$1");

/*
 * --------------------------------------------------------------------
 * Additional Routing
 * --------------------------------------------------------------------
 *
 * There will often be times that you need additional routing and you
 * need it to be able to override any defaults in this file. Environment
 * based routes is one such time. require() additional route files here
 * to make that happen.
 *
 * You will have access to the $routes object within that file without
 * needing to reload it.
 */
if (file_exists(APPPATH . 'Config/' . ENVIRONMENT . '/Routes.php'))
{
	require APPPATH . 'Config/' . ENVIRONMENT . '/Routes.php';
}
