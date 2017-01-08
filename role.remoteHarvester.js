Creep.prototype.remoteReserving = function() {
  const flag = this.getRemoteHarvesterFlag();
  if (flag === undefined) {
    return;
  }

  if (flag.pos.roomName !== this.room.name) {
    this.moveTo(flag);
    return;
  }

  if (flag.pos.roomName === this.room.name) {
    this.updateFlagMemoryWithSourceIds(flag);
  }

  const roomController = this.room.controller;
  if (roomController &&
    roomController.my === false ||
    roomController.my === undefined) {
      if (this.reserveController(roomController) === ERR_NOT_IN_RANGE) {
        this.moveTo(roomController, {maxRooms: 1});
        this.reserveController(roomController);
      }
  }
};

Creep.prototype.remoteHarvesting = function() {
  const flag = this.getRemoteHarvesterFlag();
  if (flag === undefined) {
    return;
  }

  if (flag.pos.roomName !== this.room.name) {
    this.moveTo(flag);
    return;
  }

  if (this.memory.harvestSourceId === undefined) {
    const sourceIds = flag.memory.sourceIds;
    if (sourceIds === undefined) {
      console.log(`ERROR: ${this.room} Remote harvester ${this} could not determine available sourceIds from flag memory.sourceIds`);
      return;
    }

    const desiredSourceIds = _.filter(sourceIds, (sourceIds) =>
      !_.any(Game.creeps, 'memory.harvestSourceId', sourceIds.id));
    if (desiredSourceIds.length) {
      this.memory.harvestSourceId = desiredSourceIds[0].id;
    } else {
      console.log(`ERROR: ${this.room} Remote harvester ${this} could not determine available sourceId`);
      return;
    }
  }

  const source = Game.getObjectById(this.memory.harvestSourceId);
  if (source === null) {
    console.log(`ERROR: ${this.room} Remote harvester ${this} has undefined memory.harvestSourceId`);
    return;
  }

  if (this.harvest(source) === ERR_NOT_IN_RANGE) {
    const moveResult = this.moveTo(source, {maxRooms: 1});
    this.harvest(source);
  }

  const raidingFlagName = `RaidingFlag${this.room.name}`;
  if (this.room.getHostiles().length && Game.flags[raidingFlagName] === undefined) {
    this.pos.createFlag(raidingFlagName);
  }
};

Creep.prototype.remoteTrucking = function() {
  const flag = this.getRemoteHarvesterFlag();
  if (flag === undefined) {
    return;
  }

  if (this.memory.pickup === undefined) {
    this.memory.pickup = true;
  }

  if (this.memory.pickup === true && _.sum(this.carry) === this.carryCapacity) {
    this.memory.pickup = false;
  }

  if (this.memory.pickup === false && _.sum(this.carry) < 5) {
    this.memory.pickup = true;
  }

  if (this.memory.pickup === true) {
    if (flag.pos.roomName !== this.room.name) {
      this.moveTo(flag);
      return;
    }

    // TODO: maybe need to figure out how to assign a truck to a harvester, instead of dropped resource
    // TODO: oh, figure out the room position of the dropped resources
    // TODO: maybe have the harvester update its room position when it's harvesting on the flag memory?

    if (this.memory.remotePickupId === undefined) {
      const droppedResources = this.room.getDroppedResources();
      if (droppedResources.length) {
        const availableResources = _.filter(droppedResources, (resource) =>
          !_.any(Game.creeps, 'memory.remotePickupId', resource.id));
        const closestAvailableResources = _.sortBy(availableResources, (resource) =>
          Math.hypot(this.pos.x - resource.pos.x, this.pos.y - resource.pos.y));
        if (closestAvailableResources.length) {
          this.memory.remotePickupId = closestAvailableResources[0].id;
        } else {
          return;
        }
      } else {
        return;
      }
    }

    var resourceToPickup = Game.getObjectById(this.memory.remotePickupId);
    if (resourceToPickup === null) {
      this.memory.remotePickupId = undefined;
    }

    if (this.pickup(resourceToPickup) === ERR_NOT_IN_RANGE) {
      const moveResult = this.moveTo(resourceToPickup, {ignoreCreeps: true, maxRooms: 1});
      if (moveResult === ERR_NO_PATH) {
        console.log(`Error: ${this.room} Remote truck ${this} moveResult=ERR_NO_PATH towards ${resourceToPickup}`);
        return;
      }
      this.pickup(resourceToPickup);
    }
  } else {
    if (this.memory.deliveryTarget === undefined) {
      const storageUnits = _.filter(Game.structures, (structure) =>
        structure.structureType === STRUCTURE_STORAGE);
      if (storageUnits.length) {
        const storageSortedByDistance = _.sortBy(storageUnits, (storage) =>
          Game.map.getRoomLinearDistance(this.room.name, storage.room.name));
        if (storageSortedByDistance.length) {
          console.log(`DEBUG: ${this.room} Remote truck selected storage:  ${storageSortedByDistance[0]} id: ${storageSortedByDistance[0].id}`);
          this.memory.deliveryTarget = storageSortedByDistance[0].id;
        } else {
          console.log(`ERROR: ${this.room} Remote truck ${this} unable to find any storage units sorted by distance`);
          return;
        }
      } else {
        console.log(`ERROR: ${this.room} Remote truck ${this} unable to find any storage units`);
        return;
      }
    }

    this.moveTruckWhileBuildingRoads();
  }
};

Creep.prototype.getRemoteHarvesterFlag = function() {
  return Game.flags[this.memory.remoteHarvesterFlag];
};

Creep.prototype.updateFlagMemoryWithSourceIds = function(flag) {
  if (flag.memory.sourceIds === undefined) {
    const sources = this.room.getSourcesMinusBlacklist();
    if (sources.length) {
      flag.memory.sourceIds = _.map(sources, (source) => {
        return {'id': source.id};
      });
    }
  }
};

Creep.prototype.moveTruckWhileBuildingRoads = function() {
  const deliveryTarget = Game.getObjectById(this.memory.deliveryTarget);
  if (deliveryTarget === null) {
    console.log(`ERROR: ${this.room} Remote truck ${this} has invalid deliveryTarget: ${this.memory.deliveryTarget}`);
    return;
  }

  const roadsAtPosition = _.filter(this.pos.lookFor(LOOK_STRUCTURES), 'structureType', STRUCTURE_ROAD);
  if (roadsAtPosition.length) {
    const road = roadsAtPosition[0];
    if (road.hits < road.hitsMax) {
      this.repair(road);
    }

    if (deliveryTarget.pos.roomName === this.room.name) {
      const resourceToTransfer = _.keys(this.carry)[0];
      if (this.transfer(deliveryTarget, resourceToTransfer) === ERR_NOT_IN_RANGE) {
        this.moveTo(deliveryTarget);
        this.transfer(deliveryTarget, resourceToTransfer);
      }
      return;
    } else {
      this.moveTo(deliveryTarget, {ignoreCreeps: true});
    }
  } else {
    const constructionSitesAtPosition = this.pos.lookFor(LOOK_CONSTRUCTION_SITES);
    if (constructionSitesAtPosition.length) {
      const constructionSite = constructionSitesAtPosition[0];
      this.build(constructionSite);
      return;
    } else {
      const createResult = this.pos.createConstructionSite(STRUCTURE_ROAD);
      if (createResult === ERR_INVALID_TARGET) {
        this.moveTo(deliveryTarget);
      }
      return;
    }
  }
};
