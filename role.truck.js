var roomUtility = require('room.utility');

var roleTruck = {
  run: function(creep, energyStorageStructures) {
    if (creepNeedsEnergyToCarry(creep)) {
      retrieveEnergy(creep, energyStorageStructures);
    } else {
      updateDedicatedControllerContainerTruck(creep);
      if (shouldDeliverToControllerContainer(creep)) {
        deliverEnergyToControllerContainer(creep);
        return;
      }
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

function updateDedicatedControllerContainerTruck(creep) {
  const dedicatedTruck = _.filter(Game.creeps, function(creep) {
    return creep.memory.dedicatedControllerContainer !== undefined;
  });
  if (!dedicatedTruck || dedicatedTruck.length === 0) {
    console.log(`New dedicated controller container truck: ${creep}`);
    creep.memory.dedicatedControllerContainer = true;
  }
}

function shouldDeliverToControllerContainer(creep) {
  return creep.memory.dedicatedControllerContainer &&
    Game.getObjectById(creep.room.memory.ControllerContainer) !== null;
}

function deliverEnergyToControllerContainer(creep) {
  const container = Game.getObjectById(creep.room.memory.ControllerContainer);
  if (creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.moveTo(container);
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
