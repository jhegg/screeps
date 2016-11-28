var towerController = {
  run: function(room, hostileCreeps) {
    const towersInRoom = _.filter(Game.structures, (structure) =>
      structure.structureType === STRUCTURE_TOWER &&
      structure.roomName === room.roomName
    );
    towersInRoom.forEach(function(tower) {
      if (hostileCreeps.length > 0) {
        const hostileCreep = hostileCreeps[0];
        console.log('Attacking hostile ' + hostileCreep + ' in room ' + room);
        const attackResult = tower.attack(hostileCreeps[0]);
        switch (attackResult) {
          case OK:
            console.log('Successful attack on hostile ' + hostileCreep +
              ' by tower ' + tower);
            break;
          case ERR_NOT_ENOUGH_RESOURCES:
            console.log('Warning! Tower ' + tower + ' does not have enough ' +
              'resources for attacking');
            break;
          case ERR_INVALID_TARGET:
            console.log('Error: Tower ' + tower + ' attempted to attack an ' +
              'invalid target ' + hostileCreep);
            break;
          case ERR_RCL_NOT_ENOUGH:
            console.log('Error: Room Controller Level insufficient for tower');
            break;
          default:
            console.log('Unknown result ' + attackResult + ' of attack from ' +
              tower);
        }
        return;
      }

      // TODO: any structures to repair? repair.

      const creepsNeedingHealing = _.filter(Game.creeps, (creep) =>
        creep.roomName === room.roomName &&
        creep.hits < creep.hitsMax
      );
      if (creepsNeedingHealing.length > 0) {
        const creep = creepsNeedingHealing[0];
        console.log(tower + ' healing ' + creep);
        tower.heal(creep);
        return;
      }
    });
  },
};

module.exports = towerController;
