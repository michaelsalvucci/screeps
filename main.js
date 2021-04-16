

//emoji available at:  http://unicode.org/emoji/charts/emoji-style.txt

//best practices:  https://www.developerdrive.com/top-10-must-follow-javascript-best-practices-2/
// v--- never use var multiple times.



//const PLAYER_USERNAME = _.find({...Game.structures, ...Game.creeps, ...Game.constructionSites}).owner.username;


var pathColorHarvester = '#ffaa00';
var pathColorBuilder = '#ffffff';



//var currentHarvestersPerRoom = 0
var maxHarvestersPerRoom = 2
var maxBuildersPerRoom = 1
var maxMinersPerRoom = 0

var taskHarvest = 1 // 1=harvest; 0=store it at the controller (@TODO ... or somewhere else)
var taskBuild = 0 // 0=harvest; 1=build


module.exports.loop = function () {


  /** Memory housekeeping */
  for(var name in Memory.creeps) {
    if(!Game.creeps[name]) {
      delete Memory.creeps[name];
      console.log('DELETED non-existing creep memory:', name);
    } else {
      //console.log('No outdated creeps to delete');
    }
  }

  // ROOM-BASED ACTIONS FOR SPAWNING
  // If our creep doesnt exist, create it from our spawns
  for(var roomName in Game.rooms) {
    //console.log('roomName=' + roomName);
    var currentEnergy = Game.rooms[roomName].energyAvailable;
    //console.log(Game.rooms[roomName] + ' currentEnergy=' + currentEnergy);
    if (currentEnergy < 300) {  // save us precious cpu time
      // Since we cannot spawn, we should abort this for loop
      continue;  // ABORT this entire section and save CPU time!
    }

    //HOW MANY HARVESTERS ARE IN THIS ROOM?
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');

    // DETERMINE which role to spawn
    var percentHarvesters = harvesters.length / maxHarvestersPerRoom;
//    console.log('percentHarvesters=' + percentHarvesters);
    var percentBuilders = builders.length / maxBuildersPerRoom;
//    console.log('percentBuilders=' + percentBuilders);
    if (percentHarvesters <= percentBuilders) {
      var nextToSpawn = 'harvester';
    } else {
      var nextToSpawn = 'builder';
    }

    var bodySetup = []
    switch (nextToSpawn) {
      case "attacker":
        // @TODO
        break;
      case "defender":
        // @TODO
        break;
      case "miner":
        // @TODO
        break;
      case "maintainer":
        // @TODO
        break;
      case "upgrader":
        // @TODO
        break;
      case "builder":
        if (currentEnergy >= 400) {
            bodySetup = [WORK,WORK,WORK,CARRY,MOVE]
        }
        else if (currentEnergy >= 300) {
            bodySetup = [WORK,MOVE,CARRY,MOVE,MOVE]
        } else {
            bodySetup = [WORK,MOVE,CARRY,MOVE]
        }
        taskBuild = 1  // i am incorrectly setting this to 1 even though it initializes as 0
        break;
      case "harvester":
      default:
        if (currentEnergy >= 400) {
          bodySetup = [WORK,MOVE,CARRY,WORK,MOVE,CARRY]
        }
          else if (currentEnergy >= 300) {
            bodySetup = [WORK,MOVE,CARRY,MOVE,MOVE]
        } else {
            bodySetup = [WORK,MOVE,CARRY,MOVE]
        }
        taskHarvest = 1
        break;
    }


    if (harvesters.length < maxHarvestersPerRoom) {
      var newName = nextToSpawn + Game.time;
console.log('newName' + newName);
      var result = Game.spawns['Spawn1'].spawnCreep(
        bodySetup
        , newName
        , {memory:
          {role: nextToSpawn
          , taskHarvest: taskHarvest
          , taskBuild: taskBuild
          }
        }
      );
      //console.log('result=' + result);
      switch (result) {
        case OK:
          console.log('• Spawning new harvester: ' + newName);
//          console.log('spawning new creep');
          break;
        case ERR_NOT_OWNER:  // -1
//          console.log('spawnCreep - ERR_NOT_OWNER');
          break;
        case ERR_NAME_EXISTS:  // -3
//          console.log('spawnCreep - ERR_NAME_EXISTS');
          break;
        case ERR_BUSY:  // -4
//          console.log('spawnCreep - ERR_BUSY');
          break;
        case ERR_NOT_ENOUGH_ENERGY:  // -6
//          console.log('spawnCreep - ERR_NOT_ENOUGH_ENERGY');
          break;
        case ERR_INVALID_ARGS:  // -10
//          console.log('spawnCreep - ERR_INVALID_ARGS');
          break;
        case ERR_RCL_NOT_ENOUGH:  // -14
//          console.log('spawnCreep - ERR_RCL_NOT_ENOUGH');
          break;
        default:
          break;
      }
    }
  }

  //
  // ANALYZE EACH CREEP
  //
  for (const i in Game.creeps) {
    var creep = Game.creeps[i];  // Create the creep object
    var source = Game.creeps[i].pos.findClosestByRange(FIND_SOURCES_ACTIVE);

    if (creep.memory.role == "builder") {
//console.log('hereiam');
      if (creep.memory.taskBuild == 0 && creep.carry.energy < creep.carryCapacity) {
        // Harvest instead of build
        creep.moveTo(source, {visualizePathStyle: {stroke: pathColorBuilder}});
        creep.harvest(source);
        creep.say('A🚧' + creep.carry.energy + '/' + creep.carryCapacity);
      } else {
        if (creep.carry.energy == 0) {
          // Go harvest
          creep.moveTo(source, {visualizePathStyle: {stroke: pathColorBuilder}});
          creep.say('B🚧' + creep.carry.energy + '/' + creep.carryCapacity);
          creep.harvest(source);
          creep.memory.taskBuild = 0;
        } else if (creep.memory.taskBuild == 1 && creep.carry.energy <= creep.carryCapacity) {
          // go build something
//var structure = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
var structure = creep.pos.findClosestByRange(FIND_STRUCTURES);
//console.log(JSON_stringify(creep.pos.findClosestByRange(FIND_STRUCTURES)));
          creep.moveTo(structure, {visualizePathStyle: {stroke: pathColorBuilder}});
          creep.transfer(structure, RESOURCE_ENERGY);
//          creep.build(structure); // wtf?
          creep.say('C🚧' + creep.carry.energy + '/' + creep.carryCapacity);
        } else {
          creep.say('D🚧' + creep.carry.energy + '/' + creep.carryCapacity);
          creep.memory.taskBuild = 1;
        }
      }

    }

    if (creep.memory.role == "harvester") {
      if (creep.memory.taskHarvest == 0 && creep.carry.energy <= creep.carryCapacity) {
        var controllerLocation = Game.spawns['Spawn1'].room.controller;
        //console.log(Game.creeps[i] + ' heading to controllerLocation=' + controllerLocation);
        var controller = Game.creeps[i].room.controller;
        var result = Game.creeps[i].upgradeController(controller);
        if (result != 0 && result != -6 && result != -9) {
          console.log('controller=' + result);  // This is kept active because all the result conditions (eg. OK/ERR) are not set below:
        }
        switch(result) {
          case OK:
              // @TODO WARNING:  A fully upgraded level 8 controller can't be upgraded over 15 energy units per tick regardless of creeps abilities.
              // per https://docs.screeps.com/api/#Creep.upgradeController
              creep.say('A😨' + creep.carry.energy + '/' + creep.carryCapacity);
              creep.upgradeController(controller);
            break;
          case ERR_NOT_ENOUGH_RESOURCES: // -6
            creep.say("ERR_NER");
            creep.memory.taskHarvest = 1;  // toggle to begin harvesting
            Game.creeps[i].moveTo(source, {visualizePathStyle: {stroke: pathColorHarvester}});
            break;
          case ERR_NOT_IN_RANGE: // -9
            creep.say('ERR_NIR');
            Game.creeps[i].moveTo(controllerLocation, {visualizePathStyle: {stroke: pathColorHarvester}});
            break;
          default:
            creep.say('default');
            break;
        }
      } else {
        // HARVEST IT ALL
        if (creep.carry.energy == 0) {
          var result = Game.creeps[i].moveTo(source, {visualizePathStyle: {stroke: pathColorHarvester}});
          //console.log('sourceResult=' + result);
          creep.say('A⛏️' + creep.carry.energy + '/' + creep.carryCapacity);
          Game.creeps[i].harvest(source);
        } else if (creep.memory.taskHarvest == 1 && creep.carry.energy < creep.carryCapacity) {
          // Continue harvesting until full
          //console.log('creep.carry.energy=' + creep.carry.energy + ' AND creep.carryCapacity=' + creep.carryCapacity);
          Game.creeps[i].moveTo(source, {visualizePathStyle: {stroke: pathColorHarvester}});
          Game.creeps[i].harvest(source);
          creep.say('B⛏️' + creep.carry.energy + '/' + creep.carryCapacity);
        } else {
          // creep.carry.energy == creep.carryCapacity . Therefore, turn OFF harvesting, and deliver it to the controller.
          creep.say('C⛏️' + creep.carry.energy + '/' + creep.carryCapacity);
          creep.memory.taskHarvest = 0;
          //console.log('taskHarvest2=' + taskHarvest);
        }
      }
    }
    // HEALTH CHECK
    if(creep.fatigue > 0) {
      creep.say('😌 fatigue');
    }
  }
}
