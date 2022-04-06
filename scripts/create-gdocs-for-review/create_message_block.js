function create_message_block(curr_node) {
    n_mess_block++;
    var n_mess = 1;
    var r_exp_yes = new RegExp(`\\byes\\b`, "i");
    var r_exp_no = new RegExp(`\\bno\\b`, "i");
    var curr_block = {};

    var curr_block_messages = [];
    var curr_block_interaction_messages = [];

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
                message.forEach(ac => {add_action_text(ac,curr_block_messages)});
            } else { // if curr_node is not a flow end point, consider what type of node next_node is (whether it has a router or not)
                    
                if (next_node[0].hasOwnProperty('router')) {// if next_node has a router
                    // the node could be a WFR, enter_flow (for updating toolkit) or other type of split. Consider the 3 cases separately
                    if (next_node[0].router.operand == "@input.text" && next_node[0].router.hasOwnProperty("wait")){
                        // store messages in the variable curr_block_interaction_messages
                        let wfr_node = next_node[0];
                        go_on = false;
                        var ends_with_wfr = true;
                        message.forEach(ac => {add_action_text(ac,curr_block_interaction_messages)});
                        
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
                                var curr_block_no_messages = loop_message_nodes(no_node, "null")[0];
                            }
            


                        } else {
                            // if the interaction is not of type Y/N don't do anything else 
                            var interaction_yes_no = false;
                        }

                    } else if (next_node.actions.length >0 && next_node.actions[0].type == "enter_flow" && next_node.actions[0].flow.name == "PLH - Internal - Update toolkits" && next_node.exits[0].destination_uuid == next_node.exits[1].destination_uuid && next_node.exits[0].destination_uuid != null){
                        // if the router node is an enter_flow node that enters the "update toolkits" flow and the 2 exits have the same child node
                        //then add the messages and continue with the while loop skipping this node ==> curr_node = child_node
                        go_on = true;
                        message.forEach(ac => {add_action_text(ac,curr_block_messages)});
    
                        curr_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == next_node.exits[0].destination_uuid) })[0];


                    } else {
                        // if it's any other type of split, do not continue with the while loop and just add all the messages in the actions of curr_node
                        // to curr_block_messages
                        go_on = false;
                        message.forEach(ac => {add_action_text(ac,curr_block_messages)});
                        next_node = next_node[0];

                    }


                } else { // if next_node doesn't have a router
                    // add all the messages in the actions of curr_node to curr_block_messages
                    // and set curr_node = next_node and continue with while loop
                    go_on = true;
                    message.forEach(ac => {add_action_text(ac,curr_block_messages)});
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
        } else {
            curr_block["Message " + (m + 1)] = curr_block_messages[m];
        }
    }

    if (ends_with_wfr) {
        for (let m = 0; m < curr_block_interaction_messages.length; m++) {
            if (curr_block_interaction_messages.length == 1) {
                curr_block["Interaction message"] = curr_block_interaction_messages[0];
            } else {
                curr_block["Interaction message " + (m + 1)] = curr_block_interaction_messages[m];
            }
        }
        
        if (interaction_yes_no) {
            for (let n = 0; n < curr_block_no_messages.length; n++) {
                if (curr_block_no_messages.length == 1) {
                    curr_block["Message for negative answer"] = curr_block_no_messages[0];
                } else {
                    curr_block["Message for negative answer " + (n + 1)] = curr_block_no_messages[n];
                }
            }
        }
    }

    flow_content["Set of messages " + n_mess_block] = curr_block;

    if (ends_with_wfr && interaction_yes_no) {
        if (next_node.actions.filter(function (ac) { return (ac.type == "send_msg") }).length > 0) {
            next_node = create_message_block(next_node)
        }

    }


    return next_node


}



function add_action_text(ac,curr_block_messages){
    let message_text = ac.text;
    if (ac.attachments.length > 0) {
        message_text = add_attachments_to_text(message_text)
    }
    curr_block_messages.push(message_text);

}

function add_attachments_to_text(message_text){
    // TO DO: add other types of attachments
    message_text = message_text + "\n " + ac.attachments[0].slice(6, -2).replace("@(fields.image_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/Global/resourceGroup/image/universal/")
            .replace("@(fields.comic_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/Global/resourceGroup/comic/");
    return message_text
}



function loop_message_nodes(curr_node, stop_node_id) {
    var messages_to_send = [];
    do {
        var message = curr_node.actions.filter(function (ac) { return (ac.type == "send_msg") });

        if (message.length > 0) {
            var next_node = curr_flow.nodes.filter(function (nd) { return (nd.uuid == curr_node.exits[0].destination_uuid) });
            if (next_node.length == 0) {
                console.log("end of flow")
                next_node = null;
                go_on = false;
                message.forEach(ac => {add_action_text(ac,messages_to_send)});

            } else {
                if (next_node[0].hasOwnProperty('router')) {
                    go_on = false;
                    if (next_node[0].router.operand == "@input.text") {

                        console.log("ended in interaction node")
                        next_node = next_node[0];


                    } else {
                        message.forEach(ac => {add_action_text(ac,messages_to_send)});
                        next_node = next_node[0];
                    }
                } else {
                    if (next_node[0].uuid == stop_node_id) {
                        go_on = false;
                        message.forEach(ac => {add_action_text(ac,messages_to_send)});
                        next_node = next_node[0];

                    } else {
                        go_on = true;
                        message.forEach(ac => {add_action_text(ac,messages_to_send)});
                        curr_node = next_node[0];
                    }

                }



            }

        }

        
        else {
            console.log(curr_node)
            go_on = false;
            console.log("this is not a send message node")
            next_node = null;
        }
    }
    while (go_on);
    return [messages_to_send, next_node, curr_node]
}