var fs = require('fs');
var path = require("path");


let input_args = process.argv.slice(2);

var input_path = input_args[0]


var json_string = fs.readFileSync(input_path).toString();
var obj = JSON.parse(json_string);

var country = input_args[1];
const deployment =  input_args[2];


var input_path_file_names = input_args[3];
var json_string_file_names = fs.readFileSync(input_path_file_names).toString();
var flows_by_template = JSON.parse(json_string_file_names);

var lang = input_args[4];


/// flows with timed introduction

var timed_intros = flows_by_template.filter(function (flow) { return (flow.name.endsWith("Timed intro")) });


for (var fl = 0; fl < timed_intros.length; fl++) {
    var doc_cont = {};
    if (lang){
        var doc_cont_lang = {};
    }

    var curr_flow_intro = obj.flows.filter(function (flow) { return (flow.name == timed_intros[fl].name) })[0];
    console.log(curr_flow_intro.name)
    var curr_flow_tip = obj.flows.filter(function (flow) { return (flow.name == timed_intros[fl].name.replace(" - Timed intro", "")) })[0];
    if (flows_by_template.filter(function (flow) { return (flow.name == curr_flow_tip.name) }).length == 0) {
        continue;
    }



    var curr_flow_doc = {};
    var flow_content = {};

    if (lang){
        var curr_flow_doc_lang = {};
        var flow_content_lang = {};
    }



    var curr_node_intro = curr_flow_intro.nodes[0];
    var type_of_template_intro = timed_intros[fl].type;


    var curr_node_tip = curr_flow_tip.nodes[0];
    var type_of_template_tip = flows_by_template.filter(function (flow) { return (flow.name == (timed_intros[fl].name.replace(" - Timed intro", ""))) })[0].type;

    var n_mess_block = 0;
    var curr_flow = curr_flow_intro;
    create_template(type_of_template_intro, curr_node_intro,lang)

    var n_mess_block = 0;
    curr_flow = curr_flow_tip;
    create_template(type_of_template_tip, curr_node_tip,lang)


    flows_by_template = flows_by_template.filter(function (flow) { return (flow.name != curr_flow_tip.name) });
    flows_by_template = flows_by_template.filter(function (flow) { return (flow.name != curr_flow_intro.name) });

    flow_info = {};
    flow_info["Id intro"] = curr_flow_intro.uuid;
    flow_info["Id tip"] = curr_flow_tip.uuid;
    flow_info["Template type"] = type_of_template_tip.toString();

    //////////////////////////////////////////////////////

    // add content to object for flow
    curr_flow_doc.Content = flow_content;
    curr_flow_doc["Technical information"] = flow_info;

    if (lang){
        curr_flow_doc_lang.Content = flow_content_lang;
        curr_flow_doc_lang["Technical information"] = flow_info;
    }
 

    // add flow to list of flows for doc

    doc_cont[curr_flow_tip.name] = curr_flow_doc;

    // write output
    doc_cont = JSON.stringify(doc_cont, null, 2);
    var output_path = path.join(__dirname, "../../files/review-by-country/" + country + "/json-files/" + curr_flow_tip.name + ".json");
    fs.writeFile(output_path, doc_cont, function (err, result) {
        if (err) console.log('error', err);
    });

    if (lang){
        doc_cont_lang[curr_flow_tip.name] = curr_flow_doc_lang;
        doc_cont_lang = JSON.stringify(doc_cont_lang, null, 2);
        var output_path_lang = path.join(__dirname, "../../files/review-by-country/" + country + "_" + lang + "/json-files/" + curr_flow_tip.name + ".json");
        fs.writeFile(output_path_lang, doc_cont_lang, function (err, result) {
            if (err) console.log('error', err);
        });
    }


}


//////////////////////////////////////////////////////////////////
/// flows without  timed introduction
for (var fl = 0; fl < flows_by_template.length; fl++) {

    //for (var fl = flows_by_template.length - 1; fl < flows_by_template.length; fl++) {
    //for (var fl = 520/4 -1; fl < 520/4; fl++) {    
    var doc_cont = {};
    if (lang){
        var doc_cont_lang = {};
    }

    var curr_flow = obj.flows.filter(function (flow) { return (flow.name == flows_by_template[fl].name) })[0];
    console.log(flows_by_template[fl].name)

    var curr_flow_doc = {};
    var flow_content = {};

    if (lang){
        var curr_flow_doc_lang = {};
        var flow_content_lang = {};
    }


    var curr_node = curr_flow.nodes[0];
    var type_of_template = flows_by_template[fl].type;

    var n_mess_block = 0;

    var exists_template = create_template(type_of_template, curr_node,lang);
    if (exists_template == "no") {
        continue
    }

    flow_info = {};
    flow_info.Id = curr_flow.uuid;
    flow_info.Template_type = type_of_template.toString();

    //////////////////////////////////////////////////////

    // add content to object for flow
    curr_flow_doc.Content = flow_content;
    curr_flow_doc["Technical information"] = flow_info;
    // add flow to list of flows for doc
    if (lang){
        curr_flow_doc_lang.Content = flow_content_lang;
        curr_flow_doc_lang["Technical information"] = flow_info;
    }
 


    doc_cont[curr_flow.name] = curr_flow_doc;

    // write output
    doc_cont = JSON.stringify(doc_cont, null, 2);
    var output_path = path.join(__dirname, "../../files/review-by-country/" + country + "/json-files/" + curr_flow.name + ".json");
    fs.writeFile(output_path, doc_cont, function (err, result) {
        if (err) console.log('error', err);
    });

    if (lang){
        doc_cont_lang[curr_flow.name] = curr_flow_doc_lang;
        doc_cont_lang = JSON.stringify(doc_cont_lang, null, 2);
        var output_path_lang = path.join(__dirname, "../../files/review-by-country/" + country + "_" + lang + "/json-files/" + curr_flow.name + ".json");
        fs.writeFile(output_path_lang, doc_cont_lang, function (err, result) {
            if (err) console.log('error', err);
        });
    }

}








////////////////////////////////////////////////////////////////////////
/// FUNCTIONS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////
// Templates
///////////////////////////////////////////////////////////////
function create_template(type_of_template, curr_node,lang) {
    if (type_of_template == "1") {
        template_1(curr_node,lang)
    }
    else if (type_of_template == "2") {
        template_2(curr_node,lang)
    }
    else if (type_of_template == "3") {
        template_3(curr_node,lang)
    }
    else if (type_of_template == "4") {
        template_4(curr_node,lang)
    }
    else if (type_of_template == "5") {
        template_5(curr_node,lang)
    }
    else if (type_of_template == "6") {
        template_6(curr_node,lang)
    }
    else if (type_of_template == "7") {
        template_7(curr_node,lang)
    }
    else if (type_of_template == "8") {
        template_8(curr_node,lang)
    }
    else if (type_of_template == "9") {
        template_9(curr_node,lang)
    } else if (type_of_template == "10") {
        template_10(curr_node,lang)
    } else if (type_of_template == "11") {
        template_11(curr_node,lang)
    } else if (type_of_template == "12") {
        template_12(curr_node,lang)
    } else if (type_of_template == "13") {
        template_13(curr_node,lang)
    } else if (type_of_template == "14") {
        template_14(curr_node,lang)
    } else if (type_of_template == "15") {
        template_15(curr_node,lang)
    } else if (type_of_template == "c1") {
        template_c1(curr_node,lang)
    }
    else {
        return "no"
    }
}

///////////////////////////////////////////////////////
// Template 1 - send messages

function template_1(curr_node,lang) {
    create_message_block(curr_node,lang,"1");
}

/////////////////////////////////////////////////////////
// Template 2 - theme split , video & list

function template_2(curr_node,lang) {
    var block_output = create_default_intro_block(curr_node,lang);
    curr_node = block_output;

    block_output = create_media_block(curr_node,lang);
    curr_node = block_output;

    block_output = create_list_of_tips_block(curr_node,lang);
    curr_node = block_output;

    block_output = create_message_block(curr_node,lang,"2");

}

//////////////////////////////////////////////////////
// Template 3 - 

function template_3(curr_node,lang) {
    var block_output = create_message_block(curr_node,lang,"3");
    curr_node = block_output;

    block_output = create_media_block(curr_node,lang);
    curr_node = block_output;

    block_output = create_message_block(curr_node,lang,"3");

}

///////////////////////////////////////////////////////////
// Template 4

function template_4(curr_node,lang) {
    var block_output = create_default_intro_block(curr_node,lang);
    curr_node = block_output;

    block_output = create_media_block(curr_node,lang);
    curr_node = block_output;

    block_output = create_message_block(curr_node,lang,"4");
    curr_node = block_output;

    block_output = create_list_of_tips_block(curr_node,lang);
    curr_node = block_output;

    block_output = create_message_block(curr_node,lang,"4");

}

//////////////////////////////////////////////////////////////////////
// Template 5
function template_5(curr_node,lang) {
    create_intro_for_timed_block(curr_node,lang)
}

///////////////////////////////////////////////////////////////////////
// Template  6

function template_6(curr_node,lang) {
    var block_output = create_default_intro_block(curr_node,lang);
    curr_node = block_output;

    var block_output = create_media_block(curr_node,lang);
    curr_node = block_output;

    var block_output = create_message_block(curr_node,lang,"6");

}


//////////////////////////////////////////////////////////
// Template 7

function template_7(curr_node,lang) {
    var block_output = create_default_intro_block(curr_node,lang);
    curr_node = block_output;

    block_output = create_media_block(curr_node,lang);
    curr_node = block_output;

    block_output = create_list_of_tips_block(curr_node,lang);
    curr_node = block_output;

    block_output = create_age_split_block(curr_node,lang, 1);
    curr_node = block_output;

    block_output = create_message_block(curr_node,lang,"7");

}

///////////////////////////////////////////////////////
// Template 8

function template_8(curr_node,lang) {
    var block_output = create_default_intro_block(curr_node,lang);
    curr_node = block_output;

    block_output = create_media_block(curr_node,lang);
    curr_node = block_output;

    block_output = create_message_block(curr_node,lang,"8");
    curr_node = block_output;

    block_output = create_age_split_block(curr_node,lang, 2);
    curr_node = block_output;

    block_output = create_message_block(curr_node,lang,"8");

}
///////////////////////////////////////////////////////
// Template 9

function template_9(curr_node,lang) {
    var block_output = create_message_block(curr_node,lang,"9");
    curr_node = block_output;

    block_output = create_age_split_block(curr_node,lang, 2);
    curr_node = block_output;

    block_output = create_message_block(curr_node,lang,"9");

}

///////////////////////////////////////////////////////
// Template 10

function template_10(curr_node,lang) {
    var block_output = create_age_split_block(curr_node,lang, 1);
    curr_node = block_output;

}
/////////////////////////////////////////////////////////
// Template 11

function template_11(curr_node,lang) {
    var block_output = create_default_intro_block(curr_node,lang);
    curr_node = block_output;

    block_output = create_media_block(curr_node,lang);
    curr_node = block_output;

    block_output = create_multiple_choice_block(curr_node,lang);
    curr_node = block_output;

    block_output = create_message_block(curr_node,lang,"11");

}

///////////////////////////////////////////////////////////
// Template 12

function template_12(curr_node,lang) {
    var block_output = create_default_intro_block(curr_node,lang);
    curr_node = block_output;


    block_output = create_media_block(curr_node,lang);
    curr_node = block_output;

    block_output = create_gender_split_block(curr_node,lang);
    curr_node = block_output;


    block_output = create_message_block(curr_node,lang,"12");
    curr_node = block_output;


    block_output = create_list_of_tips_block(curr_node,lang);
    curr_node = block_output;


    block_output = create_message_block(curr_node,lang,"12");

}

//////////////////////////////////////////////////////////
// Template 13

function template_13(curr_node,lang) {
    var block_output = create_default_intro_block(curr_node,lang);
    curr_node = block_output;


    block_output = create_media_block(curr_node,lang);
    curr_node = block_output;

    block_output = create_message_block(curr_node,lang,"13");
    curr_node = block_output;

    block_output = create_gender_split_block(curr_node,lang);
    curr_node = block_output;


    block_output = create_message_block(curr_node,lang,"13");
    curr_node = block_output;


    block_output = create_list_of_tips_block(curr_node,lang);
    curr_node = block_output;


    block_output = create_message_block(curr_node,lang,"13");

}

////////////////////////////////////////////////////////
// Template 14 

function template_14(curr_node,lang) {
    var block_output = create_default_intro_block(curr_node,lang);
    curr_node = block_output;

    block_output = create_media_block(curr_node,lang);
    curr_node = block_output;

    block_output = create_list_of_tips_block(curr_node,lang);
    curr_node = block_output;

    block_output = create_gender_split_block(curr_node,lang);

}

////////////////////////////////////////////////////////
// Template 15 - theme split & list

function template_15(curr_node,lang) {
    var block_output = create_default_intro_block(curr_node,lang);
    curr_node = block_output;

    block_output = create_list_of_tips_block(curr_node,lang);
    curr_node = block_output;

    block_output = create_message_block(curr_node,lang,"15");

}


///////////////////////////////////////////////////////
// Template c1 (check-ins)

function template_c1(curr_node,lang) {
    create_checkin_positive_block(curr_node,lang);

    create_checkin_challenge_block(curr_node,lang);

}

/////////////////////////////////////////////////////////

/////////////////////////////////// functions for generating content blocks ///////////////////////////////////////////////////////////////


////////////////////////////////////////////////
//send_messages block

function create_message_block(curr_node,lang,type_of_template) {
    n_mess_block++;
    var n_mess = 1;
    var r_exp_yes = new RegExp(`\\byes\\b`, "i");
    var r_exp_no = new RegExp(`\\bno\\b`, "i");
    var curr_block = {};

    var curr_block_messages = [];
    var curr_block_interaction_messages = [];
    var curr_block_no_messages = [];

    if (lang){
        var curr_block_lang = {};
        var curr_block_messages_lang = [];
        var curr_block_interaction_messages_lang = [];
        var curr_block_no_messages_lang = [];
    }

    do {
        var messages = curr_node.actions.filter(function (ac) { return (ac.type == "send_msg") });

        if (messages.length > 0) {
            // it's a send_msg node so it only has one exit and one (or zero) child node --> next_node
            var next_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == curr_node.exits[0].destination_uuid) });
            // different behaviour based on the type of next_node
            if (next_node.length == 0) {
                // if there is no child no, curr_node is one end point of the flow ==> add all the messages in the actions of curr_node
                // to curr_block_messages
                console.log("end of flow")
                next_node = null;
                go_on = false;
                messages.forEach(ac => {add_action_text(ac,curr_block_messages)});
                if (lang){
                    messages.forEach(ac => {add_action_text(ac,curr_block_messages_lang,lang)});
                }
            } else { // if curr_node is not a flow end point, consider what type of node next_node is (whether it has a router or not)
                    
                if (next_node[0].hasOwnProperty('router')) {// if next_node has a router
                    // the node could be a WFR, enter_flow (for updating toolkit) or other type of split. Consider the 3 cases separately
                    if (next_node[0].router.operand == "@input.text" && next_node[0].router.hasOwnProperty("wait")){
                        // store messages in the variable curr_block_interaction_messages
                        let wfr_node = next_node[0];
                        go_on = false;
                        var ends_with_wfr = true;
                        messages.forEach(ac => {add_action_text(ac,curr_block_interaction_messages)});
                        if (lang){
                            messages.forEach(ac => {add_action_text(ac,curr_block_interaction_messages_lang,lang)});
                        }
                        
                        // check if the interaction is of type Y/N
                        if (wfr_node.router.cases.filter(function (ca) { return (r_exp_yes.test(ca.arguments[0])) }).length > 0) {
                            var interaction_yes_no = true;

                            // identify the YES branch and set next_node (to be used as input for next block) as the child node from the yes branch
                            let yes_categ_id = wfr_node.router.cases.filter(function (ca) { return (r_exp_yes.test(ca.arguments[0])) })[0].category_uuid;
                            let yes_categ = wfr_node.router.categories.filter(function (cat) { return (cat.uuid == yes_categ_id) })[0];
                            let yes_node_id = wfr_node.exits.filter(function (ex) { return (ex.uuid == yes_categ.exit_uuid) })[0].destination_uuid;
                            
                            next_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == yes_node_id) })[0];
                             // in case next_node is an update_contact field node, replace
                             // next_node with its child (==> ignore the node)
                            if (next_node.actions.length > 0 && next_node.actions[0].type == "set_contact_field"){ // && next_node.actions[0].type.field.key == "last_interaction") {
                                    next_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == next_node.exits[0].destination_uuid) })[0];
                            }

                            //identify the NO branch
                            let no_categ_id = wfr_node.router.cases.filter(function (ca) { return (r_exp_no.test(ca.arguments[0])) })[0].category_uuid;
                            let no_categ = wfr_node.router.categories.filter(function (cat) { return (cat.uuid == no_categ_id) })[0];
                            let no_node_id = wfr_node.exits.filter(function (ex) { return (ex.uuid == no_categ.exit_uuid) })[0].destination_uuid;
                            
                            // if there is a child in the NO branch, run the loop_message_nodes function to extract all the messages
                            if (no_node_id) {
                                let no_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == no_node_id) })[0];
                                curr_block_no_messages = loop_message_nodes(no_node, "null")[0];
                                if (lang){
                                    curr_block_no_messages_lang = loop_message_nodes(no_node, "null",lang)[0];
                                }
                            }
            


                        } else {
                            // if the interaction is not of type Y/N don't do anything else 
                            var interaction_yes_no = false;
                        }

                    } else if (next_node[0].actions.length >0 && next_node[0].actions[0].type == "enter_flow" && next_node[0].actions[0].flow.name == "PLH - Internal - Update toolkits" && next_node[0].exits[0].destination_uuid == next_node[0].exits[1].destination_uuid && next_node[0].exits[0].destination_uuid != null && type_of_template != "4"){
                        // if the router node is an enter_flow node that enters the "update toolkits" flow and the 2 exits have the same child node
                        //then add the messages and continue with the while loop skipping this node ==> curr_node = child_node
                        go_on = true;
                        messages.forEach(ac => {add_action_text(ac,curr_block_messages)});
                        if (lang){
                            messages.forEach(ac => {add_action_text(ac,curr_block_messages_lang,lang)});
                        }
    
                        curr_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == next_node[0].exits[0].destination_uuid) })[0];


                    } else {
                        // if it's any other type of split, do not continue with the while loop and just add all the messages in the actions of curr_node
                        // to curr_block_messages
                        go_on = false;
                        messages.forEach(ac => {add_action_text(ac,curr_block_messages)});
                        if (lang){
                            messages.forEach(ac => {add_action_text(ac,curr_block_messages_lang,lang)});
                        }
                        next_node = next_node[0];

                    }


                } else { // if next_node doesn't have a router
                    // add all the messages in the actions of curr_node to curr_block_messages
                    // and set curr_node = next_node and continue with while loop
                    go_on = true;
                    messages.forEach(ac => {add_action_text(ac,curr_block_messages)});
                    if (lang){
                        messages.forEach(ac => {add_action_text(ac,curr_block_messages_lang,lang)});
                    }
                    curr_node = next_node[0];


                }
            }



        } else if (curr_node.actions.length > 0 && curr_node.actions[0].type == "set_contact_field") {
            
            curr_node = curr_flow.nodes.filter(nd => (nd.uuid == curr_node.exits[0].destination_uuid))[0]
            go_on = true;
            console.log("ignored update contact field node")
        
        }  else {
            
            go_on = false;
            console.log("this is not a send message node")
            
            next_node = null;
        }


    }
    while (go_on);

    for (let m = 0; m < curr_block_messages.length; m++) {
        if (curr_block_messages.length == 1) {
            curr_block["Message"] = curr_block_messages[0];
            if (lang){
                curr_block_lang["Message"] = curr_block_messages_lang[0];
            }
        } else {
            curr_block["Message " + (m + 1)] = curr_block_messages[m];
            if (lang){
                curr_block_lang["Message " + (m + 1)] = curr_block_messages_lang[m];
            }
        }
    }

    if (ends_with_wfr) {
        for (let m = 0; m < curr_block_interaction_messages.length; m++) {
            if (curr_block_interaction_messages.length == 1) {
                curr_block["Interaction message"] = curr_block_interaction_messages[0];
                if (lang){
                    curr_block_lang["Interaction message"] = curr_block_interaction_messages_lang[0];
                }
            } else {
                curr_block["Interaction message " + (m + 1)] = curr_block_interaction_messages[m];
                if (lang){
                    curr_block_lang["Interaction message " + (m + 1)] = curr_block_interaction_messages_lang[m];
                }
            }
        }
        
        if (interaction_yes_no) {
            for (let n = 0; n < curr_block_no_messages.length; n++) {
                if (curr_block_no_messages.length == 1) {
                    curr_block["Message for negative answer"] = curr_block_no_messages[0];
                    if (lang){
                        curr_block_lang["Message for negative answer"] = curr_block_no_messages_lang[0];
                    }
                } else {
                    curr_block["Message for negative answer " + (n + 1)] = curr_block_no_messages[n];
                    if (lang){
                        curr_block_lang["Message for negative answer " + (n + 1)] = curr_block_no_messages_lang[n];
                    }
                }
            }
        }
    }

    flow_content["Set of messages " + n_mess_block] = curr_block;
    if (lang){
        flow_content_lang["Set of messages " + n_mess_block] = curr_block_lang;
    }

    if (ends_with_wfr && interaction_yes_no) {
        if (next_node.actions.filter(function (ac) { return (ac.type == "send_msg") }).length > 0) {
            next_node = create_message_block(next_node,lang)
        }

    }


    return next_node


}


/////////////////////////////////////////////////////////////////
function add_action_text(ac,curr_block_messages,lang){

   
    if (lang && curr_flow.localization[lang][ac.uuid]){
            var message_text = curr_flow.localization[lang][ac.uuid].text[0];      
    } else {
        var message_text = ac.text;
    }
    
    if (ac.attachments.length > 0) {
        message_text = add_attachments_to_text(message_text,ac)
    }
    curr_block_messages.push(message_text);

}


/////////////////////////////////////////////////////////////////
function add_attachments_to_text(message_text,ac){
    // TO DO: add other types of attachments

        message_text = message_text + "\n " + ac.attachments[0].slice(6, -2).replace("@(fields.image_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/image/universal/")
            .replace("@(fields.comic_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/comic/");
    

    return message_text
}


/////////////////////////////////////////////////////////////////////////
function loop_message_nodes(curr_node, stop_node_id,lang) {
    var messages_to_send = [];
    if (lang){
        var messages_to_send_lang = [];
    }

    do {
        var message = curr_node.actions.filter(function (ac) { return (ac.type == "send_msg") });

        if (message.length > 0) {
            var next_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == curr_node.exits[0].destination_uuid) });
            if (next_node.length == 0) {
                console.log("end of flow")
                next_node = null;
                go_on = false;
                
                message.forEach(ac => {add_action_text(ac,messages_to_send)});
                if (lang){
                    message.forEach(ac => {add_action_text(ac,messages_to_send_lang,lang)});
                }

            } else {
                if (next_node[0].hasOwnProperty('router')) {
                    go_on = false;
                    if (next_node[0].router.operand == "@input.text") {

                        console.log("ended in interaction node")
                        next_node = next_node[0];


                    } else {
                        message.forEach(ac => {add_action_text(ac,messages_to_send,lang)});
                        next_node = next_node[0];
                    }
                } else {
                    if (next_node[0].uuid == stop_node_id) {
                        go_on = false;
                        message.forEach(ac => {add_action_text(ac,messages_to_send,lang)});
                        next_node = next_node[0];

                    } else {
                        go_on = true;
                        message.forEach(ac => {add_action_text(ac,messages_to_send,lang)});
                        curr_node = next_node[0];
                    }

                }



            }

        }

        
        else {
            //console.log(curr_node)
            go_on = false;
            console.log("this is not a send message node")
            next_node = null;
        }
    }
    while (go_on);
    return [messages_to_send, next_node, curr_node]
}

////////////////////////////////////////////////////////////////////////////////////////////////
// media block 
function create_media_block(curr_node,lang) {

    var curr_block = {};
    if (lang){
        curr_block_lang = {};
    }
    var next_node = null;

    if (curr_node.hasOwnProperty('router') && curr_node.router.operand == "@fields.type_of_media") {
        if (curr_node.router.cases.length == 1) {
            if (curr_node.router.cases[0].arguments[0] == "high") {

                var video_category = curr_node.router.categories.filter(function (cat) { return (cat.name.toLowerCase() == "high") })[0];
                var video_node_id = curr_node.exits.filter(function (ex) { return (ex.uuid == video_category.exit_uuid) })[0].destination_uuid;
                var video_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == video_node_id) })[0];

                var other_category = curr_node.router.categories.filter(function (cat) { return (cat.name == "Other") })[0];
                var next_node_id = curr_node.exits.filter(function (ex) { return (ex.uuid == other_category.exit_uuid) })[0].destination_uuid;
                next_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == next_node_id) })[0];
                var video = {};

                video["Text"] = video_node.actions[0].text;
                if (video_node.actions[0].attachments.length > 0) {
                    video["Link"] = (video_node.actions[0].attachments[0].slice(6, -2)).replace("@(fields.voiceover_video_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/voiceover/resourceType/video/eng/")
                } else {
                    video["Link"] = "missing";
                }

                curr_block["Video"] = video;

                if (lang){
                    var video_lang = {};    
                    if (curr_flow.localization[lang][actions[0].uuid]){
                        video_lang["Text"] = curr_flow.localization[lang][actions[0].uuid].text[0];      
                } else {
                    video_lang["Text"] = video_node.actions[0].text;
                }
                    
                    if (video_node.actions[0].attachments.length > 0) {
                        video_lang["Link"] = (video_node.actions[0].attachments[0].slice(6, -2)).replace("@(fields.voiceover_video_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/voiceover/resourceType/video/" + lang +"/")
                    } else {
                        video_lang["Link"] = "missing";
                    }
    
                    curr_block_lang["Video"] = video_lang;
                }
            } else if (curr_node.router.cases[0].arguments[0] == "low") {
                //for relax audio 

            } else {
                console.log("1 argument but not high or low")
            }
        } else if (curr_node.router.cases.length == 2) {
            var video_category = curr_node.router.categories.filter(function (cat) { return (cat.name.toLowerCase() == "high") })[0];
            var video_node_id = curr_node.exits.filter(function (ex) { return (ex.uuid == video_category.exit_uuid) })[0].destination_uuid;

            var video_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == video_node_id) })[0];
            var video = {};
            video["Text"] = video_node.actions[0].text;
            if (video_node.actions[0].attachments.length > 0) {
                video["Link"] = (video_node.actions[0].attachments[0].slice(6, -2)).replace("@(fields.voiceover_video_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/voiceover/resourceType/video/eng/")
            } else {
                video["Link"] = "missing";
            }
            curr_block["Video"] = video;

            if (lang){
                var video_lang = {};    
                if (curr_flow.localization[lang][video_node.actions[0].uuid]){
                    video_lang["Text"] = curr_flow.localization[lang][video_node.actions[0].uuid].text[0];      
                } else {
                    video_lang["Text"] = video_node.actions[0].text;
                }
                
                if (video_node.actions[0].attachments.length > 0) {
                    video_lang["Link"] = (video_node.actions[0].attachments[0].slice(6, -2)).replace("@(fields.voiceover_video_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/voiceover/resourceType/video/" + lang +"/")
                } else {
                    video_lang["Link"] = "missing";
                }

                curr_block_lang["Video"] = video_lang;
            }


            var audio_category = curr_node.router.categories.filter(function (cat) { return (cat.name.toLowerCase() == "medium") })[0];
            var audio_node_id = curr_node.exits.filter(function (ex) { return (ex.uuid == audio_category.exit_uuid) })[0].destination_uuid;
            var audio_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == audio_node_id) })[0];
            var audio = {};
            audio["Text"] = audio_node.actions[0].text;
            if (audio_node.actions[0].attachments.length > 0) {
                audio["Link"] = (audio_node.actions[0].attachments[0].slice(6, -2)).replace("@(fields.voiceover_audio_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/voiceover/resourceType/audio/eng/").replace("@(fields.relaxation_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/relaxation/eng/")
            } else {
                audio["Link"] = "missing";
            }

            curr_block["Audio"] = audio;

            if (lang){
                var audio_lang = {};    
                if (curr_flow.localization[lang][audio_node.actions[0].uuid]){
                    audio_lang["Text"] = curr_flow.localization[lang][audio_node.actions[0].uuid].text[0];      
            } else {
                audio_lang["Text"] = audio_node.actions[0].text;
            }
                
                if (audio_node.actions[0].attachments.length > 0) {
                    audio_lang["Link"] = (audio_node.actions[0].attachments[0].slice(6, -2)).replace("@(fields.voiceover_audio_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/voiceover/resourceType/audio/" + lang +"/").replace("@(fields.relaxation_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/relaxation/" + lang +"/")
                } else {
                    audio_lang["Link"] = "missing";
                }

                curr_block_lang["Audio"] = audio_lang;
            }


            var low_category = curr_node.router.categories.filter(function (cat) { return (cat.name.toLowerCase() == "other") })[0];
            var low_node_id = curr_node.exits.filter(function (ex) { return (ex.uuid == low_category.exit_uuid) })[0].destination_uuid;

            var low_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == low_node_id) })[0];





        }
        else { console.log("too many arguments") }


    } else if (curr_node.actions.length > 0 && curr_node.actions[0].type == "set_contact_field") {

        let split_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == curr_node.exits[0].destination_uuid) })[0];

        var low_node = create_media_block(split_node);

    } else {
        console.log("error, there is no media split")
    }


    flow_content["Media"] = curr_block;
    if (lang){
        flow_content_lang["Media"] = curr_block_lang;
    }
    return low_node
}



////////////////////////////////////////////////////////////
// Default intro block

function create_default_intro_block(skill_node,lang) {
    var r_exp_yes = new RegExp(`\\byes\\b`, "i");
    var r_exp_no = new RegExp(`\\bno\\b`, "i");

    var curr_block = {};
    var curr_block_messages = [];

    if (lang){
        var curr_block_lang = {};
        var curr_block_messages_lang = [];
    }



    var toolkit_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == skill_node.exits[0].destination_uuid) })[0];
    var split_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == toolkit_node.exits[0].destination_uuid) })[0];
    var msg_cat = split_node.router.categories.filter(function (cat) { return (cat.name == "Other") })[0];
    var msg_node_id = split_node.exits.filter(function (ex) { return (ex.uuid == msg_cat.exit_uuid) })[0].destination_uuid;

    var curr_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == msg_node_id) })[0];


    do {
        var message = curr_node.actions.filter(function (ac) { return (ac.type == "send_msg") });
        if (message.length > 0) {
            var next_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == curr_node.exits[0].destination_uuid) });
            if (next_node.length == 0) {
                console.log("end of flow")
                next_node = null;
                go_on = false;
                // add text
                message.forEach(ac => {
                    let message_text = ac.text;
                    if (ac.attachments.length > 0) {
                        message_text = message_text + "\n " + ac.attachments[0].slice(6, -2).replace("@(fields.image_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/image/universal/")
                            .replace("@(fields.comic_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/comic/");

                    }
                    curr_block_messages.push(message_text);
                })

                if (lang){
                    message.forEach(ac => {
                        if (curr_flow.localization[lang][ac.uuid]){
                            message_text = curr_flow.localization[lang][ac.uuid].text[0];
                        } else {
                            message_text = ac.text;
                        }
                        
                    if (ac.attachments.length > 0) {
                        message_text = message_text + "\n " + ac.attachments[0].slice(6, -2).replace("@(fields.image_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/image/universal/")
                            .replace("@(fields.comic_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/comic/");

                    }
                        curr_block_messages_lang.push(message_text_lang);
                    })
                }


                
            } else {
                if (next_node[0].hasOwnProperty('router') ) {
                    if(next_node[0].router.operand == "@parent.results.fromwelcome"){
                        
                        var other_cat_uuid = next_node[0].router.default_category_uuid;
                        var other_cat = next_node[0].router.categories.filter(cat => (cat.uuid == other_cat_uuid))[0];
                        var other_exit = next_node[0].exits.filter( ex => (ex.uuid == other_cat.exit_uuid))[0];
                        curr_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == other_exit.destination_uuid) })[0];
                        go_on = true;

                        message.forEach(ac => {
                            let message_text = ac.text;
                            if (ac.attachments.length > 0) {
                                message_text = message_text + "\n " + ac.attachments[0].slice(6, -2).replace("@(fields.image_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/image/universal/")
                                    .replace("@(fields.comic_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/comic/");
        
                            }
                            curr_block_messages.push(message_text);
                        })
        
                        if (lang){
                            message.forEach(ac => {
                                if (curr_flow.localization[lang][ac.uuid]){
                                    message_text = curr_flow.localization[lang][ac.uuid].text[0];
                                } else {
                                    message_text = ac.text;
                                }
                                
                            if (ac.attachments.length > 0) {
                                message_text = message_text + "\n " + ac.attachments[0].slice(6, -2).replace("@(fields.image_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/image/universal/")
                                    .replace("@(fields.comic_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/comic/");
        
                            }
                                curr_block_messages_lang.push(message_text_lang);
                            })
                        }
                    } else if (next_node[0].router.operand == "@input.text"){
                        go_on = false;

                        var interaction_message = message[0].text;
                        if (lang){
                            if (curr_flow.localization[lang][message[0].uuid]){
                                var interaction_message_lang = curr_flow.localization[lang][message[0].uuid].text[0];
                            } else {
                                var interaction_message_lang = message[0].text
                            }
                        }

                        if (message[0].attachments.length > 0) {
                            interaction_message = interaction_message + "\n " + message[0].attachments[0].slice(6, -2).replace("@(fields.image_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/image/universal/")
                                .replace("@(fields.comic_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/comic/")
                            if (lang){
                                interaction_message_lang = interaction_message_lang + "\n " + message[0].attachments[0].slice(6, -2).replace("@(fields.image_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/image/universal/")
                                .replace("@(fields.comic_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/comic/")
                            }
                        }

                        var wfr_node = next_node[0];
                        var yes_categ_id = wfr_node.router.cases.filter(function (ca) { return (r_exp_yes.test(ca.arguments[0])) })[0].category_uuid;
                        var yes_categ = wfr_node.router.categories.filter(function (cat) { return (cat.uuid == yes_categ_id) })[0];
                        var yes_node_id = wfr_node.exits.filter(function (ex) { return (ex.uuid == yes_categ.exit_uuid) })[0].destination_uuid;

                        var next_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == yes_node_id) })[0];

                        if (next_node.actions.length > 0) {

                            if (next_node.actions[0].type == "set_contact_field") {
                                if (next_node.actions[0].field.key == "last_interaction") {

                                    yes_node_id = next_node.exits[0].destination_uuid;
                                    next_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == yes_node_id) })[0];
                                }
                            }
                        }



                        var no_categ_id = wfr_node.router.cases.filter(function (ca) { return (r_exp_no.test(ca.arguments[0])) })[0].category_uuid;
                        var no_categ = wfr_node.router.categories.filter(function (cat) { return (cat.uuid == no_categ_id) })[0];
                        var no_node_id = wfr_node.exits.filter(function (ex) { return (ex.uuid == no_categ.exit_uuid) })[0].destination_uuid;
                        var no_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == no_node_id) })[0];


                        var curr_block_no_messages = loop_message_nodes(no_node, "null")[0];
                        if (lang){
                            var curr_block_no_messages_lang = loop_message_nodes(no_node, "null",lang)[0];
                        }


                    } else {
                        console.log("error router not recognised")
                        go_on = false
                    }

                } else {
                    // add text
                    go_on = true;
                    curr_node = next_node[0];

                    message.forEach(ac => {
                        let message_text = ac.text;
                        if (ac.attachments.length > 0) {
                            message_text = message_text + "\n " + ac.attachments[0].slice(6, -2).replace("@(fields.image_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/image/universal/")
                                .replace("@(fields.comic_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/comic/");
    
                        }
                        curr_block_messages.push(message_text);
                    })
    
                    if (lang){
                        message.forEach(ac => {
                            if (curr_flow.localization[lang][ac.uuid]){
                                message_text = curr_flow.localization[lang][ac.uuid].text[0];
                            } else {
                                message_text = ac.text;
                            }
                            
                        if (ac.attachments.length > 0) {
                            message_text = message_text + "\n " + ac.attachments[0].slice(6, -2).replace("@(fields.image_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/image/universal/")
                                .replace("@(fields.comic_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/comic/");
    
                        }
                            curr_block_messages_lang.push(message_text_lang);
                        })
                    }

                }
            }






        } else {
            go_on = false;
            console.log("this is not a send message node")
            next_node = null;
        }


    } while (go_on);

 
    for (var m = 0; m < curr_block_messages.length; m++) {
        if (curr_block_messages.length == 1) {
            curr_block["Message"] = curr_block_messages[0];
        } else {
            curr_block["Message " + (m + 1)] = curr_block_messages[m];
        }
    }

    curr_block["Interaction message"] = interaction_message;

    for (var n = 0; n < curr_block_no_messages.length; n++) {
        if (curr_block_no_messages.length == 1) {
            curr_block["Message for negative answer"] = curr_block_no_messages[0];
        } else {
            curr_block["Message for negative answer " + (n + 1)] = curr_block_no_messages[n];
        }
    }

    flow_content["Default introduction"] = curr_block;

    if (lang){
        for (var m = 0; m < curr_block_messages_lang.length; m++) {
            if (curr_block_messages_lang.length == 1) {
                curr_block_lang["Message"] = curr_block_messages_lang[0];
            } else {
                curr_block_lang["Message " + (m + 1)] = curr_block_messages_lang[m];
            }
        }
    
        curr_block_lang["Interaction message"] = interaction_message_lang;
    
        for (var n = 0; n < curr_block_no_messages_lang.length; n++) {
            if (curr_block_no_messages_lang.length == 1) {
                curr_block_lang["Message for negative answer"] = curr_block_no_messages_lang[0];
            } else {
                curr_block_lang["Message for negative answer " + (n + 1)] = curr_block_no_messages_lang[n];
            }
        }
    
        flow_content_lang["Default introduction"] = curr_block_lang;
    }


    return next_node


}


/////////////////////////////////////////////////////////////
// List of tips

function create_list_of_tips_block(toolkit_node,lang) {
    var r_exp = new RegExp(`\\bn\\b`, "i");
    var curr_block = {};

    if (lang){
        var curr_block_lang = {};
    }


    var curr_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == toolkit_node.exits[0].destination_uuid) })[0];

    var parts_of_text = curr_node.actions[0].text.split("1. ");
    curr_block["Message"] = parts_of_text[0];

    var tips = parts_of_text[1].split("\n").filter(function (i) { return i });
    tips.pop();

    if (lang){
        if (curr_flow.localization[lang][curr_node.actions[0].uuid]){
            var parts_of_text_lang = curr_flow.localization[lang][curr_node.actions[0].uuid].text[0].split("1. ");
        }else {
            var parts_of_text_lang = curr_node.actions[0].text.split("1. ");
        }
        
        curr_block_lang["Message"] = parts_of_text_lang[0];
        var tips_lang = parts_of_text_lang[1].split("\n").filter(function (i) { return i });

        tips_lang.pop();
    }


    var wfr_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == curr_node.exits[0].destination_uuid) })[0];

    for (var t = 0; t < tips.length; t++) {
        var r_exp_tip = new RegExp(`\\b${t + 1}\\b`, "i");

        var curr_opt_messages = [];
        if (lang){
            var curr_opt_messages_lang = [];
        }

        var tip_categ_id = wfr_node.router.cases.filter(function (ca) { return (r_exp_tip.test(ca.arguments[0])) })[0].category_uuid;
        var tip_categ = wfr_node.router.categories.filter(function (cat) { return (cat.uuid == tip_categ_id) })[0];
        var tip_node_id = wfr_node.exits.filter(function (ex) { return (ex.uuid == tip_categ.exit_uuid) })[0].destination_uuid;
        var tip_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == tip_node_id) })[0];


        var curr_opt = {};
        if (lang){
            var curr_opt_lang = {};
        }

        if (tip_node.hasOwnProperty('router') && tip_node.router.operand == "@fields.gender") {
            curr_node = tip_node;
            var gender_block = {};
            if (lang){
                gender_block_lang = {};
            }

            var father_category = curr_node.router.categories.filter(function (cat) { return (cat.name.toLowerCase() == "man") })[0];
            var father_node_id = curr_node.exits.filter(function (ex) { return (ex.uuid == father_category.exit_uuid) })[0].destination_uuid;
            var father_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == father_node_id) })[0];
            gender_block["Message for fathers"] = father_node.actions[0].text;
            if (lang){
                if(curr_flow.localization[lang][father_node.actions[0].uuid]){
                    gender_block_lang["Message for fathers"] = curr_flow.localization[lang][father_node.actions[0].uuid].text[0];
                }else {
                    gender_block_lang["Message for fathers"] = father_node.actions[0].text; 
                }
            }


            var mother_category = curr_node.router.categories.filter(function (cat) { return (cat.name.toLowerCase() == "woman") })[0];
            var mother_node_id = curr_node.exits.filter(function (ex) { return (ex.uuid == mother_category.exit_uuid) })[0].destination_uuid;
            var mother_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == mother_node_id) })[0];
            gender_block["Message for mothers"] = mother_node.actions[0].text;

            if (lang){
                if(curr_flow.localization[lang][mother_node.actions[0].uuid]){
                    gender_block_lang["Message for mothers"] = curr_flow.localization[lang][mother_node.actions[0].uuid].text[0];
                }else {
                    gender_block_lang["Message for mothers"] = mother_node.actions[0].text; 
                }
            }

            var default_category = curr_node.router.categories.filter(function (cat) { return (cat.name.toLowerCase() == "other") })[0];
            var default_node_id = curr_node.exits.filter(function (ex) { return (ex.uuid == default_category.exit_uuid) })[0].destination_uuid;
            var default_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == default_node_id) })[0];
            gender_block["Default message"] = default_node.actions[0].text;

            if (lang){
                if(curr_flow.localization[lang][default_node.actions[0].uuid]){
                    gender_block_lang["Default message"] = curr_flow.localization[lang][default_node.actions[0].uuid].text[0];
                }else {
                    gender_block_lang["Default message"] = default_node.actions[0].text; 
                }
            }


            next_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == default_node.exits[0].destination_uuid) });
            curr_opt["Specific content for fathers and mothers"] = gender_block;

            if (lang){
                curr_opt_lang["Specific content for fathers and mothers"] = gender_block_lang;
            }

        } else {
            var tip_text = tip_node.actions[0].text;

            if(lang){
                if(curr_flow.localization[lang][tip_node.actions[0].uuid]){
                    var tip_text_lang = curr_flow.localization[lang][tip_node.actions[0].uuid].text[0];
                }else{
                    var tip_text_lang = tip_node.actions[0].text;  
                }
            }


            if (tip_node.actions[0].attachments.length > 0) {
                tip_text = tip_text + "\n " + tip_node.actions[0].attachments[0].slice(6, -2).replace("@(fields.image_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/image/universal/")
                    .replace("@(fields.comic_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/comic/")
                if (lang){
                    tip_text_lang = tip_text_lang + "\n " + tip_node.actions[0].attachments[0].slice(6, -2).replace("@(fields.image_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/image/universal/")
                    .replace("@(fields.comic_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/comic/")
        
                }
            };
            curr_opt_messages.push(tip_text);
            if (lang){
                curr_opt_messages_lang.push(tip_text_lang);
            }

            var next_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == tip_node.exits[0].destination_uuid) })[0];

            while (!next_node.actions[0].text.startsWith("Please select another number")) {
                let tip_text = next_node.actions[0].text;

                if(lang){
                    if(curr_flow.localization[lang][next_node.actions[0].uuid]){
                        var tip_text_lang = curr_flow.localization[lang][next_node.actions[0].uuid].text[0];
                    }else{
                        var tip_text_lang = next_node.actions[0].text;  
                    }
                }
                if (next_node.actions[0].attachments.length > 0) {
                    tip_text = tip_text + "\n " + next_node.actions[0].attachments[0].slice(6, -2).replace("@(fields.image_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/image/universal/")
                        .replace("@(fields.comic_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/comic/")
                    
                    if (lang){
                        tip_text_lang = tip_text_lang + "\n " + next_node.actions[0].attachments[0].slice(6, -2).replace("@(fields.image_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/image/universal/")
                        .replace("@(fields.comic_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/comic/")
                    
                    }
                };

                curr_opt_messages.push(tip_text);
                if (lang){
                    curr_opt_messages_lang.push(tip_text_lang);
                }

                next_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == next_node.exits[0].destination_uuid) })[0];
            }
            for (var m = 0; m < curr_opt_messages.length; m++) {
                if (curr_opt_messages.length == 1) {
                    curr_opt["Message"] = curr_opt_messages[0];
                } else {
                    curr_opt["Message " + (m + 1)] = curr_opt_messages[m];
                }
            }

            if (lang){
                for (var m = 0; m < curr_opt_messages_lang.length; m++) {
                    if (curr_opt_messages_lang.length == 1) {
                        curr_opt_lang["Message"] = curr_opt_messages_lang[0];
                    } else {
                        curr_opt_lang["Message " + (m + 1)] = curr_opt_messages_lang[m];
                    }
                }
            }


        }







        var curr_opt_name = "";
        if (t == 0) { curr_opt_name = tips[t] } else { curr_opt_name = tips[t].slice(3) };
        curr_block["Option " + (t + 1) + ": " + curr_opt_name] = curr_opt;

        if (lang){
            var curr_opt_name_lang = "";
            if (t == 0) { curr_opt_name_lang = tips_lang[t] } else { curr_opt_name_lang = tips_lang[t].slice(3) };
            curr_block_lang["Option " + (t + 1) + ": " + curr_opt_name_lang] = curr_opt_lang;
        }

      




    }

    curr_block["Message for choosing another tip"] = next_node.actions[0].text.split("1. ")[0];

    if (lang){
        if(curr_flow.localization[lang][next_node.actions[0].uuid]){
            curr_block_lang["Message for choosing another tip"] = curr_flow.localization[lang][next_node.actions[0].uuid].text[0].split("1. ")[0];
        }else{
            curr_block_lang["Message for choosing another tip"] = next_node.actions[0].text.split("1. ")[0];
        }
        
    }


    var new_node_categ_id = wfr_node.router.cases.filter(function (ca) { return (r_exp.test(ca.arguments[0])) })[0].category_uuid;
    var new_node_categ = wfr_node.router.categories.filter(function (cat) { return (cat.uuid == new_node_categ_id) })[0];
    var new_node_id = wfr_node.exits.filter(function (ex) { return (ex.uuid == new_node_categ.exit_uuid) })[0].destination_uuid;
    var new_block_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == new_node_id) })[0];

    flow_content["List of tips"] = curr_block;

    if (lang){
        flow_content_lang["List of tips"] = curr_block_lang;
    }

    return new_block_node

}

//////////////////////////////////////////////////////////////
// Intro for timed

function create_intro_for_timed_block(skill_node,lang) {
    var r_exp_yes = new RegExp(`\\byes\\b`, "i");
    var r_exp_no = new RegExp(`\\bno\\b`, "i");
    var curr_block = {};
    var curr_block_messages = [];
    if (lang){
        var curr_block_lang = {};
        var curr_block_messages_lang = [];
    }

    

    var toolkit_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == skill_node.exits[0].destination_uuid) })[0];
    var curr_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == toolkit_node.exits[0].destination_uuid) })[0];


    do {
        var message = curr_node.actions.filter(function (ac) { return (ac.type == "send_msg") });

        if (message.length > 0) {
            message.forEach(ac => {
                let message_text = ac.text;
                if (ac.attachments.length > 0) {
                    message_text = message_text + "\n " + ac.attachments[0].slice(6, -2).replace("@(fields.image_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/image/universal/")
                        .replace("@(fields.comic_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/comic/");

                }
                curr_block_messages.push(message_text);
            })

            if (lang){
                message.forEach(ac => {
                    if (curr_flow.localization[lang][ac.uuid]){
                        message_text_lang = curr_flow.localization[lang][ac.uuid].text[0];
                    } else {
                        message_text_lang = ac.text;
                    }
                    
                if (ac.attachments.length > 0) {
                    message_text_lang = message_text_lang + "\n " + ac.attachments[0].slice(6, -2).replace("@(fields.image_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/image/universal/")
                        .replace("@(fields.comic_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/" + deployment + "/resourceGroup/comic/");

                }
                    curr_block_messages_lang.push(message_text_lang);
                })
            }


            var next_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == curr_node.exits[0].destination_uuid) });
            if (next_node.length == 0) {
                console.log("error fine flow")
                go_on = false;

            } else {
                if (next_node[0].hasOwnProperty('router')) {
                    go_on = false;
                    if (next_node[0].router.type == "switch" && next_node[0].router.operand == "@fields.toolkit") {
                        var not_compl_cat = next_node[0].router.categories.filter(function (cat) { return (cat.name == "Other") })[0];
                        var not_compl_id = next_node[0].exits.filter(function (ex) { return (ex.uuid == not_compl_cat.exit_uuid) })[0].destination_uuid;
                        var not_compl_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == not_compl_id) })[0];
                        var not_completed_msg = not_compl_node.actions[0].text;

                        var already_compl_cat = next_node[0].router.categories.filter(function (cat) { return (cat.name != "Other") })[0];
                        var already_compl_id = next_node[0].exits.filter(function (ex) { return (ex.uuid == already_compl_cat.exit_uuid) })[0].destination_uuid;
                        var already_compl_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == already_compl_id) })[0];
                        var already_completed_msg = already_compl_node.actions[0].text;

                        if (lang){
                            if(curr_flow.localization[lang][not_compl_node.actions[0].uuid]){
                                var not_completed_msg_lang = curr_flow.localization[lang][not_compl_node.actions[0].uuid].text[0];
                            }else{
                                var not_completed_msg_lang = not_compl_node.actions[0].text;
                            }

                            if(curr_flow.localization[lang][already_compl_node.actions[0].uuid]){
                                var already_completed_msg_lang = curr_flow.localization[lang][already_compl_node.actions[0].uuid].text[0];
                            }else{
                                var already_completed_msg_lang = already_compl_node.actions[0].text;
                            }
                        }

                        var wfr_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == already_compl_node.exits[0].destination_uuid) })[0];

                    } else {
                        console.log("error this is not a split by toolkit")
                    }



                } else {
                    go_on = true;

                    curr_node = next_node[0];



                }



            }

        }
        else {
            if (curr_node.hasOwnProperty('router') && curr_node.router.operand == "@fields.gender") {
                go_on = false;
                var gender_block = {};

                var father_category = curr_node.router.categories.filter(function (cat) { return (cat.name.toLowerCase() == "man") })[0];
                var father_node_id = curr_node.exits.filter(function (ex) { return (ex.uuid == father_category.exit_uuid) })[0].destination_uuid;
                var father_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == father_node_id) })[0];
                gender_block["Message for fathers"] = father_node.actions[0].text;
                if (lang){
                    if(curr_flow.localization[lang][father_node.actions[0].uuid]){
                        gender_block_lang["Message for fathers"] = curr_flow.localization[lang][father_node.actions[0].uuid].text[0];
                    }else {
                        gender_block_lang["Message for fathers"] = father_node.actions[0].text; 
                    }
                }

                var mother_category = curr_node.router.categories.filter(function (cat) { return (cat.name.toLowerCase() == "woman") })[0];
                var mother_node_id = curr_node.exits.filter(function (ex) { return (ex.uuid == mother_category.exit_uuid) })[0].destination_uuid;
                var mother_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == mother_node_id) })[0];
                gender_block["Message for mothers"] = mother_node.actions[0].text;
                if (lang){
                    if(curr_flow.localization[lang][mother_node.actions[0].uuid]){
                        gender_block_lang["Message for mothers"] = curr_flow.localization[lang][mother_node.actions[0].uuid].text[0];
                    }else {
                        gender_block_lang["Message for mothers"] = mother_node.actions[0].text; 
                    }
                }

                var default_category = curr_node.router.categories.filter(function (cat) { return (cat.name.toLowerCase() == "other") })[0];
                var default_node_id = curr_node.exits.filter(function (ex) { return (ex.uuid == default_category.exit_uuid) })[0].destination_uuid;
                var default_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == default_node_id) })[0];
                gender_block["Default message"] = default_node.actions[0].text;
                if (lang){
                    if(curr_flow.localization[lang][default_node.actions[0].uuid]){
                        gender_block_lang["Default Message"] = curr_flow.localization[lang][default_node.actions[0].uuid].text[0];
                    }else {
                        gender_block_lang["Default Message"] = default_node.actions[0].text; 
                    }
                }


                curr_block["Specific content for fathers and mothers"] = gender_block;
                if (lang){
                    curr_block_lang["Specific content for fathers and mothers"] = gender_block_lang; 
                }
                next_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == default_node.exits[0].destination_uuid) });

                if (next_node[0].hasOwnProperty('router')) {

                    if (next_node[0].router.type == "switch" && next_node[0].router.operand == "@fields.toolkit") {
                        var not_compl_cat = next_node[0].router.categories.filter(function (cat) { return (cat.name == "Other") })[0];
                        var not_compl_id = next_node[0].exits.filter(function (ex) { return (ex.uuid == not_compl_cat.exit_uuid) })[0].destination_uuid;
                        var not_compl_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == not_compl_id) })[0];
                        var not_completed_msg = not_compl_node.actions[0].text;

                        var already_compl_cat = next_node[0].router.categories.filter(function (cat) { return (cat.name != "Other") })[0];
                        var already_compl_id = next_node[0].exits.filter(function (ex) { return (ex.uuid == already_compl_cat.exit_uuid) })[0].destination_uuid;
                        var already_compl_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == already_compl_id) })[0];
                        var already_completed_msg = already_compl_node.actions[0].text;

                        if (lang){
                            if(curr_flow.localization[lang][not_compl_node.actions[0].uuid]){
                                var not_completed_msg_lang = curr_flow.localization[lang][not_compl_node.actions[0].uuid].text[0];
                            }else{
                                var not_completed_msg_lang = not_compl_node.actions[0].text;
                            }

                            if(curr_flow.localization[lang][already_compl_node.actions[0].uuid]){
                                var already_completed_msg_lang = curr_flow.localization[lang][already_compl_node.actions[0].uuid].text[0];
                            }else{
                                var already_completed_msg_lang = already_compl_node.actions[0].text;
                            }
                        }

                        var wfr_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == already_compl_node.exits[0].destination_uuid) })[0];
                    }


                }

            } else {
                go_on = false;
                console.log("this is not a send message node")
                next_node = null;
            }

        }
    }
    while (go_on);

    var yes_categ_id = wfr_node.router.cases.filter(function (ca) { return (r_exp_yes.test(ca.arguments[0])) })[0].category_uuid;
    var yes_categ = wfr_node.router.categories.filter(function (cat) { return (cat.uuid == yes_categ_id) })[0];
    var yes_node_id = wfr_node.exits.filter(function (ex) { return (ex.uuid == yes_categ.exit_uuid) })[0].destination_uuid;

    var yes_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == yes_node_id) })[0];
    while (yes_node.actions[0].type != "enter_flow") {
        yes_node_id = yes_node.exits[0].destination_uuid;
        yes_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == yes_node_id) })[0];
    }



    var no_categ_id = wfr_node.router.cases.filter(function (ca) { return (r_exp_no.test(ca.arguments[0])) })[0].category_uuid;
    var no_categ = wfr_node.router.categories.filter(function (cat) { return (cat.uuid == no_categ_id) })[0];
    var no_node_id = wfr_node.exits.filter(function (ex) { return (ex.uuid == no_categ.exit_uuid) })[0].destination_uuid;
    var no_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == no_node_id) })[0];


    var curr_block_no_messages = loop_message_nodes(no_node, "null")[0];
    if (lang){
        var curr_block_no_messages_lang = loop_message_nodes(no_node, "null",lang)[0];
    }


    for (var m = 0; m < curr_block_messages.length; m++) {
        if (curr_block_messages.length == 1) {
            curr_block["Message"] = curr_block_messages[0];
        } else {
            curr_block["Message " + (m + 1)] = curr_block_messages[m];
        }
    }
    curr_block["Interaction message"] = not_completed_msg;
    curr_block["Interaction message if already completed"] = already_completed_msg;

    for (var n = 0; n < curr_block_no_messages.length; n++) {
        if (curr_block_no_messages.length == 1) {
            curr_block["Message for negative answer"] = curr_block_no_messages[0];
        } else {
            curr_block["Message for negative answer " + (n + 1)] = curr_block_no_messages[n];
        }
    }

    /*
    curr_block["Corresponding flow"] = {};
    curr_block["Corresponding flow"]["Name"] = yes_node.actions[0].flow.name;
    curr_block["Corresponding flow"]["Id"] = yes_node.actions[0].flow.uuid;
*/

    flow_content["Introduction for timed content"] = curr_block;


    if (lang){
        for (var m = 0; m < curr_block_messages_lang.length; m++) {
            if (curr_block_messages_lang.length == 1) {
                curr_block_lang["Message"] = curr_block_messages_lang[0];
            } else {
                curr_block_lang["Message " + (m + 1)] = curr_block_messages_lang[m];
            }
        }
        curr_block_lang["Interaction message"] = not_completed_msg_lang;
        curr_block_lang["Interaction message if already completed"] = already_completed_msg_lang;
    
        for (var n = 0; n < curr_block_no_messages_lang.length; n++) {
            if (curr_block_no_messages_lang.length == 1) {
                curr_block_lang["Message for negative answer"] = curr_block_no_messages_lang[0];
            } else {
                curr_block_lang["Message for negative answer " + (n + 1)] = curr_block_no_messages_lang[n];
            }
        }
    
    
        flow_content_lang["Introduction for timed content"] = curr_block_lang;
    }
}


/////////////////////////////////////////////////////////////////////
// age splits
function create_age_split_block(split_node,lang, type) {

    //if (!split_node.hasOwnProperty('router') || split_node.router.type != "switch" || !(split_node.router.operand == "@fields.age_group_for_tips" || split_node.router.operand == "@fields.chosen_difficult_age" || split_node.router.operand == "parent_baby" || split_node.router.operand == "parent_young_child" || split_node.router.operand == "parent_teenager")) {
    //    error("the first node is not a split by age")
    //}

    var curr_block = {};
    if (lang){
        curr_block_lang = {};
    }


    if (type == 1) {

        var next_nodes_ids = [];
        for (var ca = 0; ca < split_node.router.categories.length; ca++) {
            next_nodes_ids.push(split_node.exits.filter(function (ex) { return (ex.uuid == split_node.router.categories[ca].exit_uuid) })[0].destination_uuid);
        }
        var next_node = null;
        var distinct_next_nodes_ids = [...new Set(next_nodes_ids)];

        while (distinct_next_nodes_ids.length == next_nodes_ids.length && next_nodes_ids.filter(function (id) { return (id == null) }).length == 0) {

            curr_nodes_ids = next_nodes_ids;
            next_nodes_ids = [];
            curr_nodes_ids.forEach(id => {
                next_nodes_ids.push(curr_flow.nodes.filter(function (nd) { return (nd.uuid == id) })[0].exits[0].destination_uuid);
            })
            distinct_next_nodes_ids = [...new Set(next_nodes_ids)];
        }

        if (next_nodes_ids.filter(function (id) { return (id == null) }).length != 0) {
            stop_node_id = "null"
        } else {
            var count = next_nodes_ids =>
                next_nodes_ids.reduce((a, b) => ({
                    ...a,
                    [b]: (a[b] || 0) + 1
                }), {}) // don't forget to initialize the accumulator

            var duplicates = dict =>
                Object.keys(dict).filter((a) => dict[a] > 1)

            stop_node_id = duplicates(count(next_nodes_ids));
            next_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == stop_node_id) })[0];
        }

        split_node.router.categories.forEach(el => {
            var msg_node_id = split_node.exits.filter(function (ex) { return (ex.uuid == el.exit_uuid) })[0].destination_uuid;
            msg_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == msg_node_id) })[0];
            var curr_age_messages = loop_message_nodes(msg_node, stop_node_id)[0];
            var curr_age_obj_msg = {};

            for (let n = 0; n < curr_age_messages.length; n++) {
                if (curr_age_messages.length == 1) {
                    curr_age_obj_msg["Message"] = curr_age_messages[0];
                } else {
                    curr_age_obj_msg["Message " + (n + 1)] = curr_age_messages[n];
                }
            }

            if (el.name == "Other") {
                curr_block["Other age groups"] = curr_age_obj_msg;

            } else {
                if (el.name.toLowerCase().includes("baby")) {
                    var age_name = "Baby";
                } else if (el.name.toLowerCase().includes("teen")) {
                    var age_name = "Teen";
                } else if (el.name.toLowerCase().includes("young") || el.name.toLowerCase().includes("child")) {
                    var age_name = "Young child";
                }
                curr_block[age_name] = curr_age_obj_msg;
            }

            if (lang){
                var curr_age_messages_lang = loop_message_nodes(msg_node, stop_node_id,lang)[0];
                var curr_age_obj_msg_lang = {};

                for (let n = 0; n < curr_age_messages_lang.length; n++) {
                    if (curr_age_messages_lang.length == 1) {
                        curr_age_obj_msg_lang["Message"] = curr_age_messages_lang[0];
                    } else {
                        curr_age_obj_msg_lang["Message " + (n + 1)] = curr_age_messages_lang[n];
                    }
                }
    
                if (el.name == "Other") {
                    curr_block_lang["Other age groups"] = curr_age_obj_msg_lang;
    
                } else {
                    if (el.name.toLowerCase().includes("baby")) {
                        var age_name = "Baby";
                    } else if (el.name.toLowerCase().includes("teen")) {
                        var age_name = "Teen";
                    } else if (el.name.toLowerCase().includes("young") || el.name.toLowerCase().includes("child")) {
                        var age_name = "Young child";
                    }
                    curr_block_lang[age_name] = curr_age_obj_msg_lang;
                }
                
            }
            

        })
        if (split_node.router.categories.length >= 3 && curr_block.hasOwnProperty("Other age groups")) {
            var cloned_other_cat = Object.assign({}, curr_block["Other age groups"]);
            delete curr_block["Other age groups"];
            if (!curr_block.hasOwnProperty("Teen")) {
                curr_block["Teen"] = cloned_other_cat;
            } else if (!curr_block.hasOwnProperty("Baby")) {
                curr_block["Baby"] = cloned_other_cat;
            } else if (!curr_block.hasOwnProperty("Young child")) {
                curr_block["Young child"] = cloned_other_cat;

            }

            if (lang){
                var cloned_other_cat_lang = Object.assign({}, curr_block_lang["Other age groups"]);
                delete curr_block_lang["Other age groups"];
                if (!curr_block_lang.hasOwnProperty("Teen")) {
                    curr_block_lang["Teen"] = cloned_other_cat_lang;
                } else if (!curr_block_lang.hasOwnProperty("Baby")) {
                    curr_block_lang["Baby"] = cloned_other_cat_lang;
                } else if (!curr_block_lang.hasOwnProperty("Young child")) {
                    curr_block_lang["Young child"] = cloned_other_cat_lang;

                }
            }
        }

    }
    else if (type == 2) {

        var cat_true = split_node.router.categories.filter(function (cat) { return (cat.name == "True") })[0];
        var msg_node_id = split_node.exits.filter(function (ex) { return (ex.uuid == cat_true.exit_uuid) })[0].destination_uuid;
        msg_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == msg_node_id) })[0];
        var age_string = split_node.router.operand.replace("@fields.parent_", "");
        curr_block["Message for " + age_string] = msg_node.actions[0].text;
        curr_block["Message for other age groups"] = "none";

        if (lang){
            if (curr_flow.localization[lang][msg_node.actions[0].uuid]){
                curr_block_lang["Message for " + age_string] = curr_flow.localization[lang][msg_node.actions[0].uuid].text[0];
            }else{
                curr_block_lang["Message for " + age_string] = msg_node.actions[0].text;

            }
            
            curr_block_lang["Message for other age groups"] = "none";
        }
        next_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == msg_node.exits[0].destination_uuid) })[0];

    }
    else if (type == 3) {
        var next_node = {};
        split_node.router.categories.forEach(el => {
            var msg_node_id = split_node.exits.filter(function (ex) { return (ex.uuid == el.exit_uuid) })[0].destination_uuid;
            msg_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == msg_node_id) })[0];
            if (el.name == "Other") {
                curr_block["Message for other age groups"] = msg_node.actions[0].text;
                if (lang){         
                    if (curr_flow.localization[lang][msg_node.actions[0].uuid]){
                        curr_block_lang["Message for other age groups"] = curr_flow.localization[lang][msg_node.actions[0].uuid].text[0];
                    }else{
                        curr_block_lang["Message for other age groups"] = msg_node.actions[0].text;     
                    }
                }
    
            } else {
                curr_block["Message for " + el.name] = msg_node.actions[0].text;
                if (lang){         
                    if (curr_flow.localization[lang][msg_node.actions[0].uuid]){
                        curr_block_lang["Message for " + el.name] = curr_flow.localization[lang][msg_node.actions[0].uuid].text[0];
                    }else{
                        curr_block_lang["Message for " + el.name] = msg_node.actions[0].text;     
                    }
                }
            }


            next_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == msg_node.exits[0].destination_uuid) })[0];
        })

    }
    else if (type == 4) {

    }

    curr_block["Technical info"] = {};
    curr_block["Technical info"]["Variable"] = split_node.router.operand;
    curr_block["Technical info"]["Type of split"] = type.toString();

    flow_content["Based on age group"] = curr_block;

    if (lang){
        flow_content_lang["Based on age group"] = curr_block_lang;
    }
    return next_node
}




///////////////////////////////////////////////////////////////////////////
/// multiple choice WFR note


function create_multiple_choice_block(curr_node,lang) {
    var curr_block = {};

    var messages_and_question = loop_message_nodes(curr_node, "null");
    var messages_to_send = messages_and_question[0];
    var wfr_node = messages_and_question[1];
    var question_node = messages_and_question[2];
    messages_to_send.push(question_node.actions[0].text);

    for (var n = 0; n < messages_to_send.length; n++) {
        if (messages_to_send.length == 1) {
            curr_block["Message"] = messages_to_send[0];
        } else {
            curr_block["Message " + (n + 1)] = messages_to_send[n];
        }
    }

    var options = question_node.actions[0].quick_replies;

    for (var op = 0; op < option.length; op++) {
        var curr_option = {};
        curr_block["Option " + op + 1 + ": " + options[op]] = curr_option;
    }

    var nodes_ids_options = [];

    options.forEach(opt => {
        for (var c = 0; c < wfr_node.router.cases.length; c++) {
            if (wfr_node.router.cases[c].type == "has_any_word") {

                arg_list = wfr_node.router.cases[c].arguments[0].split(/[\s,]+/).filter(function (i) { return i });
                old_test = arg_list.join(",") + ",";
                new_test = arg_list.join(",") + ",";

                for (var ar = 0; ar < arg_list.length; ar++) {

                    arg = arg_list[ar];
                    r_exp = new RegExp(`\\b${arg}\\b`, "i");

                    for (var qr = 0; qr < options.length; qr++) {
                        quick_reply = options[qr];

                        if (r_exp.test(quick_reply)) {
                            var corr_cat_id = wfr_node.router.cases[c].category_uuid;
                            var corr_cat = wfr_node.router.categories.filter(function (cat) { return (cat.uuid == corr_cat_id) })[0];

                            nodes_ids_options.push(wfr_node.exits.filter(function (ex) { return (ex.uuid == corr_cat.exit_uuid) })[0].destination_uuid);

                        }
                    }
                }



            }
            else { console.log("other test") }
        }
    });
    var next_node = null;
    nodes_ids_options = [...new Set(nodes_ids_options)];
    var next_nodes_ids = nodes_ids_options;

    var distinct_next_nodes_ids = next_nodes_ids;

    while (distinct_next_nodes_ids.length == next_nodes_ids.length && next_nodes_ids.filter(function (id) { return (id == null) }).length == 0) {

        curr_nodes_ids = next_nodes_ids;
        next_nodes_ids = [];
        curr_nodes_ids.forEach(id => {
            next_nodes_ids.push(curr_flow.nodes.filter(function (nd) { return (nd.uuid == id) })[0].exits[0].destination_uuid);
        })
        distinct_next_nodes_ids = [...new Set(next_nodes_ids)];
    }

    if (next_nodes_ids.filter(function (id) { return (id == null) }).length != 0) {
        stop_node_id = "null"
    } else {
        var count = next_nodes_ids =>
            next_nodes_ids.reduce((a, b) => ({
                ...a,
                [b]: (a[b] || 0) + 1
            }), {}) // don't forget to initialize the accumulator

        var duplicates = dict =>
            Object.keys(dict).filter((a) => dict[a] > 1)

        stop_node_id = duplicates(count(next_nodes_ids));
        next_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == stop_node_id) })[0];
    }

    nodes_ids_options.forEach(opt_node => {


    })

    flow_content["Multiple choice"] = curr_block;

    return next_node

}



//////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
// gender splits
function create_gender_split_block(curr_node,lang) {

    var curr_block = {};
    var next_node = null;

    if (curr_node.hasOwnProperty('router') && curr_node.router.operand == "@fields.gender") {
        var father_category = curr_node.router.categories.filter(function (cat) { return (cat.name.toLowerCase() == "man") })[0];
        var father_node_id = curr_node.exits.filter(function (ex) { return (ex.uuid == father_category.exit_uuid) })[0].destination_uuid;
        var father_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == father_node_id) })[0];
        curr_block["Message for fathers"] = father_node.actions[0].text;

        var mother_category = curr_node.router.categories.filter(function (cat) { return (cat.name.toLowerCase() == "woman") })[0];
        var mother_node_id = curr_node.exits.filter(function (ex) { return (ex.uuid == mother_category.exit_uuid) })[0].destination_uuid;
        var mother_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == mother_node_id) })[0];
        curr_block["Message for mothers"] = mother_node.actions[0].text;

        var default_category = curr_node.router.categories.filter(function (cat) { return (cat.name.toLowerCase() == "other") })[0];
        var default_node_id = curr_node.exits.filter(function (ex) { return (ex.uuid == default_category.exit_uuid) })[0].destination_uuid;
        var default_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == default_node_id) })[0];
        curr_block["Default message"] = default_node.actions[0].text;

        next_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == default_node.exits[0].destination_uuid) })[0];

    } else {
        console.log("error no gender split")
    }


    flow_content["Specific content for fathers and mothers"] = curr_block;
    return next_node
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
function create_checkin_positive_block(question_node,lang) {
    var r_exp_yes = new RegExp(`\\byes\\b`, "i");
    var r_exp_great = new RegExp(`\\bgreat\\b`, "i");
    var curr_block = {};
    var checkin_msg = question_node.actions[0].text + " (Yes/No)";
    curr_block["Check-in message"] = checkin_msg;

    if (lang){
        var curr_block_lang = {};
        if (curr_flow.localization[lang][question_node.actions[0].uuid]){
            var checkin_msg_lang = curr_flow.localization[lang][question_node.actions[0].uuid].text[0] + " (Yes/No)";
        }else{
            var checkin_msg_lang = question_node.actions[0].text + " (Yes/No)";
        }
        

        curr_block_lang["Check-in message"] = checkin_msg_lang;
    }


   



    let wfr_node = curr_flow.nodes.filter(nd => nd.uuid == question_node.exits[0].destination_uuid)[0];
    var positive_categ_id = wfr_node.router.cases.filter(function (ca) { return (r_exp_yes.test(ca.arguments[0])) })[0].category_uuid;
    var positive_categ = wfr_node.router.categories.filter(function (cat) { return (cat.uuid == positive_categ_id) })[0];
    var positive_node_id = wfr_node.exits.filter(function (ex) { return (ex.uuid == positive_categ.exit_uuid) })[0].destination_uuid;

    var positive_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == positive_node_id) })[0];
    if (positive_node.actions.length == 1) {
        if (positive_node.actions[0].type == "send_msg") {
            let how_msg = positive_node.actions[0].text + " (Great/Neutral/Bad)"
            curr_block["Positive follow on question"] = how_msg;

            if (lang){
                if(curr_flow.localization[lang][positive_node.actions[0].uuid]){
                    var how_msg_lang = curr_flow.localization[lang][positive_node.actions[0].uuid].text[0] + " (Great/Neutral/Bad)"
                }else{
                    var how_msg_lang = positive_node.actions[0].text + " (Great/Neutral/Bad)"
                }
                
                curr_block_lang["Positive follow on question"] = how_msg_lang;
            }


        } else if (positive_node.actions[0].type == "set_contact_field") {
            positive_node_id = positive_node.exits[0].destination_uuid;
            positive_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == positive_node_id) })[0];
            let how_msg = positive_node.actions[0].text + " (Great/Neutral/Bad)"
            curr_block["Positive follow on question"] = how_msg;

            if (lang){
                if(curr_flow.localization[lang][positive_node.actions[0].uuid]){
                    var how_msg_lang = curr_flow.localization[lang][positive_node.actions[0].uuid].text[0] + " (Great/Neutral/Bad)"
                }else{
                    var how_msg_lang = positive_node.actions[0].text + " (Great/Neutral/Bad)"
                }
                
                curr_block_lang["Positive follow on question"] = how_msg_lang;
            }
        }
    } else if (positive_node.actions.length == 2) {
        let send_msg_action = positive_node.actions.filter(ac => ac.type == "send_msg")[0];
        let how_msg = send_msg_action.text + " (Great/Neutral/Bad)"
        curr_block["Positive follow on question"] = how_msg;

        if (lang){
            if(curr_flow.localization[lang][positive_node.actions[0].uuid]){
                var how_msg_lang = curr_flow.localization[lang][send_msg_action.uuid].text[0] + " (Great/Neutral/Bad)"
            }else{
                var how_msg_lang = send_msg_action.text + " (Great/Neutral/Bad)"
            }
            
            curr_block_lang["Positive follow on question"] = how_msg_lang;
        }
    } else {
        console.error("0 or more than 2 actions")
    }

    let next_node_id = positive_node.exits[0].destination_uuid;
    let next_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == next_node_id) })[0];
    while (!next_node.hasOwnProperty("router")) {
        next_node_id = next_node.exits[0].destination_uuid;
        next_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == next_node_id) })[0];
    }

    let great_categ_id = next_node.router.cases.filter(function (ca) { return (r_exp_great.test(ca.arguments[0])) })[0].category_uuid;
    let great_categ = next_node.router.categories.filter(function (cat) { return (cat.uuid == great_categ_id) })[0];
    let great_node_id = next_node.exits.filter(function (ex) { return (ex.uuid == great_categ.exit_uuid) })[0].destination_uuid;
    let great_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == great_node_id) })[0];

    curr_block["Great response message"] = great_node.actions[0].text;
    flow_content["Positive pathway"] = curr_block;

    if (lang){
        if(curr_flow.localization[lang][great_node.actions[0].uuid]){
            curr_block_lang["Great response message"] = curr_flow.localization[lang][great_node.actions[0].uuid].text[0];
        }else{
            curr_block_lang["Great response message"] = great_node.actions[0].text;
        }
        
        flow_content_lang["Positive pathway"] = curr_block_lang;
    }

    
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
function create_checkin_challenge_block(question_node,lang) {
    var r_exp_no = new RegExp(`\\bno\\b`, "i");
    var curr_block = {};
    var review_block = {};

    if (lang){
        var curr_block_lang = {};
        var review_block_lang = {};
    }

    let wfr_node = curr_flow.nodes.filter(nd => nd.uuid == question_node.exits[0].destination_uuid)[0];
    var no_categ_id = wfr_node.router.cases.filter(function (ca) { return (r_exp_no.test(ca.arguments[0])) })[0].category_uuid;
    var no_categ = wfr_node.router.categories.filter(function (cat) { return (cat.uuid == no_categ_id) })[0];
    var no_node_id = wfr_node.exits.filter(function (ex) { return (ex.uuid == no_categ.exit_uuid) })[0].destination_uuid;

    var no_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == no_node_id) })[0];
    if (no_node.actions.length == 1) {
        if (no_node.actions[0].type == "send_msg") {
            let no_msg = no_node.actions[0].text;
            curr_block["Neutral/Bad or negative response message"] = no_msg;

            if (lang){
                if (curr_flow.localization[lang][no_node.actions[0].uuid]){
                    var no_msg_lang = curr_flow.localization[lang][no_node.actions[0].uuid].text[0];
                }else{
                    var no_msg_lang = no_node.actions[0].text;
                }
                curr_block_lang["Neutral/Bad or negative response message"] = no_msg_lang;
            }

            var last_int_node_id = no_node.exits[0].destination_uuid;
            var last_int_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == last_int_node_id) })[0];
            var list_node_id = last_int_node.exits[0].destination_uuid;
            var list_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == list_node_id) })[0];

        } else if (no_node.actions[0].type == "set_contact_field") {
            next_node_id = no_node.exits[0].destination_uuid;
            next_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == next_node_id) })[0];
            if (next_node.actions[0].quick_replies.length == 0) {
                let no_msg = next_node.actions[0].text
                curr_block["Neutral/Bad or negative response message"] = no_msg;
                if (lang){
                    if (curr_flow.localization[lang][next_node.actions[0].uuid]){
                        var no_msg_lang = curr_flow.localization[lang][next_node.actions[0].uuid].text[0];
                    }else{
                        var no_msg_lang = next_node.actions[0].text;
                    }
                    curr_block_lang["Neutral/Bad or negative response message"] = no_msg_lang;
                }

                let list_node_id = next_node.exits[0].destination_uuid;
                var list_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == list_node_id) })[0];
            } else {
                var list_node = next_node;
            }

        }
    } else if (no_node.actions.length == 2) {
        let send_msg_action = no_node.actions.filter(ac => ac.type == "send_msg")[0];
        let no_msg = send_msg_action.text
        curr_block["Response message"] = no_msg;

        if (lang){
            if (curr_flow.localization[lang][send_msg_action.uuid]){
                var no_msg_lang = curr_flow.localization[lang][send_msg_action.uuid].text[0];
            }else{
                var no_msg_lang = send_msg_action.text;
            }
            curr_block_lang["Response message"] = no_msg_lang;
        }

        let list_node_id = no_node.exits[0].destination_uuid;
        var list_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == list_node_id) })[0];
    } else {
        console.error("0 or more than 2 actions")
    }

    let wfr_chall_node = curr_flow.nodes.filter(nd => nd.uuid == list_node.exits[0].destination_uuid)[0];
    let list_of_challenge_obj = {};
    list_of_challenge_obj["Message"] = list_node.actions[0].text;

    if (lang){
        var list_of_challenge_obj_lang = {};
        if(curr_flow.localization[lang][list_node.actions[0].uuid]){
            list_of_challenge_obj_lang["Message"] = curr_flow.localization[lang][list_node.actions[0].uuid].text[0];
        }else{
            list_of_challenge_obj_lang["Message"] = list_node.actions[0].text;
        }
        
    }


    for (let n_chall = 0; n_chall < list_node.actions[0].quick_replies.length; n_chall++) {

        let chall = list_node.actions[0].quick_replies[n_chall];

        let opt_name = "Option " + (n_chall + 1) + ": " + chall;
        let curr_chall = {};

        let r_exp_chall = new RegExp(`\\b${chall}\\b`, "i");
        let curr_chall_messages = [];

        if (lang){
            if(curr_flow.localization[lang][list_node.actions[0].uuid]){
                var chall_lang = curr_flow.localization[lang][list_node.actions[0].uuid].quick_replies[n_chall];
            }else{
                var chall_lang = list_node.actions[0].quick_replies[n_chall];
            }
            
            var opt_name_lang = "Option " + (n_chall + 1) + ": " + chall_lang;
            var curr_chall_lang = {};
            var curr_chall_messages_lang = [];

        }

        let chall_categ_id = wfr_chall_node.router.cases.filter(function (ca) { return (r_exp_chall.test(ca.arguments[0])) })[0].category_uuid;
        let chall_categ = wfr_chall_node.router.categories.filter(function (cat) { return (cat.uuid == chall_categ_id) })[0];
        let chall_node_id = wfr_chall_node.exits.filter(function (ex) { return (ex.uuid == chall_categ.exit_uuid) })[0].destination_uuid;
        let chall_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == chall_node_id) })[0];

        curr_chall_messages.push(chall_node.actions[0].text);
        if (lang){
            if (curr_flow.localization[lang][chall_node.actions[0].uuid]){
                curr_chall_messages_lang.push(curr_flow.localization[lang][chall_node.actions[0].uuid].text[0]);
            }else{
                curr_chall_messages_lang.push(chall_node.actions[0].text); 
            }
        }

        var next_node_chall = curr_flow.nodes.filter(function (nd) { return (nd.uuid == chall_node.exits[0].destination_uuid) })[0];

        while (!next_node_chall.actions[0].text.startsWith("Would you like to")) {
            curr_chall_messages.push(next_node_chall.actions[0].text);
            if (lang){
                if (curr_flow.localization[lang][next_node_chall.actions[0].uuid]){
                    curr_chall_messages_lang.push(curr_flow.localization[lang][next_node_chall.actions[0].uuid].text[0]);
                }else{
                    curr_chall_messages_lang.push(next_node_chall.actions[0].text); 
                }
            }
            next_node_chall = curr_flow.nodes.filter(function (nd) { return (nd.uuid == next_node_chall.exits[0].destination_uuid) })[0];
        }

        for (var m = 0; m < curr_chall_messages.length; m++) {
            if (curr_chall_messages.length == 1) {
                curr_chall["Message"] = curr_chall_messages[0];
            } else {
                curr_chall["Message " + (m + 1)] = curr_chall_messages[m];
            }
        }

        list_of_challenge_obj[opt_name] = curr_chall;

        if (lang){
            for (var m = 0; m < curr_chall_messages_lang.length; m++) {
                if (curr_chall_messages_lang.length == 1) {
                    curr_chall_lang["Message"] = curr_chall_messages_lang[0];
                } else {
                    curr_chall_lang["Message " + (m + 1)] = curr_chall_messages_lang[m];
                }
            }
    
            list_of_challenge_obj_lang[opt_name_lang] = curr_chall_lang;

        }


    }

    review_block["Message"] = next_node_chall.actions[0].text;
    if (lang){
        if (curr_flow.localization[lang][next_node_chall.actions[0].uuid]){
            review_block_lang["Message"] =curr_flow.localization[lang][next_node_chall.actions[0].uuid].text[0];
        }else{
            review_block_lang["Message"] = next_node_chall.actions[0].text; 
        }
    }

    let wfr_node_review = curr_flow.nodes.filter(nd => nd.uuid == next_node_chall.exits[0].destination_uuid)[0];
    var no_categ_id = wfr_node_review.router.cases.filter(function (ca) { return (r_exp_no.test(ca.arguments[0])) })[0].category_uuid;
    var no_categ = wfr_node_review.router.categories.filter(function (cat) { return (cat.uuid == no_categ_id) })[0];
    var no_node_id = wfr_node_review.exits.filter(function (ex) { return (ex.uuid == no_categ.exit_uuid) })[0].destination_uuid;

    var no_node_review = curr_flow.nodes.filter(function (nd) { return (nd.uuid == no_node_id) })[0];

    review_block["Message for negative answer"] = no_node_review.actions[0].text;
    curr_block["List of challenges"] = list_of_challenge_obj;

    flow_content["Challenge pathway (Neutral/Bad or No)"] = curr_block;
    flow_content["Offer for review"] = review_block;

    if (lang){
        if (curr_flow.localization[lang][no_node_review.actions[0].uuid]){
            review_block_lang["Message for negative answer"] =curr_flow.localization[lang][no_node_review.actions[0].uuid].text[0];
        }else{
            review_block_lang["Message for negative answer"] = no_node_review.actions[0].text; 
        }
        curr_block_lang["List of challenges"] = list_of_challenge_obj_lang;

        flow_content_lang["Challenge pathway (Neutral/Bad or No)"] = curr_block_lang;
        flow_content_lang["Offer for review"] = review_block_lang;
    }


   
}