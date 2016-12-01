var roleHarvester = {

  run: function(creep, energyStorageStructures) {
    if (creep.carry.energy < creep.carryCapacity) {
      const source = Game.getObjectById(creep.memory.sourceId);
      if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source);
      }
    } else {
      if (energyStorageStructures.length > 0) {
        // prioritize Extension -> Spawn -> Tower -> Container
        const extensions = _.filter(energyStorageStructures, function(structure) {
          return structure.structureType === STRUCTURE_EXTENSION &&
            structure.energy < structure.energyCapacity;
        });
        const spawns = _.filter(energyStorageStructures, function(structure) {
          return structure.structureType === STRUCTURE_SPAWN &&
            structure.energy < structure.energyCapacity;
        });
        const towers = _.filter(energyStorageStructures, function(structure) {
          return structure.structureType === STRUCTURE_TOWER &&
            structure.energy < structure.energyCapacity;
        });
        const containers = _.filter(energyStorageStructures, function(structure) {
          return structure.structureType === STRUCTURE_CONTAINER &&
            _.sum(structure.store) < 2000;
        });
        const newSortedStructures = _.flatten([extensions, spawns, towers, containers]);

        if (creep.transfer(newSortedStructures[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(newSortedStructures[0]);
        }
      }
    }
  }
};

module.exports = roleHarvester;
