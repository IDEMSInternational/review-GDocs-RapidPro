$country = "Internal"

<##>

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


# step 1: create json files
node .\create_json_for_doc.js $country
Write-Output "created json files"

# step 2: create csv files
node .\create_csv_for_single_flows.js $country
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