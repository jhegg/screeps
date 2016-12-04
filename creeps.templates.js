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
  WORK, WORK,
  CARRY,
  MOVE
]; // cost: 300
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

const extraLargeHarvesterBody = [
  WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
  CARRY,
  MOVE
]; // cost: 1100
const extraLargeBuilderBody = [
  WORK, WORK, WORK, WORK, WORK,
  CARRY, CARRY, CARRY, CARRY,
  MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
]; // cost: 1150

var creepsTemplates = {
  startingBodyTemplate: function() {
    return [
      { role: harvesterRole,
        body: startingBody,
        maxCreepsOfType: 4},
      { role: builderRole,
        body: startingBody,
        maxCreepsOfType: 4},
      { role: upgraderRole,
        body: startingBody,
        maxCreepsOfType: 4},
    ];
  },
  smallBodyWithTrucksTemplate: function() {
    return [
      { role: harvesterRole,
        body: startingBody,
        maxCreepsOfType: 2},
      { role: truckRole,
        body: smallTruckBody,
        maxCreepsOfType: 2},
      { role: builderRole,
        body: startingBody,
        maxCreepsOfType: 4},
      { role: upgraderRole,
        body: startingBody,
        maxCreepsOfType: 4},
    ];
  },
  mediumBodyTemplate: function() {
    return [
      { role: harvesterRole,
        body: mediumBody,
        maxCreepsOfType: 4},
      { role: builderRole,
        body: mediumBody,
        maxCreepsOfType: 4},
      { role: upgraderRole,
        body: mediumBody,
        maxCreepsOfType: 4},
    ];
  },
  mediumBodyWithTrucksTemplate: function() {
    return [
      { role: harvesterRole,
        body: mediumHarvesterBody,
        maxCreepsOfType: 2},
      { role: truckRole,
        body: mediumTruckBody,
        maxCreepsOfType: 4},
      { role: builderRole,
        body: mediumBody,
        maxCreepsOfType: 2},
      { role: upgraderRole,
        body: mediumBody,
        maxCreepsOfType: 2},
    ];
  },
  largeBodyTemplate: function() {
    return [
      { role: harvesterRole,
        body: nonContainerHarvesterBody,
        maxCreepsOfType: 6},
      { role: builderRole,
        body: builderBody,
        maxCreepsOfType: 4},
      { role: upgraderRole,
        body: upgraderBody,
        maxCreepsOfType: 4},
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
      { role: builderRole,
        body: builderBody,
        maxCreepsOfType: 4},
      { role: upgraderRole,
        body: upgraderBody,
        maxCreepsOfType: 4},
    ];
  },
  extraLargeBodyWithTrucksTemplate: function() {
    return [
      { role: harvesterRole,
        body: extraLargeHarvesterBody,
        maxCreepsOfType: 2},
      { role: truckRole,
        body: mediumTruckBody,
        maxCreepsOfType: 4},
      { role: builderRole,
        body: extraLargeBuilderBody,
        maxCreepsOfType: 4},
      { role: upgraderRole,
        body: extraLargeHarvesterBody,
        maxCreepsOfType: 3},
    ];
  },
};

module.exports = creepsTemplates;
