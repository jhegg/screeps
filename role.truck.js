Creep.prototype.trucking = function() {
  if (this.memory.delivering &&
    _.sum(this.carry) === 0) {
    this.memory.delivering = false;
    this.memory.deliveryId = undefined;
    this.memory.pickupId = undefined;
    this.say('pickup');
  } else if (this.memory.delivering &&
    this.memory.dedicatedControllerContainer === undefined) {
    const deliveryTarget = Game.getObjectById(this.memory.deliveryId);
    if (deliveryTarget === null ||
      (deliveryTarget.structureType !== STRUCTURE_CONTAINER &&
      deliveryTarget.energy === deliveryTarget.energyCapacity) ||
      (deliveryTarget.structureType === STRUCTURE_CONTAINER &&
      _.sum(deliveryTarget.store) === deliveryTarget.storeCapacity)) {
      this.memory.delivering = true; // need new target, but still delivering
      this.memory.deliveryId = undefined;
      this.memory.pickupId = undefined;
    }
  }

  if (!this.memory.delivering &&
    (_.sum(this.carry) === this.carryCapacity ||
      (this.memory.pickupWasEmptyCounter > 4 && _.sum(this.carry) > 49))) {
    this.memory.delivering = true;
    this.memory.deliveryId = undefined;
    this.memory.pickupId = undefined;
    this.memory.pickupWasEmptyCounter = undefined;
    this.say('delivering');
  }

  if (!this.memory.delivering) {
    this.truckPickup();
  } else {
    this.updateDedicatedControllerContainerTruck();
    if (this.shouldDeliverToControllerContainer()) {
      this.deliverEnergyToControllerContainer();
      return;
    }
    const deliveryTarget = this.getTruckDeliveryTarget();
    if (deliveryTarget) {
      deliverResourceToTarget(this, deliveryTarget);
    }
  }
};

Creep.prototype.truckPickup = function() {
  const droppedResources = this.room.getDroppedResources();
  if (droppedResources.length &&
    !_.any(Game.creeps, 'memory.pickupId', droppedResources[0].id)) {
      this.memory.pickupId = droppedResources[0].id;
      this.truckPickupDroppedResource(droppedResources[0]);
      return;
  }

  const sourceContainer = this.truckGetPickupContainer();
  if (!sourceContainer) {
    // no sources available :(
    return;
  }
  const withdrawResult = this.withdraw(sourceContainer, RESOURCE_ENERGY);
  switch (withdrawResult) {
    case OK:
      this.memory.pickupWasEmptyCounter = undefined;
      break;
    case ERR_NOT_OWNER:
      console.log(`${this.room} Error: truck unable to transfer from ${sourceContainer}
        due to ownership/rampart`);
      this.memory.pickupId = undefined;
      break;
    case ERR_BUSY:
      // still spawning
      break;
    case ERR_NOT_ENOUGH_RESOURCES:
      if (this.memory.pickupWasEmptyCounter === undefined) {
        this.memory.pickupWasEmptyCounter = 1;
      } else {
        this.memory.pickupWasEmptyCounter += 1;
      }
      break;
    case ERR_INVALID_TARGET:
      console.log(`${this.room} Error: truck ${this} tried to harvest from
        ${sourceContainer} which is invalid`);
      this.memory.pickupId = undefined;
      break;
    case ERR_FULL:
      console.log(`${this.room} Warning: truck ${this} was full but tried to harvest
        anyway`);
      break;
    case ERR_NOT_IN_RANGE:
      this.moveTo(sourceContainer);
      this.withdraw(sourceContainer, RESOURCE_ENERGY);
      break;
    case ERR_INVALID_ARGS:
      console.log(`${this.room} Error: truck ${this} tried to withdraw from
         ${sourceContainer} but resource amount or type was incorrect`);
      this.memory.pickupId = undefined;
      break;
    default:
      console.log(`${this.room} Warning: unknown result ${withdrawResult} from truck
         withdraw`);
  }
};

Creep.prototype.truckPickupDroppedResource = function(resource) {
  const pickupResult = this.pickup(resource);
  switch (pickupResult) {
    case OK:
      this.memory.claimedResource = undefined;
      break;
    case ERR_NOT_IN_RANGE:
      this.moveTo(resource);
      if (this.pickup(resource) === OK) {
        this.memory.pickupWasEmptyCounter = undefined;
      }
      break;
    case ERR_BUSY:
      break;
    default:
      console.log(`${this.room} Error: unhandled error ${pickupResult} from ${this.memory.role} ${this} trying to pickup resource ${resource}`);
      break;
  }
};

Creep.prototype.truckGetPickupContainer = function() {
  const container = Game.getObjectById(this.memory.pickupId);
  if (container &&
    !(container instanceof Resource) &&
    (this.memory.pickupWasEmptyCounter === undefined ||
    this.memory.pickupWasEmptyCounter < 25)) {
    return container;
  } else {
    const newContainer = getBestPickupContainer(this);
    if (newContainer) {
      this.memory.pickupId = newContainer.id;
      this.memory.pickupWasEmptyCounter = undefined;
      return newContainer;
    }
  }
};

function getBestPickupContainer(creep) {
  if (!creep.shouldDeliverToControllerContainer()) {
    const spawnContainer = Game.getObjectById(creep.room.memory.SpawnContainer);
    if (spawnContainer && !_.any(Game.creeps, 'memory.pickupId', spawnContainer.id)) {
      const spawnsAndExtensionsNeedingEnergy = _.filter(creep.room.getAllStructures(),
        (structure) =>
        (structure.structureType === STRUCTURE_EXTENSION ||
          structure.structureType === STRUCTURE_SPAWN) &&
        structure.energy < structure.energyCapacity);
      if (spawnContainer.store[RESOURCE_ENERGY] > 200 &&
        spawnsAndExtensionsNeedingEnergy.length > 2) {
          return spawnContainer;
      } else if (creep.room.storage &&
        creep.room.storage.store[RESOURCE_ENERGY] > 200 &&
        spawnsAndExtensionsNeedingEnergy.length > 2) {
        return creep.room.storage;
      }
    }
  }
  const bestSourceContainer = creep.room.sortSourceContainersByEnergy()[0];
  if (creep.room.storage &&
    creep.room.storage.store[RESOURCE_ENERGY] > 1000 &&
    (!bestSourceContainer || bestSourceContainer.store[RESOURCE_ENERGY] < 200)) {
      return creep.room.storage;
  } else {
    return bestSourceContainer;
  }
}

Creep.prototype.getTruckDeliveryTarget = function() {
  const nonEnergyResources = _.any(Object.keys(this.carry), function(resource) {
    return resource !== RESOURCE_ENERGY; });
  if (nonEnergyResources &&
    this.room.storage &&
    (_.sum(this.room.storage.store) < this.room.storage.storeCapacity)) {
      return this.room.storage;
    }
  const deliveryTarget = Game.getObjectById(this.memory.deliveryId);
  if (deliveryTarget !== null) {
    return deliveryTarget;
  } else {
    return this.pickTruckTargetDestination();
  }
};

Creep.prototype.pickTruckTargetDestination = function() {
  const prioritizedStructures = this.room.prioritizeStructuresForTruck(this);
  const filteredStructures = _.filter(prioritizedStructures, (structure) =>
    structure !== undefined &&
    !_.any(Game.creeps, 'memory.deliveryId', structure.id));
  if (filteredStructures.length) {
    this.memory.deliveryId = filteredStructures[0].id;
    return filteredStructures[0];
  } else if (this.room.storage) {
    this.memory.deliveryId = this.room.storage.id;
    return this.room.storage;
  }
};

function sortStructuresByDistance(structures, position) {
  return _.sortBy(structures, (structure) => Math.hypot(
    position.x - structure.pos.x, position.y - structure.pos.y));
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
      creep.pickTruckTargetDestination();
      break;
    default:
      break;
  }
  if (creep.transfer(deliveryTarget, resource) == ERR_NOT_IN_RANGE) {
    creep.moveTo(deliveryTarget);
    creep.transfer(deliveryTarget, resource);
  }
}

Creep.prototype.updateDedicatedControllerContainerTruck = function() {
  const dedicatedTruck = _.filter(Game.creeps, function(creep) {
    return creep.memory.dedicatedControllerContainer !== undefined;
  });
  if (!dedicatedTruck || dedicatedTruck.length === 0) {
    console.log(`${this.room} New dedicated controller container truck: ${this}`);
    this.memory.dedicatedControllerContainer = true;
  }
};

Creep.prototype.shouldDeliverToControllerContainer = function() {
  return this.memory.dedicatedControllerContainer &&
    Game.getObjectById(this.room.memory.ControllerContainer) !== null;
};

Creep.prototype.deliverEnergyToControllerContainer = function() {
  const container = Game.getObjectById(this.room.memory.ControllerContainer);
  if (this.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    this.moveTo(container);
    this.transfer(container, RESOURCE_ENERGY);
  }
};
