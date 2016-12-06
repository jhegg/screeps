var roleUtility = require('role.utility');

var roleBuilder = {
  run: function(creep, creepWorkData) {
    if (creep.memory.building && creep.carry.energy === 0) {
      creep.memory.building = false;
      creep.memory.containerId = undefined;
      creep.memory.pickupWasEmptyCounter = undefined;
      creep.say('harvesting');
    }
    if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
      creep.memory.building = true;
      creep.memory.containerId = undefined;
      creep.say('building');
    }

    if (creep.memory.building) {
      if (creepWorkData.constructionSites.length) {
        const creepPosition = creep.pos;
        const constructionSitesSortedByDistance = creepWorkData.constructionSites.sort(function(a, b) {
          const distanceA = Math.hypot(creepPosition.x - a.pos.x, creepPosition.y - a.pos.y);
          const distanceB = Math.hypot(creepPosition.x - b.pos.x, creepPosition.y - b.pos.y);
          return distanceA - distanceB;
        });
        const extensionSites = _.filter(constructionSitesSortedByDistance, (site) =>
          site.structureType === STRUCTURE_EXTENSION
        );
        if (extensionSites.length) {
          if (creep.build(extensionSites[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(extensionSites[0]);
            creep.build(extensionSites[0]);
          }
        } else {
          if (creep.build(constructionSitesSortedByDistance[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(constructionSitesSortedByDistance[0]);
            creep.build(constructionSitesSortedByDistance[0]);
          }
        }
      } else {
        console.log('Builder '+creep+' has no construction site; error?');
      }
    } else {
      if (creep.memory.containerId !== undefined) {
        const container = Game.getObjectById(creep.memory.containerId);
        const withdrawResult = creep.withdraw(container, RESOURCE_ENERGY);
        switch (withdrawResult) {
          case OK:
            creep.memory.pickupWasEmptyCounter = undefined;
            return;
          case ERR_NOT_OWNER:
            console.log(`Error: builder unable to transfer from ${container}
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
            console.log(`Error: builder ${creep} tried to harvest from
              ${container} which is invalid`);
            break;
          case ERR_FULL:
            console.log(`Warning: builder ${creep} was full but tried to harvest
              anyway`);
            break;
          case ERR_NOT_IN_RANGE:
            creep.memory.pickupWasEmptyCounter = undefined;
            creep.moveTo(container);
            creep.withdraw(container, RESOURCE_ENERGY);
            return;
          case ERR_INVALID_ARGS:
            console.log(`Error: builder ${creep} tried to withdraw from
               ${container} but resource amount or type was incorrect`);
            break;
          default:
            console.log(`Warning: unknown result ${withdrawResult} from builder
               withdraw`);
        }
        return;
      }

      const spawnContainer = Game.getObjectById(creep.room.memory.SpawnContainer);
      const towerContainer = Game.getObjectById(creep.room.memory.TowerContainer);
      const source1Container = Game.getObjectById(creep.room.memory.Source1Container);
      const source2Container = Game.getObjectById(creep.room.memory.Source2Container);
      const containers = [
        spawnContainer,
        towerContainer,
        source1Container,
        source2Container,
      ];

      for (var container of containers) {
        if (container && container.store[RESOURCE_ENERGY] > 250) {
          creep.memory.containerId = container.id;
          if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(container);
            creep.withdraw(container, RESOURCE_ENERGY);
          }
          return;
        }
      }

      if (!creep.room.memory.sourceContainers) {
        const source = Game.getObjectById(creep.memory.sourceId);
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
          creep.moveTo(source);
          creep.harvest(source);
        }
      }
    }
  }
};

module.exports = roleBuilder;
