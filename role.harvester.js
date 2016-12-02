var roleHarvester = {
  run: function(creep, energyStorageStructures) {
    if (creepNeedsEnergyToCarry(creep)) {
      harvestEnergyFromSourceMemory(creep);
    } else {
      deliverEnergyToStructures(creep, energyStorageStructures);
    }
  },
};

function creepNeedsEnergyToCarry(creep) {
  return creep.carry.energy < creep.carryCapacity;
}

function harvestEnergyFromSourceMemory(creep) {
  const source = Game.getObjectById(creep.memory.sourceId);
  if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
    creep.moveTo(source);
  }
}

function deliverEnergyToStructures(creep, structures) {
  if (structures.length > 0) {
    const sortedStructures = prioritizeStructures(structures);
    if (creep.transfer(sortedStructures[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(sortedStructures[0]);
    }
  }
}

function prioritizeStructures(structures) {
  // prioritize Extension -> Spawn -> Tower -> Container
  const extensions = filterStructuresByTypeAndEnergy(structures,
    STRUCTURE_EXTENSION);
  const spawns = filterStructuresByTypeAndEnergy(structures,
    STRUCTURE_SPAWN);
  const towers = filterStructuresByTypeAndEnergy(structures,
    STRUCTURE_TOWER);
  const containers = filterContainersByStorage(structures);
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

function filterContainersByStorage(structures) {
  _.filter(structures, function(structure) {
    return structure.structureType === STRUCTURE_CONTAINER &&
      _.sum(structure.store) < 2000;
  });
}

module.exports = roleHarvester;
