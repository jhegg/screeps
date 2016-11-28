var roomFinders = require('room.finders');

var towerController = {
  run: function(room, hostileCreeps) {
    const towersInRoom = roomFinders.findTowers(room);
    towersInRoom.forEach(function(tower) {
      if (hostileCreeps.length > 0) {
        attackHostile(tower, room, hostileCreeps[0]);
        return;
      }

      // TODO: any structures to repair? repair.

      const creepsNeedingHealing = roomFinders.findCreepsNeedingHealing(room);
      if (creepsNeedingHealing.length > 0) {
        healCreep(tower, creepsNeedingHealing[0]);
        return;
      }
    });
  },
};

function attackHostile(tower, room, hostileCreep) {
  console.log('Attacking hostile ' + hostileCreep + ' in room ' + room);
  const attackResult = tower.attack(hostileCreep);
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
}

function healCreep(tower, creep) {
  console.log(tower + ' healing ' + creep);
  const result = tower.heal(creep);
  switch (result) {
    case OK:
      console.log('Successful heal on ' + creep + ' by tower ' + tower);
      break;
    case ERR_NOT_ENOUGH_RESOURCES:
      console.log('Warning! Tower ' + tower + ' does not have enough ' +
        'resources for healing');
      break;
    case ERR_INVALID_TARGET:
      console.log('Error: Tower ' + tower + ' attempted to heal an ' +
        'invalid target ' + creep);
      break;
    case ERR_RCL_NOT_ENOUGH:
      console.log('Error: Room Controller Level insufficient for tower');
      break;
    default:
      console.log('Unknown result ' + result + ' of heal from ' + tower);
  }
}

module.exports = towerController;
