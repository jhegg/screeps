var roleHarvester = {
  run: function(creep, energyStorageStructures) {
    updateCreepContainerAssignments(creep, energyStorageStructures);
    if (creepNeedsEnergyToCarry(creep)) {
      harvestEnergy(creep, energyStorageStructures);
    } else {
      deliverEnergyToStructures(creep, energyStorageStructures);
    }
  },
};

function updateCreepContainerAssignments(creep, structures) {
  if (structures.length > 0 && !creep.spawning) {
    // Assign one harvester per source/container combo.
    // sourceContainers = [{id: '1234', sourceId: '5678', creep: undefined}]
    const sourceContainers = creep.room.memory.sourceContainers;
    for (var sourceContainerIndex in sourceContainers) {
      const sourceContainer = sourceContainers[sourceContainerIndex];
      if (Game.getObjectById(sourceContainer.id) !== null &&
          Game.getObjectById(sourceContainer.creep) === null &&
          (creep.memory.containerId === undefined ||
           Game.getObjectById(creep.memory.containerId) === null)) {
        console.log(`Assigning ${creep} to container ${sourceContainer.id} and source ${sourceContainer.sourceId}`);
        creep.memory.containerId = sourceContainer.id;
        creep.memory.sourceId = sourceContainer.sourceId;
        sourceContainer.creep = creep.id;
        if (sourceContainers[sourceContainerIndex].creep === undefined) {
          console.log(`Error: creep ${creep.id} was not assigned to sourceContainer ${sourceContainerIndex}`);
        }
      }

      if (creep.memory.containerId) {
        const container = Game.getObjectById(creep.memory.containerId);
        if (container !== null && sourceContainer.creep === undefined) {
          console.log(`Fix: creep ${creep.id} was not originally assigned to sourceContainer ${sourceContainerIndex}, but is now`);
          creep.room.memory.sourceContainers[sourceContainerIndex].creep = creep.id;
        }
      }
    }
  }
}

function creepNeedsEnergyToCarry(creep) {
  return creep.carry.energy < creep.carryCapacity;
}

function harvestEnergy(creep, energyStorageStructures) {
  if (creep.room.memory.sourceContainers === undefined ||
      !creep.room.memory.sourceContainers.length) {
        // sourceContainers not defined: do legacy harvesting
        const source = Game.getObjectById(creep.memory.sourceId);
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
          creep.moveTo(source);
        }
  } else if (creep.memory.containerId) {
    // creep is assigned to fill a container
    const source = Game.getObjectById(creep.memory.sourceId);
    if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
      creep.moveTo(source);
    }
  } else {
    // creep is not assigned to fill a container
    const containers = filterContainersWhichHaveEnergy(energyStorageStructures);
    if (creep.withdraw(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(containers[0]);
    }
  }
}

function filterContainersWhichHaveEnergy(structures) {
  return _.filter(structures, function(structure) {
    return structure.structureType === STRUCTURE_CONTAINER &&
      structure.store[RESOURCE_ENERGY] > 0;
  });
}

function deliverEnergyToStructures(creep, structures) {
  if (structures.length > 0) {
    const container = Game.getObjectById(creep.memory.containerId);
    if (container !== null) {
      if (creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(container);
      }
    } else {
      const sortedStructures = prioritizeStructures(structures);
      if (creep.transfer(sortedStructures[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sortedStructures[0]);
      }
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
  return _.filter(structures, function(structure) {
    return structure.structureType === STRUCTURE_CONTAINER &&
      _.sum(structure.store) < 2000;
  });
}

module.exports = roleHarvester;
