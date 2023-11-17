
var fs = require('fs');
var path = require("path");
var converter = require("json-2-csv");

let input_args = process.argv.slice(2);

var input_path = input_args[0];
var full_json_string = fs.readFileSync(input_path).toString();
var full_obj = JSON.parse(full_json_string);

var obj = extract_bits_to_be_translated(full_obj);

var country = input_args[1];

var lang = input_args[2];
var excel_name = input_args[3];








async function outputFiles() {


            for (var fl in obj) {
                 var rows = [];
                 var rows_metadata = [];


                    for (var bit_id in obj[fl].localization.eng) {
                        var bit = obj[fl].localization.eng[bit_id];
                        if (bit.hasOwnProperty('text')) {
                            

                            var quick_replies = [];


                            for (var i = 0; i < 10; i++) {
                                if (i < bit.quick_replies.length) {
                                    quick_replies.push(bit.quick_replies[i]);
                                }
                                else {
                                    quick_replies.push("");
                                };
                            };
                            rows.push({
                                "text message": bit.text[0],
                                "option 1": quick_replies[0],
                                "option 2": quick_replies[1],
                                "option 3": quick_replies[2],
                                "option 4": quick_replies[3],
                                "option 5": quick_replies[4],
                                "option 6": quick_replies[5],
                                "option 7": quick_replies[6],
                                "option 8": quick_replies[7],
                                "option 9": quick_replies[8],
                                "option 10": quick_replies[9]
                            });

                            rows_metadata.push({
                                "name": obj[fl].name,
                                "node id": bit_id
                            });
                        };
                    };
            
        

        //files_rows.push(rows)
        var output_path = path.join(__dirname, "../../files/review-by-country/"+ country + "/csv-files/"+excel_name + "/" + obj[fl].name + ".csv");

        //files_output_paths.push(output_path)


        //console.log(output_path)
        /* converter.json2csv(rows, (err, csvString) => {
            fs.writeFileSync(output_path, csvString);
            //console.log("CSV " + flows_for_spreadsheet[N_file].name_of_file + " is written");
            console.log(output_path + " is written")
        }); */
        
      


        let csvString = await converter.json2csvAsync(rows);
        fs.writeFileSync(output_path, csvString);

        if (lang){
            let rows_lang = translate_rows(rows,rows_metadata,lang,full_obj.flows)
            let output_path_lang = path.join(__dirname, "../../files/review-by-country/"+ country + "_" + lang + "/csv-files/" +excel_name + "/" + obj[fl].name + ".csv");
            let csvStringLang = await converter.json2csvAsync(rows_lang);
            fs.writeFileSync(output_path_lang, csvStringLang);
        }
        /*wrapperJson2Csv(output_path, rows).then((csv) => {
            console.log(output_path)
            fs.writeFile(output_path, csv, function (err, result) {
                if (err) console.log('error', err);
            }
            )
        }).catch((err) => { console.error(err) });*/

    }
}
outputFiles().then(() => {
    console.log("I outputted the files");
});


// function for extracting text from flows
function extract_bits_to_be_translated(obj) {
    var bits_to_translate = {};
    var localization = {};
    var eng_localization = {};

    var word_tests = ["has_any_word", "has_all_words", "has_phrase", "has_only_phrase", "has_beginning"];



    for (var fl = 0; fl < obj.flows.length; fl++) {
        for (var n = 0; n < obj.flows[fl].nodes.length; n++) {
            for (var ac = 0; ac < obj.flows[fl].nodes[n].actions.length; ac++) {
                var curr_act = obj.flows[fl].nodes[n].actions[ac];
                if (curr_act.type == "send_msg") {
                    var msg_id = curr_act.uuid;
                    var trasl_to_add = {};
                    trasl_to_add.text = [curr_act.text];
                    trasl_to_add.quick_replies = curr_act.quick_replies;
                    eng_localization[msg_id] = trasl_to_add;
                }
            }
            if (obj.flows[fl].nodes[n].hasOwnProperty('router')) {
                if (obj.flows[fl].nodes[n].router.operand == "@input.text") {
                    for (var c = 0; c < obj.flows[fl].nodes[n].router.cases.length; c++) {
                        var curr_case = obj.flows[fl].nodes[n].router.cases[c];
                        if (word_tests.includes(curr_case.type)) {
                            var case_id = curr_case.uuid;
                            var trasl_to_add = {};
                            trasl_to_add.arguments = curr_case.arguments;
                            eng_localization[case_id] = trasl_to_add;

                        }
                    }

                }



            }
        }

        var flow_id = obj.flows[fl].uuid;
        var flow_info = {};
        flow_info.flowid = flow_id;
        flow_info.name = obj.flows[fl].name;
        localization.eng = eng_localization;
        flow_info.localization = localization;
        bits_to_translate[flow_id] = flow_info;
        localization = {};
        eng_localization = {};
    }
    return bits_to_translate;
}



function translate_rows(rows,rows_metadata,lang,flows){
    let rows_lang = JSON.parse(JSON.stringify(rows));
    for (let n = 0; n<rows_lang.length; n++) {
        let r = rows_lang[n];
        let r_meta = rows_metadata[n];
        let corresp_flow = flows.filter(fl => (fl.name == r_meta["name"]))[0];
        if (corresp_flow.localization[lang][r_meta["node id"]]){
            r["text message"] = corresp_flow.localization[lang][r_meta["node id"]].text[0];
            for (let qr = 0; qr< corresp_flow.localization[lang][r_meta["node id"]].quick_replies.length; qr++){
                r["option " + String(qr+1)] = corresp_flow.localization[lang][r_meta["node id"]].quick_replies[qr];
            }
        }
    }   

    return rows_lang
}

