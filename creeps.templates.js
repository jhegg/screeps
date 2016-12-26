const harvesterRole = 'harvester';
const builderRole = 'builder';
const upgraderRole = 'upgrader';
const truckRole = 'truck';

const startingBody = [WORK, CARRY, MOVE, MOVE]; // cost: 250
const smallTruckBody = [CARRY, CARRY, MOVE, MOVE]; // cost: 200

const mediumBody = [
  WORK, WORK,
  CARRY, CARRY,
  MOVE, MOVE, MOVE, MOVE
]; // cost: 500
const mediumHarvesterBody = [
  WORK, WORK, WORK,
  CARRY,
  MOVE
]; // cost: 400
const mediumTruckBody = [
  CARRY, CARRY, CARRY, CARRY,
  MOVE, MOVE, MOVE, MOVE
]; // cost 400

const nonContainerHarvesterBody = [
  WORK, WORK,
  CARRY,
  MOVE, MOVE, MOVE
]; // cost: 400
const largeHarvesterBody = [
  WORK, WORK, WORK, WORK, WORK,
  CARRY,
  MOVE
]; // cost: 600
const builderBody = [
  WORK, WORK, WORK, WORK,
  CARRY, CARRY,
  MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
]; // cost: 800
const upgraderBody = [
  WORK, WORK, WORK,
  CARRY, CARRY, CARRY,
  MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
]; // cost: 750

const megaWorkerBody = [
  WORK, WORK, WORK, WORK, WORK,
  CARRY, CARRY, CARRY, CARRY,
  MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
]; // cost: 1150

const megaUpgraderBody = [
  WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
  CARRY, CARRY,
  MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
]; // cost: 1350

var creepsTemplates = {
  startingBodyTemplate: function() {
    return [
      { role: harvesterRole,
        body: startingBody,
        maxCreepsOfType: 4},
      { role: upgraderRole,
        body: startingBody,
        maxCreepsOfType: 4},
      { role: builderRole,
        body: startingBody,
        maxCreepsOfType: 4},
    ];
  },
  smallBodyWithTrucksTemplate: function() {
    return [
      { role: harvesterRole,
        body: startingBody,
        maxCreepsOfType: 3},
      { role: truckRole,
        body: smallTruckBody,
        maxCreepsOfType: 2},
      { role: upgraderRole,
        body: startingBody,
        maxCreepsOfType: 2},
      { role: builderRole,
        body: startingBody,
        maxCreepsOfType: 2},
    ];
  },
  mediumBodyTemplate: function() {
    return [
      { role: harvesterRole,
        body: mediumBody,
        maxCreepsOfType: 4},
      { role: upgraderRole,
        body: mediumBody,
        maxCreepsOfType: 4},
      { role: builderRole,
        body: mediumBody,
        maxCreepsOfType: 2},
    ];
  },
  mediumBodyWithTrucksTemplate: function() {
    return [
      { role: harvesterRole,
        body: mediumHarvesterBody,
        maxCreepsOfType: 3},
      { role: truckRole,
        body: mediumTruckBody,
        maxCreepsOfType: 4},
      { role: upgraderRole,
        body: mediumBody,
        maxCreepsOfType: 2},
      { role: builderRole,
        body: mediumBody,
        maxCreepsOfType: 2},
    ];
  },
  largeBodyTemplate: function() {
    return [
      { role: harvesterRole,
        body: nonContainerHarvesterBody,
        maxCreepsOfType: 6},
      { role: upgraderRole,
        body: upgraderBody,
        maxCreepsOfType: 2},
      { role: builderRole,
        body: builderBody,
        maxCreepsOfType: 2},
    ];
  },
  largeBodyWithTrucksTemplate: function() {
    return [
      { role: harvesterRole,
        body: largeHarvesterBody,
        maxCreepsOfType: 2},
      { role: truckRole,
        body: mediumTruckBody,
        maxCreepsOfType: 4},
      { role: upgraderRole,
        body: upgraderBody,
        maxCreepsOfType: 2},
      { role: builderRole,
        body: builderBody,
        maxCreepsOfType: 2},
    ];
  },
  extraLargeBodyWithTrucksTemplate: function(spawn) {
    return [
      { role: harvesterRole,
        body: largeHarvesterBody,
        maxCreepsOfType: 2},
      { role: truckRole,
        body: mediumTruckBody,
        maxCreepsOfType: 4},
      { role: upgraderRole,
        body: upgraderBody,
        maxCreepsOfType: 2},
      { role: builderRole,
        body: builderBody,
        maxCreepsOfType: getDesiredBuilderNumber(spawn.room)},
    ];
  },
  megaBodyWithTrucksTemplate: function(spawn) {
    return [
      { role: harvesterRole,
        body: largeHarvesterBody,
        maxCreepsOfType: 2},
      { role: truckRole,
        body: mediumTruckBody,
        maxCreepsOfType: 4},
      { role: upgraderRole,
        body: megaUpgraderBody,
        maxCreepsOfType: 2},
      { role: builderRole,
        body: megaWorkerBody,
        maxCreepsOfType: getDesiredBuilderNumber(spawn.room)},
    ];
  },
};

function getDesiredBuilderNumber(room) {
  if (room.getConstructionSites() > 20) {
    return 2;
  } else if (room.getConstructionSites() > 0) {
    return 1;
  } else {
    return 0;
  }
}

module.exports = creepsTemplates;
