var fs = require('fs');
var path = require("path");
var country = "Malaysia";
var input_path = path.join(__dirname, '../../files/review-by-country/' +country +'/files_urls_with_incorporated.json');
var json_string = fs.readFileSync(input_path).toString();
var files_urls = JSON.parse(json_string);

var fs = require('fs');
var path = require("path");
var input_path = path.join(__dirname, "../../files/review-by-country/Malaysia/external_folders_urls.json");
var json_string = fs.readFileSync(input_path).toString();
var external_folders_urls = JSON.parse(json_string);

var dummy_url = "https://www.covid19parenting.com/home"

for (url in files_urls){
    files_urls[url] = dummy_url;
}

for (url in external_folders_urls){
    external_folders_urls[url] = dummy_url;
}



new_urls = JSON.stringify(files_urls, null, 2);
var output_path = path.join(__dirname, "../../files/review-by-country/Malaysia/dummy_files_urls_with_incorporated.json");
fs.writeFile(output_path, new_urls, function (err, result) {
    if (err) console.log('error', err);
});

external_folders_urls = JSON.stringify(external_folders_urls, null, 2);
var output_path = path.join(__dirname, "../../files/review-by-country/Malaysia/dummy_external_folders_urls.json");
fs.writeFile(output_path, external_folders_urls, function (err, result) {
    if (err) console.log('error', err);
});