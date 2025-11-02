<?php
namespace App\Models;

use CodeIgniter\Model;
use App\Libraries\Api;
use App\Libraries\Build;

use stdClass;

/**
* Client Class
*
* @package CodeIgniter
* @category Models
* @Author ITM Dev Team
* @Since Version 1.0.0
*/
class Account_profile extends Model
{
    public $api;
    public $build;
    public $model;
    public $active;
    public $attrib;
    public $session;
    public $inactive;
    public $anchor_attrib;

    public function __construct()
    {
        parent::__construct();

        $this->api     = new Api();
        $this->build   = new Build();
        $this->session = \Config\Services::session();

        $this->model    = '';
        $this->attrib   = array('class' => 'center');
        $this->active   = array('class' => LABEL_SUCCESS);
        $this->inactive = array('class' => LABEL_DANGER);
    }

    public function get_form()
    {
        $page     = new \App\Models\Page();
        $contents = $page->get_settings('profile');

        $this->model .= $this->build->build_components(
            $contents['ACCOUNT_PROFILE_FORM']
        );

        $this->model = str_replace('{id}', 'account-profile', $this->model);

        return $this->model;
    }

    public function get_data($id)
    {
        $endpoint = GET_USERS_ROUTE . '/' . $id;

        $params = new stdClass();
        $token  = $this->session->get('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );

        $user = new stdClass();

        if ($response->code == 200)
        {
            $user->id            = $response->message->user_id;
            $user->rol           = $response->message->rol_id;
            $user->first_name    = $response->message->first_name;
            $user->last_name     = $response->message->last_name;
            $user->email_addr    = $response->message->email_addr;
            $user->active        = $response->message->active_status;
            $user->avatar        = $response->message->avatar;

            $unities = [];
            if (! empty($response->message->business_unities)) {
                $l = count($response->message->business_unities);
                for ($i = 0; $i < $l; $i++) {
                    $unities[] = $response->message->business_unities[$i]->unity_id;
                }
            }

            $user->business_unities = $unities;
        }

        return $user;
    }
}
