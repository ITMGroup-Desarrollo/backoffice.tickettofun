<?php
defined('BASEPATH') OR exit('No direct script access allowed');

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
    public function get_token($method, $endpoint, $params)
    {
        return $this->_get_token($method, $endpoint, $params);
    }

    private function _get_token($method, $endpoint, $params)
    {
        $curl = curl_init();
        $data = json_encode($params);

        curl_setopt_array($curl, array(
            CURLOPT_URL => $endpoint,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_POSTFIELDS => $data,
            CURLOPT_HTTPHEADER => array(
                "Content-Type: application/json"
            ),
        ));

        $response = curl_exec($curl);
        $err = curl_error($curl);

        curl_close($curl);

        if ($err)
        {
            $response = new stdClass();

            $response->code = 404;
            $response->message = "Not found data";

            $response = json_encode($response);
        }

        return $response;
    }
}
