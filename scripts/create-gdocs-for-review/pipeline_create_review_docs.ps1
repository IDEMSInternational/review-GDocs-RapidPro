$country = "UNICEF_Philippines"
$deployment = "Philippines"
$input_flows = "../../files/input-flows/PH-plh-international-flavour_expire_ABtesting_fil.json"
$flow_categorisation = "../../files/flow-categorisations/flows_by_template_and_type.json"
$lang = "fil"
<#

#step 0: create directories
$path_country = ("..\..\files\review-by-country\" + $country) 
$path_json = ("..\..\files\review-by-country\" + $country + "\json-files") 
$path_csv = ("..\..\files\review-by-country\" + $country + "\csv-files") 

If(!(test-path $path_country))
{
    New-Item -Path $path_country -ItemType "directory"
}

If(!(test-path $path_json))
{
    New-Item -Path $path_json -ItemType "directory"
}

If(!(test-path $path_csv))
{
    New-Item -Path $path_csv -ItemType "directory"
}

Write-Output "created directories"

if ($lang){
    $path_country_lang = ("..\..\files\review-by-country\" + $country + "_" + $lang) 
    $path_json_lang = ("..\..\files\review-by-country\" + $country + "_" + $lang + "\json-files") 
    $path_csv_lang = ("..\..\files\review-by-country\" + $country+ "_" + $lang + "\csv-files") 

    If(!(test-path $path_country_lang))
    {
        New-Item -Path $path_country_lang -ItemType "directory"
    }

    If(!(test-path $path_json_lang))
    {
        New-Item -Path $path_json_lang -ItemType "directory"
    }

    If(!(test-path $path_csv_lang))
    {
        New-Item -Path $path_csv_lang -ItemType "directory"
    }

    Write-Output "created directories for lang"
}


# step 1: create json files
node .\create_json_for_docs_and_translation.js $input_flows $country $deployment $flow_categorisation $lang
Write-Output "created json files"


# step 2: create csv files
node .\create_csv_for_single_flows.js $input_flows $country $lang
Write-Output "created csv files"


# step 3: create gdocs and spreadsheets in folders
python .\create_docs_and_spreadsheets_in_folders.py $country
Write-Output "created docs and spreasheets in folders"

# step 4: fix and create ulrs 
node .\add_missing_files_urls.js $country
node .\create_urls_of_external_folders.js $country
Write-Output "generated urls"

# step 5: add links to documentation
python .\add_links_to_documentation.py $country
Write-Output "added links to gdoc"
#>
if ($lang){
    $country_lang = $country+ "_" + $lang
    # step 3: create gdocs and spreadsheets in folders for lang
    python .\create_docs_and_spreadsheets_in_folders.py $country_lang
    Write-Output "created docs and spreasheets in folders"

    # step 4: fix and create ulrs for lang
    node .\add_missing_files_urls.js $country_lang
    node .\create_urls_of_external_folders.js $country_lang
    Write-Output "generated urls"

    # step 5: add links to documentation for lang
    python .\add_links_to_documentation.py $country_lang
    Write-Output "added links to gdoc"
}
