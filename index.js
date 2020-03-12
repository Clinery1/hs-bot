// in pings ! means server owner & means role. syntax: <@<special><UUID>> <special> is the special character that shows what type you are pinging, <UUID> is the id of the object you are pinging.


var Discord=require("discord.io");
var auth=require("./auth.json");
var fs=require("fs");
var readline=require("readline");
var api=require("./api.js");
let helpMessage="Could not load help message";
try {
    helpMessage=fs.readFileSync("./help");
} catch {}
// Data storage
let storage=api();
storage.loadData();
// let userID=371142395938603010;   // This is public knowledge if you have discord.
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
bot.on("disconnect",function() {console.log("bot disconnected");});
bot.on("message", function (user, userID, channelID, msg, evt) {
    // Messages that will start with `!` will be assumed to be commands
    function message(channelID,msg) {
        bot.sendMessage({
            to: channelID,
            message: msg
        });
    }
    if (msg.startsWith("!")) {
        console.log(msg);
        var args=msg.substring(1).split(' ');
        var cmd=args[0];
        args=args.splice(1);
        var guildID=evt.d.guild_id;
        switch (cmd) {
            case "help":
                message(channelID,helpMessage);
                break;
            case "allow":
                storage.grantPermission(userID,guildID,channelID);
                message(channelID,"Granted access.");
                break;
            case "deny":
                storage.revokePermission(userID,guildID,channelID);
                message(channelID,"Removed access.");
                break;
            case "permission":
                if (storage.getPermission(userID,guildID,channelID)) {
                    message(channelID,"Tech permissions allowed.");
                } else {
                    message(channelID,"Tech permissions denied.");
                }
                break;
            case "t":
                let subcommand=args[0];
                args=args.splice(1);
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
                                message(channelID,"Group tech list is not yet supported.");
                                break;
                            }
                        }
                        if (storage.getPermission(uuid,guildID,channelID)) {
                            if (args.length>0) {
                                let tech=args[0];
                                args=args.splice(1);
                                for (let i=0;i<args.length;i++) {
                                    tech+=" "+args[i];
                                }
                                let val=storage.queryTechLvl(tech,uuid);
                                if (val==-1) {
                                    message(channelID,"Unknown tech "+tech);
                                    break;
                                } else if (val==-2) {
                                    message(channelID,"Tech is undefined");
                                    break;
                                } else if (val==-3) {
                                    message(channelID,"Unknown user id");
                                    break;
                                } else {
                                    message(channelID,"`"+tech+"="+val+"`");
                                    break;
                                }
                            } else {
                                let str=[];
                                let techs=storage.tech;
                                let techNames=["misc","ships","trade","mining","weapons","shields","support"];
                                for (let i=0;i<techs.length;i++) {
                                    let techList=techs[i];
                                    str[i]=new String();
                                    str[i]+=techNames[i]+"\n";
                                    str[i]+="----------------------------\n";
                                    for (let j=0;j<techList.length;j++) {
                                        let msg=storage.queryTechLvl(techList[j][1],uuid);
                                        if (msg>=0&&msg<=12) {
                                            str[i]+="    "+techList[j][1]+":    ";
                                            for (let x=0;x<22-techList[j][1].length;x++) {str[i]+=" ";}
                                            str[i]+=msg+"\n";
                                        }
                                    }
                                }
                                message(channelID,
                                    "```\n"+str[0]+"============================\n"+str[1]+"============================\n"+str[2]+"\n```"
                                );
                                message(channelID,
                                    "```\n"+str[3]+"============================\n"+str[4]+"============================\n"+str[5]+"\n```"
                                );
                                message(channelID,
                                    "```\n"+str[6]+"\n```"
                                );
                            }
                        } else {
                            message(channelID,"Permission denied.");
                        }
                        break;
                    case "set":
                        let argsStr="";
                        for (let i=0;i<args.length;i++) {
                            argsStr+=args[i]+" ";
                        }
                        argsStr=argsStr.trim();
                        let vals=argsStr.split('=');
                        if (vals.length!==2) {
                            message(channelID,"Invalid usage");
                            break;
                        }
                        let value;
                        let tech=vals[0];
                        try {
                            value=Number(vals[1]);
                        } catch {
                            message(channelID,"Input is not a number.");
                            break;
                        }
                        let ret=storage.writeTechDatabase(tech,userID,value);
                        if (ret==-1) {
                            message(channelID,"Unknown tech `"+tech+"`");
                            break;
                        } else if (ret==-2) {
                            message(channelID,"Tech level `"+value+"` not in range.");
                            break;
                        } else if (ret==0) {
                            message(channelID,"Tech `"+tech+"` successfully set to `"+value+"`");
                            break;
                        }
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
    storage.writeData();
    console.log("\nData saved to disk.");
    bot.disconnect();
    rl.close();
});
