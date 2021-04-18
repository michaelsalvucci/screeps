var role_defendmelee = {

  /*
   * towerfiller is called when the room is under attack
   *
   * Moves to the associated tower and transfers the energy from the link to the tower
   */

    /**
      @param {Creep, roomName}
      creep - The creep object
      roomName - roomName from Game object
    **/
    run: function(creep, roomName) {

    if (creep.memory.role == "defendmelee") {
      console.log('role_defendmelee.js - hereiam');

      // tower defense - https://docs.screeps.com/defense.html
      var hostile = Game.rooms[roomName].findClosestByPath(FIND_HOSTILE_CREEPS);
      if(hostile.length > 0) {
          var hostileUsername = hostile.owner.username;
          console.log(`User ${hostileUsername} spotted in room ${roomName}`);
          creep.moveTo(hostiles);
          creep.attack(hostile);
      }
    }
	}
};

module.exports = role_defendmelee;
