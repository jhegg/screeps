var creepsSpawner = require('creeps.spawner');

StructureSpawn.prototype.spawnNewCreeps = function() {
  const energyCapacity = this.room.energyCapacityAvailable;
  const mediumEnergyCapacity = 550;
  const largeEnergyCapacity = 1000;
  const extraLargeEnergyCapacity = 1500;
  const megaEnergyCapacity = 2100;

  if (!this.room.memory.emergencyMode &&
    _.filter(Game.creeps, (creep) => creep.room === this.room).length <= 4) {
    console.log(`${this.room} Creep numbers too low! Engaging emergency mode.`);
    Game.notify(`${this.room} Creep numbers too low! Engaging emergency mode.`);
    this.room.memory.emergencyMode = true;
  }

  if (this.room.memory.emergencyMode === true) {
    if (_.filter(Game.creeps, (creep) => creep.room === this.room).length >= 8) {
      console.log(`${this.room} Exiting emergency mode.`);
      Game.notify(`${this.room} Exiting emergency mode.`);
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
  produceRaider(this);
  produceHarasser(this);
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
    console.log(`${spawn.room} Spawning defender ${spawnedCreep} in room ${spawn.room}`);
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
        creep.memory.targetFlag === flag.name).length < 5);
    if (unclaimedFlags.length) {
      const body = [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
      if (spawn.canCreateCreep(body) === OK) {
        const spawnedCreep = spawn.createCreep(body,
          undefined, {
            role: 'newSpawnBuilder',
            targetFlag: unclaimedFlags[0].name
          });
        console.log(`${spawn.room} Spawning newSpawnBuilder ${spawnedCreep} for flag ${unclaimedFlags[0]}`);
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
      const flag = unclaimedFlags[0];
      const body = getClaimerBodyForSpawn(spawn, flag);
      if (spawn.canCreateCreep(body) === OK) {
        const spawnedCreep = spawn.createCreep(body,
          undefined, {
            role: 'claimer',
            claimFlag: flag.name
          });
        console.log(`${spawn.room} Spawning claimer ${spawnedCreep} for flag ${flag}`);
      }
    }
  }
}

function getClaimerBodyForSpawn(spawn, flag) {
  if (spawn.room.energyCapacityAvailable < 1300 ||
    flag.memory.cheapClaimer === true) {
    return [CLAIM, MOVE];
  } else {
    return [CLAIM, CLAIM, MOVE, MOVE];
  }
}

function produceMiner(spawn) {
  if (spawn.room.controller.level >= 6 &&
    spawn.room.getExtractors().length > 0 &&
    spawn.room.storage !== undefined &&
    spawn.spawning === null &&
    spawn.room.memory.emergencyMode !== true &&
    !_.any(spawn.room.getMinerals(), 'mineralAmount', 0)) {
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
        console.log(`${spawn.room} Spawning miner ${spawnedCreep} for ${spawn.room}`);
      }
    }
  }
}

function produceRaider(spawn) {
  if (spawn.spawning === null && spawn.room.memory.emergencyMode !== true) {
    const creepsAssignedToFlags = _.filter(Game.creeps, (creep) =>
      creep.memory.raidingTargetFlag !== undefined
    );
    const unclaimedFlags = _.filter(Game.flags, (flag) =>
      flag.name.startsWith('RaidingFlag') &&
        _.filter(creepsAssignedToFlags, (creep) =>
          creep.memory.raidingTargetFlag === flag.name).length < (flag.memory.maxRaiders ? flag.memory.maxRaiders : 1));
    if (unclaimedFlags.length) {
      const targetFlag = unclaimedFlags[0];
      const body = getRaiderBodyForSpawn(spawn);
      if (spawn.canCreateCreep(body) === OK) {
        const spawnedCreep = spawn.createCreep(body,
          undefined, {
            role: 'raider',
            raidingTargetFlag: targetFlag.name
          });
        console.log(`${spawn.room} Spawning raider ${spawnedCreep} for flag ${targetFlag}`);
      }
    }
  }
}

function getRaiderBodyForSpawn(spawn) {
  if (spawn.room.energyCapacityAvailable < 1300) {
    return [ATTACK, MOVE];
  } else {
    return [
      TOUGH, MOVE, TOUGH, MOVE, TOUGH, MOVE,
      MOVE, ATTACK
    ]; // cost: 310
  }
}

function produceHarasser(spawn) {
  if (spawn.spawning === null && spawn.room.memory.emergencyMode !== true) {
    const creepsAssignedToFlags = _.filter(Game.creeps, (creep) =>
      creep.memory.harasserTargetFlag !== undefined
    );
    const unclaimedFlags = _.filter(Game.flags, (flag) =>
      flag.name.startsWith('HarasserFlag') &&
        _.filter(creepsAssignedToFlags, (creep) =>
          creep.memory.harasserTargetFlag === flag.name).length < (flag.memory.maxHarassers ? flag.memory.maxHarassers : 1));
    if (unclaimedFlags.length) {
      const targetFlag = unclaimedFlags[0];
      const body = [
        TOUGH, MOVE, TOUGH, MOVE, TOUGH, MOVE, TOUGH, MOVE,
        HEAL, MOVE, HEAL, MOVE, ATTACK, MOVE, MOVE, HEAL
      ]; // cost: 1270
      if (spawn.canCreateCreep(body) === OK) {
        const spawnedCreep = spawn.createCreep(body,
          undefined, {
            role: 'harasser',
            harasserTargetFlag: targetFlag.name
          });
        console.log(`${spawn.room} Spawning harasser ${spawnedCreep} for flag ${targetFlag}`);
      }
    }
  }
}
