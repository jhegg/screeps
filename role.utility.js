var roleUtility = {
  containersWithEnergy: function(energyStorageStructures) {
    return _.filter(energyStorageStructures, (structure) =>
      structure.structureType === STRUCTURE_CONTAINER &&
      structure.store[RESOURCE_ENERGY] > 50
    );
  },
};

module.exports = roleUtility;
