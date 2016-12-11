var roleTruck = {
  run: function(creep, energyStorageStructures) {
    if (creep.memory.delivering &&
      _.sum(creep.carry) === 0) {
      creep.memory.delivering = false;
      creep.memory.deliveryId = undefined;
      creep.memory.pickupId = undefined;
      creep.say('pickup');
    } else if (creep.memory.delivering &&
      creep.memory.dedicatedControllerContainer === undefined) {
      const deliveryTarget = Game.getObjectById(creep.memory.deliveryId);
      if (deliveryTarget === null ||
        (deliveryTarget.structureType !== STRUCTURE_CONTAINER &&
        deliveryTarget.energy === deliveryTarget.energyCapacity) ||
        (deliveryTarget.structureType === STRUCTURE_CONTAINER &&
        _.sum(deliveryTarget.store) === deliveryTarget.storeCapacity)) {
        creep.memory.delivering = true; // need new target, but still delivering
        creep.memory.deliveryId = undefined;
        creep.memory.pickupId = undefined;
      }
    }

    if (!creep.memory.delivering &&
      (_.sum(creep.carry) === creep.carryCapacity ||
        (creep.memory.pickupWasEmptyCounter > 4 && _.sum(creep.carry) > 49))) {
      creep.memory.delivering = true;
      creep.memory.deliveryId = undefined;
      creep.memory.pickupId = undefined;
      creep.memory.pickupWasEmptyCounter = undefined;
      creep.say('delivering');
    }

    if (!creep.memory.delivering) {
      retrieveResources(creep, energyStorageStructures);
    } else {
      updateDedicatedControllerContainerTruck(creep);
      if (shouldDeliverToControllerContainer(creep)) {
        deliverEnergyToControllerContainer(creep);
        return;
      }
      const deliveryTarget = getDeliveryTarget(creep, energyStorageStructures);
      if (deliveryTarget) {
        deliverResourceToTarget(creep, deliveryTarget);
      }
    }
  },
};

function getDeliveryTarget(creep, energyStorageStructures) {
  const nonEnergyResources = _.any(Object.keys(creep.carry), function(resource) {
    return resource !== RESOURCE_ENERGY; });
  if (nonEnergyResources &&
    creep.room.storage &&
    (_.sum(creep.room.storage.store) < creep.room.storage.storeCapacity)) {
      return creep.room.storage;
    }
  const deliveryTarget = Game.getObjectById(creep.memory.deliveryId);
  if (deliveryTarget !== null) {
    return deliveryTarget;
  } else {
    return pickTargetDestination(creep, energyStorageStructures);
  }
}

function pickTargetDestination(creep, structures) {
  const sortedStructures = prioritizeStructures(creep.room, structures);
  if (sortedStructures[0]) {
    creep.memory.deliveryId = sortedStructures[0].id;
    return sortedStructures[0];
  } else {
    return sortedStructures[0];
  }
}

function deliverResourceToTarget(creep, deliveryTarget) {
  const resource = _.findKey(creep.carry, function(resource) {
    return resource > 0;
  });
  switch (creep.transfer(deliveryTarget, resource)) {
    case ERR_NOT_IN_RANGE:
      creep.moveTo(deliveryTarget);
      creep.transfer(deliveryTarget, resource);
      break;
    case ERR_FULL:
      pickTargetDestination(creep, creep.room.getEnergyStorageStructures());
      break;
    default:
      break;
  }
  if (creep.transfer(deliveryTarget, resource) == ERR_NOT_IN_RANGE) {
    creep.moveTo(deliveryTarget);
    creep.transfer(deliveryTarget, resource);
  }
}

function retrieveResources(creep, energyStorageStructures) {
  const droppedResources = creep.room.getDroppedResources();
  if (droppedResources.length) {
    findAndPickupDroppedResource(creep, droppedResources[0]);
    return;
  }

  const sourceContainer = getPickupContainer(creep);
  if (!sourceContainer) {
    // no sources available :(
    return;
  }
  const withdrawResult = creep.withdraw(sourceContainer, RESOURCE_ENERGY);
  switch (withdrawResult) {
    case OK:
      creep.memory.pickupWasEmptyCounter = undefined;
      break;
    case ERR_NOT_OWNER:
      console.log(`Error: truck unable to transfer from ${sourceContainer}
        due to ownership/rampart`);
      break;
    case ERR_BUSY:
      // still spawning
      break;
    case ERR_NOT_ENOUGH_RESOURCES:
      if (!creep.memory.pickupWasEmptyCounter) {
        creep.memory.pickupWasEmptyCounter = 1;
      } else {
        creep.memory.pickupWasEmptyCounter += 1;
      }
      break;
    case ERR_INVALID_TARGET:
      console.log(`Error: truck ${creep} tried to harvest from
        ${sourceContainer} which is invalid`);
      break;
    case ERR_FULL:
      console.log(`Warning: truck ${creep} was full but tried to harvest
        anyway`);
      break;
    case ERR_NOT_IN_RANGE:
      creep.moveTo(sourceContainer);
      creep.withdraw(sourceContainer, RESOURCE_ENERGY);
      break;
    case ERR_INVALID_ARGS:
      console.log(`Error: truck ${creep} tried to withdraw from
         ${sourceContainer} but resource amount or type was incorrect`);
      break;
    default:
      console.log(`Warning: unknown result ${withdrawResult} from truck
         withdraw`);
  }
}

function findAndPickupDroppedResource(creep, resource) {
  const pickupResult = creep.pickup(resource);
  switch (pickupResult) {
    case OK:
      creep.memory.claimedResource = undefined;
      break;
    case ERR_NOT_IN_RANGE:
      creep.moveTo(resource);
      if (creep.pickup(resource) === OK) {
        creep.memory.pickupWasEmptyCounter = undefined;
      }
      break;
    case ERR_BUSY:
      break;
    default:
      console.log(`Error: unhandled error ${pickupResult} from ${creep.memory.role} ${creep} trying to pickup resource ${resource}`);
      break;
  }
}

function getPickupContainer(creep) {
  const container = Game.getObjectById(creep.memory.pickupId);
  if (container && creep.memory.pickupWasEmptyCounter < 25) {
    return container;
  } else {
    const newContainer = filterContainersWhichHaveEnergy(
      creep.room.getSourceContainers())[0];
    if (newContainer) {
      creep.memory.pickupId = newContainer.id;
      creep.memory.pickupWasEmptyCounter = undefined;
      return newContainer;
    }
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
    creep.transfer(container, RESOURCE_ENERGY);
  }
}

function filterContainersWhichHaveEnergy(structures) {
  const containersWithEnergy = _.filter(structures, function(structure) {
    return structure.structureType === STRUCTURE_CONTAINER &&
      structure.store[RESOURCE_ENERGY] > 0;
  });
  return _.sortByOrder(containersWithEnergy, function(container) {
    return container.store[RESOURCE_ENERGY];
  }, ['desc']);
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
    containers,
    [room.storage],
  ]);
}

function filterStructuresByTypeAndEnergy(structures, structureType) {
  return _.filter(structures, function(structure) {
    return structure.structureType === structureType &&
      structure.energy < structure.energyCapacity;
  });
}

function filterContainersByStorage(room, structures) {
  const sourceContainers = room.getSourceContainers();
  const nonSourceContainers = _.filter(structures, function(structure) {
    return structure.structureType === STRUCTURE_CONTAINER &&
      !_.any(sourceContainers, 'id', structure.id) &&
      _.sum(structure.store) < structure.storeCapacity;
  });
  return _.sortByOrder(nonSourceContainers, function(container) {
    return _.sum(container.store);
  }, ['asc']);
}

module.exports = roleTruck;
