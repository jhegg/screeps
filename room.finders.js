var roomFinders = {
  findConstructionSites: function(room) {
    return room.find(FIND_CONSTRUCTION_SITES);
  },
  findDroppedResources: function(room) {
    return room.find(FIND_DROPPED_RESOURCES);
  },
  findEnergyStorageStructures: function(room) {
    return room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_EXTENSION ||
            structure.structureType == STRUCTURE_SPAWN ||
            structure.structureType == STRUCTURE_TOWER) &&
          structure.energy < structure.energyCapacity;
      }
    });
  },
  findRoadsToRepair: function(room) {
    return room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType === STRUCTURE_ROAD &&
          (structure.hits < structure.hitsMax / 3);
      }
    });
  },
};

module.exports = roomFinders;
