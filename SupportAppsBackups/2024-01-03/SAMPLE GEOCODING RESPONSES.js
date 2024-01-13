// SAMPLE GEOCODING RESPONSES

// 200 BUT NO MATCHES FOUND
[
    {
        "Address": null,
        "Coords": null,
        "Region": 4,
        "Label": null,
        "PlaceName": null,
        "TimeZone": null,
        "Errors": [
            {
                "Type": 1,
                "Code": 88,
                "LegacyErrorCode": 400,
                "Description": "No matches found"
            }
        ]
    }
]


// 200 SUCCESS
[
    {
        "Address": {
            "StreetAddress": "15 St Cross Street",
            "City": "London",
            "State": "UK",
            "Zip": "EC1N 8UW",
            "County": "London",
            "Country": "United Kingdom",
            "SPLC": null,
            "CountryPostalFilter": 0,
            "AbbreviationFormat": 0,
            "StateName": "England",
            "StateAbbreviation": "ENG",
            "CountryAbbreviation": "UK"
        },
        "Coords": {
            "Lat": "51.520823",
            "Lon": "-0.107749"
        },
        "Region": 3,
        "Label": "",
        "PlaceName": "",
        "TimeZone": "+0:00",
        "Errors": [],
        "SpeedLimitInfo": null,
        "ConfidenceLevel": "Exact",
        "DistanceFromRoad": null,
        "CrossStreet": null,
        "TimeZoneOffset": "GMT+0:00"
    }
]