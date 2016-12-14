var creepsSpawner = require('creeps.spawner');

StructureSpawn.prototype.spawnNewCreeps = function() {
  const energyCapacity = this.room.energyCapacityAvailable;
  const mediumEnergyCapacity = 550;
  const largeEnergyCapacity = 1000;
  const extraLargeEnergyCapacity = 1500;

  if (!this.room.memory.emergencyMode &&
    energyCapacity >= largeEnergyCapacity &&
    Object.keys(Game.creeps).length <= 5) {
    console.log(`Creep numbers too low! Engaging emergency mode.`);
    Game.notify(`Creep numbers too low! Engaging emergency mode.`);
    this.room.memory.emergencyMode = true;
  }

  if (this.room.memory.emergencyMode === true) {
    if (Object.keys(Game.creeps).length >= 10) {
      console.log(`Exiting emergency mode.`);
      Game.notify(`Exiting emergency mode.`);
      this.room.memory.emergencyMode = undefined;
    } else {
      lowEnergyCapacitySpawning(this);
      return;
    }
  }

  if (energyCapacity < mediumEnergyCapacity) {
    lowEnergyCapacitySpawning(this);
  } else if (energyCapacity < largeEnergyCapacity) {
    mediumEnergyCapacitySpawning(this);
  } else if (energyCapacity < extraLargeEnergyCapacity) {
    largeEnergyCapacitySpawning(this);
  } else {
    extraLargeEnergyCapacitySpawning(this);
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
        creep.memory.targetFlag === flag.name).length < 2);
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
    spawn.room.memory.emergencyMode !== true) {
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
