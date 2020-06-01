<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/*
|--------------------------------------------------------------------------
| Display Debug backtrace
|--------------------------------------------------------------------------
|
| If set to TRUE, a backtrace will be displayed along with php errors. If
| error_reporting is disabled, the backtrace will not display, regardless
| of this setting
|
*/
defined('SHOW_DEBUG_BACKTRACE') OR define('SHOW_DEBUG_BACKTRACE', TRUE);

/*
|--------------------------------------------------------------------------
| File and Directory Modes
|--------------------------------------------------------------------------
|
| These prefs are used when checking and setting modes when working
| with the file system.  The defaults are fine on servers with proper
| security, but you may wish (or even need) to change the values in
| certain environments (Apache running a separate process for each
| user, PHP under CGI with Apache suEXEC, etc.).  Octal values should
| always be used to set the mode correctly.
|
*/
defined('FILE_READ_MODE')  OR define('FILE_READ_MODE', 0644);
defined('FILE_WRITE_MODE') OR define('FILE_WRITE_MODE', 0666);
defined('DIR_READ_MODE')   OR define('DIR_READ_MODE', 0755);
defined('DIR_WRITE_MODE')  OR define('DIR_WRITE_MODE', 0755);

/*
|--------------------------------------------------------------------------
| File Stream Modes
|--------------------------------------------------------------------------
|
| These modes are used when working with fopen()/popen()
|
*/
defined('FOPEN_READ')                           OR define('FOPEN_READ', 'rb');
defined('FOPEN_READ_WRITE')                     OR define('FOPEN_READ_WRITE', 'r+b');
defined('FOPEN_WRITE_CREATE_DESTRUCTIVE')       OR define('FOPEN_WRITE_CREATE_DESTRUCTIVE', 'wb'); // truncates existing file data, use with care
defined('FOPEN_READ_WRITE_CREATE_DESTRUCTIVE')  OR define('FOPEN_READ_WRITE_CREATE_DESTRUCTIVE', 'w+b'); // truncates existing file data, use with care
defined('FOPEN_WRITE_CREATE')                   OR define('FOPEN_WRITE_CREATE', 'ab');
defined('FOPEN_READ_WRITE_CREATE')              OR define('FOPEN_READ_WRITE_CREATE', 'a+b');
defined('FOPEN_WRITE_CREATE_STRICT')            OR define('FOPEN_WRITE_CREATE_STRICT', 'xb');
defined('FOPEN_READ_WRITE_CREATE_STRICT')       OR define('FOPEN_READ_WRITE_CREATE_STRICT', 'x+b');

/*
|--------------------------------------------------------------------------
| Exit Status Codes
|--------------------------------------------------------------------------
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
defined('EXIT_SUCCESS')        OR define('EXIT_SUCCESS', 0); // no errors
defined('EXIT_ERROR')          OR define('EXIT_ERROR', 1); // generic error
defined('EXIT_CONFIG')         OR define('EXIT_CONFIG', 3); // configuration error
defined('EXIT_UNKNOWN_FILE')   OR define('EXIT_UNKNOWN_FILE', 4); // file not found
defined('EXIT_UNKNOWN_CLASS')  OR define('EXIT_UNKNOWN_CLASS', 5); // unknown class
defined('EXIT_UNKNOWN_METHOD') OR define('EXIT_UNKNOWN_METHOD', 6); // unknown class member
defined('EXIT_USER_INPUT')     OR define('EXIT_USER_INPUT', 7); // invalid user input
defined('EXIT_DATABASE')       OR define('EXIT_DATABASE', 8); // database error
defined('EXIT__AUTO_MIN')      OR define('EXIT__AUTO_MIN', 9); // lowest automatically-assigned error code
defined('EXIT__AUTO_MAX')      OR define('EXIT__AUTO_MAX', 125); // highest automatically-assigned error code

/*
|--------------------------------------------------------------------------
| API Key
|--------------------------------------------------------------------------
|
| Used to getting token access to core.
|
*/
defined('TOKEN_ROUTE') OR define('TOKEN_ROUTE', 'v1/token');
defined('GET_SERVICES_ROUTE') OR define('GET_SERVICES_ROUTE', 'api/v1/products');
defined('GET_LOCATIONS_ROUTE') OR define('GET_LOCATIONS_ROUTE', 'api/v1/locations');

defined('GET_COURTESIES_ROUTE') OR define('GET_COURTESIES_ROUTE', 'api/v1/courtesies');
defined('GET_PRICES_ROUTE') OR define('GET_PRICES_ROUTE', 'api/v1/prices');
defined('GET_ROLES_ROUTE') OR define('GET_ROLES_ROUTE', 'api/v1/roles');
defined('GET_REPS_ROUTE') OR define('GET_REPS_ROUTE', 'api/v1/sales');
defined('GET_BOOTHS_ROUTE') OR define('GET_BOOTHS_ROUTE', 'api/v1/booths');
defined('GET_REP_BOOTH_ROUTE') OR define('GET_REP_BOOTH_ROUTE', 'api/v1/rep_booth');
defined('GET_CHANNELS_ROUTE') OR define('GET_CHANNELS_ROUTE', 'api/v1/channels');
defined('GET_DESTINATIONS_ROUTE') OR define('GET_DESTINATIONS_ROUTE', 'api/v1/destinations');
defined('GET_USERS_ROUTE') OR define('GET_USERS_ROUTE', 'api/v1/users');
defined('GET_COUNTRIES_ROUTE') OR define('GET_COUNTRIES_ROUTE', 'api/v1/countries');

defined('GET_RESELLERS_ROUTE') OR define('GET_RESELLERS_ROUTE', 'api/v1/resellers');
defined('GET_BUSINESS_ROUTE') OR define('GET_BUSINESS_ROUTE', 'api/v1/unities');
defined('GET_SHIPS_ROUTE') OR define('GET_SHIPS_ROUTE', 'api/v1/ships');
defined('GET_APIKEYS_ROUTE') OR define('GET_APIKEYS_ROUTE', 'api/v1/apikeys');
defined('GET_EQUIVALENCES_ROUTE') OR define('GET_EQUIVALENCES_ROUTE', 'api/v1/equivalences');
defined('GET_ARRIVES_ROUTE') OR define('GET_ARRIVES_ROUTE', 'api/v1/arrives');

defined('GET_ALLOTMENT_RESERVATIONS_ROUTE') OR define('GET_ALLOTMENT_RESERVATIONS_ROUTE', 'api/v1/allotment_reservations');
defined('GET_ALLOTMENTS_ROUTE') OR define('GET_ALLOTMENTS_ROUTE', 'api/v1/allotments');

defined('LABEL_SUCCESS') OR define('LABEL_SUCCESS', 'badge badge-success');
defined('LABEL_DANGER') OR define('LABEL_DANGER', 'badge badge-danger');
