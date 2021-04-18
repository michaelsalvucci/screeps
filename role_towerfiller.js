var role_towerfiller = {

  /*
   * towerfiller is called when the room is under attack
   *
   * Moves to the associated tower and transfers the energy from the link to the tower
   */

    /** @param {Creep, roomName} creep, roomName **/
    run: function(creep, roomName) {

    if (creep.memory.role == "towerfiller") {
      console.log('role_towerfiller.js - hereiam');


      //for loop through the number of towers in the rooms

      //check energy level of tower



      var controllerLevel = Game.spawns['Spawn1'].room.controller.level;
      if (controllerLevel >= 3) { // Then I may have a tower
      }





    }

	}
};

module.exports = role_towerfiller;
