var Discord=require("discord.io");
var logger=require("winston");
var auth=require("./auth.json");
var fs=require("fs");
var readline=require("readline");
// Data storage
var messages={};
try {
    var contents=fs.readFileSync("./data");
    messages=JSON.parse(contents);
} catch {}
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = "debug";
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on("ready", function (evt) {
    logger.info("Started");
});
bot.on("message", function (user, userID, channelID, message, evt) {
    // Messages that will start with `!` will be assumed to be commands
    if (message.substring(0, 1)=='!') {
        logger.info("New command: "+message);
        var args=message.substring(1).split(' ');
        var cmd=args[0];
        args=args.splice(1);
        var guildID=evt.d.guild_id;
        switch (cmd) {
            // !ping
            case "allow":
                if (messages[userID]===undefined) {messages[userID]={}}
                if (messages[userID][guildID]===undefined) {messages[userID][guildID]={}}
                messages[userID][guildID][channelID]=true;
                bot.sendMessage({
                    id:channelID,
                    message:"Access granted.",
                });
                break;
            case "deny":
                if (messages[userID]===undefined) {messages[userID]={}}
                if (messages[userID][guildID]===undefined) {messages[userID][guildID]={}}
                messages[userID][guildID][channelID]=false;
                bot.sendMessage({
                    id:channelID,
                    message:"Access removed.",
                });
                break;
            case "t":
                let subcommand=args[0];
                args=args.splice(1);
                let misc=["redstar scanner"];
                let ships=["battleship","transport","miner",];
                let trade=["cargo bay","shipment computer","trade boost","rush","trade burst","shipment drone","offload","shipment beam","entrust","dispatch","recall",];
                let mining=["mining boost","hydrogen bay","enrich","remote mining","hydrogen upload","mining unity","crunch","genesis","hydrogen rocket","mining drone",];
                let weapons=["battery","laser","mass battery","dual laser","barrage","dart launcher",];
                let shields=["alpha shield","delta shield","passive shield","omega shield","mirror shield","blast shield","area shield",];
                let support=["emp","teleport","red star life extender","remote repair","timewarp","unity","sanctuary","stealth","fortify","impulse","alpha rocket","salvage","suppress","destiny","barrier","vengeance","delta rocket","leap","bond","alpha drone","suspend","omega rocket"];
                if (messages[userID]===undefined) {messages[userID]={}}
                if (messages[userID][0]===undefined) {messages[userID][0]={}}
                let techs=[misc,ships,trade,mining,weapons,shields,support];
                let techNames=["misc","ships","trade","mining","weapons","shields","support"];
                // variable;userID; 0 stands for tech, there will be no guildID of 0; techIndex is obtained from concatenating the string of the `techs` variable index and the index of the sub array.
                // messages[userID][0]                                               [techIndex]
                switch (subcommand) {
                    case "get":
                        if (args.length>0) {
                            let tech=args[0];
                            args=args.splice(1);
                            for (let i=0;i<args.length;i++) {
                                tech+=" "+args[i];
                            }
                            logger.info("Get tech "+tech);
                            var message="";
                            for (var i=0;i<techs.length;i++) {
                                let val=techs[i].findIndex(info=>{return info==tech.toLowerCase();});
                                if (val!=-1) {
                                    message=messages[userID][0][Number(String(i)+String(val))];
                                    break;
                                }
                            }
                            logger.info(tech+": "+String(message));
                            logger.info("Sending message");
                            let msg=message;
                            bot.sendMessage({
                                to:channelID,
                                message:"`"+tech+"`: `"+message+"`",
                            });
                            logger.info("After message");
                            if (message=="") {
                                bot.sendMessage({
                                    to:channelID,
                                    message:"Failed to get tech.",
                                });
                                break;
                            }
                            if (message===undefined) {
                                bot.sendMessage({
                                    id:channelID,
                                    message:"Tech is undefined.",
                                });
                                break;
                            }
                        } else {
                            logger.info("Get all techs");
                            let str=[];
                            for (let i=0;i<techs.length;i++) {
                                let techList=techs[i];
                                str[i]=new String();
                                str[i]+=techNames[i]+"\n";
                                str[i]+="----------------------------\n";
                                for (let j=0;j<techList.length;j++) {
                                    str[i]+="    "+techList[j]+":    ";
                                    for (let x=0;x<22-techList[j].length;x++) {str[i]+=" ";}
                                    str[i]+=messages[userID][0][Number(String(i)+String(j))]+"\n";
                                }
                            }
                            bot.sendMessage({
                                to:channelID,
                                message:"```\n"+str[0]+"============================\n"+str[1]+"============================\n"+str[2]+"\n```",
                            });
                            bot.sendMessage({
                                to:channelID,
                                message:"```\n"+str[3]+"============================\n"+str[4]+"============================\n"+str[5]+"\n```",
                            });
                            bot.sendMessage({
                                to:channelID,
                                message:"```\n"+str[6]+"\n```",
                            });
                        }
                        break;
                    case "set":
                        let tech="";
                        let tech_finished=false;
                        let failed=false;
                        let value="";
                        for (let i=0;i<args.length;i++) {
                            if (args[i].includes("=")&&!tech_finished) {
                                tech_finished=true;
                                if (args[i].length>1) {
                                    let split=args[i].split("=");
                                    if (split.length>2) {
                                        bot.sendMessage({
                                            id:channelID,
                                            message:"Invalid usage!",
                                        });
                                    }
                                    tech+=split[0];
                                    value+=split[1];
                                    break;
                                }
                            } else if (tech_finished) {
                                value+=args[i];
                                break;
                            } else {
                                tech+=args[i];
                                tech+=" ";
                            }
                        }
                        if (failed) {
                            break;
                        }
                        if (tech.endsWith(" ")) {tech=tech.trim();}
                        try {
                            value=Number(value);
                        } catch {
                            bot.sendMessage({
                                to:channelID,
                                message:"Input is not a number.",
                            });
                            break;
                        }
                        var message=[];
                        for (var i=0;i<techs.length;i++) {
                            let val=techs[i].findIndex(info=>{return info==tech;});
                            if (val!=-1) {
                                message=[i,val];
                                break;
                            }
                        }
                        if (message.length==0) {
                            bot.sendMessage({
                                to:channelID,
                                message:"Failed to set tech `"+tech+"`",
                            });
                            break;
                        }
                        messages[userID][0][Number(String(message[0])+String(message[1]))]=value;
                        bot.sendMessage({
                            to:channelID,
                            message:"Tech `"+tech+"` successfully set to `"+value+"`",
                        });
                        break;
                }
            break;
        }
     }
});
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal:true
});
rl.question("",function(line){
    var str=JSON.stringify(messages);
    fs.writeFileSync("./data",str);
    logger.info("Data written to file");
    bot.disconnect();
    rl.close();
});
