var utilRoom = require('util.room');
var fatigueCheck = require('fatigueCheck');
var role_towerfiller = require('role_towerfiller');
var role_defendmelee = require('role_defendmelee');

//emoji available at:  http://unicode.org/emoji/charts/emoji-style.txt

//best practices:  https://www.developerdrive.com/top-10-must-follow-javascript-best-practices-2/
// v--- never use var multiple times.



//const PLAYER_USERNAME = _.find({...Game.structures, ...Game.creeps, ...Game.constructionSites}).owner.username;


// @TODO:  Wrap/Cover important structures with ramparts per slack #help
// Building walls is important

var pathColorHarvester = '#ffaa00';
var pathColorBuilder = '#ffffff';



//var currentHarvestersPerRoom = 0
//@TODO:  This looks like a problem because it doesn't take into part that we could be in different shards
var maxHarvestersPerRoom = 1
var maxBuildersPerRoom = 8
var maxTowerFillersPerRoom = 1
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

//    console.log('roomName=' + roomName);
    var currentEnergy = Game.rooms[roomName].energyAvailable;


    // tower defense - https://docs.screeps.com/defense.html
    var hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
    if(hostiles.length > 0) {
        var hostileUsername = hostiles[0].owner.username;
        console.log(`User ${hostileUsername} spotted in room ${roomName}`);
        var towers = Game.rooms[roomName].find(
            FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
        towers.forEach(tower => tower.attack(hostiles[0]));
    }



    //console.log(Game.rooms[roomName] + ' currentEnergy=' + currentEnergy);
    if (currentEnergy < 300) {  // save us precious cpu time
      // Since we cannot spawn, we should abort this for loop
      continue;  // ABORT this entire section and save CPU time!
    }

    //HOW MANY HARVESTERS ARE IN THIS ROOM?
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');

    // DETERMINE which role to spawn

    // @TODO: If we're under attack, launch role_defendmelee
    //if (hostiles.length>0) {
    //  var nextToSpawn = "defendmelee";
    //}

    var percentHarvesters = harvesters.length / maxHarvestersPerRoom;
//    console.log('percentHarvesters=' + percentHarvesters);
    var percentBuilders = builders.length / maxBuildersPerRoom;
//    console.log('percentBuilders=' + percentBuilders);
    if (percentHarvesters <= percentBuilders) {
      var nextToSpawn = 'harvester';
    } else {
      var nextToSpawn = 'builder';
    }

    // body setup
    // Put TOUGH first.  Put HEAL last.  https://wiki.screepspl.us/index.php/Creep_body_setup_strategies
    /*
    Bodypart Buildcost	Effect
    MOVE    50	      Moves the creep. Reduces creep fatigue by 2/tick. See movement.
    WORK    100	      Harvests energy from target source. Gathers 2 energy/tick.
                      Constructs a target structure. Builds the designated structure at a construction site, at 5 points/tick, consuming 1 energy/point. See building Costs.
                      Repairs a target structure. Repairs a structure for 100 hits/tick. Consumes 0.01 energy/hit repaired, rounded up to the nearest whole number.
    CARRY          50	Stores energy. Contains up to 50 energy units. Weighs nothing when empty.
    ATTACK	       80	Attacks a target creep/structure. Deals 30 damage/tick. Short-ranged attack (1 tile).
    RANGED_ATTACK 150	Attacks a target creep/structure. Deals 10 damage/tick. Long-ranged attack (1 to 3 tiles).
    HEAL	        250	Heals a target creep. Restores 12 hit points/tick at short range (1 tile) or 4 hits/tick at a distance (up to 3 tiles).
    TOUGH	         10	No effect other than the 100 hit points all body parts add. This provides a cheap way to add hit points to a creep.
    CLAIM	        600
    */
    var bodySetup = []
    switch (nextToSpawn) {
      case "attacker":
        // @TODO
        break;
      case "defendmelee":
        if (currentEnergy >= 350) {
            bodySetup = [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,ATTACK] // Tx12=120 + Mx3=150 + Ax1=80 = 350.  3 moves to go from ranged to melee
        }
        else if (currentEnergy >= 300) {
            bodySetup = [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,ATTACK] // Tx12=120 + Mx2=100 + Ax1=80 = 300
        } else {
            console.log('ERR: Attempting to create a bodySetup with only 250 energy')
            bodySetup = [WORK,MOVE,CARRY,MOVE] // w100+m50+c50+m50 = 250
        }
        break;
      case "healer":
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
        // Put in 1 WORK for each CARRY
        if (currentEnergy >= 800) {
          bodySetup = [WORK,WORK,WORK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY] // w100+w100+w100+m50+m50+m50+m50+m50+m50+c50+c50+c50+c50 = 800
        }
        else if (currentEnergy >= 750) {
          bodySetup = [WORK,WORK,WORK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY] // w100+w100+w100+m50+m50+m50+m50+m50+m50+c50+c50+c50 = 750
        }
        else if (currentEnergy >= 700) {
          bodySetup = [WORK,WORK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY] // w100+w100+m50+m50+m50+m50+m50+m50+m50+c50+c50+c50 = 700
        }
        else if (currentEnergy >= 650) {
          bodySetup = [WORK,WORK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY] // w100+w100+m50+m50+m50+m50+m50+m50+c50+c50+c50 = 650
        }
        else if (currentEnergy >= 600) {
          bodySetup = [WORK,WORK,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY] // w100+w100+m50+m50+m50+m50+m50+c50+c50+c50 = 600
        }
        else if (currentEnergy >= 550) {
            bodySetup = [WORK,WORK,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY] // w100+w100+m50+m50+m50+m50+c50+c50+c50 = 550
        }
        else if (currentEnergy >= 500) {
            bodySetup = [WORK,WORK,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY] // w100+w100+m50+m50+m50+m50+c50+c50 = 500
        }
        else if (currentEnergy >= 450) {
            bodySetup = [WORK,WORK,MOVE,MOVE,CARRY,MOVE,CARRY] // w100+m50+w100+m50+c50+m50+c50 = 450
        }
        else if (currentEnergy >= 400) {
            bodySetup = [WORK,WORK,MOVE,MOVE,CARRY,MOVE] // w100+m50+w100+m50+c50+m50 = 400
        }
        else if (currentEnergy >= 300) {
            bodySetup = [WORK,MOVE,CARRY,MOVE,MOVE] // w100+m50+c50+m50+m50 = 300
        } else {
            console.log('ERR: Attempting to create a bodySetup with only 250 energy')
            bodySetup = [WORK,MOVE,CARRY,MOVE] // w100+m50+c50+m50 = 250
        }
        taskBuild = 1  // i am incorrectly setting this to 1 even though it initializes as 0
        break;
      case "harvester":
      default:
        if (currentEnergy >= 400) {
          bodySetup = [WORK,MOVE,CARRY,WORK,MOVE,CARRY] // w100+m50+c50+w100+m50+c50 = 400
        }
        else if (currentEnergy >= 300) {
          bodySetup = [WORK,MOVE,CARRY,MOVE,MOVE] // w100+m50+c50+m50+m50 = 300
        } else {
          bodySetup = [WORK,MOVE,CARRY,MOVE] // w100+m50+c50+m50 = 250
        }
        taskHarvest = 1
        break;
    }

    // Pick a random energy source and assign it to the creep
    var activeSources = Game.rooms[roomName].find(FIND_SOURCES_ACTIVE);
    var activeSourcesLength = activeSources.length;
    var harvestSource = activeSources[Math.floor(Math.random()*activeSourcesLength)];

    if (harvesters.length < maxHarvestersPerRoom || builders.length < maxBuildersPerRoom) {
      console.log('currentEnergy='+currentEnergy);
      var newName = nextToSpawn + Game.time;
      //console.log('newName' + newName);
      var result = Game.spawns['Spawn1'].spawnCreep(
        bodySetup
        , newName
        , {memory:
          { role: nextToSpawn
          , taskHarvest: taskHarvest
          , taskBuild: taskBuild
          , harvestSource: harvestSource
          }
        }
      );
      //console.log('result=' + result);
      switch (result) {
        case OK:
          console.log('• Spawning: ' + newName + ' with bodySetup=' + bodySetup + ' in room ' + roomName);
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
      if (creep.memory.taskBuild == 0 && creep.carry.energy < creep.carryCapacity) {
        // Harvest instead of build

        // Old way:
        // var result = creep.moveTo(source, {visualizePathStyle: {stroke: pathColorBuilder}});
        // creep.harvest(source);
        //console.log('source1='+JSON.stringify(source));

        // New way:
        var result = creep.moveTo(creep.memory.harvestSource.pos.x,creep.memory.harvestSource.pos.y, {visualizePathStyle: {stroke: pathColorBuilder}});
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
          creep.say('C🚧' + creep.carry.energy + '/' + creep.carryCapacity);
          // Go build something
          var controllerLevel = Game.spawns['Spawn1'].room.controller.level;
          if (controllerLevel >= 3) {
              //console.log('• [' + roomName + '] Building tower.')
              //console.log(JSON.stringify(creep));
              var validTiles = utilRoom.getValidTilesCloseTo(roomName, Game.spawns['Spawn1'].pos, 6)
              Game.rooms[roomName].createConstructionSite(validTiles[0][0], validTiles[0][1], 'tower', 'tower1')
              var structure = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
              if (structure === null) {
                // Since I don't have a tower to build, I need to build an extension
                Game.rooms[roomName].createConstructionSite(validTiles[0][0], validTiles[0][1], STRUCTURE_EXTENSION , 'extension'+Game.time)
              } else {
                var result = creep.moveTo(structure, {visualizePathStyle: {stroke: pathColorBuilder}});
                //console.log('creep.moveTo='+result);
                var result = creep.build(structure);
                //console.log('creep.build='+result);
              }

              // Transfer energy into structures
              var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                  return (structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_CONTAINER ||
//                    structure.structureType == STRUCTURE_SPAWN ||
                    structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                  }
              });
              if (target) {
                creep.say('E🚧' + creep.carry.energy + '/' + creep.carryCapacity);
                var result = creep.moveTo(target, {visualizePathStyle: {stroke: pathColorBuilder}});
                var result = creep.transfer(target, RESOURCE_ENERGY);
              }

              // Repair structures
              var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                  return (structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_CONTAINER ||
                    structure.structureType == STRUCTURE_ROAD ||
                    structure.structureType == STRUCTURE_SPAWN ||
                    structure.structureType == STRUCTURE_TOWER) && structure.hits < structure.hitsMax;
                  }
              });
              if (target) {
                creep.say('F🚧' + creep.carry.energy + '/' + creep.carryCapacity);
                var result = creep.moveTo(target, {visualizePathStyle: {stroke: pathColorBuilder}});
                var result = creep.repair(target);
              }



          }
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

    if(creep.memory.role == 'towerfiller') {
        role_towerfiller.run(creep, roomName);
    }

    // HEALTH CHECK and ROAD BUILDING
    fatigueCheck.run(creep, roomName);

  }
}
