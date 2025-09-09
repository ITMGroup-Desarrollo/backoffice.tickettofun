<?php
namespace App\Libraries;

use stdClass;

/**
* Api class
*
* @package Codeigniter
* @subpackage Libraries
* @category Api's
* @since Version 1.0.0
*/

class Api
{
    public $headers;

    public function __construct()
    {
        $this->headers = array("Content-Type: application/json");
    }

    public function get_token()
    {
        $params = new stdClass();

        $endpoint   = TOKEN_ROUTE;
        $params->id = getenv('apiKey');

        return $this->_request('POST', $endpoint, $this->headers, $params);
    }

    public function request_api($method, $endpoint, $params, $token)
    {
        $this->headers = array();

        if ($method == 'GET') {
            $this->headers = array();
        }

        $this->headers[] = "Authorization: " . $token;

        return $this->_request($method, $endpoint, $this->headers, $params);
    }

    private function _request($method, $endpoint, $headers, $params)
    {
        $curl = curl_init();
        $data = json_encode($params);

        $endpoint = getenv('apiHost') . $endpoint;

        curl_setopt_array($curl, array(
            CURLOPT_URL            => $endpoint,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING       => "",
            CURLOPT_MAXREDIRS      => 10,
            CURLOPT_TIMEOUT        => 0,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_HTTP_VERSION   => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST  => $method,
            CURLOPT_POSTFIELDS     => $data,
            CURLOPT_HTTPHEADER     => $headers,
        ));

        $response = curl_exec($curl);
        $err      = curl_error($curl);

        curl_close($curl);

        if ($err)
        {
            $response = new stdClass();

            $response->code    = 404;
            $response->message = "Not found data";

            $response = json_encode($response);
        }

        return $response;
    }
}
