var utilRoom = {

    /** @param {string} roomName **/
    getEnergy: function(roomName) {
        return Game.rooms[roomName].energyAvailable
    },

    /** @param {string} roomName */
    getValidTilesCloseTo: function(roomName, position, range) {
        var validTiles = []
        var validTilesCloseTo = []
        const terrain = new Room.Terrain(roomName)
        for(let y = 0; y < 50; y++ ) {
            for(let x = 0; x < 50; ) {
                const tile = terrain.get(x, y);
                const weight =
                tile === TERRAIN_MASK_WALL  ? 255 : // wall  => unwalkable
                tile === TERRAIN_MASK_SWAMP ?   5 : // swamp => weight:  5
                                                1 ; // plain => weight:  1

                var objAtPos = Game.rooms[roomName].lookAt(x, y)
                if (weight <= 1 && objAtPos.length <=1 ) { // Check for other structures as well
                    validTiles.push([x,y])
                }
                x = x + 2
            }
        }
        for (let index = 0; index < validTiles.length; index++) {
            const element = validTiles[index];
            if (position.inRangeTo(element[0], element[1], range)) {
                validTilesCloseTo.push(element)
            }
        }
        return validTilesCloseTo
    }
}
module.exports = utilRoom;
