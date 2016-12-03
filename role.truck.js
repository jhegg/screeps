var roomUtility = require('room.utility');

var roleTruck = {
  run: function(creep, energyStorageStructures) {
    if (creepNeedsEnergyToCarry(creep)) {
      retrieveEnergy(creep, energyStorageStructures);
    } else {
      deliverEnergyToStructures(creep, energyStorageStructures);
    }
  },
};

function creepNeedsEnergyToCarry(creep) {
  return creep.carry.energy < creep.carryCapacity;
}

function retrieveEnergy(creep, energyStorageStructures) {
  const containers = filterContainersWhichHaveEnergy(
    roomUtility.getSourceContainers(creep.room));
  if (creep.withdraw(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.moveTo(containers[0]);
  }
}

function filterContainersWhichHaveEnergy(structures) {
  return _.filter(structures, function(structure) {
    return structure.structureType === STRUCTURE_CONTAINER &&
      structure.store[RESOURCE_ENERGY] > 0;
  });
}

function deliverEnergyToStructures(creep, structures) {
  const sortedStructures = prioritizeStructures(creep.room, structures);
  if (creep.transfer(sortedStructures[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.moveTo(sortedStructures[0]);
  }
}

function prioritizeStructures(room, structures) {
  // prioritize Extension -> Spawn -> Tower -> non-source Container
  const extensions = filterStructuresByTypeAndEnergy(structures,
    STRUCTURE_EXTENSION);
  const spawns = filterStructuresByTypeAndEnergy(structures,
    STRUCTURE_SPAWN);
  const towers = filterStructuresByTypeAndEnergy(structures,
    STRUCTURE_TOWER);
  const containers = filterContainersByStorage(room, structures);
  return _.flatten([
    extensions,
    spawns,
    towers,
    containers
  ]);
}

function filterStructuresByTypeAndEnergy(structures, structureType) {
  return _.filter(structures, function(structure) {
    return structure.structureType === structureType &&
      structure.energy < structure.energyCapacity;
  });
}

function filterContainersByStorage(room, structures) {
  const sourceContainers = roomUtility.getSourceContainers(room);
  return _.filter(structures, function(structure) {
    return structure.structureType === STRUCTURE_CONTAINER &&
      !_.any(sourceContainers, 'id', structure.id) &&
      _.sum(structure.store) < 2000;
  });
}

module.exports = roleTruck;
