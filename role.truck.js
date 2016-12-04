var roomUtility = require('room.utility');

var roleTruck = {
  run: function(creep, energyStorageStructures) {
    if (creep.memory.delivering &&
      creep.carry.energy === 0) {
      creep.memory.delivering = false;
      creep.memory.deliveryId = undefined;
      creep.say('pickup');
    } else if (creep.memory.delivering) {
      const deliveryTarget = Game.getObjectById(creep.memory.deliveryId);
      if (deliveryTarget === null ||
        (deliveryTarget.structureType !== STRUCTURE_CONTAINER &&
        deliveryTarget.energy === deliveryTarget.energyCapacity) ||
        (deliveryTarget.structureType === STRUCTURE_CONTAINER &&
        _.sum(deliveryTarget.store) === deliveryTarget.storeCapacity)) {
        creep.memory.delivering = false;
        creep.memory.deliveryId = undefined;
      }
    }

    if (!creep.memory.delivering &&
      creep.carry.energy === creep.carryCapacity) {
      creep.memory.delivering = true;
      creep.memory.deliveryId = undefined;
      creep.say('delivering');
    }

    if (!creep.memory.delivering) {
      retrieveEnergy(creep, energyStorageStructures);
    } else {
      updateDedicatedControllerContainerTruck(creep);
      if (shouldDeliverToControllerContainer(creep)) {
        deliverEnergyToControllerContainer(creep);
        return;
      }
      const deliveryTarget = getDeliveryTarget(creep, energyStorageStructures);
      deliverEnergyToTarget(creep, deliveryTarget);
    }
  },
};

function getDeliveryTarget(creep, energyStorageStructures) {
  const deliveryTarget = Game.getObjectById(creep.memory.deliveryId);
  if (deliveryTarget !== null) {
    return deliveryTarget;
  } else {
    return pickTargetDestination(creep, energyStorageStructures);
  }
}

function pickTargetDestination(creep, structures) {
  const sortedStructures = prioritizeStructures(creep.room, structures);
  creep.memory.deliveryId = sortedStructures[0].id;
  return sortedStructures[0];
}

function deliverEnergyToTarget(creep, deliveryTarget) {
  if (creep.transfer(deliveryTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.moveTo(deliveryTarget);
  }
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
