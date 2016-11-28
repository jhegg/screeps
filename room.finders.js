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
            structure.structureType == STRUCTURE_TOWER ||
            structure.structureType == STRUCTURE_CONTAINER) &&
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
  findHostiles: function(room) {
    return room.find(FIND_HOSTILE_CREEPS);
  },
};

module.exports = roomFinders;
