// entity.js

class EntityFactory {
  static createEntity(subtype, initialValues = {}) {
    switch (subtype) {
      case "star":
        return new Entity(
          Entity.generateUniqueId("star"),
          initialValues.name || "Unnamed Star",
          initialValues.position || {x: 0, y: 0, z: 0},
          "star",
          initialValues.mass || 1e30,
          Infinity,
          initialValues.resources || 0
        );
      case "planet":
        return new Entity(
          Entity.generateUniqueId("planet"),
          initialValues.name || "Unnamed Planet",
          initialValues.position || {x: 0, y: 0, z: 0},
          "planet",
          initialValues.mass || 1e25,
          Infinity,
          initialValues.resources || 0
        );
      case "ship":
        return new Entity(
          Entity.generateUniqueId("ship"),
          initialValues.name || "Unnamed Ship",
          initialValues.position || {x: 0, y: 0, z: 0},
          "ship",
          initialValues.mass || 1e5,
          initialValues.storageCapacity || 10,
          initialValues.resources || 0
        );
      case "ship component":
        return new Entity(
          Entity.generateUniqueId("component"),
          initialValues.name || "Unnamed Component",
          null,
          "ship component",
          initialValues.mass || 500,
          Infinity,
          initialValues.resources || 0
        );
      default:
        throw new Error(`Unknown entity subtype: ${subtype}`);
    }
  }
}

// // Usage example:
// const star = EntityFactory.createEntity("star", {
//   name: "Sun",
//   mass: 2e30,
//   resources: 5000,
// });
// console.log(star);

// const ship = EntityFactory.createEntity("ship", {
//   name: "Explorer-1",
//   storageCapacity: 20,
// });
// console.log(ship);

class Entity {
  constructor(
    name,
    position,
    subtype,
    mass,
    storageCapacity,
    resources = 0,
    propulsion = []
  ) {
    this.id = id;
    this.name = name;
    this.position = position;
    this.subtype = subtype;
    this.mass = mass;
    this.storageCapacity = storageCapacity;
    this.resources = resources;
    this.entitiesInside = [];
    this.propulsion = propulsion;
  }

  static generateUniqueId(prefix = "entity") {
    // Generate a random number or use a more sophisticated method for production
    const uniqueNumber = Math.floor(Math.random() * 1000000);
    return `${prefix}-${uniqueNumber}`;
  }

  addEntityInside(entity) {
    if (this.entitiesInside.length < this.storageCapacity) {
      this.entitiesInside.push(entity);
      return true; // Entity successfully added
    } else {
      console.log(`Storage capacity of ${this.name} is full.`);
      return false; // Entity could not be added due to full capacity
    }
  }
}

// // Sample celestial bodies
// const celestialBodies = {
//   earth: new Entity("Earth", {x: 0, y: 0, z: 0}, "star", 5e24, Infinity, 1000),
//   mars: new Entity(
//     "Mars",
//     {x: 10, y: 5, z: 0},
//     "planet",
//     6.39e23,
//     Infinity,
//     500
//   ),
//   // Add more celestial bodies as needed
// };

// // Sample ships
// const ships = {
//   explorer1: new Entity("Explorer-1", {x: 2, y: 3, z: 0}, "ship", 1e4, 10, 0),
//   cargoShip1: new Entity(
//     "Cargo-Ship-1",
//     {x: 8, y: 10, z: 0},
//     "ship",
//     5e4,
//     20,
//     0
//   ),
//   // Add more ships as needed
// };

// // Sample ship components
// const shipComponents = {
//   cargoBay: new Entity("Cargo Bay", null, "ship component", 1e3, Infinity),
//   thrusters: new Entity("Thrusters", null, "ship component", 500, Infinity),
//   // Add more ship components as needed
// };

// celestialBodies.earth.addEntityInside(shipComponents.thrusters);
// ships.explorer1.addEntityInside(shipComponents.cargoBay);
// ships.explorer1.addEntityInside(shipComponents.thrusters);

// Export entities
module.exports = {
  EntityFactory,
};
