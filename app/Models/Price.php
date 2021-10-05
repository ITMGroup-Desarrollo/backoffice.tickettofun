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
class Price extends Model
{
    public $api;
    public $page;
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
        $this->page    = new \App\Models\Page();
        $this->session = \Config\Services::session();

        $this->model    = '';
        $this->attrib   = array('class' => 'center');
        $this->active   = array('class' => LABEL_SUCCESS);
        $this->inactive = array('class' => LABEL_DANGER);
    }

    public function get_list()
    {
        $rol_id        = $this->session->get('rol_id');
        $table_content = $this->page->get_settings('prices');

        $table = $table_content['PRICES_TABLE'];
        if ($rol_id != 1 && !in_array('g_prices', $this->session->get('permissions')))
        {
            $limit = count($table->contents[0]->contents->contents) - 1;

            array_splice($table->contents[0]->contents->contents, $limit, 1);
            array_splice($table->contents[2]->contents->contents, $limit, 1);
        }

        $table_content = $this->build->build_components($table);

        // Call API here!
        $params   = new stdClass();
        $endpoint = GET_PRICES_ROUTE;

        $token = $this->session->get('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );

        if ($response->code == 200)
        {
            $rows = $response->message;
            foreach ($rows as $row)
            {
                $aux = '';
                $this->anchor_attrib = array();

                $aux .= custom('td', '', $row->reseller_name);
                $aux .= custom('td', '', $row->ship_name);
                $aux .= custom('td', '', $row->service_name);
                $aux .= custom('td', '', $row->pax_name);
                $aux .= custom('td', '', $row->symbol_currency." ".$row->price);
                $aux .= custom('td', '', $row->iso);

                $span_down = custom('span', array('class' => 'caret'), '');
                $btn_down  = custom('button', array('class' => 'btn btn-default dropdown-toggle', 'type' => 'button', 'id' => 'dropdown-'.$row->price_id, 'data-toggle' => 'dropdown', 'aria-haspopup' => 'true', 'aria-expanded' => 'false'), 'Show date ' . $span_down);

                $head_purchase = custom('li', array('class' => 'dropdown-header'), 'Range Date to Purchase');
                $a_purcahse    = custom('a', array('href' => '#'), $row->start_date_purchase.' - '.$row->end_date_purchase);

                $li_purchase  = custom('li', '', $a_purcahse);
                $head_seasson = custom('li', array('class' => 'dropdown-header'), 'Season date');

                $a_seasson  = custom('a', array('href' => '#'), $row->seasson_start.' - '.$row->seasson_end);
                $li_seasson = custom('li', '', $a_seasson);

                $ul_down      = custom('ul', array('class' => 'dropdown-menu', 'aria-labelledby' => 'dropdown-'.$row->price_id), $head_purchase.$li_purchase.$head_seasson.$li_seasson);
                $section_down = custom('div', array('class' => 'dropdown'), $btn_down. $ul_down);

                $aux .= custom('td', '', $section_down);

                $status = '';
                $delete = '';
                if ($row->active_status == 1)
                {
                    $status = custom('span', $this->active, 'Active');
                }
                else
                {
                    $status = custom('span', $this->inactive, 'Inactive');
                }

                $status_attrib                = $this->attrib;
                $status_attrib['data-status'] =  $row->price_id;

                $aux .= custom('td', $status_attrib, $status);

                if ($rol_id == 1 || in_array('u_prices', $this->session->get('permissions')))
                {
                    $path = 'prices/' . $row->price_id;
                    
                    $this->anchor_attrib['class'] = 'edit';
                    $this->anchor_attrib['href']  = base_url($path);

                    $edit = custom('i', array('class' => 'fas fa-edit'), '');
                    $edit = custom('a', $this->anchor_attrib, $edit);
                }
                if ($rol_id == 1 || in_array('d_prices', $this->session->get('permissions')))
                {
                    if ($row->active_status == 1) 
                    {
                        $this->anchor_attrib['href']    = '#';
                        $this->anchor_attrib['class']   = 'delete';
                        $this->anchor_attrib['data-id'] = $row->price_id;
                    
                        $delete = custom('i', array('class' => 'fas fa-trash'), '');
                        $delete = custom('a', $this->anchor_attrib, $delete);
                    }

                    $aux .= custom('td', $this->attrib, $edit . $delete);
                }

                $this->model .= custom('tr', '', $aux);
            }
        }
        else
        {
            $aux = '';
            for ($i = 0; $i < 5; $i++) {
                $aux .= custom('td', '', '');
            }

            $this->model = custom('tr', '', $aux);
        }

        $this->model = str_replace('{rows}', $this->model, $table_content);

        return $this->model;
    }

    public function get_form()
    {
        $contents = $this->page->get_settings('prices');

        $this->model = $this->build->build_components(
            $contents['PRICES_FORM']
        );

        return $this->model;
    }

    public function get_data($id)
    {
        $params   = new stdClass();
        $endpoint = GET_PRICES_ROUTE . '/' . $id;

        $token = $this->session->get('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );
        $price = new stdClass();

        if ($response->code == 200)
        {
            $price->price                 = $response->message->price;
            $price->pax_id                = $response->message->pax_id;
            $price->ship_id               = $response->message->ship_id;
            $price->price_id              = $response->message->price_id;
            $price->ship_name             = $response->message->ship_name;
            $price->service_id            = $response->message->service_id;
            $price->channel_id            = $response->message->channel_id;
            $price->seasson_end           = $response->message->seasson_end;
            $price->reseller_id           = $response->message->reseller_id;
            $price->currency_id           = $response->message->currency_id;
            $price->seasson_start         = $response->message->seasson_start;
            $price->active_status         = $response->message->active_status;
            $price->end_date_purchase     = $response->message->end_date_purchase;
            $price->start_date_purchase   = $response->message->start_date_purchase;

        }else{
            redirect('/prices/list');
        }

        return $price;
    }

    public function get_equivalences()
    {
        $params   = new stdClass();
        $endpoint = GET_EQUIVALENCES_ROUTE;

        $token = $this->session->get('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );

        $equivalence = new stdClass();

        if ($response->code == 200)
        {
            $equivalence = $response->message;
        }
        else
        {
            redirect('/prices/list');
        }

        return $equivalence;
    }

}
