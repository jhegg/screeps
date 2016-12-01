var roleHarvester = {

  run: function(creep, energyStorageStructures) {
    if (creep.carry.energy < creep.carryCapacity) {
      const source = Game.getObjectById(creep.memory.sourceId);
      if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source);
      }
    } else {
      if (energyStorageStructures.length > 0) {
        // prioritize Tower -> Spawn -> Extension -> Container
        var sortedEnergyStructures = _.sortBy(energyStorageStructures,
          [function(structure) { return structure.structureType;}],
          ['desc']
        );
        if (creep.transfer(sortedEnergyStructures[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(sortedEnergyStructures[0]);
        }
      }
    }
  }
};

module.exports = roleHarvester;
