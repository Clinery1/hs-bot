module.exports=newStorage;
var fs=require("fs");
function newStorage() {
    this.techList={};
    this.permissions={};    // stored as this.permissions[userID][guildID][channelID]=allowedOrDisallowed:bool
    this.tech=[
        // stored as techs[typeOfTech][techNameIndex][0]=maxLvl:Number
        // stored as techs[typeOfTech][techNameIndex][1]=trueName:String
        // stored as techs[typeOfTech][techNameIndex][2..]=alias:String
        // this.list[userID][String(typeOfTech)+String(techNameIndex)]=techLvl:Number
        // this.list[userID][techIndex]=techLvl:Number
        [["10","redstar scanner","red star scanner","rs scanner","rs","rss"]],
        [["6","battleship","bs"],["6","transport","trans"],["6","miner"]],
        [["12","cargo bay extension","cargo bay","cargo extension"],["12","shipment computer"],["12","trade boost","boost"],["12","rush"],["12","trade burst","burst"],["12","shipment drone"],["10","offload"],["12","shipment beam"],["12","entrust"],["10","dispatch"],["1","recall"]],
        [["12","mining boost"],["10","hydrogen bay extension","hydro bay","hydrogen bay","hydrogen extension","hydro extension"],["12","enrich"],["10","remote mining"],["12","hydrogen upload","hydro upload","upload"],["10","mining unity"],["12","crunch"],["12","genesis","gen"],["12","hydrogen rocket","hydro rocket"],["10","mining drone"]],
        [["12","battery","batt"],["12","laser"],["12","mass battery","mb"],["12","dual laser","dl"],["12","barrage"],["12","dart launcher","dart"]],
        [["5","alpha shield","alpha"],["12","delta shield","delta"],["12","passive shield","passive"],["12","omega shield","omega"],["12","mirror shield","mirror"],["12","blast shield","blast"],["12","area shield","area"]],
        [["12","emp"],["12","teleport","tele"],["10","red star life extender","redstar extender","rs life extender","rs life","rs extender"],["12","remote repair","repair"],["12","timewarp","tw"],["12","unity"],["1","sanctuary"],["12","stealth"],["12","fortify"],["12","impulse"],["12","alpha rocket","ar"],["12","salvage"],["12","suppress"],["12","destiny"],["12","barrier"],["12","vengeance","veng"],["12","delta rocket"],["10","leap"],["12","bond"],["12","alpha drone"],["12","suspend"],["12","omega rocket"]],
    ];
    this.loadData=loadData;
    this.testTechLvl=testTechLvl;
    this.writeData=writeData;
    this.queryDatabase=queryDatabase;
    this.queryTechLvl=queryTechLvl;
    this.writeTechDatabase=writeTechDatabase;
    this.makeTechIndex=makeTechIndex;
    this.grantPermission=grantPermission;
    this.revokePermission=revokePermission;
    this.getPermission=getPermission;
    return this;
}
function loadData() {
    try {
        let contents=fs.readFileSync("./data");
        this.techList=JSON.parse(contents);
    } catch {
        this.techList={};
        this.permissions={};
        console.log("Failed to load data.");
        return;
    }
    try {
        let contents=fs.readFileSync("./permissions");
        this.permissions=JSON.parse(contents);
    } catch {
        this.permissions={};
        console.log("Failed to load permissions.");
        return;
    }
}
function writeData() {
    let list=JSON.stringify(this.techList);
    let permissions=JSON.stringify(this.permissions);
    fs.writeFileSync("./data",list);
    fs.writeFileSync("./permissions",permissions);
}
function testTechLvl(num,techIndexes) {  // Returns:[0:success,1:out of bounds,2:no list was found]
    let typeOfTech=techIndexes[0];
    let typeNameIndex=techIndexes[1];
    let maxLvl;
    try {
        maxLvl=tech[typeOfTech][techNameIndex][0];
    } catch {
        return 2;
    }
    if (num<0||num>maxLvl) {
        return 1;
    }
    return 0;
}
function queryDatabase(rawTech) {   // Returns -1 on error otherwise an array of the two indexes
    let rawTechLowerCase=rawTech.toLowerCase();
    let techIndexes=undefined;
    for (let i=0;i<this.tech.length;i++) {
        let y=false;
        for (let j=0;j<this.tech[i].length;j++) {
            for (let x=1;x<this.tech[i][j].length;x++) {
                if (this.tech[i][j][x]==rawTechLowerCase) {
                    techIndexes=[i,j];
                    y=true;
                    break;
                }
            }
            if (y) {break;}
        }
        if (y) {break;}
    }
    if (techIndexes===undefined) {return -1;}
    return techIndexes;
}
function writeTechDatabase(rawTech,userID,lvl) { // returns 0 on success, -1 when tech is not found, -2 when tech is out of range
    let techIndexes=this.queryDatabase(rawTech);
    if (techIndexes==-1) {return -1;}
    if (this.techList[userID]===undefined) {
        this.techList[userID]={};
    }
    let maxLvl=this.tech[techIndexes[0]][techIndexes[1]][0];
    if (lvl<0||lvl>maxLvl) {return -2;}
    this.techList[userID][this.makeTechIndex(techIndexes)]=lvl;
    return 0;
}
function makeTechIndex(techIndexes) {
    return String(techIndexes[0])+String(techIndexes[1]);
}
function queryTechLvl(rawTech,userID) { // returns 0..=12 on success, -1 when tech is not found, -2 when tech is undefined, -3 when userID is undefined
    let techIndexes=this.queryDatabase(rawTech);
    if (techIndexes==-1) {return -1;}
    if (this.techList[userID]===undefined) {
        return -3;
    }
    let techLvl=this.techList[userID][this.makeTechIndex(techIndexes)];
    if (techLvl===undefined) {return -2;}
    return techLvl;
}
function grantPermission(userID,guildID,channelID) {
    if (this.permissions[userID]===undefined) {this.permissions[userID]={}}
    if (this.permissions[userID][guildID]===undefined) {this.permissions[userID][guildID]={}}
    this.permissions[userID][guildID][channelID]=true;
}
function revokePermission(userID,guildID,channelID) {
    if (this.permissions[userID]===undefined) {this.permissions[userID]={}}
    if (this.permissions[userID][guildID]===undefined) {this.permissions[userID][guildID]={}}
    this.permissions[userID][guildID][channelID]=false;
}
function getPermission(userID,guildID,channelID) {
    if (this.permissions[userID]===undefined) {return false;}
    if (this.permissions[userID][guildID]===undefined) {return false;}
    if (this.permissions[userID][guildID][channelID]!==true) {return false;}
    return true;
}
