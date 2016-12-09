var roleUtility = require('role.utility');

var roleUpgrader = {
  run: function(creep) {
    if (creep.memory.upgrading && creep.carry.energy === 0) {
      creep.memory.upgrading = false;
      creep.say('harvesting');
    }

    if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
      creep.memory.upgrading = true;
      creep.memory.containerId = undefined;
      creep.say('upgrading');
    }

    if (creep.memory.upgrading) {
      if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller);
        creep.upgradeController(creep.room.controller);
      }
    } else {
      if (creep.memory.containerId !== undefined) {
        const container = Game.getObjectById(creep.memory.containerId);
        const withdrawResult = creep.withdraw(container, RESOURCE_ENERGY);
        switch (withdrawResult) {
          case OK:
            creep.memory.pickupWasEmptyCounter = undefined;
            creep.upgradeController(creep.room.controller);
            break;
          case ERR_NOT_OWNER:
            console.log(`Error: upgrader unable to transfer from ${container}
              due to ownership/rampart`);
            break;
          case ERR_BUSY:
            // still spawning
            break;
          case ERR_NOT_ENOUGH_RESOURCES:
            if (!creep.memory.pickupWasEmptyCounter) {
              creep.memory.pickupWasEmptyCounter = 1;
            } else {
              creep.memory.pickupWasEmptyCounter += 1;
            }
            if (creep.memory.pickupWasEmptyCounter > 4) {
              creep.memory.containerId = undefined;
              creep.memory.pickupWasEmptyCounter = undefined;
            }
            break;
          case ERR_INVALID_TARGET:
            console.log(`Error: upgrader ${creep} tried to harvest from
              ${container} which is invalid`);
            break;
          case ERR_FULL:
            console.log(`Warning: upgrader ${creep} was full but tried to harvest
              anyway`);
            break;
          case ERR_NOT_IN_RANGE:
            creep.moveTo(container);
            creep.withdraw(container, RESOURCE_ENERGY);
            break;
          case ERR_INVALID_ARGS:
            console.log(`Error: upgrader ${creep} tried to withdraw from
               ${container} but resource amount or type was incorrect`);
            break;
          default:
            console.log(`Warning: unknown result ${withdrawResult} from upgrader
               withdraw`);
        }
        return;
      }

      const controllerContainer = Game.getObjectById(creep.room.memory.ControllerContainer);
      const spawnContainer = Game.getObjectById(creep.room.memory.SpawnContainer);
      const towerContainer = Game.getObjectById(creep.room.memory.TowerContainer);
      const roomStorage = creep.room.storage;
      const source1Container = Game.getObjectById(creep.room.memory.Source1Container);
      const source2Container = Game.getObjectById(creep.room.memory.Source2Container);
      const containers = [
        controllerContainer,
        spawnContainer,
        towerContainer,
        roomStorage,
        source1Container,
        source2Container,
      ];

      for (var container of containers) {
        if (container && container.store[RESOURCE_ENERGY] > 150) {
          creep.memory.containerId = container.id;
          if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(container);
            creep.withdraw(container, RESOURCE_ENERGY);
          }
          return;
        }
      }

      const source = Game.getObjectById(creep.memory.sourceId);
      if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source);
        creep.harvest(source);
      }
    }
  }
};

module.exports = roleUpgrader;
