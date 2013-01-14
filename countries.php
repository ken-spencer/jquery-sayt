<?php

$countries = array(
    "AR" => "Argentina",
    "AU" => "Australia",
    "AT" => "Austria",
    "BE" => "Belgium",
    "BA" => "Bosnia and Herzegovina",
    "BR" => "Brazil",
    "CA" => "Canada",
    "TD" => "Chad",
    "CL" => "Chile",
    "CN" => "China",
    "CO" => "Colombia",
    "HR" => "Croatia (Hrvatska)",
    "CZ" => "Czech Republic",
    "DK" => "Denmark",
    "EG" => "Egypt",
    "SV" => "El Salvador",
    "FI" => "Finland",
    "FR" => "France",
    "DE" => "Germany",
    "GR" => "Greece",
    "HK" => "Hong Kong",
    "HU" => "Hungary",
    "IN" => "India",
    "ID" => "Indonesia",
    "IE" => "Ireland",
    "IL" => "Israel",
    "IT" => "Italy",
    "JM" => "Jamaica",
    "JP" => "Japan",
    "MY" => "Malaysia",
    "MX" => "Mexico",
    "FM" => "Micronesia",
    "MS" => "Montserrat",
    "MA" => "Morocco",
    "NP" => "Nepal",
    "NL" => "Netherlands",
    "NZ" => "New Zealand",
    "NI" => "Nicaragua",
    "NG" => "Nigeria",
    "OM" => "Oman",
    "PK" => "Pakistan",
    "PA" => "Panama",
    "PE" => "Peru",
    "PH" => "Philippines",
    "PL" => "Poland",
    "PT" => "Portugal",
    "PR" => "Puerto Rico",
    "QA" => "Qatar",
    "RO" => "Romania",
    "RU" => "Russian Federation",
    "WS" => "Samoa",
    "SA" => "Saudi Arabia",
    "SG" => "Singapore",
    "SK" => "Slovakia (Slovak Republic)",
    "SI" => "Slovenia",
    "SO" => "Somalia",
    "ZA" => "South Africa",
    "ES" => "Spain",
    "LK" => "Sri Lanka",
    "SD" => "Sudan",
    "SE" => "Sweden",
    "CH" => "Switzerland",
    "TW" => "Taiwan",
    "TH" => "Thailand",
    "TR" => "Turkey",
    "UA" => "Ukraine",
    "AE" => "United Arab Emirates",
    "GB" => "United Kingdom (Great Britain)",
    "US" => "United States",
    "VA" => "Vatican City State (Holy See)",
    "VE" => "Venezuela",
    "EH" => "Western Sahara",
);

$list = preg_grep("/" . preg_quote($_POST['keywords']) . "/", $countries);

$results = array();
foreach ($list as $key => $value) {
    $results[] = array('key' => $key, 'title' => $value);
}


$data = array(
    'status' => 'success',
    'results' => $results,
);

header('Content-type: applicaiton/json');
echo json_encode($data);
