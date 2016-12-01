var roleUtility = require('role.utility');

var roleUpgrader = {

  run: function(creep, creepWorkData) {
    if (creep.memory.upgrading && creep.carry.energy === 0) {
      creep.memory.upgrading = false;
      creep.say('harvesting');
    }

    if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
      creep.memory.upgrading = true;
      creep.say('upgrading');
    }

    if (creep.memory.upgrading) {
      if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller);
      }
    } else {
      const controllerContainer = Game.getObjectById(creep.room.memory.ControllerContainer);
      if (controllerContainer && controllerContainer.store[RESOURCE_ENERGY] > 50) {
        if (creep.withdraw(controllerContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(controllerContainer);
        }
        return;
      }

      const containersWithEnergy =
        roleUtility.containersWithEnergy(creepWorkData.energyStorageStructures);
      if (containersWithEnergy.length) {
        if (creep.withdraw(containersWithEnergy[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(containersWithEnergy[0]);
        }
        return;
      }

      const source = Game.getObjectById(creep.memory.sourceId);
      if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source);
      }
    }
  }
};

module.exports = roleUpgrader;
