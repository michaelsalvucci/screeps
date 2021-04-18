var fatigueCheck = {

    /*
      If a creep is tired, consider building a road
    */

    // Silten on screeps.slack.com recommends using PathFinder to more directly plan road routes, so you end up with less

    /** @param {Creep} creep **/
    run: function(creep, roomName) {



      if(creep.fatigue > 0) {
        creep.say('😌 fatigue');
        // Since I'm tired, build a road to improve the future
        if(Game.rooms[roomName].getTerrain().get(creep.pos.x,creep.pos.y) === TERRAIN_MASK_SWAMP) {
          //console.log('Building road because of fatigue');
          road = Game.rooms[roomName].createConstructionSite(creep.pos.x, creep.pos.y, STRUCTURE_ROAD , 'road'+Game.time);
          creep.build(road);
        }
      }

	}
};

module.exports = fatigueCheck;
