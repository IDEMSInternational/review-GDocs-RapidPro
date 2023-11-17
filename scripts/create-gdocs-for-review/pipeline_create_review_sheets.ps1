$country = "China_review_translations"
#$deployment = "Global"
$input_flows = "../../files/input-flows/parenttext_onboarding_5_localised_translations.json"
$lang = "zho"
$excel_name = "onboarding"

#step 0: create directories
$path_country = ("..\..\files\review-by-country\" + $country) 
$path_csv = ("..\..\files\review-by-country\" + $country + "\csv-files" ) 
$path_excel = ("..\..\files\review-by-country\" + $country + "\excel-files") 
$sub_path_csv = ($path_csv + "\" + $excel_name) 



If(!(test-path $path_country))
{
    New-Item -Path $path_country -ItemType "directory"
}


If(!(test-path $path_csv))
{
    New-Item -Path $path_csv -ItemType "directory"
}

If(!(test-path $sub_path_csv))
{
    New-Item -Path $sub_path_csv -ItemType "directory"
}

If(!(test-path $path_excel))
{
    New-Item -Path $path_excel -ItemType "directory"
}


Write-Output "created directories"

if ($lang){
    $path_country_lang = ("..\..\files\review-by-country\" + $country + "_" + $lang) 
    $path_csv_lang = ("..\..\files\review-by-country\" + $country+ "_" + $lang + "\csv-files") 
    $sub_path_csv_lang = ($path_csv_lang + "\" + $excel_name) 
    $path_excel_lang = ("..\..\files\review-by-country\" + $country+ "_" + $lang + "\excel-files") 

    If(!(test-path $path_country_lang))
    {
        New-Item -Path $path_country_lang -ItemType "directory"
    }


    If(!(test-path $path_csv_lang))
    {
        New-Item -Path $path_csv_lang -ItemType "directory"
    }

    If(!(test-path $sub_path_csv_lang))
    {
        New-Item -Path $sub_path_csv_lang -ItemType "directory"
    }

    If(!(test-path $path_excel_lang))
    {
        New-Item -Path $path_excel_lang -ItemType "directory"
    }

    Write-Output "created directories for lang"
}



# step 2: create csv files
#node .\create_csv_for_single_flows_all.js $input_flows $country $lang $excel_name
Write-Output "created csv files"
$CurrentDirectory = Get-Location
$full_csv_path = (Join-Path $CurrentDirectory $path_csv) | Resolve-Path
$full_csv_path_lang = (Join-Path $CurrentDirectory $path_csv_lang) | Resolve-Path
$full_excel_path = (Join-Path $CurrentDirectory $path_excel) | Resolve-Path
$full_excel_path_lang = (Join-Path $CurrentDirectory $path_excel_lang) | Resolve-Path



#create excel files from all csv folders

#python C:\Users\fagio\Documents\GitHub\rapidpro-flow-spreadsheet-converter\json_to_spreadsheet\create_single_excel.py $full_csv_path $full_excel_path
if($lang){
    python C:\Users\fagio\Documents\GitHub\rapidpro-flow-spreadsheet-converter\json_to_spreadsheet\create_single_excel.py $full_csv_path_lang $full_excel_path_lang 
}

