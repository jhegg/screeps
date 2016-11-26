var roleHarvester = {

  run: function(creep, energyStorageStructures) {
    if (creep.carry.energy < creep.carryCapacity) {
      const source = Game.getObjectById(creep.memory.sourceId);
      if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source);
      }
    } else {
      if (energyStorageStructures.length > 0) {
        if (creep.transfer(energyStorageStructures[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(energyStorageStructures[0]);
        }
      }
    }
  }
};

module.exports = roleHarvester;
