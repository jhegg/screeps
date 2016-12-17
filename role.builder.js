var roleUtility = require('role.utility');

Creep.prototype.building = function() {
  if (this.memory.building && this.carry.energy === 0) {
    this.memory.building = false;
    this.memory.containerId = undefined;
    this.memory.pickupWasEmptyCounter = undefined;
    this.say('harvesting');
  }
  if (!this.memory.building && this.carry.energy == this.carryCapacity) {
    this.memory.building = true;
    this.memory.containerId = undefined;
    this.say('building');
  }

  if (this.memory.building) {
    if (this.room.getConstructionSites().length) {
      const creepPosition = this.pos;
      const constructionSitesSortedByDistance = this.room.getConstructionSites().sort(function(a, b) {
        const distanceA = Math.hypot(creepPosition.x - a.pos.x, creepPosition.y - a.pos.y);
        const distanceB = Math.hypot(creepPosition.x - b.pos.x, creepPosition.y - b.pos.y);
        return distanceA - distanceB;
      });
      const extensionSites = _.filter(constructionSitesSortedByDistance, (site) =>
        site.structureType === STRUCTURE_EXTENSION
      );
      if (extensionSites.length) {
        if (this.build(extensionSites[0]) === ERR_NOT_IN_RANGE) {
          this.moveTo(extensionSites[0]);
          this.build(extensionSites[0]);
        }
      } else {
        if (this.build(constructionSitesSortedByDistance[0]) === ERR_NOT_IN_RANGE) {
          this.moveTo(constructionSitesSortedByDistance[0]);
          this.build(constructionSitesSortedByDistance[0]);
        }
      }
    } else {
      console.log('Builder '+this+' has no construction site; error?');
    }
  } else {
    if (this.memory.containerId !== undefined) {
      const container = Game.getObjectById(this.memory.containerId);
      const withdrawResult = this.withdraw(container, RESOURCE_ENERGY);
      switch (withdrawResult) {
        case OK:
          this.memory.pickupWasEmptyCounter = undefined;
          return;
        case ERR_NOT_OWNER:
          console.log(`Error: builder unable to transfer from ${container}
            due to ownership/rampart`);
          break;
        case ERR_BUSY:
          // still spawning
          break;
        case ERR_NOT_ENOUGH_RESOURCES:
          if (!this.memory.pickupWasEmptyCounter) {
            this.memory.pickupWasEmptyCounter = 1;
          } else {
            this.memory.pickupWasEmptyCounter += 1;
          }
          if (this.memory.pickupWasEmptyCounter > 4) {
            this.memory.containerId = undefined;
            this.memory.pickupWasEmptyCounter = undefined;
          }
          break;
        case ERR_INVALID_TARGET:
          console.log(`Error: builder ${this} tried to harvest from
            ${container} which is invalid`);
          break;
        case ERR_FULL:
          console.log(`Warning: builder ${this} was full but tried to harvest
            anyway`);
          break;
        case ERR_NOT_IN_RANGE:
          this.memory.pickupWasEmptyCounter = undefined;
          this.moveTo(container);
          this.withdraw(container, RESOURCE_ENERGY);
          return;
        case ERR_INVALID_ARGS:
          console.log(`Error: builder ${this} tried to withdraw from
             ${container} but resource amount or type was incorrect`);
          break;
        default:
          console.log(`Warning: unknown result ${withdrawResult} from builder
             withdraw`);
      }
      return;
    }

    const spawnContainer = Game.getObjectById(this.room.memory.SpawnContainer);
    const towerContainer = Game.getObjectById(this.room.memory.TowerContainer);
    const roomStorage = this.room.storage;
    const source1Container = Game.getObjectById(this.room.memory.Source1Container);
    const source2Container = Game.getObjectById(this.room.memory.Source2Container);
    const containers = [
      roomStorage,
      spawnContainer,
      towerContainer,
      source1Container,
      source2Container,
    ];

    for (var container of containers) {
      if (container && container.store[RESOURCE_ENERGY] > 250) {
        this.memory.containerId = container.id;
        if (this.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          this.moveTo(container);
          this.withdraw(container, RESOURCE_ENERGY);
        }
        return;
      }
    }

    if (!this.room.memory.sourceContainers) {
      const source = Game.getObjectById(this.memory.sourceId);
      if (this.harvest(source) == ERR_NOT_IN_RANGE) {
        this.moveTo(source);
        this.harvest(source);
      }
    }
  }
};
