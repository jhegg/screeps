Room.prototype.activateSafeModeDueToHostile = function(hostileCreep) {
  if (this.controller.safeMode === undefined &&
      this.controller.safeModeAvailable > 0 &&
      this.controller.safeModeCooldown === undefined) {
    const safeModeResult = this.controller.activateSafeMode();
    switch (safeModeResult) {
      case OK:
        const message = `Safe mode activated due to ${JSON.stringify(hostileCreep)}`;
        console.log(message);
        Game.notify(message);
        break;
      case ERR_NOT_ENOUGH_RESOURCES:
        console.log(`Error: no safe modes available!`);
        break;
      case ERR_BUSY:
        // another room is in safe mode already, too bad
        break;
      case ERR_TIRED:
        // safe mode is on cooldown
        break;
      default:
        console.log(`Warning: unknown result ${safeModeResult} from
          attempt to activate safe mode`);
    }
  }
};

Room.prototype.activateSafeModeIfNecessary = function() {
  for (var hostileCreep of this.getHostiles()) {
    // if any hostile creep is beyond 5 spaces of 50x50 room edges, activate
    if (hostileCreep.pos.x > 5 ||
      hostileCreep.pos.x < 45 ||
      hostileCreep.pos.y > 5 ||
      hostileCreep.pos.y < 45) {
        this.activateSafeModeDueToHostile(hostileCreep);
    }
  }
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
  if (!this._creeps) {
    this._creeps = this.find(FIND_MY_CREEPS);
  }
  return this._creeps;
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
    this._droppedResources = this.find(FIND_DROPPED_RESOURCES, {
      filter: (resource) => {
        return resource.pos.x > 5 &&
          resource.pos.x < 45 &&
          resource.pos.y > 5 &&
          resource.pos.y < 45;
      }
    });
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
          _.sum(structure.store) < 2000));
  }
  return this._energyStorageStructures;
};

Room.prototype.getHostiles = function() {
  return this.find(FIND_HOSTILE_CREEPS);
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
  } else {
    return { wall: 50000, rampart: 50000 };
  }
};

Room.prototype.getRoadsNeedingRepair = function() {
  if (!this._roadsNeedingRepair) {
    this._roadsNeedingRepair = _.filter(this.getAllStructures(),
      (structure) => structure.structureType === STRUCTURE_ROAD &&
        (structure.hits < structure.hitsMax / 2));
  }
  return this._roadsNeedingRepair;
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
