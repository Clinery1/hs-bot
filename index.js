// in pings ! means server owner & means role. syntax: <@<special><UUID>> <special> is the special character that shows what type you are pinging, <UUID> is the id of the object you are pinging.


var Discord=require("discord.io");
var auth=require("./auth.json");
var fs=require("fs");
var readline=require("readline");
// Data storage
var messages={};
try {
    var contents=fs.readFileSync("./data");
    messages=JSON.parse(contents);
} catch {}
var helpMessage="Could not load help message.";
try {
    helpMessage=fs.readFileSync("./help");
} catch {}
// Configure logger settings
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on("ready", function (evt) {
    console.log("Bot ready\n");
});
bot.setPresence({
    idle_since:null,
    game:{
        name:"!help",
        type:null,
        url:null,
    },
});
function testNumber(num,tech) {
    let techs={
        "redstar scanner":10,
        "battleship":6,"transport":6,"miner":6,
        "cargo bay":12,"shipment computer":12,"trade boost":12,"rush":12,"trade burst":12,"shipment drone":12,"offload":10,"shipment beam":12,"entrust":12,"dispatch":10,"recall":1,
        "mining boost":12,"hydrogen bay extension":10,"enrich":12,"remote mining":10,"hydrogen upload":12,"mining unity":10,"crunch":12,"genesis":12,"hydrogen rocket":12,"mining drone":10,
        "battery":12,"laser":12,"mass battery":12,"dual laser":12,"barrage":12,"dart launcher":12,
        "alpha shield":5,"delta shield":12,"passive shield":12,"omega shield":12,"mirror shield":12,"blast shield":12,"area shield":12,
        "emp":12,"teleport":12,"red star life extender":10,"remote repair":12,"timewarp":12,"unity":12,"sanctuary":1,"stealth":12,"fortify":12,"impulse":12,"alpha rocket":12,"salvage":12,"suppress":12,"destiny":12,"barrier":12,"vengeance":12,"delta rocket":12,"leap":10,"bond":12,"alpha drone":12,"suspend":12,"omega rocket":12
    };
    let techVal=techs[tech];
    if (num>=0&&num<=techVal) {
        return 0;
    } else if (techVal!=undefined) {
        return 1;
    }
    return 2;
}
bot.on("message", function (user, userID, channelID, message, evt) {
    // Messages that will start with `!` will be assumed to be commands
    if (message.substring(0, 1)=='!') {
        console.log(message);
        var args=message.substring(1).split(' ');
        var cmd=args[0];
        args=args.splice(1);
        var guildID=evt.d.guild_id;
        if (messages[userID]===undefined) {messages[userID]={}}
        if (messages[userID][guildID]===undefined) {messages[userID][guildID]={}}
        if (messages[userID][0]===undefined) {messages[userID][0]={}}
        switch (cmd) {
            case "help":
                bot.sendMessage({
                    to:channelID,
                    message:helpMessage,
                });
                break;
            case "allow":
                messages[userID][guildID][channelID]=true;
                bot.sendMessage({
                    to:channelID,
                    message:"Granted access.",
                });
                break;
            case "deny":
                messages[userID][guildID][channelID]=false;
                bot.sendMessage({
                    to:channelID,
                    message:"Removed access.",
                });
                break;
            case "permission":
                let msg;
                if (messages[userID][guildID][channelID]===true) {
                    bot.sendMessage({
                        to:channelID,
                        message:"Tech permissions allowed.",
                    });
                } else {
                    bot.sendMessage({
                        to:channelID,
                        message:"Tech permissions denied.",
                    });
                }
                break;
            case "t":
                let subcommand=args[0];
                args=args.splice(1);
                let misc=["redstar scanner"];
                let ships=["battleship","transport","miner",];
                let trade=["cargo bay","shipment computer","trade boost","rush","trade burst","shipment drone","offload","shipment beam","entrust","dispatch","recall",];
                let mining=["mining boost","hydrogen bay extension","enrich","remote mining","hydrogen upload","mining unity","crunch","genesis","hydrogen rocket","mining drone",];
                let weapons=["battery","laser","mass battery","dual laser","barrage","dart launcher",];
                let shields=["alpha shield","delta shield","passive shield","omega shield","mirror shield","blast shield","area shield",];
                let support=["emp","teleport","red star life extender","remote repair","timewarp","unity","sanctuary","stealth","fortify","impulse","alpha rocket","salvage","suppress","destiny","barrier","vengeance","delta rocket","leap","bond","alpha drone","suspend","omega rocket"];
                let techs=[misc,ships,trade,mining,weapons,shields,support];
                let techNames=["misc","ships","trade","mining","weapons","shields","support"];
                let miscAliases=[["red star scanner","rs scanner","rs"]];
                let shipsAliases=[
                    ["bs",],
                    ["trans",],
                ];
                let tradeAliases=[
                    ["cargo bay extension","cargo extension"],
                ];
                let miningAliases=[
                    [],["hydro bay","hydrogen bay","hydrogen extension"],[],[],["upload"],[],[],["gen"],["hydro rocket"]
                ];
                let weaponAliases=[
                    ["batt"],
                    [],
                    ["mb",],
                    ["dl"],
                    [],
                    ["dart"],
                ];
                let shieldAliases=[
                    ["alpha"],
                    ["delta"],
                    ["passive"],
                    ["omega"],
                    ["mirror"],
                    ["blast"],
                    ["area"],
                ];
                let supportAliases=[];
                let aliases=[miscAliases,shipsAliases,tradeAliases,miningAliases,weaponAliases,shieldAliases,supportAliases];
                // variable;userID; 0 stands for tech, there will be no guildID of 0; techIndex is obtained from concatenating the string of the `techs` variable index and the index of the sub array.
                // messages[userID][0]                                               [techIndex]
                switch (subcommand) {
                    case "get":
                        let uuid=userID;
                        if (args.length>0) {
                            if (args[0].startsWith("<@")) {
                                uuid=args[0].slice(2,-1);
                                args=args.splice(1);
                            }
                            if (uuid.startsWith("!")) {uuid=uuid.slice(1);}
                            if (uuid.startsWith("&")) {
                                bot.sendMessage({
                                    to:channelID,
                                    message:"Group tech list is not yet supported.",
                                });
                                break;
                            }
                        }
                        if (messages[uuid][guildID][channelID]===true) {
                            if (messages[uuid]===undefined) {messages[uuid]={}}
                            if (messages[uuid][guildID]===undefined) {messages[uuid][guildID]={}}
                            if (messages[uuid][0]===undefined) {messages[uuid][0]={}}
                            if (args.length>0) {
                                let tech=args[0];
                                args=args.splice(1);
                                for (let i=0;i<args.length;i++) {
                                    tech+=" "+args[i];
                                }
                                var tech_value="";
                                let val;
                                for (var i=0;i<techs.length;i++) {
                                    val=techs[i].findIndex(info=>{return info==tech.toLowerCase();});
                                    if (val==-1) {
                                        for (let j=0;j<aliases[i].length;j++) {
                                            if (aliases[i][j].find(info=>{return info==tech.toLowerCase();})) {
                                                val=j;
                                                break;
                                            }
                                        }
                                    }
                                    if (val!=-1) {
                                        tech_value=Number(messages[uuid][0][String(i)+String(val)]);
                                        break;
                                    }
                                }
                                if (val==-1) {
                                    bot.sendMessage({
                                        to:channelID,
                                        message:"Failed to get tech "+tech,
                                    });
                                    break;
                                } else {
                                    bot.sendMessage({
                                        to:channelID,
                                        message:"`"+tech+"`: `"+tech_value+"`",
                                    });
                                }
                                if (message===undefined) {
                                    bot.sendMessage({
                                        to:channelID,
                                        message:"",
                                    });
                                    break;
                                }
                            } else {
                                let str=[];
                                for (let i=0;i<techs.length;i++) {
                                    let techList=techs[i];
                                    str[i]=new String();
                                    str[i]+=techNames[i]+"\n";
                                    str[i]+="----------------------------\n";
                                    for (let j=0;j<techList.length;j++) {
                                        let msg=messages[uuid][0][String(i)+String(j)];
                                        if (!(msg===undefined)) {
                                            str[i]+="    "+techList[j]+":    ";
                                            for (let x=0;x<22-techList[j].length;x++) {str[i]+=" ";}
                                            str[i]+=msg+"\n";
                                        }
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
                        } else {
                            bot.sendMessage({
                                to:channelID,
                                message:"Permission deined.",
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
                        tech=tech.trim();
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
                        let val;
                        for (var i=0;i<techs.length;i++) {
                            val=techs[i].findIndex(info=>{return info==tech;});
                            if (val==-1) {
                                for (let j=0;j<aliases[i].length;j++) {
                                    if (aliases[i][j].find(info=>{return info==tech.toLowerCase();})) {
                                        val=j;
                                        break;
                                    }
                                }
                            }
                            if (val!=-1) {
                                message=[i,val];
                                break;
                            }
                        }
                        if (val==-1) {
                            bot.sendMessage({
                                to:channelID,
                                message:"Unknown tech `"+tech+"`",
                            });
                            break;
                        }
                        let trueName=techs[message[0]][message[1]];
                        let res=testNumber(value,trueName);
                        if(res==0){}else if (res==1) {
                            bot.sendMessage({
                                to:channelID,
                                message:"Tech level `"+value+"` not in range.",
                            });
                            break;
                        } else if (res==2) {
                            bot.sendMessage({
                                to:channelID,
                                message:"Unknown tech. Please contact the developer to fix this issue.",
                            });
                            break;
                        } else {
                            bot.sendMessage({
                                to:channelID,
                                message:"Unknown error occured while setting tech. Please contact the developer to fix this issue.",
                            });
                            break;
                        }
                        messages[userID][0][String(message[0])+String(message[1])]=value;
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
    console.log("\nData saved to disk.");
    bot.disconnect();
    rl.close();
});
