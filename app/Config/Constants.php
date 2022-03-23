<?php

/*
 | --------------------------------------------------------------------
 | App Namespace
 | --------------------------------------------------------------------
 |
 | This defines the default Namespace that is used throughout
 | CodeIgniter to refer to the Application directory. Change
 | this constant to change the namespace that all application
 | classes should use.
 |
 | NOTE: changing this will require manually modifying the
 | existing namespaces of App\* namespaced-classes.
 */
defined('APP_NAMESPACE') || define('APP_NAMESPACE', 'App');

/*
 | --------------------------------------------------------------------------
 | Composer Path
 | --------------------------------------------------------------------------
 |
 | The path that Composer's autoload file is expected to live. By default,
 | the vendor folder is in the Root directory, but you can customize that here.
 */
defined('COMPOSER_PATH') || define('COMPOSER_PATH', ROOTPATH . 'vendor/autoload.php');

/*
 |--------------------------------------------------------------------------
 | Timing Constants
 |--------------------------------------------------------------------------
 |
 | Provide simple ways to work with the myriad of PHP functions that
 | require information to be in seconds.
 */
defined('SECOND') || define('SECOND', 1);
defined('MINUTE') || define('MINUTE', 60);
defined('HOUR')   || define('HOUR', 3600);
defined('DAY')    || define('DAY', 86400);
defined('WEEK')   || define('WEEK', 604800);
defined('MONTH')  || define('MONTH', 2592000);
defined('YEAR')   || define('YEAR', 31536000);
defined('DECADE') || define('DECADE', 315360000);

/*
 | --------------------------------------------------------------------------
 | Exit Status Codes
 | --------------------------------------------------------------------------
 |
 | Used to indicate the conditions under which the script is exit()ing.
 | While there is no universal standard for error codes, there are some
 | broad conventions.  Three such conventions are mentioned below, for
 | those who wish to make use of them.  The CodeIgniter defaults were
 | chosen for the least overlap with these conventions, while still
 | leaving room for others to be defined in future versions and user
 | applications.
 |
 | The three main conventions used for determining exit status codes
 | are as follows:
 |
 |    Standard C/C++ Library (stdlibc):
 |       http://www.gnu.org/software/libc/manual/html_node/Exit-Status.html
 |       (This link also contains other GNU-specific conventions)
 |    BSD sysexits.h:
 |       http://www.gsp.com/cgi-bin/man.cgi?section=3&topic=sysexits
 |    Bash scripting:
 |       http://tldp.org/LDP/abs/html/exitcodes.html
 |
 */
defined('EXIT_SUCCESS')        || define('EXIT_SUCCESS', 0); // no errors
defined('EXIT_ERROR')          || define('EXIT_ERROR', 1); // generic error
defined('EXIT_CONFIG')         || define('EXIT_CONFIG', 3); // configuration error
defined('EXIT_UNKNOWN_FILE')   || define('EXIT_UNKNOWN_FILE', 4); // file not found
defined('EXIT_UNKNOWN_CLASS')  || define('EXIT_UNKNOWN_CLASS', 5); // unknown class
defined('EXIT_UNKNOWN_METHOD') || define('EXIT_UNKNOWN_METHOD', 6); // unknown class member
defined('EXIT_USER_INPUT')     || define('EXIT_USER_INPUT', 7); // invalid user input
defined('EXIT_DATABASE')       || define('EXIT_DATABASE', 8); // database error
defined('EXIT__AUTO_MIN')      || define('EXIT__AUTO_MIN', 9); // lowest automatically-assigned error code
defined('EXIT__AUTO_MAX')      || define('EXIT__AUTO_MAX', 125); // highest automatically-assigned error code

/*
|--------------------------------------------------------------------------
| API Key
|--------------------------------------------------------------------------
|
| Used to getting token access to core.
|
*/
defined('TOKEN_ROUTE')          || define('TOKEN_ROUTE', 'v1/token');
defined('GET_SERVICES_ROUTE')   || define('GET_SERVICES_ROUTE', 'api/v1/products');
defined('GET_LOCATIONS_ROUTE')  || define('GET_LOCATIONS_ROUTE', 'api/v1/locations');

defined('GET_COURTESIES_ROUTE')   || define('GET_COURTESIES_ROUTE', 'api/v1/courtesies');
defined('GET_PRICES_ROUTE')       || define('GET_PRICES_ROUTE', 'api/v1/prices');
defined('GET_ROLES_ROUTE')        || define('GET_ROLES_ROUTE', 'api/v1/roles');
defined('GET_REPS_ROUTE')         || define('GET_REPS_ROUTE', 'api/v1/sales');
defined('GET_BOOTHS_ROUTE')       || define('GET_BOOTHS_ROUTE', 'api/v1/booths');
defined('GET_REP_BOOTH_ROUTE')    || define('GET_REP_BOOTH_ROUTE', 'api/v1/rep_booth');
defined('GET_CHANNELS_ROUTE')     || define('GET_CHANNELS_ROUTE', 'api/v1/channels');
defined('GET_DESTINATIONS_ROUTE') || define('GET_DESTINATIONS_ROUTE', 'api/v1/destinations');
defined('GET_USERS_ROUTE')        || define('GET_USERS_ROUTE', 'api/v1/users');
defined('GET_COUNTRIES_ROUTE')    || define('GET_COUNTRIES_ROUTE', 'api/v1/countries');

defined('GET_RESELLERS_ROUTE')    || define('GET_RESELLERS_ROUTE', 'api/v1/resellers');
defined('GET_BUSINESS_ROUTE')     || define('GET_BUSINESS_ROUTE', 'api/v1/unities');
defined('GET_SHIPS_ROUTE')        || define('GET_SHIPS_ROUTE', 'api/v1/ships');
defined('GET_APIKEYS_ROUTE')      || define('GET_APIKEYS_ROUTE', 'api/v1/apikeys');
defined('GET_EQUIVALENCES_ROUTE') || define('GET_EQUIVALENCES_ROUTE', 'api/v1/equivalences');
defined('GET_ARRIVES_ROUTE')      || define('GET_ARRIVES_ROUTE', 'api/v1/arrives');

defined('GET_ALLOTMENT_RESERVATIONS_ROUTE') || define('GET_ALLOTMENT_RESERVATIONS_ROUTE', 'api/v1/allotment_reservations');
defined('GET_ALLOTMENTS_ROUTE')             || define('GET_ALLOTMENTS_ROUTE', 'api/v1/allotments');
defined('GET_ARRIVES_ALLOTMENTS_ROUTE')     || define('GET_ARRIVES_ALLOTMENTS_ROUTE', 'api/v1/allotments/arrive/');

defined('GET_SALE_LOCATION_ROUTE')  || define('GET_SALE_LOCATION_ROUTE', 'api/v1/sale_locations');
defined('GET_COST_ROUTE')  || define('GET_COST_ROUTE', 'api/v1/costs');
defined('GET_BOOKINGS_DATE_ROUTE')  || define('GET_BOOKINGS_DATE_ROUTE', 'api/v1/bookings/date/');

defined('LABEL_SUCCESS') || define('LABEL_SUCCESS', 'badge badge-success');
defined('LABEL_DANGER')  || define('LABEL_DANGER', 'badge badge-danger');
