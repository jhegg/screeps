var creepsSpawner = require('creeps.spawner');

StructureSpawn.prototype.spawnNewCreeps = function() {
  const energyCapacity = this.room.energyCapacityAvailable;
  const mediumEnergyCapacity = 550;
  const largeEnergyCapacity = 1000;
  const extraLargeEnergyCapacity = 1500;
  const megaEnergyCapacity = 2100;

  if (!this.room.memory.emergencyMode &&
    energyCapacity >= largeEnergyCapacity &&
    _.filter(Game.creeps, (creep) => creep.room === this.room).length <= 5) {
    console.log(`Creep numbers too low! Engaging emergency mode.`);
    Game.notify(`Creep numbers too low! Engaging emergency mode.`);
    this.room.memory.emergencyMode = true;
  }

  if (this.room.memory.emergencyMode === true) {
    if (_.filter(Game.creeps, (creep) => creep.room === this.room).length >= 10) {
      console.log(`Exiting emergency mode.`);
      Game.notify(`Exiting emergency mode.`);
      this.room.memory.emergencyMode = undefined;
    } else {
      lowEnergyCapacitySpawning(this);
      return;
    }
  }

  if (shouldProduceDefender(this)) {
    produceDefender(this);
    return;
  }

  if (energyCapacity < mediumEnergyCapacity) {
    lowEnergyCapacitySpawning(this);
  } else if (energyCapacity < largeEnergyCapacity) {
    mediumEnergyCapacitySpawning(this);
  } else if (energyCapacity < extraLargeEnergyCapacity) {
    largeEnergyCapacitySpawning(this);
  } else if (energyCapacity < megaEnergyCapacity) {
    extraLargeEnergyCapacitySpawning(this);
  } else {
    megaEnergyCapacitySpawning(this);
  }

  produceNewSpawnBuilder(this);
  produceClaimer(this);
  produceMiner(this);
};

function lowEnergyCapacitySpawning(spawn) {
  if (spawn.room.hasSourceContainers()) {
    creepsSpawner.spawnSmallCreepsWithTrucks(spawn);
  } else {
    creepsSpawner.spawnSmallCreeps(spawn);
  }
}

function mediumEnergyCapacitySpawning(spawn) {
  if (spawn.room.hasSourceContainers()) {
    creepsSpawner.spawnMediumCreepsWithTrucks(spawn);
  } else {
    creepsSpawner.spawnMediumCreeps(spawn);
  }
}

function largeEnergyCapacitySpawning(spawn) {
  if (spawn.room.hasSourceContainers()) {
    creepsSpawner.spawnLargeCreepsWithTrucks(spawn);
  } else {
    creepsSpawner.spawnLargeCreeps(spawn);
  }
}

function extraLargeEnergyCapacitySpawning(spawn) {
  if (spawn.room.hasSourceContainers()) {
    creepsSpawner.spawnExtraLargeCreepsWithTrucks(spawn);
  } else {
    creepsSpawner.spawnLargeCreeps(spawn);
  }
}

function megaEnergyCapacitySpawning(spawn) {
  if (spawn.room.hasSourceContainers()) {
    creepsSpawner.spawnMegaCreepsWithTrucks(spawn);
  } else {
    creepsSpawner.spawnLargeCreeps(spawn);
  }
}

function shouldProduceDefender(spawn) {
  if (spawn.spawning === null &&
    spawn.room.memory.emergencyMode !== true &&
    !spawn.room.safeMode &&
    spawn.room.energyCapacityAvailable > 1800 &&
    spawn.room.getHostiles().length &&
    getNumberOfDefenders(spawn) < 1) {
    return true;
  } else {
    return false;
  }
}

function getNumberOfDefenders(spawn) {
  return _.filter(spawn.room.getCreeps(),
    (creep) => creep.memory.role === 'defender').length;
}

function produceDefender(spawn) {
  const body = [
    TOUGH, MOVE, TOUGH, MOVE, TOUGH, MOVE,
    ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE,
    ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE,
    ATTACK, MOVE, ATTACK, MOVE
  ]; // cost: 1480
  if (spawn.canCreateCreep(body) === OK) {
    const spawnedCreep = spawn.createCreep(body,
      undefined, {
        role: 'defender'
      });
    console.log(`Spawning defender ${spawnedCreep} in room ${spawn.room}`);
  }
}

function produceNewSpawnBuilder(spawn) {
  if (Game.gcl.level > 1 &&
    spawn.spawning === null &&
    spawn.room.memory.emergencyMode !== true) {
    const creepsAssignedToFlags = _.filter(Game.creeps, (creep) =>
      creep.memory.targetFlag !== undefined
    );
    const unclaimedFlags = _.filter(Game.flags, (flag) =>
      flag.name.startsWith('NewSpawnFlag') &&
      _.filter(creepsAssignedToFlags, (creep) =>
        creep.memory.targetFlag === flag.name).length < 3);
    if (unclaimedFlags.length) {
      const body = [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
      if (spawn.canCreateCreep(body) === OK) {
        const spawnedCreep = spawn.createCreep(body,
          undefined, {
            role: 'newSpawnBuilder',
            targetFlag: unclaimedFlags[0].name
          });
        console.log(`Spawning newSpawnBuilder ${spawnedCreep} for flag ${unclaimedFlags[0]}`);
      }
    }
  }
}

function produceClaimer(spawn) {
  if (Game.gcl.level > 1 &&
    spawn.spawning === null &&
    spawn.room.memory.emergencyMode !== true) {
    const creepsAssignedToFlags = _.filter(Game.creeps, (creep) =>
      creep.memory.claimFlag !== undefined
    );
    const unclaimedFlags = _.filter(Game.flags, (flag) =>
      flag.name.startsWith('ClaimFlag') &&
      !_.any(creepsAssignedToFlags, (creep) =>
        creep.memory.claimFlag === flag.name
      ));
    if (unclaimedFlags.length) {
      const body = [CLAIM, CLAIM, MOVE, MOVE];
      if (spawn.canCreateCreep(body) === OK) {
        const spawnedCreep = spawn.createCreep(body,
          undefined, {
            role: 'claimer',
            claimFlag: unclaimedFlags[0].name
          });
        console.log(`Spawning claimer ${spawnedCreep} for flag ${unclaimedFlags[0]}`);
      }
    }
  }
}

function produceMiner(spawn) {
  if (spawn.room.controller.level >= 6 &&
    spawn.room.getExtractors().length > 0 &&
    spawn.room.storage !== undefined &&
    spawn.spawning === null &&
    spawn.room.memory.emergencyMode !== true &&
    !_.any(spawn.room.getExtractors(), 'mineralAmount', 0)) {
    const miners = _.filter(spawn.room.getCreeps(), (creep) =>
      creep.memory.role === 'miner'
    );
    if (miners.length < 1) {
      const body = [
        WORK, WORK, WORK, WORK, WORK,
        CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
      ]; // 950
      if (spawn.canCreateCreep(body) === OK) {
        const spawnedCreep = spawn.createCreep(body,
          undefined, {
            role: 'miner'
          });
        console.log(`Spawning miner ${spawnedCreep} for ${spawn.room}`);
      }
    }
  }
}
