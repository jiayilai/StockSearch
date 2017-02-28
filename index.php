<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
date_default_timezone_set("America/Los_Angeles");
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    if (isset($_GET["input"])) {
        // using lookup api
        $input = urlencode($_GET["input"]);
        $quoteUrl = "http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json?input=" . $input;
        $json = file_get_contents($quoteUrl);
        echo $json;
    }
    if (isset($_GET["symbol"])) {
        // using quote api
        $symbol = urlencode($_GET["symbol"]);
        $quoteUrl = "http://dev.markitondemand.com/MODApis/Api/v2/Quote/json?symbol=" . $symbol;
        $json = file_get_contents($quoteUrl);
        echo $json;
    }
    if (isset($_GET["query"])) {
        // using bing search api
        // Replace this value with your account key
        $accountKey = 'nqB/PNOypf9QtbhKDw0HzfFLAcwN5D3XhSSSnSnimoQ';
        $ServiceRootURL =  "https://api.datamarket.azure.com/Bing/Search/";
        $WebSearchURL = $ServiceRootURL . 'News?$format=json&Query=';
        $context = stream_context_create(array(
            'http' => array(
                'request_fulluri' => true,
                'header' => "Authorization: Basic " . base64_encode($accountKey . ":" . $accountKey)
            )
        ));
        $request = $WebSearchURL . urlencode('\'' . $_GET["query"] . '\'');
        $response = file_get_contents($request, 0, $context);
        echo $response;
    }
    if (isset($_GET["parameters"])) {
        // using quote api
        $parameters = urlencode($_GET["parameters"]);
        $quoteUrl = "http://dev.markitondemand.com/MODApis/Api/v2/InteractiveChart/json?parameters=" . $parameters;
        $json = file_get_contents($quoteUrl);
        echo $json;
    }
}
?>

