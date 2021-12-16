<?php

    // remove for production

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    $result = file_get_contents("countryBorders.geo.json");
 

    /*$border = $decode['features'][$i]['geometry'];

    for($i=0;$i<count($decode['features']);$i++) {

        if (is0_a2 === $('#select-country').val()) {

        }

    };    */

    $border = $decode['features'][$i]['geometry'];

    foreach ($decode['features'] as $feature) {

        if ($feature["properties"]["ISO_A2"] ==  $_REQUEST['select-country']) {

            $border = $feature;

            break;
         }

     }
 
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

    $output['data']['border'] = $border;

    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output); 

 

?>