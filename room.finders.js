var roomFinders = {
  findConstructionSites: function(room) {
    return room.find(FIND_CONSTRUCTION_SITES);
  },
  findCreepsNeedingHealing: function(room) {
    return _.filter(Game.creeps, (creep) =>
      creep.roomName === room.roomName &&
      creep.hits < creep.hitsMax
    );
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
          (structure.hits < structure.hitsMax / 2);
      }
    });
  },
  findHostiles: function(room) {
    return room.find(FIND_HOSTILE_CREEPS);
  },
  findStructuresToRepair: function(room) {
    return _.filter(Game.structures, (structure) =>
      (structure.hits < structure.hitsMax) &&
      structure.room.name === room.name
    );
  },
  findTowers: function(room) {
    return _.filter(Game.structures, (structure) =>
      structure.structureType === STRUCTURE_TOWER &&
      structure.room.name === room.name
    );
  },
};

module.exports = roomFinders;
