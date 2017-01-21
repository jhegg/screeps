Room.prototype.activateSafeModeDueToHostile = function(hostileCreep) {
  if (this.controller.safeMode === undefined &&
      this.controller.safeModeAvailable > 0 &&
      this.controller.safeModeCooldown === undefined) {
    const safeModeResult = this.controller.activateSafeMode();
    switch (safeModeResult) {
      case OK:
        const message = `${this} Safe mode activated due to ${JSON.stringify(hostileCreep)}`;
        console.log(message);
        Game.notify(message);
        break;
      case ERR_NOT_ENOUGH_RESOURCES:
        console.log(`${this} Error: no safe modes available!`);
        break;
      case ERR_BUSY:
        // another room is in safe mode already, too bad
        break;
      case ERR_TIRED:
        // safe mode is on cooldown
        break;
      default:
        console.log(`${this} Warning: unknown result ${safeModeResult} from
          attempt to activate safe mode`);
    }
  }
};

Room.prototype.activateSafeModeIfNecessary = function() {
  if (this.controller.safeMode > 0) {
    return;
  }

  const hostiles = this.getHostiles();
  if (hostiles.length > 0) {
    const essentialStructures = _.filter(this.getAllStructures(),
      (structure) => structure.structureType === STRUCTURE_EXTENSION ||
      structure.structureType === STRUCTURE_SPAWN ||
      structure.structureType === STRUCTURE_TOWER);
    const damagedEssentialStructures = _.filter(essentialStructures,
      (structure) => structure.hits < structure.hitsMax);
    if (damagedEssentialStructures.length > 0) {
      console.log(`${this} Want to activate safe mode due to damaged structures!`);
      this.activateSafeModeDueToHostile(hostiles[0]);
    }

    const spawnsAndExtensions = _.filter(essentialStructures,
      (structure) => structure.structureType === STRUCTURE_EXTENSION ||
      structure.structureType === STRUCTURE_SPAWN);
    for (var hostile of hostiles) {
      if (hostile.pos.findInRange(spawnsAndExtensions, 4).length > 0) {
        console.log(`${this} Want to activate safe mode due to hostile in range!`);
        this.activateSafeModeDueToHostile(hostile);
      }
    }
  }
};

Room.prototype.areTowersSufficientOnEnergy = function() {
  return _.all(this.getTowers(),
    (tower) => (tower.energy > 0.75 * tower.energyCapacity));
};

Room.prototype.getAllStructures = function() {
  if (!this._allStructures) {
    this._allStructures = this.find(FIND_STRUCTURES);
  }
  return this._allStructures;
};

Room.prototype.getConstructionSites = function() {
  return this.find(FIND_CONSTRUCTION_SITES);
};

Room.prototype.getContainersNeedingRepair = function() {
  if (!this._containersNeedingRepair) {
    this._containersNeedingRepair = _.filter(this.getAllStructures(),
      (structure) => structure.structureType === STRUCTURE_CONTAINER &&
      (structure.hits < structure.hitsMax / 1.25));
  }
  return this._containersNeedingRepair;
};

Room.prototype.getCreeps = function() {
  return _.filter(Game.creeps, (creep) =>
    creep.room.name === this.name
  );
};

Room.prototype.getCreepsNeedingHealing = function() {
  if (!this._creepsNeedingHealing) {
    this._creepsNeedingHealing = _.filter(this.getCreeps(),
      (creep) => creep.hits < creep.hitsMax);
  }
  return this._creepsNeedingHealing;
};

Room.prototype.getDroppedResources = function() {
  if (!this._droppedResources) {
    if (this.getHostiles().length) {
      this._droppedResources = this.find(FIND_DROPPED_RESOURCES, {
        filter: (resource) => {
          return resource.pos.x < 45 &&
          resource.pos.x > 5 &&
          resource.pos.y < 45 &&
          resource.pos.y > 5;
        }
      });
    } else {
      this._droppedResources = this.find(FIND_DROPPED_RESOURCES);
    }
  }
  return this._droppedResources;
};

Room.prototype.getEnergyStorageStructures = function() {
  if (!this._energyStorageStructures) {
    this._energyStorageStructures = _.filter(this.getAllStructures(),
      (structure) => ((structure.structureType === STRUCTURE_EXTENSION ||
          structure.structureType === STRUCTURE_SPAWN ||
          structure.structureType === STRUCTURE_TOWER) &&
          structure.energy < structure.energyCapacity) ||
          (structure.structureType === STRUCTURE_CONTAINER &&
          _.sum(structure.store) < structure.storeCapacity));
  }
  return this._energyStorageStructures;
};

Room.prototype.getExtractors = function() {
  if (!this._extractors) {
    this._extractors = _.filter(this.getAllStructures(),
      (structure) => structure.structureType === STRUCTURE_EXTRACTOR);
  }
  return this._extractors;
};

Room.prototype.getHostiles = function() {
  return this.find(FIND_HOSTILE_CREEPS);
};

Room.prototype.getMinerals = function() {
  if (!this._minerals) {
    this._minerals = this.find(FIND_MINERALS);
  }
  return this._minerals;
};

Room.prototype.getNumberOfHarvesters = function() {
  if (!this._numberOfHarvesters) {
    this._numberOfHarvesters = _.filter(this.getCreeps(),
      (creep) => creep.memory.role === 'harvester');
  }
  return this._numberOfHarvesters;
};

Room.prototype.getRampartsAndWallsNeedingRepair = function() {
  if (!this._rampartsAndWallsNeedingRepair) {
    const desiredRampartAndWallHits = getDesiredRampartAndWallHits(this);
    this._rampartsAndWallsNeedingRepair = _.filter(this.getAllStructures(),
      (structure) => (structure.structureType === STRUCTURE_WALL &&
        structure.hits < desiredRampartAndWallHits.wall) ||
        (structure.structureType === STRUCTURE_RAMPART &&
        structure.hits < desiredRampartAndWallHits.rampart ));
  }
  return this._rampartsAndWallsNeedingRepair;
};

const getDesiredRampartAndWallHits = function(room) {
  const level = room.controller.level;
  if (level <= 2) {
    return { wall: 1000, rampart: 10000 };
  } else if (level <= 4) {
    return { wall: 25000, rampart: 25000 };
  } else if (level >= 5 && room.getTowers() && room.getTowers().length > 1) {
    return { wall: 100000, rampart: 100000 };
  } else {
    return { wall: 50000, rampart: 50000 };
  }
};

Room.prototype.getResourceStorageStructures = function() {
  if (!this._resourceStorageStructures) {
    this._resourceStorageStructures = _.filter(this.getAllStructures(),
      (structure) => (structure.structureType === STRUCTURE_CONTAINER ||
        structure.structureType === STRUCTURE_STORAGE) &&
        _.sum(structure.store) < structure.storeCapacity);
  }
  return this._resourceStorageStructures;
};

Room.prototype.getRoadsNeedingRepair = function() {
  if (!this._roadsNeedingRepair) {
    this._roadsNeedingRepair = _.filter(this.getAllStructures(),
      (structure) => structure.structureType === STRUCTURE_ROAD &&
        (structure.hits < structure.hitsMax / 2));
  }
  return this._roadsNeedingRepair;
};

Room.prototype.getSpawns = function() {
  return this.find(FIND_MY_SPAWNS);
};

Room.prototype.getSourceContainers = function() {
  if (!this._sourceContainers) {
    this._sourceContainers = _.map(this.memory.sourceContainers, function(sourceContainer) {
      return Game.getObjectById(sourceContainer.id);
    });
  }
  return this._sourceContainers;
};

Room.prototype.getSourcesMinusBlacklist = function() {
  if (!this._sourcesMinusBlacklist) {
    this._sourcesMinusBlacklist = this.find(FIND_SOURCES, {
      filter: (source) => {
        return !_.includes(this.memory.blacklistedSources, source.id);
      }
    });
  }
  return this._sourcesMinusBlacklist;
};

Room.prototype.getStructuresNeedingRepair = function() {
  if (!this._structuresNeedingRepair) {
    this._structuresNeedingRepair = _.filter(this.getAllStructures(),
      (structure) => structure.structureType !== STRUCTURE_CONTAINER &&
        structure.structureType !== STRUCTURE_ROAD &&
        structure.structureType !== STRUCTURE_WALL &&
        structure.structureType !== STRUCTURE_RAMPART &&
        structure.hits < structure.hitsMax);
  }
  return this._structuresNeedingRepair;
};

Room.prototype.getTowers = function() {
  if (!this._towers) {
    this._towers = _.filter(this.getAllStructures(),
      (structure) => structure.structureType === STRUCTURE_TOWER &&
        structure.room.name === this.name);
  }
  return this._towers;
};

Room.prototype.hasSourceContainers = function() {
  const sourceContainers = this.getSourceContainers();
  return sourceContainers && sourceContainers.length > 0;
};

Room.prototype.prioritizePickupsByPosition = function(creepPosition) {
  return _.filter(_.sortBy(_.compact([
    Game.getObjectById(this.memory.ControllerContainer),
    Game.getObjectById(this.memory.SpawnContainer),
    Game.getObjectById(this.memory.TowerContainer),
    Game.getObjectById(this.memory.Source1Container),
    Game.getObjectById(this.memory.Source2Container),
    this.storage
  ]), (structure) => Math.hypot(creepPosition.x - structure.pos.x,
    creepPosition.y - structure.pos.y)
  ), (structure) => structure.store[RESOURCE_ENERGY] > 250);
};

Room.prototype.prioritizeStructuresForTruck = function(creep) {
  // prioritize Extension -> Spawn -> Tower -> non-source Container
  const structures = this.getEnergyStorageStructures();
  const extensions = sortStructuresByDistanceToCreep(
    filterStructuresByTypeAndEnergy(structures, STRUCTURE_EXTENSION),
    creep);
  const spawns = sortStructuresByDistanceToCreep(
    filterStructuresByTypeAndEnergy(structures, STRUCTURE_SPAWN),
    creep);
  const towers = sortStructuresByDistanceToCreep(
    filterStructuresByTypeAndEnergy(structures, STRUCTURE_TOWER),
    creep);
  const containers = sortStructuresByDistanceToCreep(
    filterContainersByStorage(this, structures),
    creep);
  return _.flatten([
    extensions,
    spawns,
    towers,
    containers,
  ]);
};

function filterStructuresByTypeAndEnergy(structures, structureType) {
  return _.filter(structures, function(structure) {
    return structure.structureType === structureType &&
      structure.energy < structure.energyCapacity;
  });
}

function sortStructuresByDistanceToCreep(structures, creep) {
  return _.sortBy(structures, (structure) =>
    Math.hypot(creep.pos.x - structure.pos.x,
      creep.pos.y - structure.pos.y));
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

Room.prototype.shouldEnterEmergencyMode = function() {
  const numHarvesters = _.filter(this.getCreeps(),
    (creep) => creep.memory.role === 'harvester').length;
  const numTrucks = _.filter(this.getCreeps(),
    (creep) => creep.memory.role === 'truck').length;
  if (numHarvesters === 0 && numTrucks <= 1) {
    return true;
  } else {
    return false;
  }
};

Room.prototype.shouldExitEmergencyMode = function() {
  const numHarvesters = _.filter(this.getCreeps(),
    (creep) => creep.memory.role === 'harvester').length;
  const numTrucks = _.filter(this.getCreeps(),
    (creep) => creep.memory.role === 'truck').length;
  const numUpgraders = _.filter(this.getCreeps(),
    (creep) => creep.memory.role === 'upgrader').length;
  if (numHarvesters > 0 && numTrucks > 2 && numUpgraders > 0) {
    return true;
  } else {
    return false;
  }
};

Room.prototype.sortSourceContainersByEnergy = function() {
  if (!this._sourceContainersSortedByEnergy) {
    const structures = this.getSourceContainers();
    const containersWithEnergy = _.filter(structures, function(structure) {
      return structure !== null &&
      structure.structureType === STRUCTURE_CONTAINER &&
        structure.store[RESOURCE_ENERGY] > 0;
    });
    this._sourceContainersSortedByEnergy =  _.sortByOrder(containersWithEnergy,
      function(container) {
        return container.store[RESOURCE_ENERGY];
      }, ['desc']);
  }
  return this._sourceContainersSortedByEnergy;
};
