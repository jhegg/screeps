var roleUtility = require('role.utility');

var roleBuilder = {
  run: function(creep, creepWorkData) {
    if (creep.memory.building && creep.carry.energy === 0) {
      creep.memory.building = false;
      creep.say('harvesting');
    }
    if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
      creep.memory.building = true;
      creep.say('building');
    }

    if (creep.memory.building) {
      if (creepWorkData.constructionSites.length) {
        const constructionSitesSortedByMostProgress = creepWorkData.constructionSites.sort(function(a, b) {
          return b.progress - a.progress;
        });
        const extensionSites = _.filter(constructionSitesSortedByMostProgress, (site) =>
          site.structureType === STRUCTURE_EXTENSION
        );
        if (extensionSites.length) {
          if (creep.build(extensionSites[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(extensionSites[0]);
          }
        } else {
          if (creep.build(constructionSitesSortedByMostProgress[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(constructionSitesSortedByMostProgress[0]);
          }
        }
      } else {
        console.log('Builder '+creep+' has no construction site; error?');
      }
    } else {
      if (creepWorkData.droppedResources.length) {
        if (creep.pickup(creepWorkData.droppedResources[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(creepWorkData.droppedResources[0]);
        }
        return;
      }

      const spawnContainer = Game.getObjectById(creep.room.memory.SpawnContainer);
      const towerContainer = Game.getObjectById(creep.room.memory.TowerContainer);
      const controllerContainer = Game.getObjectById(creep.room.memory.ControllerContainer);
      const source1Container = Game.getObjectById(creep.room.memory.Source1Container);
      const source2Container = Game.getObjectById(creep.room.memory.Source2Container);
      const containers = [
        spawnContainer,
        towerContainer,
        controllerContainer,
        source1Container,
        source2Container,
      ];

      for (var container of containers) {
        if (container && container.store[RESOURCE_ENERGY] > 250) {
          if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(container);
          }
          return;
        }
      }

      // todo why doesn't this work? a container with 2k energy sat idle.
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

module.exports = roleBuilder;
